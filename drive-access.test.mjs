import test from "node:test";
import assert from "node:assert/strict";
import { isCloudBoardReadOnly } from "./drive-access.js";

test("a transient authorization failure retains known local editing rights but not viewer rights", () => {
  const pending = { fileId: "file-1", status: "authorization-required", canEdit: false };
  assert.equal(isCloudBoardReadOnly(pending, { fileId: "file-1", canEdit: true }), false);
  assert.equal(isCloudBoardReadOnly(pending, { fileId: "file-1", canEdit: false }), true);
  assert.equal(isCloudBoardReadOnly({ ...pending, status: "ready" }, { fileId: "file-1", canEdit: true }), true);
  assert.equal(isCloudBoardReadOnly(pending, { fileId: "other", canEdit: false }), false);
});
