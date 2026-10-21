import assert from "node:assert/strict";
import test from "node:test";
import {
  contentByteLength,
  driveErrorMessage,
  DriveConflictError,
  downloadGoogleDriveMoodboard,
  enforceGoogleDriveRevisionRetention,
  ensureGoogleDriveFolder,
  evaluateDriveQuota,
  linkDriveFile,
  listGoogleDriveRevisions,
  loadDriveState,
  isGoogleDriveAuthorizationError,
  isGoogleDriveTokenUsable,
  normalizeDriveFile,
  normalizeDriveQuota,
  normalizeDriveRevision,
  normalizeGoogleDriveTokenResponse,
  requestGoogleDriveToken,
  saveDriveState,
  serializeMoodboardSnapshot,
  unlinkDriveFile,
  uploadGoogleDriveMoodboard,
} from "./drive-storage.js";

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
  };
}

test("serializes a portable moodboard snapshot and measures UTF-8 bytes", () => {
  const content = serializeMoodboardSnapshot({ id: "board-1", name: "靈感" });
  assert.ok(content.endsWith("\n"));
  assert.equal(JSON.parse(content).name, "靈感");
  assert.ok(contentByteLength(content) > content.length);
});

test("Google Drive tokens require the exact drive.file scope and expire safely", () => {
  const token = normalizeGoogleDriveTokenResponse({
    access_token: "token-1",
    expires_in: 3600,
    scope: "openid https://www.googleapis.com/auth/drive.file",
  }, 10_000);
  assert.equal(token.accessToken, "token-1");
  assert.equal(isGoogleDriveTokenUsable(token, 10_001), true);
  assert.equal(isGoogleDriveTokenUsable(token, token.expiresAt), false);
  assert.throws(
    () => normalizeGoogleDriveTokenResponse({ access_token: "token-2", scope: "openid email" }),
    (error) => error.code === "drive/permission" && error.status === 403,
  );
  assert.throws(
    () => normalizeGoogleDriveTokenResponse({
      access_token: "token-3",
      scope: "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive",
    }),
    (error) => error.code === "drive/permission" && error.status === 403,
  );
  assert.throws(
    () => normalizeGoogleDriveTokenResponse({ error: "access_denied", error_description: "Denied" }),
    (error) => error.code === "drive/authorization" && error.reason === "access_denied",
  );
});

test("Google Drive authorization failures include missing and excessive permissions", () => {
  assert.equal(isGoogleDriveAuthorizationError({ status: 401 }), true);
  assert.equal(isGoogleDriveAuthorizationError({ code: "drive/permission", status: 403 }), true);
  assert.equal(isGoogleDriveAuthorizationError({ reason: "insufficientPermissions" }), true);
  assert.equal(isGoogleDriveAuthorizationError({ code: "drive/quota", reason: "storageQuotaExceeded" }), false);
});

test("normalizes finite and unlimited Drive quota", () => {
  assert.deepEqual(normalizeDriveQuota({ limit: "1000", usage: "250", usageInDrive: "200" }), {
    limit: 1000,
    usage: 250,
    usageInDrive: 200,
    usageInDriveTrash: 0,
    remaining: 750,
  });
  assert.equal(normalizeDriveQuota({ usage: "250" }).limit, null);
  assert.equal(normalizeDriveQuota({ usage: "250" }).remaining, null);
});

test("quota evaluation keeps a safety margin and blocks unsafe uploads", () => {
  const insufficient = evaluateDriveQuota({ limit: 10_000, usage: 9_500 }, 400, { safetyBytes: 200 });
  assert.equal(insufficient.allowed, false);
  assert.equal(insufficient.level, "insufficient");
  const healthy = evaluateDriveQuota({ limit: 100_000, usage: 1_000 }, 400, { safetyBytes: 200 });
  assert.equal(healthy.allowed, true);
  assert.equal(healthy.level, "ok");
  assert.equal(evaluateDriveQuota({ usage: 1_000 }, 400).level, "unknown");
  assert.equal(evaluateDriveQuota({ limit: 10_000_000, usage: 6_000_000 }, 10_000).allowed, true);
});

