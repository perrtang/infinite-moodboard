import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [mainSource, stylesSource] = await Promise.all([
  readFile(new URL("./main.jsx", import.meta.url), "utf8"),
  readFile(new URL("./styles.css", import.meta.url), "utf8"),
]);

test("layer rows use their full surface for selection and thresholded drag ordering", () => {
  assert.doesNotMatch(mainSource, /className="layer-drag-handle"/);
  assert.doesNotMatch(stylesSource, /\.layer-drag-handle/);
  assert.match(mainSource, /onPointerDown=\{\(event\) => startLayerDrag\(event, object\.id\)\}/);
  assert.match(mainSource, /Math\.hypot\([\s\S]*?if \(distance < 5\) return/);
  assert.match(mainSource, /layerDrag\?\.ids\?\.includes\(object\.id\)/);
  assert.match(mainSource, /onReorderLayer\(movingIds, dropTarget\.targetId, dropTarget\.placement\)/);
});

test("layer row actions explain range, discontiguous, drag, and keyboard ordering", () => {
  assert.match(mainSource, /Shift 連續選取；Command\/Ctrl 個別加入/);
  assert.match(mainSource, /toggleKey: event\.metaKey \|\| event\.ctrlKey/);
  assert.match(mainSource, /if \(!event\.altKey\) return/);
  assert.match(stylesSource, /\.layer-main:focus-visible[\s\S]*?outline-offset: -3px/);
});
