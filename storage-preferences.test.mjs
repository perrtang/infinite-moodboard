import assert from "node:assert/strict";
import test from "node:test";
import {
  STORAGE_PREFERENCES_STORAGE_KEY,
  isCurrentStorageTargetOperation,
  loadStoragePreferences,
  normalizeStoragePreferences,
  saveStoragePreferences,
  setBoardStorageTarget,
  storageTargetForBoard,
} from "./storage-preferences.js";

function memoryStorage() {
  const values = new Map();
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
  };
}

test("storage preferences default to safe autosave and visible status", () => {
  assert.deepEqual(normalizeStoragePreferences(null), {
    autoSave: true,
    showSaveStatus: true,
    targets: {},
  });
});

test("storage targets are board-specific and ignore unsupported values", () => {
  let preferences = setBoardStorageTarget({}, "board-a", "local");
  preferences = setBoardStorageTarget(preferences, "board-b", "drive");
  preferences = setBoardStorageTarget(preferences, "board-c", "dropbox");

  assert.equal(storageTargetForBoard(preferences, "board-a"), "local");
  assert.equal(storageTargetForBoard(preferences, "board-b"), "drive");
  assert.equal(storageTargetForBoard(preferences, "board-c"), null);
});

test("storage preferences persist without changing safe defaults", () => {
  const storage = memoryStorage();
  saveStoragePreferences(storage, {
    autoSave: false,
    showSaveStatus: false,
    targets: { board: "drive", invalid: "other" },
  });

  assert.ok(storage.getItem(STORAGE_PREFERENCES_STORAGE_KEY));
  assert.deepEqual(loadStoragePreferences(storage), {
    autoSave: false,
    showSaveStatus: false,
    targets: { board: "drive" },
  });
});

test("stale storage target operations cannot override the latest board choice", () => {
  assert.equal(isCurrentStorageTargetOperation({
    expectedEpoch: 4,
    currentEpoch: 4,
    expectedBoardId: "board-a",
    currentBoardId: "board-a",
  }), true);
  assert.equal(isCurrentStorageTargetOperation({
    expectedEpoch: 4,
    currentEpoch: 5,
    expectedBoardId: "board-a",
    currentBoardId: "board-a",
  }), false);
  assert.equal(isCurrentStorageTargetOperation({
    expectedEpoch: 5,
    currentEpoch: 5,
    expectedBoardId: "board-a",
    currentBoardId: "board-b",
  }), false);
});
