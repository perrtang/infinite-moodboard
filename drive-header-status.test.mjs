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
  assert.match(main.slice(syncedStateIndex, backgroundRefreshIndex), /status: asCopy[\s\S]*"synced-local-warning" : "synced"[\s\S]*busy: false/);
});

test("autosync waits while Drive is busy and retries recoverable errors on the queued deadline", () => {
  assert.match(main, /if \(driveSession\.status === "error"\) \{[\s\S]*currentSyncJob[\s\S]*nextAttemptAt[\s\S]*saveBoardToGoogleDrive\(\{ silent: true \}\);/);
  assert.match(main, /if \(driveSession\.busy \|\| \["checking", "connecting", "syncing", "quota"\]\.includes\(driveSession\.status\)\) return undefined;/);
});

test("Drive failures always settle the spinner before queue recovery work", () => {
  const saveStart = main.indexOf("const saveBoardToGoogleDrive = useCallback");
  const failureStart = main.indexOf("const isConflict = error?.code === \"drive/conflict\"", saveStart);
  const queueStart = main.indexOf("if (linkedFile && driveSettings.autoSync)", failureStart);
  const failureBlock = main.slice(failureStart, queueStart);
  assert.ok(saveStart > -1 && failureStart > saveStart && queueStart > failureStart);
  assert.match(failureBlock, /setDriveSession\(\(current\) => \{[\s\S]*busy: false/);
  assert.match(main.slice(failureStart, main.indexOf("return false;", queueStart)), /isGoogleDriveRetryableError\(error\)[\s\S]*nextAttemptAt: retryable/);
  assert.match(main, /DRIVE_LOCAL_RECOVERY_TIMEOUT_MS = 30_000/);
  assert.match(main, /retainSnapshot: Boolean\(localRecoveryWarning\)/);
});

test("a local recovery-copy failure warns but does not block the Drive upload", () => {
  const saveStart = main.indexOf("const saveBoardToGoogleDrive = useCallback");
  const warningStart = main.indexOf("noteLocalRecoveryFailure(error instanceof DriveApiError", saveStart);
  const driveAboutStart = main.indexOf("const about = await getGoogleDriveAbout(accessToken);", warningStart);
  const uploadStart = main.indexOf("const savedFile = await uploadGoogleDriveMoodboard", driveAboutStart);
  const localFailureBlock = main.slice(warningStart, driveAboutStart);

  assert.ok(saveStart > -1 && warningStart > saveStart && driveAboutStart > warningStart && uploadStart > driveAboutStart);
  assert.doesNotMatch(localFailureBlock, /throw new DriveApiError/);
  assert.match(main.slice(uploadStart, main.indexOf("return true;", uploadStart)), /"synced-local-warning"[\s\S]*Google Drive 已同步/);
});

test("sync-queue bookkeeping failures never masquerade as local recovery-copy failures", () => {
  const saveStart = main.indexOf("const saveBoardToGoogleDrive = useCallback");
  const queueReadStart = main.indexOf("const queuedJob = await getSyncJob(snapshot.id);", saveStart);
  const driveAboutStart = main.indexOf("const about = await getGoogleDriveAbout(accessToken);", queueReadStart);
  const queueRemovalStart = main.indexOf("await removeSyncJob(snapshot.id);", driveAboutStart);
  const syncedStateStart = main.indexOf("const syncedAt = new Date().toISOString();", queueRemovalStart);

  assert.match(main.slice(queueReadStart, driveAboutStart), /catch \(error\) \{\s*noteQueueStateFailure\(error\);/);
  assert.doesNotMatch(main.slice(queueReadStart, driveAboutStart), /noteLocalRecoveryFailure\(error\)/);
  assert.match(main.slice(queueRemovalStart, syncedStateStart), /noteQueueStateFailure\(error\)[\s\S]*setSyncJobs[\s\S]*setTimeout[\s\S]*removeSyncJob/);
  assert.match(main.slice(syncedStateStart, main.indexOf("return true;", syncedStateStart)), /queueStateWarning[\s\S]*Google Drive 已同步；本機同步佇列待整理/);
});
