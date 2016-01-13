# Reverse Polish Notation Calculator

This is a toy project completed as an assignment for a job interview. The full text for the assignment is [here](https://gist.github.com/nilbus/29b0752086f59af3e2bb). It's written to be compatible with EcmaScript 5 (although I use arrow notation in the documentation for a couple examples). No additional modules are required for non-development/testing.

## Overview
The core of the library is very simple. The first part is the [input validator]() (perhaps more correctly a parser or tokenizer). It checks if a specific entity may be added to a specific stack given a list of valid operators. [The calculator](lib/calculate-rpn.js) expects a valid stack as input and an object with operator names as keys, and their corresponding functions as values (for an example of this structure, see [common-ops](lib/common-ops.js)).

Two interfaces are implemented to use the core library. [CLI](lib/cli.js) uses readline for an experience similar to the one described in the assignment, and the [browser](lib/browser.js) implementation uses a toy unidirectional FRP pattern.

## Code Documentation
Comments are written in the [docco](https://jashkenas.github.io/docco/) style. If you'd like to read the comments and code side by side (which I recommend), you can view the corresponding html files in the docs folder.

## Installing
Simply clone this repo. The browser interface is ready to go, just open [index.html](index.html) in a web browser.

To run the readline interface, ensure you have node installed and run `npm run cli` or `node ./bin/rpn.js`.

## Testing & Development
`npm install` will install development and testing requirements.

`npm test` will run tests. One of the tests covers linting with jshint and jscs.

`npm run build` will build the browser bundle and docs.

`npm run webpack` will build just the browser bundle.

`npm run docs` will build jst the docs.

A quick note on testing, I don't consider this quite done as the readline interface and browser interface are left untested, where they are more likely to have bugs. They are simply left out because of time concerns.
