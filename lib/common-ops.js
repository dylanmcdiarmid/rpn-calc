"use strict";
// Arithmetic operators. All operators will receive two values (the previous
// two in the stack).
module.exports = {
  "+": function add(v1, v2) { return v1 + v2; },
  "-": function subtract(v1, v2) { return v1 - v2; },
  "*": function mult(v1, v2) { return v1 * v2; },
  "/": function div(v1, v2) { return v1 / v2; }
};
