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
