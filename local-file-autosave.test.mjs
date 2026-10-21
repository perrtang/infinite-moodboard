import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("./main.jsx", import.meta.url), "utf8");

test("local autosave keeps a recovery copy before writing the bound file", () => {
  const recovery = source.indexOf("persistBoardLocally(snapshot)");
  const fileWrite = source.indexOf("writeBoardToBoundLocalFile(snapshot)", recovery);
  assert.ok(recovery >= 0);
  assert.ok(fileWrite > recovery);
});

test("the local file picker is presented through an explicit user action", () => {
  assert.match(source, /function LocalFileAutosaveModal/);
  assert.match(source, /onClick=\{onChoose\}/);
  assert.match(source, /pickMoodboardLocalFile\(snapshot, window\.showSaveFilePicker/);
  assert.match(source, /showLocalFileLocation && currentPrimaryStorageTarget === "local"/);
});

test("local mode distinguishes a linked file from explicit browser-only recovery", () => {
  assert.match(source, /localFileBinding\.status === "linked"/);
  assert.match(source, /localFileBinding\.status === "browser-only" \|\| localFileBinding\.status === "unsupported"/);
  assert.match(source, /等待選擇 \.moodboard 檔案/);
});

test("local autosave ignores stale picker results and persists imports immediately", () => {
  assert.match(source, /const operationIsCurrent = \(\) => isCurrentStorageTargetOperation\(\{/);
  assert.match(source, /if \(!operationIsCurrent\(\)\) return false;[\s\S]{0,120}fileHandleRef\.current = handle/);
  assert.match(source, /await persistBoardLocally\(imported\);[\s\S]{0,120}setDirty\(false\)/);
});

test("a saved file handle is scoped to the active Moodboard", () => {
  assert.match(source, /saveLocalFileHandle\(snapshot\.id, handle\)/);
  assert.match(source, /loadLocalFileHandle\(board\.id\)/);
  assert.match(source, /fileHandleRef\.current = null;[\s\S]{0,120}setBoard\(next\)/);
});
