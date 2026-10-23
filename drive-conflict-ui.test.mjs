import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("./main.jsx", import.meta.url), "utf8");

test("Drive conflict prioritizes two safe choices and keeps overwrite behind a disclosure", () => {
  assert.match(source, /!driveSession\.conflict \? \(\s*<section className=\{`drive-status-panel/);
  assert.match(source, /同步已暫停：選擇要保留的版本/);
  assert.match(source, /將 Drive 版本開成新 Moodboard/);
  assert.match(source, /將目前內容另存新檔/);
  assert.match(source, /<details className="drive-conflict-more"/);
  assert.match(source, /更多處理方式/);
  assert.match(source, /以目前內容覆寫 Drive…/);
  assert.match(source, /className="quiet-button"[^>]*>稍後處理<\/button>/);
  assert.match(source, /disabled=\{!overwriteAcknowledged \|\| busy\}/);
  assert.match(source, /driveSession\.conflictActionError/);
  assert.match(source, /上次操作未完成：/);
  assert.match(source, /fileId: driveSession\.conflict\.id/);
  assert.match(source, /onOverwrite\(\{[\s\S]*?boardId: board\.id,[\s\S]*?version: driveSession\.conflict\.version/);
});

test("saving a Drive copy creates an independent board and keeps the current Drive link", () => {
  assert.match(source, /const uploadSnapshot = asCopy \? createRecoveredMoodboard\(snapshot, \{ label: "Drive 複本" \}\) : snapshot/);
  assert.match(source, /if \(!asCopy\) \{\s*updateDriveSettings\([\s\S]*?setBoardPrimaryStorage\(snapshot\.id, "drive"\);[\s\S]*?await removeSyncJob\(snapshot\.id\);/);
  assert.match(source, /conflict: asCopy \? current\.conflict : null/);
  assert.match(source, /if \(!asCopy\) \{\s*try \{\s*const queuedJob = await getSyncJob/);
  assert.match(source, /conflict: asCopy \|\| forceOverwrite \? current\.conflict : null/);
  assert.match(source, /\(asCopy \|\| forceOverwrite\) && current\.conflict/);
  assert.match(source, /status: authorizationRequired \? "authorization-required" : preservesExistingConflict \? "conflict" : status/);
});

test("autosync stays paused until a Drive conflict is resolved", () => {
  assert.match(source, /currentDriveLink \|\| driveSession\.conflict\) return undefined/);
  assert.match(source, /status: current\.conflict \? "conflict" : "ready"/);
});

test("overwrite stays bound to the reviewed board and Drive file", () => {
  assert.match(source, /overwriteTarget\.boardId === snapshot\.id/);
  assert.match(source, /overwriteTarget\.fileId === linkedFile\?\.fileId/);
  assert.match(source, /overwriteTarget\.boardId === activeConflict\?\.boardId/);
  assert.match(source, /overwriteTarget\.fileId === activeConflict\?\.id/);
  assert.match(source, /status: current\.connected \? "ready" : current\.status,[\s\S]*?conflict: null/);
});
