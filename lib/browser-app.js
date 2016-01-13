"use strict";
// A unidirectional GUI for interacting with RPN features. Uses a toy
// functional reactive implementation.
var rpn = require("../");

// Instantiate this object and call `render` to run the browser interface.
//
// * elements - (Object[Element]) A map containing the following
// DOM `Element`s:
//     - input: The text input element where numbers/operations will be
//     entered.
//     - submit: The button for submitting entered text.
//     - clear: The button for clearing text.
//     - error: The element to put error messages in.
//     - lastInStack: The element to display the last stack item in.
//     - fullStack: The element to display the entire stack in.
// * operators - (Object[Function]) A map of operator names to their functions.
// * raf - (Function) The function to use for requestAnimationFrame. Usually
// `window.requestAnimationFrame`.
//
// Returns BrowserApp instance.
function BrowserApp(elements, operators, raf) {
  if (!(this instanceof BrowserApp)) {
    return new BrowserApp(elements, operators);
  }
  this.state = {
    // For state that effects the view.
    app: {
      // List of items in the stack (Array).
      stack: [],
      // Timestamp indicating the last time a new word was submitted (Number).
      lastSubmitted: null,
      // The error messsage (String).
      error: null,
      // The default placeholder text for the input
      placeholder: ""
    },
    // Keep track of previous app state values.
    previous: {},
    // Keeps track of state only needed by `BrowserApp`.
    internal: {
      firstRender: false,
      isRendering: false
    }
  };
  this.elements = elements;
  this.operators = operators;
  this.raf = raf;
  // Setup the default placeholder text.
  this.state.app.placeholder = "enter a number or any of " +
    Object.keys(this.operators).join(" ");
  return this;
}
// Changes the app state and triggers a new render.
//
// * k - (String) The state key to change.
// * v - (Any) The new value to change the state to.
//
// Returns null
BrowserApp.prototype.setState = function setState(k, v) {
  this.state.app[k] = v;
  this.render();
  return null;
};

// We need to clone the state because otherwise updating a key in the app state
// object would also effect the previous state. This is a toy solution, in
// production it's best to use some sort of immutable data structure.
//
// Returns object.
BrowserApp.prototype.cloneState = function cloneState() {
  // Alias app state.
  var as = this.state.app;
  return {
    // `.slice(0)` is a quick way to clone an array.
    stack: as.stack.slice(0),
    lastSubmitted: as.lastSubmitted,
    error: as.error
  };
};

// `render` helps batch state changes to prevent layout thrashing by only
// calling functions that manipulate the dom on animation frames (by using
// `requestAnimationFrame`). Should be manually triggered when a new app is
// instantiated. After that, it will be called each time the state updates.
//
// Returns null
BrowserApp.prototype.render = function render() {
  // The internal state flag "isRendering" let's us safely ignore requests
  // triggered by multiple app state updates. It will be reset to false once
  // the `_render` callback is called.
  if (this.state.internal.isRendering) {
    return null;
  }
  var self = this;
  this.state.internal.isRendering = true;
  this.raf(function renderCb() {
    self._render(self.state.app, self.state.previous, self.elements);
  });
  return null;
};

// Private rendering method. Triggers first time setup procedures, and
// refreshing the view.
//
// Returns null.
BrowserApp.prototype._render = function _render() {
  if (!this.state.internal.firstRender) {
    this.setupEvents();
    this.state.internal.firstRender = true;
  }
  refreshView(this.state.app, this.state.previous, this.elements);
  this.state.previous = this.cloneState();
  this.state.internal.isRendering = false;
  return null;
};

// Binds elements to DOM events.
//
// Returns null.
BrowserApp.prototype.setupEvents = function setupEvents() {
  // Setup enter keypress event, which will usually trigger submit.
  this.elements.input.addEventListener("keypress", Events.onKeypress.bind(this));
  // Setup button submit event.
  this.elements.submit.addEventListener("click", Events.onSubmit.bind(this));
  // Setup button clear event.
  this.elements.clear.addEventListener("click", Events.onClear.bind(this));
  return null;
};

// All DOM element manipulation is done within this function. It takes
// the current state, the previous state, and a list of dom elements, and
// then applies necessary changes to the DOM.
// * cstate - (Object) State of the current render.
// * pstate - (Object) State of the previous render.
// * elements - (Object[Element]) Map of names to dom elements. See the
// `BrowserApp` function for more information.
//
// Returns null.

function refreshView(cstate, pstate, elements) {
  if (cstate.lastSubmitted !== pstate.lastSubmitted) {
    // Clear the input if there has been a new submission
    elements.input.value = "";
  }
  // If the placeholder text has changed, update it
  if (cstate.placeholder !== pstate.placeholder) {
    elements.input.placeholder = cstate.placeholder;
  }
  // If there has been an error, show it.
  if (cstate.error && cstate.error !== pstate.error) {
    elements.error.textContent = cstate.error;
  } else {
    // Otherwise, clear the error if there was one.
    if (cstate.error !== pstate.error) {
      elements.error.textContent = "";
    }
  }
  var lastDisplay;
  if (!cstate.stack.length) {
    lastDisplay = "";
  } else {
    lastDisplay = cstate.stack.slice(-1)[0];
  }
  // If we wanted to further optimize this, there are a few things we could do.
  // We could decide to only update this state if a new submission has been
  // made (move it underneath the lastSubmitted conditional at the top). We
  // could create a flag, or we could do a simple comparison on length.
  // Depending on how that state gets updated in our app, each method has
  // different tradeoffs. For now we'll choose the least optimized option,
  // updating it anytime the state is updated.
  elements.lastInStack.textContent = String(lastDisplay);
  elements.fullStack.textContent = "[ " + cstate.stack.join(" ") + " ]";
  return null;
}

// Events are kept separate as a purely organizational choice. It is expected
// that they will be called with `BrowserApp` instance as their context.
var Events = {
  // Triggered when a new word is submitted, either through click or keypress.
  //
  // * e - (Object) *optional* Event object, will trigger preventDefault if
  // available.
  //
  // Returns null.
  onSubmit: function onSubmit(e) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    var v = this.elements.input.value.trim();
    // If the input field is empty, we don't need any state updates.
    if (!v) {
      return null;
    }
    // Otherwise, we can definitely call this a submission.
    this.setState("lastSubmitted", timestamp());
    // Run validation.
    var valid = rpn.validation.validate(v, this.state.app.stack, Object.keys(this.operators));
    if (valid.error) {
      this.setState("error", valid.message);
    } else {
      // Clear any errors and create the new stack, careful to cast the string
      // to a number if it's of that type.
      var stackAddition;
      if (valid.type === rpn.inputTypes.NUMBER) {
        stackAddition = [Number(v)];
      } else {
        stackAddition = [v];
      }
      var newStack = rpn.calculate(this.state.app.stack.concat(stackAddition),
                                   this.operators);
      this.setState("error", null);
      this.setState("stack", newStack);
    }
    return null;
  },
  // Triggered when the user wants the stack cleared.
  //
  // Returns null.
  onClear: function onClear() {
    this.setState("stack", []);
    return null;
  },
  // Triggered when the user presses a key.
  //
  // * e - (Object) Native event object from 'keypress' event, required.
  //
  // Returns null.
  onKeypress: function onKeypress(e) {
    if (e.keyCode === 13) {
      Events.onSubmit.call(this, e);
    }
    return null;
  }
};

// A simple wrapper for `Date#getTime`.
//
// Returns integer.
function timestamp() {
  return (new Date()).getTime();
}

module.exports = BrowserApp;
