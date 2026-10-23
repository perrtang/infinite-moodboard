import "fake-indexeddb/auto";
import assert from "node:assert/strict";
import test from "node:test";
import {
  LOCAL_DATABASE_NAME,
  deleteLocalBoard,
  enqueueSync,
  getActiveBoardId,
  getDueSyncJobs,
  getLocalBoard,
  getLocalLibrarySummary,
  getSyncJob,
  listLocalBoards,
  listSyncJobs,
  listVersions,
  loadLocalFileHandle,
  loadCurrentBoard,
  recoverInterruptedSyncJobs,
  removeLocalFileHandle,
  removeSyncJob,
  saveCurrentBoard,
  saveLocalFileHandle,
  saveVersion,
  setActiveBoardId,
  updateSyncJob,
  upsertLocalBoard,
} from "./storage.js";

function board(id, overrides = {}) {
  return {
    schemaVersion: 11,
    id,
    name: `Board ${id}`,
    createdAt: "2026-10-20T00:00:00.000Z",
    updatedAt: "2026-10-20T00:00:00.000Z",
    revision: 1,
    objects: [],
    groups: [],
    guides: [],
    captures: [],
    lastComposition: null,
    view: { x: 0, y: 0, zoom: 1 },
    ...overrides,
  };
}

function deleteDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(LOCAL_DATABASE_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("test database deletion blocked"));
  });
}

function seedLegacyDatabase(legacyBoard) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(LOCAL_DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      database.createObjectStore("state", { keyPath: "key" });
      const versions = database.createObjectStore("versions", { keyPath: "id" });
      versions.createIndex("boardId", "boardId", { unique: false });
      versions.createIndex("createdAt", "createdAt", { unique: false });
    };
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const database = request.result;
      const transaction = database.transaction("state", "readwrite");
      transaction.objectStore("state").put({
        key: "current-board",
        board: legacyBoard,
        savedAt: "2026-10-20T01:00:00.000Z",
      });
      transaction.oncomplete = () => {
        database.close();
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);
    };
  });
}

test("v1 current board migrates into the multi-board local library", async () => {
  await deleteDatabase();
  const legacy = board("legacy", { name: "Legacy Moodboard" });
  await seedLegacyDatabase(legacy);

  assert.equal((await loadCurrentBoard()).id, "legacy");
  assert.equal(await getActiveBoardId(), "legacy");
  const records = await listLocalBoards();
  assert.equal(records.length, 1);
  assert.equal(records[0].board.name, "Legacy Moodboard");
});

test("local library preserves several boards while the active board remains explicit", async () => {
  await deleteDatabase();
  const first = board("one", { updatedAt: "2026-10-20T01:00:00.000Z" });
  const second = board("two", { updatedAt: "2026-10-20T02:00:00.000Z", objects: [{ id: "object-1" }] });
  await saveCurrentBoard(first);
  await upsertLocalBoard(second);

  assert.equal((await loadCurrentBoard()).id, "one");
  assert.equal((await listLocalBoards()).map((entry) => entry.id).join(","), "two,one");
  assert.equal((await getLocalBoard("two")).objectCount, 1);

  await setActiveBoardId("two");
  assert.equal((await loadCurrentBoard()).id, "two");
});

test("offline sync queue coalesces to the newest snapshot and keeps recoverable state", async () => {
  await deleteDatabase();
  await enqueueSync(board("queued", { revision: 1 }), { fileId: "drive-1", expectedVersion: "3" });
  await enqueueSync(board("queued", { revision: 2 }), { fileId: "drive-1", expectedVersion: "3" });

  let jobs = await listSyncJobs();
  assert.equal(jobs.length, 1);
  assert.equal(jobs[0].board.revision, 2);
  assert.equal(jobs[0].fileId, "drive-1");

  await updateSyncJob("queued", {
    state: "offline",
    attemptCount: 1,
    lastError: "network unavailable",
    nextAttemptAt: "2099-01-01T00:00:00.000Z",
  });
  assert.equal((await getSyncJob("queued")).state, "offline");
  assert.equal((await getDueSyncJobs(new Date("2026-10-20T00:00:00.000Z"))).length, 0);

  await removeSyncJob("queued");
  assert.equal(await getSyncJob("queued"), null);
});

test("a page refresh recovers an interrupted syncing job without losing its snapshot", async () => {
  await deleteDatabase();
  await enqueueSync(board("interrupted", { revision: 8 }), { fileId: "drive-8", expectedVersion: "21" });
  await updateSyncJob("interrupted", {
    state: "syncing",
    attemptCount: 2,
    lastError: "",
    nextAttemptAt: "",
  });

  const recoveredAt = new Date("2026-10-23T02:00:00.000Z");
  const recovered = await recoverInterruptedSyncJobs(recoveredAt);
  const job = recovered.find((entry) => entry.boardId === "interrupted");

  assert.equal(job.state, "pending");
  assert.equal(job.board.revision, 8);
  assert.equal(job.fileId, "drive-8");
  assert.equal(job.nextAttemptAt, recoveredAt.toISOString());
  assert.match(job.lastError, /頁面更新或關閉而中斷/);
  assert.equal((await getDueSyncJobs(recoveredAt)).length, 1);
});

test("terminal Drive queue states never become due without an explicit retry deadline", async () => {
  await deleteDatabase();
  const now = new Date("2026-10-23T03:00:00.000Z");
  for (const state of ["authorization-required", "quota", "conflict"]) {
    const id = `terminal-${state}`;
    await enqueueSync(board(id), { fileId: `drive-${state}` });
    await updateSyncJob(id, { state, nextAttemptAt: "" });
  }

  assert.deepEqual(await getDueSyncJobs(now), []);
});

test("deleting a local board also removes its queued sync and versions", async () => {
  await deleteDatabase();
  const current = board("remove-me");
  await saveCurrentBoard(current);
  await saveVersion(current, "Before delete");
  await enqueueSync(current, { fileId: "drive-remove" });
  await saveLocalFileHandle(current.id, { kind: "file", name: "remove-me.moodboard" });

  await deleteLocalBoard(current.id);

  assert.equal(await getLocalBoard(current.id), null);
  assert.equal(await getSyncJob(current.id), null);
  assert.equal((await listVersions(current.id)).length, 0);
  assert.equal(await loadLocalFileHandle(current.id), null);
  assert.equal(await getActiveBoardId(), "");
  assert.equal(await loadCurrentBoard(), null);
});

test("local file handles are stored per board and can be removed independently", async () => {
  await deleteDatabase();
  const firstHandle = { kind: "file", name: "one.moodboard" };
  const secondHandle = { kind: "file", name: "two.moodboard" };
  await saveLocalFileHandle("one", firstHandle);
  await saveLocalFileHandle("two", secondHandle);

  assert.deepEqual(await loadLocalFileHandle("one"), firstHandle);
  assert.deepEqual(await loadLocalFileHandle("two"), secondHandle);

  await removeLocalFileHandle("one");
  assert.equal(await loadLocalFileHandle("one"), null);
  assert.deepEqual(await loadLocalFileHandle("two"), secondHandle);
});

test("local library summary reports board and pending sync counts", async () => {
  await deleteDatabase();
  await saveCurrentBoard(board("summary"));
  await enqueueSync(board("summary", { revision: 2 }));
  const summary = await getLocalLibrarySummary();
  assert.equal(summary.boardCount, 1);
  assert.equal(summary.pendingSyncCount, 1);
  assert.ok(summary.estimatedBoardBytes > 0);
  assert.equal(typeof summary.storage, "object");
});
