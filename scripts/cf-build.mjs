/**
 * Workers Builds preview runs `npx wrangler versions upload` and does not
 * use the dashboard Build command from wrangler.jsonc. Wrangler still runs
 * this custom build before upload, which must produce `.open-next/worker.js`.
 */
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const workerJs = path.join(root, ".open-next", "worker.js");
const nextDir = path.join(root, ".next");
const workerSource = existsSync(workerJs) ? readFileSync(workerJs, "utf8") : "";
const isPlaceholder = workerSource.includes("PIXLANZ_PLACEHOLDER");

if (existsSync(workerJs) && !isPlaceholder) {
  console.log("[cf-build] .open-next/worker.js already present");
  process.exit(0);
}

const bin = path.join(
  root,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "opennextjs-cloudflare.cmd" : "opennextjs-cloudflare",
);
const args = ["build"];
if (existsSync(nextDir)) {
  args.push("--skipNextBuild");
  console.log("[cf-build] adapting existing Next.js build for Cloudflare");
} else {
  console.log("[cf-build] building Next.js and adapting for Cloudflare");
}

const result = spawnSync(bin, args, {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status === null ? 1 : result.status);
