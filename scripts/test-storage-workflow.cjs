// Isolated browser acceptance: only the test browser's responses are instrumented.
// No production hooks, real accounts, or real Drive writes are used.
// NODE_PATH=<directory containing playwright> node scripts/test-storage-workflow.cjs
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const base = process.env.MOODBOARD_TEST_URL || 'http://127.0.0.1:5184';
const out = process.env.MOODBOARD_TEST_OUTPUT || '/tmp/moodboard-v054-qa';

const hook = `
window.__storageQA = {
  hydrated,
  read: () => ({ board: boardRef.current, dirty, drive: driveSession, prefs: storagePreferences, links: driveSettings.links, pending: pendingTabUpdate, recovery: driveLoadRecovery, confirmation: driveSaveConfirmation }),
  seed: async () => {
    cancelDriveOperations();
    const next = ensureBoard(createBoard({ id: 'qa-board', name: '編輯中的 Moodboard', revision: 10,
      objects: [{ id: 'qa-shape', type: 'shape', shape: 'rectangle', name: '目前編輯內容', x: 100, y: 160, width: 320, height: 220, fill: '#dddddd', color: '#dddddd', rotation: 0 }] }));
    boardRef.current = next; setBoard(next); setDirty(true);
    viewRef.current = next.view; setView(next.view);
    driveTokenRef.current = { accessToken: 'isolated-test-token', expiresAt: Date.now() + 3600000 };
    const metadata = { id: 'qa-file', name: '共同設計.moodboard', version: '1', headRevisionId: 'h1', modifiedTime: new Date().toISOString(), size: 4096, ownedByMe: true, capabilities: { canEdit: true, canShare: true } };
    window.__driveMock = { metadata, board: { ...next, name: '雲端內容', revision: 9 }, uploads: [], calls: {}, gates: {} };
    updateDriveSettings((s) => linkDriveFile({ ...s, enabled: true, autoSync: false, folderId: 'qa-folder' }, next, metadata));
    updateStoragePreferences((s) => ({ ...s, autoSave: false, targets: { ...s.targets, [next.id]: 'drive' }, uploadPaused: {}, loadRecoveries: {} }));
    setDriveSession((s) => ({ ...s, connected: true, busy: false, status: 'ready', conflict: null, message: '', files: [metadata] }));
    setDriveSharing({ ...EMPTY_DRIVE_SHARING });
    setDriveLoadRecovery(null); setDriveIncomingVersion(null); setPendingTabUpdate(null);
    setDriveSaveConfirmation(null); setShowDriveLibrary(false); setShowStorageLocation(false); setShowLocalFileLocation(false);
    setShowVersions(false); setLocalSwitchConfirmation(false); setToast(null); finishStartup();
    await persistBoardLocally(next);
  },
  edit: (name) => applyBoard((s) => ({ ...s, name })),
  save: saveBoardToGoogleDrive,
  open: () => openGoogleDriveFile(window.__driveMock.metadata),
  refresh: refreshGoogleDrive,
  restore: restoreBeforeDriveLoad,
  close: closeDriveLibrary,
  library: () => setShowDriveLibrary(true),
  chooseLocal: () => choosePrimaryStorageTarget('local'),
  enableAutoUpload: () => {
    driveTokenRef.current = { accessToken: 'isolated-test-token', expiresAt: Date.now() + 3600000 };
    updateDriveSettings((s) => ({ ...s, enabled: true, autoSync: true }));
    updateStoragePreferences((s) => ({ ...s, autoSave: true }));
    setDriveSession((s) => ({ ...s, connected: true, status: 'ready', busy: false }));
  },
  download: () => saveBoardFile(true),
  versions: () => listVersions(boardRef.current.id),
  dismissStartup: finishStartup,
  hideLocalPrompt: () => setShowLocalFileLocation(false),
};
`;
const mock = `
const state = () => window.__driveMock;
const copy = (x) => structuredClone(x);
const gate = async (name) => {
  const s = state(); s.calls[name] = (s.calls[name] || 0) + 1;
  if (s.gates[name]) await new Promise((resolve) => { s.gates[name] = resolve; });
};
export const requestGoogleDriveToken = async () => ({ accessToken: 'isolated-test-token', expiresAt: Date.now() + 3600000 });
export const ensureGoogleDriveFolder = async () => 'qa-folder';
export const getGoogleDriveAbout = async () => ({ user: { emailAddress: 'qa@example.test' }, quota: { limit: '10000000000', usage: '0' } });
export const listGoogleDriveMoodboards = async () => { await gate('list'); return [copy(state().metadata)]; };
export const listGoogleDriveRevisions = async () => [];
export const getGoogleDriveFile = async () => { await gate('metadata'); return copy(state().metadata); };
export const downloadGoogleDriveMoodboard = async () => { const content = JSON.stringify(state().board); await gate('download'); return content; };
export const uploadGoogleDriveMoodboard = async (token, options) => {
  await gate('upload');
  if (options.signal.aborted) throw Object.assign(new Error('cancelled'), { name: 'AbortError' });
  const s = state();
  if (options.existingFile && (options.forceOverwrite ? options.confirmedRemoteVersion : options.expectedVersion) !== s.metadata.version) {
    throw Object.assign(new Error('Remote changed'), { code: 'drive/conflict', remoteFile: copy(s.metadata) });
  }
  s.uploads.push({ board: copy(options.board), force: options.forceOverwrite });
  s.board = copy(options.board);
  const version = String(Number(s.metadata.version) + 1);
  s.metadata = { ...s.metadata, version, headRevisionId: 'h' + version, modifiedTime: new Date().toISOString() };
  return copy(s.metadata);
};
`;

