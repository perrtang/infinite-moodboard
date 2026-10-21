import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const main = await readFile(new URL("./main.jsx", import.meta.url), "utf8");
const driveState = await readFile(new URL("./drive-state.js", import.meta.url), "utf8");
const driveStorage = await readFile(new URL("./drive-storage.js", import.meta.url), "utf8");

test("refresh restores an enabled Drive connection silently for the same signed-in owner", () => {
  assert.match(main, /const driveRestoreAttemptRef = useRef\(""\)/);
  assert.match(main, /connectionOwnerUid && driveSettings\.connectionOwnerUid !== connectionOwnerUid/);
  assert.match(main, /requestGoogleDriveToken\(\{[\s\S]*prompt: "none",[\s\S]*timeoutMs: 8_000/);
  assert.match(main, /if \(\["checking", "connecting"\]\.includes\(driveSession\.status\)\) return undefined/);
  assert.match(main, /無法在背景恢復 Google Drive；點一下重新連結，本機變更仍安全保留/);
});

test("Drive owner metadata persists but OAuth access tokens remain memory-only", () => {
  for (const source of [driveState, driveStorage]) {
    assert.match(source, /connectionOwnerUid: ""/);
    assert.match(source, /connectionEmail: ""/);
  }
  assert.doesNotMatch(main, /localStorage\.setItem\([^\n]*(accessToken|driveToken)/i);
  assert.doesNotMatch(driveStorage, /localStorage\.setItem\([^\n]*(accessToken|driveToken)/i);
});
