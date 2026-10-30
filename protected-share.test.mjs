import test from "node:test";
import assert from "node:assert/strict";
import { createProtectedShareLink, unlockProtectedShare } from "./protected-share.js";

test("protected links conceal identifiers and require the right password", async () => {
  const target = { fileId: "drive-file-12345", resourceKey: "resource-123" };
  const url = new URL(await createProtectedShareLink(target, "long password", "https://example.com/"));
  assert.equal(url.searchParams.has("driveFile"), false);
  assert.equal(url.href.includes(target.fileId), false);
  assert.deepEqual(await unlockProtectedShare(url.searchParams.get("lockedShare"), "long password"), target);
  await assert.rejects(unlockProtectedShare(url.searchParams.get("lockedShare"), "wrong password"));
  await assert.rejects(createProtectedShareLink(target, "short", url.href));
  await assert.rejects(unlockProtectedShare("broken!", "password"));
  await assert.rejects(unlockProtectedShare("a", "password"), /分享連結格式不正確/);
});
