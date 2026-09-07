#!/usr/bin/env node
"use strict";

require("./wrangler-hook.cjs");

const { spawn } = require("child_process");
const path = require("path");

const wranglerJs = path.join(
  __dirname,
  "..",
  "node_modules",
  "wrangler",
  "bin",
  "wrangler.js",
);

const child = spawn(process.execPath, [wranglerJs, ...process.argv.slice(2)], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
