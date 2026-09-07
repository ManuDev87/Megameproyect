"use strict";

/**
 * Runs before `wrangler deploy` / `wrangler versions upload` so
 * `.open-next/worker.js` exists. Workers Builds preview ignores wrangler.jsonc
 * custom builds and goes straight to `npx wrangler versions upload`.
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

if (process.env.SKIP_CF_BUILD === "1") {
  return;
}

const entry = String(process.argv[1] || "").replace(/\\/g, "/");
if (!entry.includes("wrangler")) {
  return;
}

const args = process.argv.slice(2);
const isDeploy = args[0] === "deploy";
const isUpload = args[0] === "versions" && args.includes("upload");
if (!isDeploy && !isUpload) {
  return;
}
if (args.includes("--help") || args.includes("-h")) {
  return;
}

process.env.SKIP_CF_BUILD = "1";

const script = path.join(__dirname, "cf-build.mjs");
if (!fs.existsSync(script)) {
  console.error("[cf-build] missing", script);
  process.exit(1);
}

console.log("[cf-build] building OpenNext before wrangler", args[0]);
const result = spawnSync(process.execPath, [script], {
  stdio: "inherit",
  env: process.env,
});
if (result.status) {
  const workerJs = path.join(__dirname, "..", ".open-next", "worker.js");
  if (fs.existsSync(workerJs)) {
    console.warn("[cf-build] OpenNext failed; deploying the Worker already in the repo");
    return;
  }
  process.exit(result.status);
}
