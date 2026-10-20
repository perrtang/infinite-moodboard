import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_OBJECT_COLORS,
  OBJECT_COLOR_LIBRARY_STORAGE_KEY,
  loadObjectColorLibrary,
  mergeObjectColorLibrary,
  normalizeObjectColor,
  parseObjectColorLibraryFile,
  saveObjectColorLibrary,
  serializeObjectColorLibrary,
} from "./color-library.js";

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
  };
}

test("object colors normalize shorthand, casing, duplicates, and invalid values", () => {
  assert.equal(normalizeObjectColor("#abc"), "#AABBCC");
  assert.equal(normalizeObjectColor("#a1B2c3"), "#A1B2C3");
  assert.equal(normalizeObjectColor("rgb(0, 0, 0)"), null);
  assert.deepEqual(mergeObjectColorLibrary(["#fff", "#FFFFFF", "#000000", "bad"]), ["#FFFFFF", "#000000"]);
});

test("object color library persists locally while retaining the built-in palette", () => {
  const storage = memoryStorage();
  const saved = saveObjectColorLibrary(storage, ["#123456", "#FFFFFF"]);
  const loaded = loadObjectColorLibrary(storage);

  assert.equal(storage.getItem(OBJECT_COLOR_LIBRARY_STORAGE_KEY), JSON.stringify(saved));
  assert.deepEqual(loaded.slice(0, DEFAULT_OBJECT_COLORS.length), DEFAULT_OBJECT_COLORS);
  assert.equal(loaded.at(-1), "#123456");
});

test("portable object color libraries round-trip and unrelated JSON fails closed", () => {
  const colors = ["#123456", "#ABCDEF"];
  assert.deepEqual(parseObjectColorLibraryFile(serializeObjectColorLibrary(colors)), colors);
  assert.deepEqual(parseObjectColorLibraryFile(JSON.stringify(colors)), colors);
  assert.throws(
    () => parseObjectColorLibraryFile(JSON.stringify({ kind: "other-library", colors })),
    /不是 Infinite Moodboard/,
  );
});
