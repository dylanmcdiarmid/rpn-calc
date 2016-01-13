/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	(function (root) {
	  var document = root.document || {};
	  // ## browser
	  //
	  // Runs the browser app. Meant to be the main module called when building for
	  // the browser.

	  var rpn = __webpack_require__(1);
	  var BrowserApp = __webpack_require__(8);

	  // Create list of element ids, see `lib/browser-app.js` for descriptions,
	  // `index.html` for definitions.
	  var id = document.getElementById.bind(document);
	  var elements = {
	    container: id("container"),
	    input: id("rpn-input"),
	    submit: id("submit-button"),
	    clear: id("clear-button"),
	    error: id("error-field"),
	    lastInStack: id("last-stack"),
	    fullStack: id("full-stack")
	  };


	  // Manually trigger the first render.
	  (new BrowserApp(elements, rpn.commonOps, root.requestAnimationFrame.bind(root))).render();
	}).call(window, window);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	// Alias module.exports
	var me = module.exports;

	// Used to run the calculation with a given stack and set of ops.
	me.calculate = __webpack_require__(2);
	// Commonly defined operations
	me.commonOps = __webpack_require__(3);
	// Input validation
	me.validation = __webpack_require__(4);
	// Input types (useful for comparing against validation returns)
	me.inputTypes = __webpack_require__(5);
	// Make the version easily available.
	me.version = __webpack_require__(7).version;


/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";
	// Takes a list of numbers and operators (stack), and returns a new stack with
	// the operators applied.
	//
	//    calculateRpn([1, 2, "+"], { "+": v1, v2 => v1 + v2 });
	//
	// * stack - (Array) list containing valid numbers and operators
	// * operators - (Object[Function]) hash in the format `(operator name): (operator function)`
	function calculateRpn(stack, operators) {
	  return stack.reduce(function rpnReducer(accu, v) {
	    if (typeof operators[v] !== "undefined") {
	      // If it's an operator, grab the last two numbers from the stack and
	      // apply the function.
	      return accu
	        .slice(0, accu.length - 2)
	        .concat([operators[v].apply(undefined, accu.slice(-2))]);
	    }
	    // If it's not a valid operator, then it should be a number. Immutably add
	    // it on to the end of the stack.
	    return accu.concat([v]);
	  }, []);
	}

	module.exports = calculateRpn;


/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";
	// Arithmetic operators. All operators will receive two values (the previous
	// two in the stack).
	module.exports = {
	  "+": function add(v1, v2) { return v1 + v2; },
	  "-": function subtract(v1, v2) { return v1 - v2; },
	  "*": function mult(v1, v2) { return v1 * v2; },
	  "/": function div(v1, v2) { return v1 / v2; }
	};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var types = __webpack_require__(5);
	var errorMessages = __webpack_require__(6);

	// The `ValidationResult` data structure will be returned when calling
	// the `validate` function.
	//
	// * err - (Boolean) Whether there was an error.
	// * type - (Integer) Number, Operator, or Invalid type. See `lib/input-types`.
	// * msg - (String) Error message to display to user.
	//
	// Return `ValidationResult` instance.
	function ValidationResult(err, type, msg) {
	  if (!(this instanceof ValidationResult)) {
	    return new ValidationResult(err, type, msg);
	  }
	  this.error = err;
	  this.message = msg || null;
	  this.type = type;
	  return this;
	}

	// Checks input to see if it may be added to an RPN stack.
	//
	// **B.N.** The caller is responsible for casting numbers correctly before
	// adding them to the stack. If your result doesn't contain an error, check the
	// ValidationResult.type to see if it is a number or operator.
	//
	// * newItem - (Any) The item to validate.
	// * stack - (Array) The current stack.
	// * operatorList - (Array[String]) A list of valid operator names.
	//
	// Returns `ValidationResult` instance.
	function validate(newItem, stack, operatorList) {
	  // Stack items must be defined.
	  var type;
	  if (typeof newItem === "undefined") {
	    type = types.INVALID_UNDEFINED;
	    return new ValidationResult(true, type, errorMessages[type]);
	  }
	  var itemIsOperator = isOperator(newItem, operatorList);
	  var itemAsNumber = Number(newItem);
	  // If it's not an operator or numeric, it's invalid.
	  if (!itemIsOperator && !isNumeric(newItem)) {
	    type = types.INVALID_WORD;
	    return new ValidationResult(true, type, errorMessages[type]);
	  }
	  // If it's an operator, we need to make sure that we have two numbers before
	  // it in the stack, otherwise we can't successfully apply the operator.
	  if (itemIsOperator && !firstTwoAreNumbers(stack)) {
	    type = types.INVALID_NUMBERS_IN_STACK;
	    return new ValidationResult(true, type, errorMessages[type]);
	  }

	  type = itemIsOperator ? types.OPERATOR : types.NUMBER;
	  return new ValidationResult(false, type);
	}

	// ## utility functions

	// Checks to see if there are enough numbers to run an operation
	// after the stack has been processed.
	//
	// * stack - (Array) The stack to check
	//
	// Returns boolean.
	function firstTwoAreNumbers(stack) {
	  var v = stack.slice(0, 2);
	  return !(v.length < 2 || !isNumeric(v[0]) || !isNumeric(v[1]));
	}

	// Checks if a value should be considered numeric.
	//
	// * v - (Any) The entity to check.
	//
	// Returns boolean.
	function isNumeric(v) {
	  return (!isNaN(v) && isFinite(v));
	}

	// Looks through a given list of operators and checks to see if the given item
	// is in it.
	//
	// * item - (String) The item to check for.
	// * operatorList - (Array[String]) A list of operator names.
	//
	// Returns boolean.
	function isOperator(item, operatorList) {
	  return (operatorList.indexOf(item) > -1);
	}

	module.exports = {
	  ValidationResult: ValidationResult,
	  validate: validate
	};


