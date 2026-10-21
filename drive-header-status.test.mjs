import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const main = await readFile(new URL("./main.jsx", import.meta.url), "utf8");
const styles = await readFile(new URL("./styles.css", import.meta.url), "utf8");

test("Drive autosync status appears immediately before undo and only for an active linked Drive target", () => {
  assert.match(main, /const showTopbarDriveStatus = currentPrimaryStorageTarget === "drive"[\s\S]*storagePreferences\.autoSave[\s\S]*driveSettings\.autoSync[\s\S]*Boolean\(currentDriveLink\)/);
  assert.match(main, /<div className="topbar-secondary">\s*\{showTopbarDriveStatus \? \(/);
  assert.match(main, /className=\{`topbar-cloud-status is-\$\{drivePresentation\.tone\}`\}/);
  assert.match(main, /aria-label=\{`\$\{drivePresentation\.label\}；開啟 Google Drive 檔案與同步狀態`\}/);
  assert.match(main, /onClick=\{openGoogleDriveLibrary\}/);
});

test("Drive status remains a compact accessible action on narrow screens", () => {
  assert.match(styles, /\.topbar-cloud-status \{[\s\S]*max-width: 36px;[\s\S]*min-height: 36px;[\s\S]*min-width: 36px;/);
  assert.match(main, /<span className="sr-only">\{drivePresentation\.label\}<\/span>/);
  assert.match(styles, /\.topbar-cloud-status:focus-visible \{[\s\S]*outline: 2px solid var\(--accent-strong\);/);
  assert.match(styles, /\.mobile-topbar-more-button,[\s\S]*\.topbar-cloud-status \{[\s\S]*min-height: 44px;[\s\S]*min-width: 44px;/);
});

test("a confirmed upload stops the spinner before optional Drive metadata refresh", () => {
  const syncedStateIndex = main.indexOf('const syncedAt = new Date().toISOString();');
  const backgroundRefreshIndex = main.indexOf("void Promise.all([", syncedStateIndex);
  assert.ok(syncedStateIndex > -1);
  assert.ok(backgroundRefreshIndex > syncedStateIndex);
  assert.match(main.slice(syncedStateIndex, backgroundRefreshIndex), /status: asCopy \? \(current\.conflict \? "conflict" : "ready"\) : "synced"[\s\S]*busy: false/);
});

test("autosync waits while Drive is busy and retries recoverable errors on the queued deadline", () => {
  assert.match(main, /if \(driveSession\.status === "error"\) \{[\s\S]*currentSyncJob[\s\S]*nextAttemptAt[\s\S]*saveBoardToGoogleDrive\(\{ silent: true \}\);/);
  assert.match(main, /if \(driveSession\.busy \|\| \["checking", "connecting", "syncing", "quota"\]\.includes\(driveSession\.status\)\) return undefined;/);
});
