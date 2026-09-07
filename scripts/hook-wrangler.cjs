"use strict";

/**
 * Patches the installed wrangler CLI so Workers Builds runs OpenNext before
 * `versions upload`. npm lifecycle scripts may be skipped; `.npmrc` also
 * preloads scripts/wrangler-hook.cjs as a fallback.
 */
const fs = require("fs");
const path = require("path");

const MARKER = "/* pixlanz-opennext-hook */";
const wranglerBin = path.join(
  __dirname,
  "..",
  "node_modules",
  "wrangler",
  "bin",
  "wrangler.js",
);

if (!fs.existsSync(wranglerBin)) {
  process.exit(0);
}

let src = fs.readFileSync(wranglerBin, "utf8");
if (src.includes(MARKER)) {
  process.exit(0);
}

const hookPath = path.join(__dirname, "wrangler-hook.cjs");
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

fs.writeFileSync(wranglerBin, src);
console.log("[cf-build] hooked wrangler to build OpenNext before deploy/upload");
