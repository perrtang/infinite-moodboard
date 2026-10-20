import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("release version stays aligned across runtime and update metadata", async () => {
  const [packageJson, lockJson, versionSource, manifestJson] = await Promise.all([
    read("./package.json").then(JSON.parse),
    read("./package-lock.json").then(JSON.parse),
    read("./version.js"),
    read("./public/infinite-moodboard-update.json").then(JSON.parse),
  ]);

  assert.equal(lockJson.version, packageJson.version);
  assert.equal(lockJson.packages[""].version, packageJson.version);
  assert.equal(manifestJson.version, packageJson.version);
  assert.match(versionSource, new RegExp(`APP_VERSION = ["']${packageJson.version.replaceAll(".", "\\.")}["']`));
});

test("GitHub release assets are built from a verified tag without cloud rule deployment", async () => {
  const [releaseWorkflow, pagesWorkflow, packageScript] = await Promise.all([
    read("./.github/workflows/release.yml"),
    read("./.github/workflows/deploy-pages.yml"),
    read("./scripts/package-release.sh"),
  ]);

  assert.match(releaseWorkflow, /npm test/);
  assert.match(releaseWorkflow, /package-release\.sh/);
  assert.match(releaseWorkflow, /gh release create/);
  assert.match(releaseWorkflow, /SHA256SUMS\.txt/);
  assert.doesNotMatch(`${releaseWorkflow}\n${pagesWorkflow}`, /firebase(?:-tools)?\s+deploy|firestore:rules/);
  assert.match(packageScript, /VITE_BASE_PATH=\.\/ npm run build/);
});

test("standalone rules file carries an explicit central-rules safety warning", async () => {
  const [rules, readme, releaseGuide] = await Promise.all([
    read("./firestore.rules"),
    read("./README.md"),
    read("./RELEASING.md"),
  ]);

  assert.match(rules, /DO NOT DEPLOY THIS FILE BY ITSELF/);
  assert.match(readme, /must never be deployed by itself/);
  assert.match(releaseGuide, /Never run `firebase deploy --only firestore:rules`/);
});
