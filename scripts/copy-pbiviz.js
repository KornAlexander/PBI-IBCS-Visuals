#!/usr/bin/env node
/**
 * Copies the freshly built .pbiviz from ./dist/ into ../releases/.
 * Run after `pbiviz package` from each visual folder.
 */
const fs = require("fs");
const path = require("path");

const cwd = process.cwd();
const distDir = path.join(cwd, "dist");
const releasesDir = path.resolve(cwd, "..", "releases");

if (!fs.existsSync(distDir)) {
  console.error("[copy-pbiviz] No dist/ folder found at", distDir);
  process.exit(1);
}

const pbivizFiles = fs.readdirSync(distDir).filter((f) => f.endsWith(".pbiviz"));
if (pbivizFiles.length === 0) {
  console.error("[copy-pbiviz] No .pbiviz found in", distDir);
  process.exit(1);
}

fs.mkdirSync(releasesDir, { recursive: true });

for (const f of pbivizFiles) {
  const src = path.join(distDir, f);
  const dst = path.join(releasesDir, f);
  fs.copyFileSync(src, dst);
  console.log("[copy-pbiviz] Copied", f, "→", path.relative(path.resolve(cwd, ".."), dst));
}
