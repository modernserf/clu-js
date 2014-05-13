var repl = require("repl");
var CLU = require('./clu.js');

var local = repl.start({
  prompt: "node via stdin> ",
  input: process.stdin,
  output: process.stdout
});

local.context.CLU = CLU;