(async () => {
  await fs.mkdir(out, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'zh-TW', colorScheme: 'dark', reducedMotion: 'reduce' });
  const errors = [];
  await context.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== new URL(base).origin) return route.abort();
    if (url.pathname === '/drive-storage.js') return route.fulfill({ contentType: 'application/javascript', body: mock });
    if (url.pathname === '/main.jsx') {
      const response = await route.fetch();
      const body = await response.text();
      assert(body.includes('const hasBlockingDialog = Boolean('), 'test injection anchor must exist');
      return route.fulfill({ response, body: body.replace('const hasBlockingDialog = Boolean(', hook + '\nconst hasBlockingDialog = Boolean(') });
    }
    return route.continue();
  });
  const page = await context.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  const results = [];
  const record = (name) => { results.push(name); console.log('PASS ' + name); };
  const state = () => page.evaluate(() => window.__storageQA.read());
  const seed = async () => { await page.evaluate(() => window.__storageQA.seed()); await page.waitForFunction(() => window.__storageQA.read().board.name === '編輯中的 Moodboard' && !window.__storageQA.read().drive.busy); };
  const gate = (name) => page.evaluate((key) => { window.__driveMock.gates[key] = true; }, name);
  const waitGate = (name) => page.waitForFunction((key) => typeof window.__driveMock.gates[key] === 'function', name);
  const release = (name) => page.evaluate((key) => { const resolve = window.__driveMock.gates[key]; delete window.__driveMock.gates[key]; resolve(); }, name);
  try {
    await page.goto(base + '/?authPreview=signed-in', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__storageQA?.hydrated);
    await seed();
    await page.locator('.topbar-save-button').waitFor({ state: 'visible' });
    assert.equal(await page.locator('.topbar-save-button').innerText(), '更新至雲端');
    await page.screenshot({ path: out + '/desktop-workspace.png' });

    // Real button -> conflict -> one explicit decision -> current canvas uploaded.
    await page.evaluate(() => { window.__driveMock.metadata.version = '2'; window.__driveMock.metadata.headRevisionId = 'h2'; });
    await page.locator('.topbar-save-button').click();
    await page.waitForFunction(() => Boolean(window.__storageQA.read().confirmation));
    assert.equal((await state()).board.name, '編輯中的 Moodboard');
    await page.screenshot({ path: out + '/desktop-confirmation.png' });
    await page.getByRole('button', { name: '取消', exact: true }).click();
    assert.equal(await page.evaluate(() => window.__driveMock.uploads.length), 0);
    await page.locator('.topbar-save-button').click();
    await page.getByRole('button', { name: '以目前內容更新', exact: true }).click();
    await page.waitForFunction(() => window.__driveMock.uploads.length === 1 && !window.__storageQA.read().drive.busy);
    assert.equal((await state()).board.name, '編輯中的 Moodboard');
    record('Save conflict is upload-only, cancel is non-mutating, confirmation uploads current canvas');

    await seed(); await gate('download');
    await page.evaluate(() => { window.__open = window.__storageQA.open(); }); await waitGate('download');
    await page.evaluate(() => window.__storageQA.edit('下載等待時繼續編輯'));
    await release('download'); await page.evaluate(() => window.__open);
    assert.equal((await state()).board.name, '下載等待時繼續編輯');
    assert.equal((await state()).drive.busy, false);
    record('An older cloud read cannot replace edits made while waiting');

    await seed(); await gate('download');
    await page.evaluate(() => { window.__open = window.__storageQA.open(); }); await waitGate('download');
    await page.evaluate(() => window.__storageQA.save());
    await release('download'); await page.evaluate(() => window.__open);
    assert.equal((await state()).board.name, '編輯中的 Moodboard');
    assert.equal((await state()).drive.status, 'synced');
    record('Save invalidates an earlier cloud read without a stale busy/error state');

    await seed(); await gate('download');
    await page.evaluate(() => { window.__open = window.__storageQA.open(); }); await waitGate('download');
    await page.evaluate(() => window.__storageQA.close());
    await release('download'); await page.evaluate(() => window.__open);
    assert.equal((await state()).board.name, '編輯中的 Moodboard');
    assert.equal((await state()).drive.busy, false);
    record('Closing the file dialog cancels its pending read');

    await seed();
    await page.evaluate(() => window.__storageQA.open());
    await page.getByRole('button', { name: '復原載入前內容', exact: true }).waitFor();
    assert.equal((await state()).board.name, '雲端內容');
    assert.equal((await state()).recovery.version.pinned, true);
    const reloadedMock = await page.evaluate(() => window.__driveMock);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__storageQA?.hydrated && window.__storageQA.read().recovery);
    await page.evaluate((mockState) => { window.__driveMock = mockState; }, reloadedMock);
    await page.evaluate(() => window.__storageQA.dismissStartup());
    await page.getByRole('button', { name: '復原載入前內容', exact: true }).click();
    await page.waitForFunction(() => window.__storageQA.read().board.name === '編輯中的 Moodboard');
    assert.equal((await state()).prefs.uploadPaused['qa-board'], true);
    record('Cloud load has a durable pinned recovery; after refresh, restore recovers canvas and pauses auto-upload');
    await page.evaluate(() => window.__storageQA.enableAutoUpload());
    await page.waitForTimeout(7200); // Exceeds the app's six-second autosave debounce.
    assert.equal(await page.evaluate(() => window.__driveMock.uploads.length), 0);
    await page.locator('.topbar-save-button').click();
    await page.waitForFunction(() => window.__driveMock.uploads.length === 1 && !window.__storageQA.read().drive.busy);
    assert.equal((await state()).prefs.uploadPaused['qa-board'], undefined);
    record('With autosave enabled, restoration stays local beyond the debounce; explicit Save uploads and clears the pause');

    await seed(); await gate('list');
    await page.evaluate(() => { window.__refresh = window.__storageQA.refresh(); }); await waitGate('list');
    await page.evaluate(() => { window.__releaseOldList = window.__driveMock.gates.list; delete window.__driveMock.gates.list; });
    await page.evaluate(() => window.__storageQA.save());
    await page.evaluate(() => { window.__releaseOldList(); });
    await page.evaluate(() => window.__refresh);
    assert.equal((await state()).drive.status, 'synced');
    assert.equal((await state()).drive.busy, false);
    record('A late metadata refresh cannot replace the status of a newer successful Save');

    await seed(); await gate('upload');
    await page.evaluate(() => { window.__save = window.__storageQA.save(); }); await waitGate('upload');
    await page.evaluate(() => window.__storageQA.refresh());
    await page.evaluate(() => window.__storageQA.chooseLocal());
    assert.equal((await state()).drive.busy, true);
    assert.equal((await state()).prefs.targets['qa-board'], 'drive');
    await page.evaluate(() => window.__storageQA.edit('上傳期間繼續編輯'));
    await release('upload'); await page.evaluate(() => window.__save);
    assert.equal((await state()).board.name, '上傳期間繼續編輯');
    assert.equal((await state()).dirty, true);
    assert.equal(await page.evaluate(() => window.__driveMock.uploads[0].board.name), '編輯中的 Moodboard');
    record('A refresh or storage-target switch cannot interrupt an active upload');
    record('Edits during upload stay on canvas and remain visibly unsaved after the earlier snapshot completes');

    await seed();
    await page.evaluate(() => {
      const channel = new BroadcastChannel('moodboard-lab:qa-board');
      const current = window.__storageQA.read().board;
      channel.postMessage({ type: 'board-update', sourceId: 'qa-other-tab', board: { ...current, revision: 999, name: '另一分頁內容' } });
      window.__peer = channel;
    });
    await page.waitForFunction(() => Boolean(window.__storageQA.read().pending));
    assert.equal((await state()).board.name, '編輯中的 Moodboard');
    await page.waitForFunction(async () => (await window.__storageQA.versions()).some((v) => v.board.name === '另一分頁內容'));
    record('Cross-tab updates are kept as a separate recoverable version, not applied to canvas');

    const downloadPromise = page.waitForEvent('download');
    await page.evaluate(() => window.__storageQA.download()); await downloadPromise;
    assert.equal((await state()).prefs.targets['qa-board'], 'drive');
    record('Downloading a local backup preserves the primary Drive destination');

    await page.evaluate(() => window.__storageQA.chooseLocal());
    await page.getByRole('button', { name: '另開本機副本', exact: true }).click();
    await page.waitForFunction(() => window.__storageQA.read().board.id !== 'qa-board');
    const local = await state();
    assert.equal(local.prefs.targets[local.board.id], 'local');
    assert.equal(local.links['qa-board'].fileId, 'qa-file');
    assert.equal(local.links[local.board.id], undefined);
    record('Switching to local creates a new independent document and preserves original Drive identity');

    await seed();
    await page.evaluate(() => { window.__driveMock.metadata.version = '9'; window.__driveMock.metadata.headRevisionId = 'h9'; });
    await page.evaluate(() => window.__storageQA.refresh());
    await page.getByRole('button', { name: '載入雲端版本', exact: true }).waitFor();
    assert.equal((await state()).board.name, '編輯中的 Moodboard');
    await page.screenshot({ path: out + '/desktop-incoming.png' });
    await page.getByRole('button', { name: '保留目前工作', exact: true }).click();
    record('Changed cloud metadata prompts an explicit load choice and never auto-replaces canvas');

    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      await page.screenshot({ path: out + '/mobile-' + width + '-workspace.png' });
      const size = await page.locator('.topbar-save-button').boundingBox();
      assert(size.width >= 44 && size.height >= 44, 'mobile save target >= 44px');
      assert(size.x >= 0 && size.x + size.width <= width, 'save fits mobile viewport');
      await page.locator('.topbar-save-button').click();
      await page.getByRole('button', { name: '以目前內容更新', exact: true }).waitFor();
      await page.screenshot({ path: out + '/mobile-' + width + '-confirmation.png' });
      const button = await page.getByRole('button', { name: '以目前內容更新', exact: true }).boundingBox();
      assert(button.x >= 0 && button.x + button.width <= width, 'confirmation fits mobile viewport');
      await page.getByRole('button', { name: '取消', exact: true }).click();
    }
    record('320px/390px mobile: visible Save and confirmation controls fit with touch-sized targets');
    assert.deepEqual(errors, []);
    await fs.writeFile(out + '/results.json', JSON.stringify({ passed: results.length, results, errors, mockDrive: true }, null, 2));
    console.log(JSON.stringify({ passed: results.length, artifacts: out }));
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
