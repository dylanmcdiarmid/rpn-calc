"use strict";
// Human readable error messages for invalid input types.
var types = require("./input-types");

// Alias `module.exports`
var me = module.exports;

// See `/lib/input-types.js` for a description of these types.
me[types.INVALID_UNDEFINED] = "Received undefined value.";
me[types.INVALID_WORD] = "You must enter a number or known operator.";
me[types.INVALID_NUMBERS_IN_STACK] = "You do not have enough numbers left in the stack to process an operator.";
