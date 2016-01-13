#!/usr/bin/env node
"use strict";
// Just creates a `CliApp` and runs it. See `lib/cli.js` for the meat.
var rpn = require("../");
var CliApp = require("../lib/cli").CliApp;

(new CliApp(rpn.commonOps, "stack")).run();
