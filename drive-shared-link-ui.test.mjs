import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("./main.jsx", import.meta.url), "utf8");

test("a shared Drive link requires explicit exact-file Picker authorization", () => {
  assert.match(source, /const loadDrivePickerRuntime = \(\) => import\("\.\/drive-picker\.js"\)/);
  assert.match(source, /status: "needs-picker-access"/);
  assert.match(source, /選取這份共享檔案/);
  assert.match(source, /openGoogleDriveMoodboardPicker\(\{[\s\S]*?expectedFileId: incoming\.fileId,[\s\S]*?expectedResourceKey: incoming\.resourceKey/);
  assert.match(source, /openGoogleDriveFile\(selection\.file, \{ sharedLink: true \}\)/);
});

test("shared-link startup never directly imports an unapproved Drive file", () => {
  const sharedLinkEffect = source.match(/useEffect\(\(\) => \{\n    const incoming = initialDriveShareRef\.current;[\s\S]*?\n  \}, \[authReady,[^;]+;/)?.[0] || "";
  assert.ok(sharedLinkEffect, "shared-link startup effect should remain discoverable");
  assert.match(sharedLinkEffect, /status: "needs-picker-access"/);
  assert.doesNotMatch(sharedLinkEffect, /openGoogleDriveFile\(/);
});

test("failed or cancelled shared-file opening never adopts a blank board", () => {
  assert.match(source, /沒有把空白畫布當成共享檔案/);
  assert.match(source, /status: "shared-file-denied"/);
  assert.match(source, /目前畫布沒有被當成該檔案/);
  assert.match(source, /if \(!opened\) return false/);
  assert.match(source, /startsWith\("drive\/picker-"\)[\s\S]*?\? "needs-picker-access"/);
});
