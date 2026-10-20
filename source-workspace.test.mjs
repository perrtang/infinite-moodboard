import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { sourceExportArtifact } from "./asset-export.js";

const source = await readFile(new URL("./main.jsx", import.meta.url), "utf8");

test("source workspace renders source-specific controls instead of hidden canvas controls", () => {
  assert.match(source, /sourceModeActive \? \(\s*<div className="source-toolbar-context">/);
  assert.match(source, /sourceModeActive \? \(\s*<SourceInspector/);
  assert.match(source, /\{!sourceModeActive \? <div className="export-dock"/);
  assert.match(source, /onPointerDown=\{sourceModeActive \? undefined : onCanvasPointerDown\}/);
  assert.match(source, /onWheel=\{sourceModeActive \? undefined : onWheel\}/);
  assert.match(source, /onDrop=\{sourceModeActive \? onSourceModeDrop : onDrop\}/);
  assert.match(source, /disabled=\{cloudReadOnly \|\| sourceModeActive \|\| !undoRef\.current\.length\}/);
  assert.match(source, /disabled=\{cloudReadOnly \|\| sourceModeActive \|\| !redoRef\.current\.length\}/);
  assert.match(source, /disabled=\{cloudReadOnly \|\| sourceModeActive\}/);
  assert.match(source, /sourceModeActive \? "素材檢視中 · Moodboard 名稱唯讀" : topbarSaveState/);
});

test("source workspace blocks hidden canvas mutation shortcuts and media paste", () => {
  assert.match(source, /if \(leftTab === "sources"\) \{[\s\S]*blockedModifier[\s\S]*blockedShift[\s\S]*blockedDirect/);
  assert.match(source, /if \(leftTab === "sources"\) \{\s*announce\("素材檢視不會新增或改動畫布物件/);
  assert.match(source, /inert=\{inspectionActive \? true : undefined\}/);
});

test("source export returns the original bytes and filename extension", async () => {
  const artifact = await sourceExportArtifact({
    type: "image",
    mime: "image/png",
    originalFilename: "original-reference.png",
    src: "data:image/png;base64,AQIDBA==",
  });
  assert.equal(artifact.extension, "png");
  assert.equal(artifact.blob.type, "image/png");
  assert.deepEqual([...new Uint8Array(await artifact.blob.arrayBuffer())], [1, 2, 3, 4]);
});
