import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  COLLABORATION_DEFAULT_INVITE_ROLE,
  LOCAL_COLLABORATION_ORIGIN,
  REMOTE_COLLABORATION_ORIGIN,
  applyCollaborationUpdate,
  assertVerifiedCollaborationUser,
  collaborationId,
  collaborationAccessRequestStatusLabel,
  combineCollaborationChunks,
  createCollaborationDocument,
  createCollaborationInviteUrl,
  encodeCollaborationDocument,
  listenToCollaborationUpdates,
  loadCollaborationResume,
  normalizeCollaborationInvite,
  normalizeCollaborationAccessRequestStatus,
  readBoardFromCollaborationDocument,
  saveCollaborationResume,
  splitCollaborationUpdate,
  writeBoardToCollaborationDocument,
} from "./collaboration.js";
import { createBoard, ensureBoard } from "./model.js";

const appSource = await readFile(new URL("./main.jsx", import.meta.url), "utf8");

function sampleBoard() {
  return ensureBoard(createBoard({
    id: "board-collaboration-test",
    name: "共同編輯測試",
    view: { x: 120, y: -40, zoom: 1.5 },
    objects: [
      {
        id: "object-a",
        sourceId: "asset-a",
        type: "image",
        name: "A",
        layerName: "A",
        src: `data:image/png;base64,${"a".repeat(120_000)}`,
        mime: "image/png",
        originalFilename: "a.png",
        pivotX: 10,
        pivotY: 20,
        width: 100,
        height: 100,
      },
      {
        id: "object-b",
        type: "shape",
        name: "B",
        layerName: "B",
        pivotX: 40,
        pivotY: 50,
        width: 80,
        height: 60,
      },
    ],
  }));
}

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

test("collaboration ids and invitation links are URL safe", () => {
  const invite = collaborationId("invite", 24);
  assert.match(invite, /^invite_[A-Za-z0-9_-]{20,96}$/);
  const url = createCollaborationInviteUrl(invite, "https://example.com/moodboard.html?theme=dark#old");
  assert.equal(new URL(url).searchParams.get("collab"), invite);
  assert.equal(new URL(url).hash, "");
  assert.equal(normalizeCollaborationInvite(url), invite);
  assert.equal(normalizeCollaborationInvite("not a valid invite"), "");
});

test("collaboration updates split and combine without changing bytes", () => {
  const input = new Uint8Array(900_000).map((_, index) => index % 251);
  const chunks = splitCollaborationUpdate(input, 100_000);
  assert.equal(chunks.length, 9);
  assert.deepEqual(combineCollaborationChunks(chunks), input);
});

test("verified identity is required for cloud collaboration", () => {
  assert.throws(() => assertVerifiedCollaborationUser({ uid: "u1", emailVerified: false }), /Email 驗證/);
  assert.equal(assertVerifiedCollaborationUser({ uid: "u1", emailVerified: true }).uid, "u1");
});

test("shared collaboration links start as view only and access request states are normalized", () => {
  assert.equal(COLLABORATION_DEFAULT_INVITE_ROLE, "viewer");
  assert.equal(normalizeCollaborationAccessRequestStatus("pending"), "pending");
  assert.equal(normalizeCollaborationAccessRequestStatus("unexpected"), "none");
  assert.equal(collaborationAccessRequestStatusLabel("approved"), "已核准編輯");
});

test("shared Moodboard links use a link-first flow and auto-join after verified sign-in", () => {
  assert.match(appSource, /title="分享與共同編輯"/);
  assert.match(appSource, /建立分享連結/);
  assert.match(appSource, /複製分享連結/);
  assert.match(appSource, /requestAdvancedFeature\("shared-moodboard"\)/);
  assert.match(appSource, /automaticCollaborationJoinRef\.current = inviteId;\s*joinCloudCollaboration\(inviteId\);/);
});