/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";
	// A list of types that can be returned from input validation. See
	// `lib/validate-rpn.js`.
	var inputTypes = {
	  // If the word matches an operator name.
	  OPERATOR: 1,
	  // If the word is numeric.
	  NUMBER: 2,
	  // Should never occcur, indicates a mistake on the programmers part.
	  INVALID_UNDEFINED: 3,
	  // Indicates user input was not a valid operator or number
	  INVALID_WORD: 4,
	  // Indicates there were not enough numbers in the stack to
	  INVALID_NUMBERS_IN_STACK: 5
	};

	module.exports = inputTypes;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	// Human readable error messages for invalid input types.
	var types = __webpack_require__(5);

	// Alias `module.exports`
	var me = module.exports;

	// See `/lib/input-types.js` for a description of these types.
	me[types.INVALID_UNDEFINED] = "Received undefined value.";
	me[types.INVALID_WORD] = "You must enter a number or known operator.";
	me[types.INVALID_NUMBERS_IN_STACK] = "You do not have enough numbers left in the stack to process an operator.";


/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = {
		"name": "rpn-calc",
		"version": "0.1.0",
		"description": "Reverse Polish Notation Calculator, written as a programming sample.",
		"main": "index.js",
		"private": "true",
		"bin": {
			"rpn-calc": "bin/rpn.js"
		},
		"scripts": {
			"test": "./node_modules/mocha/bin/mocha test/",
			"build": "node node_modules/webpack/bin/webpack.js browser.js assets/bundle.js && npm run docs",
			"docs": "node scripts/gen-docs.js"
		},
		"repository": {
			"type": "git",
			"url": "git+https://github.com/littleloops/rpn-calc.git"
		},
		"author": "Dylan McDiarmid <dylan@litteloops.io>",
		"license": "MIT",
		"bugs": {
			"url": "https://github.com/littleloops/rpn-calc/issues"
		},
		"homepage": "https://github.com/littleloops/rpn-calc#readme",
		"devDependencies": {
			"chai": "^3.4.1",
			"docco": "^0.7.0",
			"glob": "^6.0.4",
			"imports-loader": "^0.6.5",
			"jscs": "^2.8.0",
			"jshint": "^2.8.0",
			"json-loader": "^0.5.4",
			"mocha": "^2.3.4",
			"webpack": "^1.12.11"
		}
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	// A unidirectional GUI for interacting with RPN features. Uses a toy
	// functional reactive implementation.
	var rpn = __webpack_require__(1);

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


/***/ }
/******/ ]);