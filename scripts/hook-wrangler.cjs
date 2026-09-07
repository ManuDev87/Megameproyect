"use strict";

/**
 * Workers Builds preview runs `npx wrangler versions upload` and ignores
 * wrangler.jsonc custom builds. Patch the installed CLI so OpenNext runs first.
 */
const fs = require("fs");
const path = require("path");

const MARKER = "/* pixlanz-opennext-hook */";
const root = path.join(__dirname, "..");
const wranglerJs = path.join(root, "node_modules", "wrangler", "bin", "wrangler.js");
const hookPath = path.join(__dirname, "wrangler-hook.cjs");
const wrapperPath = path.join(__dirname, "wrangler-bin.cjs");

function patchWranglerJs() {
  if (!fs.existsSync(wranglerJs)) {
    return;
  }

  let src = fs.readFileSync(wranglerJs, "utf8");
  if (src.includes(MARKER)) {
    return;
  }

  const hook = `${MARKER}
try {
  require(${JSON.stringify(hookPath)});
} catch (err) {
  console.error("[cf-build] wrangler hook failed:", err);
  process.exit(1);
}
`;

  if (src.startsWith("#!")) {
    const nl = src.indexOf("\n");
    src = src.slice(0, nl + 1) + hook + src.slice(nl + 1);
  } else {
    src = hook + src;
  }

  fs.writeFileSync(wranglerJs, src);
}

function writeBinShim() {
  const binDir = path.join(root, "node_modules", ".bin");
  if (!fs.existsSync(binDir) || !fs.existsSync(wrapperPath)) {
    return;
  }

  const shim = `#!/usr/bin/env node
require(${JSON.stringify(wrapperPath)});
`;
  fs.writeFileSync(path.join(binDir, "wrangler"), shim, { mode: 0o755 });
}

patchWranglerJs();
writeBinShim();
console.log("[cf-build] hooked wrangler to build OpenNext before deploy/upload");
