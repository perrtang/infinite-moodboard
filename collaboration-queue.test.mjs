import assert from "node:assert/strict";
import test, { beforeEach } from "node:test";
import { indexedDB } from "fake-indexeddb";
import {
  COLLABORATION_QUEUE_DATABASE,
  clearCollaborationQueue,
  listQueuedCollaborationUpdates,
  queueCollaborationUpdate,
  removeQueuedCollaborationUpdate,
  updateQueuedCollaborationUpdate,
} from "./collaboration-queue.js";

globalThis.indexedDB = indexedDB;

function deleteDatabase(name) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("database delete blocked"));
  });
}

beforeEach(async () => {
  await deleteDatabase(COLLABORATION_QUEUE_DATABASE);
});

test("offline collaboration queue keeps account and room ownership", async () => {
  await queueCollaborationUpdate({
    id: "update-a",
    roomId: "room-a",
    clientId: "client-a",
    senderUid: "uid-a",
    chunks: ["AQID"],
    byteLength: 3,
  });
  const [record] = await listQueuedCollaborationUpdates("room-a");
  assert.equal(record.senderUid, "uid-a");
  assert.equal(record.roomId, "room-a");
  assert.deepEqual(record.chunks, ["AQID"]);
});

test("offline collaboration queue updates retry state and removes acknowledged updates", async () => {
  await queueCollaborationUpdate({ id: "update-a", roomId: "room-a", chunks: ["AQID"], byteLength: 3 });
  const changed = await updateQueuedCollaborationUpdate("update-a", { attemptCount: 2, lastError: "offline" });
  assert.equal(changed.attemptCount, 2);
  assert.equal(changed.lastError, "offline");
  await removeQueuedCollaborationUpdate("update-a");
  assert.deepEqual(await listQueuedCollaborationUpdates(), []);
});

test("clearing collaboration queue removes all rooms", async () => {
  await queueCollaborationUpdate({ id: "update-a", roomId: "room-a", chunks: ["AQID"], byteLength: 3 });
  await queueCollaborationUpdate({ id: "update-b", roomId: "room-b", chunks: ["BAUG"], byteLength: 3 });
  await clearCollaborationQueue();
  assert.deepEqual(await listQueuedCollaborationUpdates(), []);
});
