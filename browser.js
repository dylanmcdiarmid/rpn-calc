"use strict";
// Runs the browser app. Meant to be the main module called when building for
// the browser.
(function (root) {
  var document = root.document || {};

  var rpn = require("./");
  var BrowserApp = require("./lib/browser-app");

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
