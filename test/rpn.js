"use strict";
var assert = require("chai").assert;
var rpn = require("../");

describe("validate", function() {
  it("should reject new entities when undefined", function() {
    var res, no;
    res = rpn.validation.validate(no, [1, 2], ["%"]);
    assert.equal(res.error, true);
    assert.equal(res.type, rpn.inputTypes.INVALID_UNDEFINED);
  });
  it("should reject new entities when not valid operator or number", function() {
    var res;
    res = rpn.validation.validate("+", [1, 2], ["%"]);
    assert.equal(res.error, true);
    assert.equal(res.type, rpn.inputTypes.INVALID_WORD);
  });
  it("should reject new entities if the stack is too small", function() {
    var res;
    res = rpn.validation.validate("%", [1], ["%"]);
    assert.equal(res.error, true);
    assert.equal(res.type, rpn.inputTypes.INVALID_NUMBERS_IN_STACK);
  });
  it("should accept valid operators when there are 2 or more numbers in the stack", function() {
    var res;
    res = rpn.validation.validate("%", [1, 2], ["%"]);
    assert.equal(res.error, false);
    assert.equal(res.type, rpn.inputTypes.OPERATOR);
    res = rpn.validation.validate("%", [1, 2, 3], ["%"]);
    assert.equal(res.error, false);
    assert.equal(res.type, rpn.inputTypes.OPERATOR);
  });
  it("should accept numeric strings, integers, and decimals", function() {
    var res;
    res = rpn.validation.validate("1", [], []);
    assert.equal(res.error, false);
    assert.equal(res.type, rpn.inputTypes.NUMBER);
    res = rpn.validation.validate(1, [], []);
    assert.equal(res.error, false);
    assert.equal(res.type, rpn.inputTypes.NUMBER);
    res = rpn.validation.validate("1.2", [], []);
    assert.equal(res.error, false);
    assert.equal(res.type, rpn.inputTypes.NUMBER);
    res = rpn.validation.validate(1.2, [], []);
    assert.equal(res.error, false);
    assert.equal(res.type, rpn.inputTypes.NUMBER);
  });
});

describe("calculate", function() {
  it("should process two numbers exactly when given an operator", function() {
    var res = rpn.calculate([1, 2, "+"], rpn.commonOps)
    assert.equal(res.length, 1);
    assert.equal(res[0], 3);
  });
  it("should accept custom operators", function(done) {
    var testOp = function (v1, v2) {
      assert.equal(v1, 1);
      assert.equal(v2, 2);
      done();
    };
    rpn.calculate([1, 2, "%"], { "%": testOp });
  });
});
