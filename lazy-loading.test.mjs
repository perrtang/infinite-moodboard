import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("./main.jsx", import.meta.url), "utf8");
const viteConfig = await readFile(new URL("./vite.config.js", import.meta.url), "utf8");

test("advanced feature runtimes are dynamically imported instead of entering the startup graph", () => {
  const lazyModules = [
    "asset-export.js",
    "collaboration-firestore.js",
    "drive-storage.js",
    "micro3d-ui.jsx",
    "output.js",
    "portable.js",
  ];
  lazyModules.forEach((moduleName) => {
    assert.match(source, new RegExp(`import\\(\\"\\./${moduleName.replace(".", "\\.")}\\"\\)`));
    assert.doesNotMatch(source, new RegExp(`from \\"\\./${moduleName.replace(".", "\\.")}\\"`));
  });
});

test("collaboration-only vendor code remains outside the initial authentication chunks", () => {
  assert.match(viteConfig, /@firebase\/firestore[^\n]+firebase-firestore/);
  assert.match(viteConfig, /@firebase\/auth[^\n]+firebase-auth/);
  assert.match(viteConfig, /yjs[^\n]+collaboration-engine/);
});

test("lazy 3D controls expose loading and recoverable failure feedback", () => {
  assert.match(source, /FeatureChunkLoading label="3D 控制器"/);
  assert.match(source, /載入失敗；目前畫布未受影響/);
  assert.match(source, /重新載入程式/);
});
