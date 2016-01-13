"use strict";
// # cli
var readline = require("readline");
var rpn = require("../");
// Simple data structure for representing command line commands, such as 'help' or 'quit'.
//
// * aliases - (Array[String])|(String) A list of words used to trigger the
//   command, or a single word if passing a string.
// * help - (String) The help text.
// * fn - (Function) The function that should be executed. Will get a `CliApp`
//   instance as it's only argument.
//
// Returns a Command instance.
function Command(aliases, help, fn) {
  if (!(this instanceof Command)) {
    return new Command(aliases, help, fn);
  }
  if (typeof aliases === "string") {
    this.aliases = [aliases];
  } else {
    this.aliases = aliases;
  }
  this.help = help;
  this.fn = fn;
  return this;
}

// Determines whether the given word is a commmand.
//
// * v - (String) The word to test.
//
// Returns boolean.
function isCommand(v) {
  return (typeof commandMap[v] !== "undefined");
}

// The list of available command line commands.
var commands = [
  Command(["?", "help"], "Prints the command and operator list.", function (app) { app.printHelp(); }),
  Command(["q", "quit"], "Quit the application.", function (app) { app.exit(); }),
  Command(["p", "print"], "Prints the full stack.", function (app) { app.printHelp(); }),
  Command(["e", "empty"], "Clears the stack.", function (app) { app.emptyStack(); }),
  Command(["simple"], "Sets the prompt to show only '>'.", function (app) { app.setPrompt("simple"); }),
  Command(["stack"], "Sets the prompt to show the stack.", function (app) { app.setPrompt("stack"); })
];

// Makes command lookups faster and easier when given input.
var commandMap = commands.reduce(function commandReduce(accu, v) {
  v.aliases.forEach(function (cmd) {
    accu[cmd] = v;
    return null;
  });
  return accu;
}, {});

// This string will be used when invoking the 'help' command.
var commandHelp = commands.map(function commandHelpMap(v) {
  return v.aliases.join(", ") + " - " + v.help;
}).join("\n");

// `CliApp` provides the command line interface to both readline and the rpn
// functionality. All of it's prototype functions should be considered to have
// potential side effects.
//
// * promptStyle - (String) The style of prompt to start the application with.
//     - 'simple' Will just display '> '
//     - 'stack' Will display a truncated list of the stack beforhand, e.g.
//       `[ 1 5 4 ]`. See the `makePromptString` function for more information.
// * operators - (Object) Map of operators in the form
//   (operator word): (operator function), e.g. `{ "+": v1, v2 => v1 + v2 }`
function CliApp(operators, promptStyle) {
  if (!(this instanceof CliApp)) {
    return new CliApp(promptStyle);
  }
  if (typeof(promptStyle === "undefined")) {
    promptStyle = "stack";
  }
  this.state = {
    stack: [],
    promptStyle: promptStyle
  };
  this.operators = operators;
  this.rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

// Starts the application.
//
// Returns null.
CliApp.prototype.run = function run() {
  this.printWelcome();
  this.showPrompt();
  return null;
};

// Displays the prompt and waits for input.
//
// Returns null;
CliApp.prototype.showPrompt  = function showPrompt() {
  this.rl.question(makePromptString(this.state.promptStyle, this.state.stack), this.processInput.bind(this));
  return null;
};

CliApp.prototype.processInput = function processInput(input) {
  // Sanitize the input.
  var v = input.trim();

  // If it's a command, call the command function.
  if (isCommand(v)) {
    commandMap[v].fn(this);
  } else {
    // At this point, it's treated as non command input, so check if it's valid.
    var valid = rpn.validation.validate(v, this.state.stack, Object.keys(this.operators));
    if (valid.error) {
      this.printError(valid.message);
    } else {
      // We've got valid input. Add it to the stack and calculate the new stack.
      // Make sure to cast to a Number if that's its type, otherwise it will go
      // in as a string and JavaScript will get all wat-ty when doing arithmetic.
      var stackAddition;
      if (valid.type === rpn.inputTypes.NUMBER) {
        stackAddition = [Number(v)];
      } else {
        stackAddition = [v];
      }
      this.state.stack = rpn.calculate(this.state.stack.concat(stackAddition), this.operators);
      console.log(this.state.stack.slice(-1)[0]);
    }
  }
  // Always reprompt (if a quit command was read, the program will end before this).
  this.showPrompt();
  return null;
};

// Prints an error message to the console.
//
// * msg - (String) The error message to print.
//
// Returns null.
CliApp.prototype.printError = function printError(msg) {
  console.error("Error: ", msg);
  return null;
};

// Exits the application.
//
// Returns null.
CliApp.prototype.exit = function exit() {
  process.exit(0);
  return null;
};

// Clears the stack.
//
// Returns null.
CliApp.prototype.emptyStack = function emptyStack() {
  this.state.stack = [];
  return null;
};

// Prints the welcome message to the console.
//
// Returns null.
CliApp.prototype.printWelcome = function printWelcome() {
  var welcome = "Reverse Polish Notation Calculator v" + rpn.version;
  var welcomeHelp = "? for help, q to exit.";
  console.log(welcome, "\n", welcomeHelp);
  return null;
};

// Prints command line commands and available operators to the console.
//
// Returns null.
CliApp.prototype.printHelp = function printHelp() {
  console.log("Available operators: ", Object.keys(this.operators).join(" "));
  console.log(commandHelp);
  return null;
};

// Updates the prompt style state.
//
// * promptStyle - (String) The style of prompt to start the application with.
//   See the `makePromptString` function for more information.
//
// Returns null.
CliApp.prototype.setPrompt = function setPrompt(promptStyle) {
  this.state.promptStyle = promptStyle;
};

// Pure function for creating the command line prompt.
//
// * promptStyle - (String) The style of prompt to start the application with.
//   Currently accepts 'stack' or 'simple', although any string but 'simple'
//   will result in the 'stack' style being used.
// * stack - (Array) The stack to show (if using the 'stack' style).
// * stackTruncate - (Number) *optional* Max items to show in the stack (before truncating).
//
// Returns string.
function makePromptString(promptStyle, stack, stackTruncate) {
  if (promptStyle === "simple") {
    return "> ";
  }
  if (typeof stackTruncate === "undefined") {
    stackTruncate = 5;
  }
  // Compress the output for empty stacks.
  if (!stack.length) {
    return "[] > ";
  }
  // `workingStack` is the possibly truncated stack.
  var workingStack;
  // `beforeString` is simply what we'll print before (it will vary based on
  // whether we truncate as well).
  var beforeString;
  if (stack.length > stackTruncate) {
    workingStack = stack.slice(-1 * stackTruncate);
    // If truncated, make something like `[ (20 more)... 21 22 3 4 5 ]`.
    beforeString = "[ (" + (stack.length - stackTruncate) + " more)... ";
  } else {
    workingStack = stack;
    beforeString = " [ ";
  }
  var numbers = workingStack.join(" ");
  return beforeString + numbers + " ] > ";
}

module.exports = {
  CliApp: CliApp,
  Command: Command,
  commands: commands,
  commandMap: commandMap
};