test("Drive file links stay device-local and preserve sync metadata", () => {
  const storage = memoryStorage();
  const board = { id: "board-1", revision: 7, updatedAt: "2026-10-20T01:02:03.000Z" };
  let state = linkDriveFile({
    ...loadDriveState(storage),
    connectionOwnerUid: "petfashion-user-1",
    connectionEmail: "person@example.com",
  }, board, {
    id: "drive-1",
    name: "研究.moodboard",
    version: "12",
    modifiedTime: "2026-10-20T01:02:04.000Z",
    size: "2048",
  });
  saveDriveState(storage, state);
  state = loadDriveState(storage);
  assert.equal(state.enabled, true);
  assert.equal(state.links[board.id].fileId, "drive-1");
  assert.equal(state.links[board.id].syncedRevision, 7);
  assert.equal(state.links[board.id].size, 2048);
  assert.equal(state.connectionOwnerUid, "petfashion-user-1");
  assert.equal(state.connectionEmail, "person@example.com");
  state = unlinkDriveFile(state, board.id);
  assert.equal(state.links[board.id], undefined);
});

test("Drive can silently restore a granted session without persisting the access token", async (t) => {
  const previousGoogle = globalThis.google;
  let tokenConfig = null;
  let requestOptions = null;
  t.after(() => {
    if (previousGoogle === undefined) delete globalThis.google;
    else globalThis.google = previousGoogle;
  });
  globalThis.google = {
    accounts: {
      oauth2: {
        initTokenClient(config) {
          tokenConfig = config;
          return {
            requestAccessToken(options) {
              requestOptions = options;
              queueMicrotask(() => config.callback({
                access_token: "silent-token",
                expires_in: 3600,
                scope: "https://www.googleapis.com/auth/drive.file",
              }));
            },
          };
        },
      },
    },
  };

  const token = await requestGoogleDriveToken({
    loginHint: "person@example.com",
    prompt: "none",
    timeoutMs: 1000,
  });

  assert.equal(token.accessToken, "silent-token");
  assert.equal(tokenConfig.login_hint, "person@example.com");
  assert.equal(requestOptions.prompt, "none");
  assert.equal(requestOptions.login_hint, "person@example.com");
});

test("normalizes Drive files and maps recoverable errors", () => {
  assert.deepEqual(normalizeDriveFile({
    id: "1",
    name: "test.moodboard",
    size: "99",
    version: "3",
    headRevisionId: "",
    appProperties: { boardId: "board-1" },
  }), {
    id: "1",
    name: "test.moodboard",
    mimeType: "application/json",
    createdTime: "",
    modifiedTime: "",
    size: 99,
    version: "3",
    headRevisionId: "",
    webViewLink: "",
    parents: [],
    boardId: "board-1",
    capabilities: {
      canDownload: true,
      canReadRevisions: true,
    },
  });
  assert.match(driveErrorMessage({ reason: "storageQuotaExceeded" }), /空間不足/);
  assert.match(driveErrorMessage({ status: 401 }), /重新連結/);
  assert.match(driveErrorMessage({ code: "drive/offline" }), /離線/);
});

