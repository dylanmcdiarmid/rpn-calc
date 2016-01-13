"use strict";
// Alias module.exports
var me = module.exports;

// Used to run the calculation with a given stack and set of ops.
me.calculate = require("./lib/calculate-rpn");
// Commonly defined operations
me.commonOps = require("./lib/common-ops");
// Input validation
me.validation = require("./lib/validate-rpn.js");
// Input types (useful for comparing against validation returns)
me.inputTypes = require("./lib/input-types.js");
// Make the version easily available.
me.version = require("./package.json").version;
