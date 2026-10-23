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

test("a compact queue record remains identifiable without duplicating the board payload", () => {
  const [item] = mergeMoodboardLibrary({
    syncJobs: [{
      id: "board-queued",
      boardId: "board-queued",
      name: "等待同步",
      snapshotRevision: 12,
      snapshotUpdatedAt: "2026-10-20T05:00:00.000Z",
      state: "offline",
    }],
  });
  assert.equal(item.name, "等待同步");
  assert.equal(item.updatedAt, "2026-10-20T05:00:00.000Z");
  assert.equal(item.status, "offline");
});

test("a stale syncing queue entry cannot override a newer confirmed Drive link", () => {
  const [item] = mergeMoodboardLibrary({
    localBoards: [{ id: "board-1", name: "研究", revision: 12, updatedAt: "2026-10-20T05:00:00.000Z" }],
    remoteFiles: [{ id: "drive-1", boardId: "board-1", name: "研究.moodboard", version: "21" }],
    syncJobs: [{
      id: "board-1",
      boardId: "board-1",
      snapshotRevision: 12,
      snapshotUpdatedAt: "2026-10-20T05:00:00.000Z",
      state: "syncing",
    }],
    links: {
      "board-1": {
        fileId: "drive-1",
        version: "21",
        syncedRevision: 12,
        syncedUpdatedAt: "2026-10-20T05:00:00.000Z",
      },
    },
  });
  assert.equal(item.status, "synced");
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

test("a Drive version newer than the last linked version needs review", () => {
  const [item] = mergeMoodboardLibrary({
    localBoards: [{ id: "board-1", name: "Research" }],
    remoteFiles: [{ id: "drive-1", boardId: "board-1", name: "Research.moodboard", version: "12" }],
    links: { "board-1": { fileId: "drive-1", version: "11" } },
  });
  assert.equal(item.status, "needs-review");
});

test("local edits after the last Drive sync are never reported as synced", () => {
  const [item] = mergeMoodboardLibrary({
    localBoards: [{ id: "board-1", name: "Research", revision: 9, updatedAt: "2026-10-21T02:00:00.000Z" }],
    remoteFiles: [{ id: "drive-1", boardId: "board-1", name: "Research.moodboard", version: "12" }],
    links: {
      "board-1": {
        fileId: "drive-1",
        version: "12",
        syncedRevision: 8,
        syncedUpdatedAt: "2026-10-21T01:00:00.000Z",
      },
    },
  });
  assert.equal(item.status, "local-changed");
});
