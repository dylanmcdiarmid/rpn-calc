#!/usr/bin/env node
'use strict';
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var rootDir = path.join(__dirname, '../');
var doccoConfigPath = path.join(rootDir, 'docco.json');
var doccoPath = path.resolve(rootDir, 'node_modules/docco/bin/docco');
var docPath = path.join(rootDir, 'docs');
var libPath = path.join(rootDir, 'lib');
var binPath = path.join(rootDir, 'bin');
var libDocPath = path.join(docPath, 'lib');
var binDocPath = path.join(docPath, 'bin');
var libDocFiles = fs.readdirSync(libPath)
  .filter(function (v) {
    return (path.extname(v) === '.js');
  })
  .map(function (v) {
    return path.join(libPath, v);
});
var binFiles = [path.join(binPath, 'rpn.js')];
var rootFiles = [path.join(rootDir, 'index.js'), path.join(rootDir, 'browser.js')];

function execDocco(files, dir, cb) {
  var cmd = doccoPath + " " + files.join(" ") + " -m " + doccoConfigPath + " -o " + dir;
  exec(cmd, function(err, stdin, stderr) {
    if (err) {
      console.log("Error:", err);
    }
    if (stdin) {
      console.log(stdin);
    }
    if (stderr) {
      console.log("Error:", stderr);
    }
    cb();
  });
}
function makeAll() {
  makeDirectories();
  execDocco(libDocFiles, libDocPath, function() {
    execDocco(binFiles, binDocPath, function() {
      execDocco(rootFiles, docPath, function() {
        process.exit(0);
      })
    })
  });
}

function makeDirectories() {
  removeDir(docPath);
  fs.mkdirSync(docPath);
  fs.mkdirSync(libDocPath);
  fs.mkdirSync(binDocPath);
}

function removeDir(p) {
  // existence check
  try {
    fs.statSync(p);
  } catch (ignore) {
    return null;
  }
  fs.readdirSync(p).forEach(function (file) {
    var fullPath = path.join(p, file);
    if(fs.statSync(fullPath).isDirectory()) {
      removeDir(fullPath);
    } else {
      fs.unlinkSync(fullPath);
    }
  });
  fs.rmdirSync(p);
  return null;
}
makeAll();
process.stdin.resume();