test("connecting to Drive can discover storage without creating a folder", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), method: options.method || "GET" });
    return {
      ok: true,
      status: 200,
      json: async () => ({ files: [] }),
    };
  };
  try {
    assert.equal(await ensureGoogleDriveFolder("token", "", { create: false }), "");
    assert.equal(calls.length, 1);
    assert.equal(calls[0].method, "GET");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("an updated remote file stops the upload before any overwrite", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), method: options.method || "GET" });
    return {
      ok: true,
      status: 200,
      json: async () => ({ id: "drive-1", name: "Board.moodboard", version: "9" }),
    };
  };
  try {
    await assert.rejects(
      uploadGoogleDriveMoodboard("token", {
        board: { id: "board-1" },
        content: "{}",
        filename: "Board.moodboard",
        existingFile: { id: "drive-1" },
        expectedVersion: "8",
      }),
      DriveConflictError,
    );
    assert.deepEqual(calls.map((call) => call.method), ["GET"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("an existing file requires an HTTP ETag before conditional update", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), method: options.method || "GET" });
    return {
      ok: true,
      status: 200,
      headers: { get: () => "" },
      json: async () => ({ id: "drive-1", name: "Board.moodboard", version: "8" }),
    };
  };
  try {
    await assert.rejects(
      uploadGoogleDriveMoodboard("token", {
        board: { id: "board-1" },
        content: "{}",
        filename: "Board.moodboard",
        existingFile: { id: "drive-1" },
        expectedVersion: "8",
      }),
      DriveConflictError,
    );
    assert.deepEqual(calls.map((call) => call.method), ["GET"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("metadata-only Drive version changes keep syncing through the matching head revision", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  let fileGetCount = 0;
  globalThis.fetch = async (url, options = {}) => {
    const call = { url: String(url), method: options.method || "GET", headers: options.headers || {} };
    calls.push(call);
    if (call.url.includes("/revisions?") && call.method === "GET") {
      return {
        ok: true,
        status: 200,
        json: async () => ({ revisions: [] }),
      };
    }
    if (call.url.includes("/revisions/revision-8") && call.method === "PATCH") {
      return {
        ok: true,
        status: 200,
        json: async () => ({ id: "revision-8", modifiedTime: "2026-10-20T01:00:00.000Z", keepForever: true }),
      };
    }
    if (call.url.includes("/upload/") && call.method === "PATCH") {
      return {
        ok: true,
        status: 200,
        headers: { get: () => '"v10"' },
        json: async () => ({ id: "drive-1", name: "Board.moodboard", version: "10", headRevisionId: "revision-10" }),
      };
    }
    fileGetCount += 1;
    const currentVersion = fileGetCount === 1 ? "8" : fileGetCount === 2 ? "9" : "10";
    const currentRevision = fileGetCount < 3 ? "revision-8" : "revision-10";
    return {
      ok: true,
      status: 200,
      headers: { get: (name) => name === "etag" ? `"v${currentVersion}"` : "" },
      json: async () => ({ id: "drive-1", name: "Board.moodboard", version: currentVersion, headRevisionId: currentRevision }),
    };
  };
  try {
    const saved = await uploadGoogleDriveMoodboard("token", {
      board: { id: "board-1" },
      content: "{}",
      filename: "Board.moodboard",
      existingFile: { id: "drive-1" },
      expectedVersion: "7",
      expectedHeadRevisionId: "revision-8",
    });
    assert.equal(saved.version, "10");
    assert.deepEqual(calls.map((call) => call.method), ["GET", "GET", "PATCH", "GET", "PATCH", "GET"]);
    assert.equal(calls[4].headers["If-Match"], '"v9"');
    assert.match(calls[2].url, /revisions\/revision-8/);
    assert.doesNotMatch(calls[4].url, /keepRevisionForever=true/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("confirmed overwrite accepts the reviewed remote version and still uses a fresh ETag", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  let fileGetCount = 0;
  globalThis.fetch = async (url, options = {}) => {
    const call = { url: String(url), method: options.method || "GET", headers: options.headers || {} };
    calls.push(call);
    if (call.url.includes("/revisions?") && call.method === "GET") {
      return { ok: true, status: 200, json: async () => ({ revisions: [] }) };
    }
    if (call.url.includes("/revisions/revision-9") && call.method === "PATCH") {
      return { ok: true, status: 200, json: async () => ({ id: "revision-9", keepForever: true }) };
    }
    if (call.url.includes("/upload/") && call.method === "PATCH") {
      return {
        ok: true,
        status: 200,
        json: async () => ({ id: "drive-1", name: "Board.moodboard", version: "11", headRevisionId: "revision-11" }),
      };
    }
    fileGetCount += 1;
    const file = fileGetCount === 1
      ? { version: "9", headRevisionId: "revision-9" }
      : fileGetCount === 2
        ? { version: "10", headRevisionId: "revision-9" }
        : { version: "11", headRevisionId: "revision-11" };
    return {
      ok: true,
      status: 200,
      headers: { get: (name) => name === "etag" ? `"v${file.version}"` : "" },
      json: async () => ({ id: "drive-1", name: "Board.moodboard", ...file }),
    };
  };
  try {
    const saved = await uploadGoogleDriveMoodboard("token", {
      board: { id: "board-1" },
      content: "{}",
      filename: "Board.moodboard",
      existingFile: { id: "drive-1" },
      expectedVersion: "8",
      forceOverwrite: true,
      confirmedRemoteVersion: "9",
    });
    assert.equal(saved.version, "11");
    assert.equal(calls.find((call) => call.url.includes("/upload/")).headers["If-Match"], '"v10"');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("confirmed overwrite stops when Drive changed after the user reviewed it", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), method: options.method || "GET" });
    return {
      ok: true,
      status: 200,
      headers: { get: () => '"v10"' },
      json: async () => ({ id: "drive-1", name: "Board.moodboard", version: "10", headRevisionId: "revision-10" }),
    };
  };
  try {
    await assert.rejects(
      uploadGoogleDriveMoodboard("token", {
        board: { id: "board-1" },
        content: "{}",
        filename: "Board.moodboard",
        existingFile: { id: "drive-1" },
        expectedVersion: "8",
        forceOverwrite: true,
        confirmedRemoteVersion: "9",
      }),
      DriveConflictError,
    );
    assert.deepEqual(calls.map((call) => call.method), ["GET"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("confirmed overwrite fails closed when the target Drive file is missing", async () => {
  const originalFetch = globalThis.fetch;
  let fetchCalled = false;
  globalThis.fetch = async () => {
    fetchCalled = true;
    throw new Error("fetch should not be called");
  };
  try {
    await assert.rejects(
      uploadGoogleDriveMoodboard("token", {
        board: { id: "board-1" },
        content: "{}",
        filename: "Board.moodboard",
        forceOverwrite: true,
        confirmedRemoteVersion: "9",
      }),
      (error) => error?.code === "drive/overwrite-target",
    );
    assert.equal(fetchCalled, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("an update arriving while the old revision is retained stops before upload", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  let fileGetCount = 0;
  globalThis.fetch = async (url, options = {}) => {
    const call = { url: String(url), method: options.method || "GET" };
    calls.push(call);
    if (call.url.includes("/revisions?") && call.method === "GET") {
      return { ok: true, status: 200, json: async () => ({ revisions: [] }) };
    }
    if (call.url.includes("/revisions/revision-8") && call.method === "PATCH") {
      return { ok: true, status: 200, json: async () => ({ id: "revision-8", keepForever: true }) };
    }
    fileGetCount += 1;
    const file = fileGetCount === 1
      ? { version: "8", headRevisionId: "revision-8" }
      : { version: "9", headRevisionId: "revision-9" };
    return {
      ok: true,
      status: 200,
      headers: { get: () => `"v${file.version}"` },
      json: async () => ({ id: "drive-1", name: "Board.moodboard", ...file }),
    };
  };
  try {
    await assert.rejects(
      uploadGoogleDriveMoodboard("token", {
        board: { id: "board-1" },
        content: "{}",
        filename: "Board.moodboard",
        existingFile: { id: "drive-1" },
        expectedVersion: "8",
        expectedHeadRevisionId: "revision-8",
      }),
      DriveConflictError,
    );
    assert.deepEqual(calls.map((call) => call.method), ["GET", "GET", "PATCH", "GET"]);
    assert.equal(calls.some((call) => call.url.includes("/upload/")), false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Drive revisions are normalized, paginated, and sorted newest first", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    const secondPage = String(url).includes("pageToken=next-page");
    return {
      ok: true,
      status: 200,
      json: async () => secondPage
        ? { revisions: [{ id: "r2", modifiedTime: "2026-10-20T02:00:00.000Z", size: "20", keepForever: true }] }
        : { nextPageToken: "next-page", revisions: [{ id: "r1", modifiedTime: "2026-10-20T01:00:00.000Z", size: "10" }] },
    };
  };
  try {
    const revisions = await listGoogleDriveRevisions("token", "file-1");
    assert.equal(calls.length, 2);
    assert.deepEqual(revisions.map((revision) => revision.id), ["r2", "r1"]);
    assert.equal(revisions[0].size, 20);
    assert.equal(revisions[0].keepForever, true);
    assert.deepEqual(normalizeDriveRevision({ id: "r3" }).lastModifyingUser, { displayName: "", emailAddress: "", photoLink: "" });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Drive revision retention releases only preserved versions beyond the limit", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), method: options.method || "GET", body: options.body || "" });
    if ((options.method || "GET") === "PATCH") {
      return { ok: true, status: 200, json: async () => ({ id: "r1", keepForever: false }) };
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({ revisions: [
        { id: "r3", modifiedTime: "2026-10-20T03:00:00.000Z", keepForever: true },
        { id: "r2", modifiedTime: "2026-10-20T02:00:00.000Z", keepForever: false },
        { id: "r1", modifiedTime: "2026-10-20T01:00:00.000Z", keepForever: true },
      ] }),
    };
  };
  try {
    const result = await enforceGoogleDriveRevisionRetention("token", "file-1", { maxRetained: 1 });
    assert.deepEqual(result.released, ["r1"]);
    assert.equal(calls.filter((call) => call.method === "PATCH").length, 1);
    assert.equal(JSON.parse(calls.find((call) => call.method === "PATCH").body).keepForever, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("downloads the exact head revision when a revision id is supplied", async () => {
  const originalFetch = globalThis.fetch;
  let requestedUrl = "";
  globalThis.fetch = async (url) => {
    requestedUrl = String(url);
    return { ok: true, status: 200, text: async () => "{\"id\":\"board-1\"}" };
  };
  try {
    const content = await downloadGoogleDriveMoodboard("token", "file-1", { revisionId: "revision-8" });
    assert.equal(content, "{\"id\":\"board-1\"}");
    assert.match(requestedUrl, /files\/file-1\/revisions\/revision-8\?alt=media/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
