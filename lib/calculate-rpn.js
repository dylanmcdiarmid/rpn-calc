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
