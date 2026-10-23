import assert from "node:assert/strict";
import test from "node:test";
import { workspaceReadIsCurrent, remoteContentChanged } from "./workspace-read-guard.js";
import { normalizeStoragePreferences, saveStoragePreferences, loadStoragePreferences } from "./storage-preferences.js";

test("pending downloads only commit to the unchanged starting document", () => {
  const board = { id: "board", revision: 3 };
  assert.equal(workspaceReadIsCurrent(board, board, 1, 1, 2, 2), true);
  assert.equal(workspaceReadIsCurrent(board, { ...board }, 1, 1, 2, 2), false);
  assert.equal(workspaceReadIsCurrent(board, board, 1, 2, 2, 2), false);
  assert.equal(workspaceReadIsCurrent(board, board, 1, 1, 2, 3), false);
});

test("remote content checks prefer head revision over metadata version", () => {
  const link = { fileId: "file", version: "1", headRevisionId: "head1" };
  assert.equal(remoteContentChanged(link, { id: "file", version: "2", headRevisionId: "head1" }), false);
  assert.equal(remoteContentChanged(link, { id: "file", version: "2", headRevisionId: "head2" }), true);
  assert.equal(remoteContentChanged(link, { id: "other", version: "2" }), false);
  assert.equal(remoteContentChanged(link, { id: "file", version: "2" }), true);
});

test("recovered documents retain the upload pause and recovery pointer after reload", () => {
  let serialized;
  const storage = { setItem: (_, value) => { serialized = value; }, getItem: () => serialized };
  saveStoragePreferences(storage, { targets: { board: "drive" }, uploadPaused: { board: true }, loadRecoveries: { board: { boardId: "original", versionId: "saved", target: "local" } } });
  const restored = loadStoragePreferences(storage);
  assert.equal(restored.targets.board, "drive");
  assert.equal(restored.uploadPaused.board, true);
  assert.equal(restored.loadRecoveries.board.versionId, "saved");
  assert.deepEqual(normalizeStoragePreferences({ uploadPaused: { bad: "yes" }, loadRecoveries: { bad: {} } }).loadRecoveries, {});
});
