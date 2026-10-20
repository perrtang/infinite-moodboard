import assert from "node:assert/strict";
import test from "node:test";
import { mergeMoodboardLibrary } from "./library.js";

test("Moodboard library merges local and Drive records by board identity", () => {
  const items = mergeMoodboardLibrary({
    localBoards: [
      { id: "board-1", name: "研究", updatedAt: "2026-10-20T01:00:00.000Z" },
      { id: "board-2", name: "只有本機", updatedAt: "2026-10-20T02:00:00.000Z" },
    ],
    remoteFiles: [
      { id: "drive-1", boardId: "board-1", name: "研究.moodboard", modifiedTime: "2026-10-20T03:00:00.000Z" },
      { id: "drive-3", boardId: "board-3", name: "只有雲端.moodboard", modifiedTime: "2026-10-20T04:00:00.000Z" },
    ],
  });

  assert.equal(items.length, 3);
  assert.equal(items.find((item) => item.boardId === "board-1").status, "synced");
  assert.equal(items.find((item) => item.boardId === "board-2").status, "local-only");
  assert.equal(items.find((item) => item.boardId === "board-3").status, "remote-only");
});

test("persistent sync state takes priority over location labels", () => {
  const [item] = mergeMoodboardLibrary({
    localBoards: [{ id: "board-1", name: "待同步", updatedAt: "2026-10-20T01:00:00.000Z" }],
    remoteFiles: [{ id: "drive-1", boardId: "board-1", name: "待同步.moodboard" }],
    syncJobs: [{ id: "board-1", boardId: "board-1", state: "conflict" }],
  });
  assert.equal(item.status, "conflict");
});

test("legacy Drive links merge files that predate boardId app properties", () => {
  const [item] = mergeMoodboardLibrary({
    localBoards: [{ id: "board-legacy", name: "Legacy" }],
    remoteFiles: [{ id: "drive-legacy", name: "Legacy.moodboard" }],
    links: { "board-legacy": { fileId: "drive-legacy" } },
  });
  assert.equal(item.boardId, "board-legacy");
  assert.equal(item.status, "synced");
});