test("collaboration document keeps assets while preserving each device viewport", () => {
  const board = sampleBoard();
  const document = createCollaborationDocument(board);
  const restored = readBoardFromCollaborationDocument(document, board, { x: -10, y: 30, zoom: 0.8 });
  assert.equal(restored.objects[0].src, board.objects[0].src);
  assert.deepEqual(restored.view, { x: -10, y: 30, zoom: 0.8 });
  document.destroy();
});

test("collaboration keeps global and individual guide locks with the shared board", () => {
  const board = {
    ...sampleBoard(),
    guidesLocked: true,
    guides: [{ id: "guide-locked", axis: "x", position: 144, locked: true }],
  };
  const document = createCollaborationDocument(board);
  const restored = readBoardFromCollaborationDocument(document, board);
  assert.equal(restored.guidesLocked, true);
  assert.deepEqual(restored.guides, [{ id: "guide-locked", axis: "x", position: 144, locked: true }]);
  document.destroy();
});

test("transforming an image does not resend its large source asset", () => {
  const board = sampleBoard();
  const document = createCollaborationDocument(board);
  const updates = [];
  const stop = listenToCollaborationUpdates(document, (update, origin) => {
    if (origin === LOCAL_COLLABORATION_ORIGIN) updates.push(update);
  });
  const next = { ...board, objects: board.objects.map((object) => object.id === "object-a" ? { ...object, pivotX: 88 } : object) };
  writeBoardToCollaborationDocument(document, next);
  assert.equal(updates.length, 1);
  assert.ok(updates[0].byteLength < 20_000, `unexpected update size ${updates[0].byteLength}`);
  stop();
  document.destroy();
});

test("concurrent edits to different objects merge and converge", () => {
  const base = sampleBoard();
  const left = createCollaborationDocument(base);
  const right = createCollaborationDocument();
  applyCollaborationUpdate(right, encodeCollaborationDocument(left), REMOTE_COLLABORATION_ORIGIN);
  const leftUpdates = [];
  const rightUpdates = [];
  const stopLeft = listenToCollaborationUpdates(left, (update, origin) => origin === LOCAL_COLLABORATION_ORIGIN && leftUpdates.push(update));
  const stopRight = listenToCollaborationUpdates(right, (update, origin) => origin === LOCAL_COLLABORATION_ORIGIN && rightUpdates.push(update));

  writeBoardToCollaborationDocument(left, {
    ...base,
    objects: base.objects.map((object) => object.id === "object-a" ? { ...object, pivotX: 111 } : object),
  });
  writeBoardToCollaborationDocument(right, {
    ...base,
    objects: base.objects.map((object) => object.id === "object-b" ? { ...object, pivotY: 222 } : object),
  });
  leftUpdates.forEach((update) => applyCollaborationUpdate(right, update, REMOTE_COLLABORATION_ORIGIN));
  rightUpdates.forEach((update) => applyCollaborationUpdate(left, update, REMOTE_COLLABORATION_ORIGIN));

  const leftBoard = readBoardFromCollaborationDocument(left, base);
  const rightBoard = readBoardFromCollaborationDocument(right, base);
  assert.equal(leftBoard.objects.find((object) => object.id === "object-a").pivotX, 111);
  assert.equal(leftBoard.objects.find((object) => object.id === "object-b").pivotY, 222);
  assert.deepEqual(leftBoard.objects, rightBoard.objects);
  stopLeft();
  stopRight();
  left.destroy();
  right.destroy();
});

test("collaboration resume data is normalized", () => {
  const storage = memoryStorage();
  const inviteId = collaborationId("invite", 24);
  saveCollaborationResume(storage, { roomId: "room_12345678901234567890", boardId: "board-a", inviteId });
  assert.deepEqual(loadCollaborationResume(storage), {
    roomId: "room_12345678901234567890",
    boardId: "board-a",
    inviteId,
    savedAt: loadCollaborationResume(storage).savedAt,
  });
});
