"use strict";
var types = require("./input-types.js");
var errorMessages = require("./input-error-messages.js");

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
