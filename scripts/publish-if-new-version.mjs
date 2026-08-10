#!/usr/bin/env node
// `changesets/action`'s `publish:` command runs on every push to `main`
// regardless of whether there's actually a new version to ship — when no
// changesets are pending, it still tries `npm run release` "in case a
// previous run's publish step failed partway through." A doc-only PR (or
// any push with no changeset) leaves package.json's version exactly where
// the last successful release already left it, so a plain `npm publish`
// hits registry.npmjs.org's "cannot publish over the previously published
// version" 403 — a hard CI failure for a situation that isn't actually an
// error, just nothing new to publish. Skipping cleanly when the current
// version is already live closes that gap without weakening the real
// publish path.
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const { name, version } = JSON.parse(readFileSync("package.json", "utf8"));

let published;
try {
  published = execSync(`npm view ${name}@${version} version`, {
    stdio: ["ignore", "pipe", "ignore"],
  })
    .toString()
    .trim();
} catch {
  // A non-zero exit here means npm couldn't find this exact
  // name@version at all (e.g. the very first publish ever, or a
  // registry lookup hiccup) — fall through to a real publish attempt
  // rather than silently skipping.
  published = null;
}

if (published === version) {
  console.log(`${name}@${version} is already published — nothing to do.`);
  process.exit(0);
}

execSync("npm publish", { stdio: "inherit" });
