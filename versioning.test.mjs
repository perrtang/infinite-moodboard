import assert from "node:assert/strict";
import test from "node:test";
import { createRecoveredMoodboard, describeDriveConflict } from "./versioning.js";

test("recovering a Drive revision always creates a separate local Moodboard", () => {
  const source = {
    id: "source-board",
    name: "研究",
    createdAt: "2026-10-01T00:00:00.000Z",
    updatedAt: "2026-10-02T00:00:00.000Z",
    revision: 8,
    objects: [{ id: "object-1", type: "shape", name: "矩形", x: 0, y: 0, width: 10, height: 10 }],
  };
  const recovered = createRecoveredMoodboard(source, {
    label: "Drive 版本 3",
    now: "2026-10-20T08:00:00.000Z",
    idFactory: () => "recovered-board",
  });
  assert.equal(recovered.id, "recovered-board");
  assert.equal(recovered.name, "研究 — Drive 版本 3");
  assert.equal(recovered.revision, 0);
  assert.equal(recovered.createdAt, "2026-10-20T08:00:00.000Z");
  assert.equal(source.id, "source-board");
  assert.equal(source.revision, 8);
});

test("Drive conflict comparison keeps local and remote facts separate", () => {
  const summary = describeDriveConflict(
    { revision: 12, updatedAt: "2026-10-20T07:00:00.000Z", objects: [{}, {}] },
    { version: "19", modifiedTime: "2026-10-20T07:10:00.000Z", size: 4096, headRevisionId: "r19" },
  );
  assert.deepEqual(summary.local, {
    revision: 12,
    updatedAt: "2026-10-20T07:00:00.000Z",
    objectCount: 2,
  });
  assert.equal(summary.remote.version, "19");
  assert.equal(summary.remote.headRevisionId, "r19");
});
