const runtimeEnv = import.meta.env || {};

export const GOOGLE_DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
export const GOOGLE_DRIVE_FOLDER_NAME = "Infinite Moodboard";
export const GOOGLE_DRIVE_CLIENT_ID = runtimeEnv.VITE_GOOGLE_DRIVE_CLIENT_ID
  || "1068479226042-u90bs7m2d64p0q7r9ip53uca2ir3la50.apps.googleusercontent.com";
export const DRIVE_STATE_STORAGE_KEY = "infinite-moodboard-drive-state-v1";
export const DRIVE_FILE_MIME_TYPE = "application/json";

const DRIVE_API_ROOT = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_ROOT = "https://www.googleapis.com/upload/drive/v3";
const GOOGLE_IDENTITY_SCRIPT = "https://accounts.google.com/gsi/client";
const DEFAULT_QUOTA_SAFETY_BYTES = 64 * 1024;
export const MAX_RETAINED_DRIVE_REVISIONS = 24;

let identityScriptPromise;

export class DriveApiError extends Error {
  constructor(message, { code = "drive/unknown", status = 0, reason = "", details = null } = {}) {
    super(message);
    this.name = "DriveApiError";
    this.code = code;
    this.status = status;
    this.reason = reason;
    this.details = details;
  }
}

export class DriveConflictError extends DriveApiError {
  constructor(remoteFile) {
    super("Google Drive 上已有較新的版本。", {
      code: "drive/conflict",
      status: 409,
      reason: "versionConflict",
      details: remoteFile,
    });
    this.name = "DriveConflictError";
    this.remoteFile = remoteFile;
  }
}

export function isGoogleDriveConfigured() {
  return Boolean(GOOGLE_DRIVE_CLIENT_ID);
}

export function normalizeGoogleDriveTokenResponse(response, now = Date.now()) {
  if (!response || response.error || !response.access_token) {
    throw new DriveApiError(response?.error_description || "Google Drive 授權未完成。", {
      code: "drive/authorization",
      reason: response?.error || "authorizationFailed",
      details: response || null,
    });
  }
  const scopes = new Set(String(response.scope || "").split(/\s+/).filter(Boolean));
  const driveScopes = [...scopes].filter((scope) => scope.startsWith("https://www.googleapis.com/auth/drive"));
  if (!scopes.has(GOOGLE_DRIVE_SCOPE) || driveScopes.some((scope) => scope !== GOOGLE_DRIVE_SCOPE)) {
    throw new DriveApiError("Google Drive 未授予工作檔所需權限。", {
      code: "drive/permission",
      status: 403,
      reason: "insufficientPermissions",
      details: response,
    });
  }
  return {
    accessToken: String(response.access_token),
    expiresAt: now + Math.max(0, Number(response.expires_in || 3600) - 60) * 1000,
    scope: [...scopes].join(" "),
  };
}

export function isGoogleDriveTokenUsable(token, now = Date.now()) {
  return Boolean(token?.accessToken && Number(token.expiresAt) > now);
}

export function isGoogleDriveAuthorizationError(error) {
  const reason = error?.reason || error?.details?.error?.errors?.[0]?.reason || "";
  return error?.code === "drive/authorization"
    || error?.code === "drive/permission"
    || error?.status === 401
    || error?.status === 403
    || ["authError", "invalidCredentials", "insufficientPermissions", "forbidden"].includes(reason);
}

export function serializeMoodboardSnapshot(snapshot) {
  return `${JSON.stringify(snapshot, null, 2)}\n`;
}

export function contentByteLength(content) {
  if (typeof TextEncoder === "function") return new TextEncoder().encode(String(content || "")).byteLength;
  return new Blob([String(content || "")]).size;
}

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

export function normalizeDriveQuota(storageQuota = {}) {
  const hasLimit = storageQuota.limit !== undefined && storageQuota.limit !== null && storageQuota.limit !== "";
  const limit = hasLimit ? finiteNumber(storageQuota.limit, null) : null;
  const usage = finiteNumber(storageQuota.usage);
  return {
    limit,
    usage,
    usageInDrive: finiteNumber(storageQuota.usageInDrive),
    usageInDriveTrash: finiteNumber(storageQuota.usageInDriveTrash),
    remaining: limit === null ? null : Math.max(0, limit - usage),
  };
}

export function evaluateDriveQuota(storageQuota, uploadBytes, {
  safetyBytes = DEFAULT_QUOTA_SAFETY_BYTES,
} = {}) {
  const quota = normalizeDriveQuota(storageQuota);
  const upload = finiteNumber(uploadBytes);
  const safety = Math.max(finiteNumber(safetyBytes), Math.ceil(upload * 0.1));
  const required = upload + safety;
  if (quota.limit === null) {
    return { allowed: true, level: "unknown", required, ...quota };
  }
  if (quota.remaining < required) {
    return { allowed: false, level: "insufficient", required, ...quota };
  }
  if (quota.remaining < required * 3) {
    return { allowed: true, level: "low", required, ...quota };
  }
  return { allowed: true, level: "ok", required, ...quota };
}

export function normalizeDriveFile(file = {}) {
  return {
    id: String(file.id || ""),
    name: String(file.name || "未命名.moodboard"),
    mimeType: String(file.mimeType || DRIVE_FILE_MIME_TYPE),
    createdTime: String(file.createdTime || ""),
    modifiedTime: String(file.modifiedTime || ""),
    size: finiteNumber(file.size),
    version: String(file.version || ""),
    headRevisionId: String(file.headRevisionId || ""),
    webViewLink: String(file.webViewLink || ""),
    parents: Array.isArray(file.parents) ? file.parents.map(String) : [],
    boardId: String(file.appProperties?.boardId || ""),
    capabilities: {
      canDownload: file.capabilities?.canDownload !== false,
      canReadRevisions: file.capabilities?.canReadRevisions !== false,
    },
  };
}

export function normalizeDriveRevision(revision = {}) {
  return {
    id: String(revision.id || ""),
    mimeType: String(revision.mimeType || DRIVE_FILE_MIME_TYPE),
    modifiedTime: String(revision.modifiedTime || ""),
    size: finiteNumber(revision.size),
    keepForever: revision.keepForever === true,
    originalFilename: String(revision.originalFilename || ""),
    lastModifyingUser: {
      displayName: String(revision.lastModifyingUser?.displayName || ""),
      emailAddress: String(revision.lastModifyingUser?.emailAddress || ""),
      photoLink: String(revision.lastModifyingUser?.photoLink || ""),
    },
  };
}

function defaultDriveState() {
  return {
    enabled: false,
    autoSync: true,
    folderId: "",
    links: {},
  };
}

export function normalizeDriveState(value) {
  const fallback = defaultDriveState();
  if (!value || typeof value !== "object") return fallback;
  const links = {};
  for (const [boardId, link] of Object.entries(value.links || {})) {
    if (!boardId || !link?.fileId) continue;
    links[boardId] = {
      fileId: String(link.fileId),
      name: String(link.name || ""),
      version: String(link.version || ""),
      modifiedTime: String(link.modifiedTime || ""),
      size: finiteNumber(link.size),
      headRevisionId: String(link.headRevisionId || ""),
      syncedRevision: finiteNumber(link.syncedRevision),
      syncedUpdatedAt: String(link.syncedUpdatedAt || ""),
    };
  }
  return {
    enabled: value.enabled === true,
    autoSync: value.autoSync !== false,
    folderId: String(value.folderId || ""),
    links,
  };
}

export function loadDriveState(storage = globalThis.localStorage) {
  try {
    return normalizeDriveState(JSON.parse(storage?.getItem(DRIVE_STATE_STORAGE_KEY) || "null"));
  } catch {
    return defaultDriveState();
  }
}

export function saveDriveState(storage, value) {
  const state = normalizeDriveState(value);
  storage?.setItem(DRIVE_STATE_STORAGE_KEY, JSON.stringify(state));
  return state;
}

export function linkDriveFile(state, board, file) {
  const normalized = normalizeDriveState(state);
  const remote = normalizeDriveFile(file);
  return normalizeDriveState({
    ...normalized,
    enabled: true,
    links: {
      ...normalized.links,
      [board.id]: {
        fileId: remote.id,
        name: remote.name,
        version: remote.version,
        modifiedTime: remote.modifiedTime,
        size: remote.size,
        headRevisionId: remote.headRevisionId,
        syncedRevision: finiteNumber(board.revision),
        syncedUpdatedAt: String(board.updatedAt || ""),
      },
    },
  });
}

export function unlinkDriveFile(state, boardId) {
  const normalized = normalizeDriveState(state);
  const links = { ...normalized.links };
  delete links[boardId];
  return { ...normalized, links };
}

export function driveErrorMessage(error) {
  const reason = error?.reason || error?.details?.error?.errors?.[0]?.reason || "";
  if (error?.code === "drive/conflict") return "Drive 上已有較新的版本；請選擇要開啟雲端版本或另存複本。";
  if (error?.code === "drive/revision") return error?.message || "無法安全建立或讀取 Google Drive 版本；目前 Moodboard 未受影響。";
  if (reason === "storageQuotaExceeded" || error?.code === "drive/quota") return "Google Drive 空間不足；畫布仍安全保存在這台裝置。";
  if (["authError", "invalidCredentials"].includes(reason) || error?.status === 401) return "Google Drive 授權已失效；請重新連結後再同步。";
  if (["insufficientPermissions", "forbidden"].includes(reason) || error?.status === 403) return "目前沒有權限存取這個 Google Drive 檔案。";
  if (["rateLimitExceeded", "userRateLimitExceeded"].includes(reason) || error?.status === 429) return "Google Drive 暫時忙碌；本機版本已保留，稍後會再同步。";
  if (error?.code === "drive/offline") return "目前離線；變更已保存在這台裝置，連線後可再同步。";
  if (error?.name === "AbortError" || error?.code === "drive/cancelled") return "Google Drive 操作已取消；本機版本未受影響。";
  return error?.message || "Google Drive 暫時無法使用；畫布仍保存在這台裝置。";
}

function loadIdentityScript() {
  if (globalThis.google?.accounts?.oauth2) return Promise.resolve();
  if (identityScriptPromise) return identityScriptPromise;
  if (!globalThis.document) return Promise.reject(new DriveApiError("目前環境無法載入 Google Drive 授權。", { code: "drive/unavailable" }));
  identityScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GOOGLE_IDENTITY_SCRIPT}"]`);
    const script = existing || document.createElement("script");
    const cleanup = () => {
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onError);
    };
    const onLoad = () => { cleanup(); resolve(); };
    const onError = () => {
      cleanup();
      identityScriptPromise = null;
      reject(new DriveApiError("無法載入 Google Drive 授權服務。", { code: "drive/unavailable" }));
    };
    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", onError, { once: true });
    if (!existing) {
      script.src = GOOGLE_IDENTITY_SCRIPT;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  });
  return identityScriptPromise;
}

export async function requestGoogleDriveToken({ loginHint = "" } = {}) {
  if (!isGoogleDriveConfigured()) {
    throw new DriveApiError("Google Drive OAuth 尚未設定完成。", { code: "drive/unconfigured" });
  }
  if (globalThis.navigator?.onLine === false) {
    throw new DriveApiError("目前沒有網路連線。", { code: "drive/offline" });
  }
  await loadIdentityScript();
  return new Promise((resolve, reject) => {
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_DRIVE_CLIENT_ID,
      scope: GOOGLE_DRIVE_SCOPE,
      hint: loginHint || undefined,
      callback: (response) => {
        try {
          resolve(normalizeGoogleDriveTokenResponse(response));
        } catch (error) {
          reject(error);
        }
      },
      error_callback: (response) => reject(new DriveApiError(response?.message || "Google Drive 授權視窗已關閉。", {
        code: "drive/authorization",
        reason: response?.type || "popupClosed",
        details: response,
      })),
    });
    tokenClient.requestAccessToken({ prompt: "", include_granted_scopes: false });
  });
}

function googleApiError(payload, response) {
  const reason = payload?.error?.errors?.[0]?.reason || payload?.error?.status || "";
  const message = payload?.error?.message || `Google Drive 回應 ${response.status}`;
  return new DriveApiError(message, {
    code: response.status === 412 ? "drive/conflict" : reason === "storageQuotaExceeded" ? "drive/quota" : "drive/api",
    status: response.status,
    reason,
    details: payload,
  });
}

async function driveRequest(accessToken, url, options = {}) {
  if (!accessToken) throw new DriveApiError("Google Drive 尚未連結。", { code: "drive/authorization", status: 401 });
  if (globalThis.navigator?.onLine === false) throw new DriveApiError("目前沒有網路連線。", { code: "drive/offline" });
  const { includeResponse = false, ...fetchOptions } = options;
  let response;
  try {
    response = await fetch(url, {
      ...fetchOptions,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(fetchOptions.headers || {}),
      },
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new DriveApiError(error?.message || "無法連線 Google Drive。", { code: "drive/network", details: error });
  }
  if (response.status === 204) return null;
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw googleApiError(payload, response);
  return includeResponse ? { payload, response } : payload;
}

export async function getGoogleDriveAbout(accessToken) {
  const fields = "storageQuota,user(displayName,emailAddress,photoLink)";
  const result = await driveRequest(accessToken, `${DRIVE_API_ROOT}/about?fields=${encodeURIComponent(fields)}`);
  return {
    quota: normalizeDriveQuota(result?.storageQuota),
    user: {
      displayName: String(result?.user?.displayName || ""),
      emailAddress: String(result?.user?.emailAddress || ""),
      photoLink: String(result?.user?.photoLink || ""),
    },
  };
}

async function findDriveFolder(accessToken) {
  const query = `name = '${GOOGLE_DRIVE_FOLDER_NAME.replaceAll("'", "\\'")}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const params = new URLSearchParams({
    q: query,
    spaces: "drive",
    pageSize: "10",
    fields: "files(id,name,modifiedTime)",
  });
  const result = await driveRequest(accessToken, `${DRIVE_API_ROOT}/files?${params}`);
  return result?.files?.[0] || null;
}

export async function ensureGoogleDriveFolder(accessToken, knownFolderId = "", { create = true } = {}) {
  if (knownFolderId) {
    try {
      const folder = await driveRequest(accessToken, `${DRIVE_API_ROOT}/files/${encodeURIComponent(knownFolderId)}?fields=id,name,trashed`);
      if (!folder?.trashed) return knownFolderId;
    } catch (error) {
      if (error.status !== 404) throw error;
    }
  }
  const existing = await findDriveFolder(accessToken);
  if (existing?.id) return existing.id;
  if (!create) return "";
  const folder = await driveRequest(accessToken, `${DRIVE_API_ROOT}/files?fields=id,name`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: GOOGLE_DRIVE_FOLDER_NAME,
      mimeType: "application/vnd.google-apps.folder",
      appProperties: { infiniteMoodboard: "true" },
    }),
  });
  return String(folder.id);
}

const DRIVE_FILE_FIELDS = "id,name,mimeType,createdTime,modifiedTime,size,version,headRevisionId,webViewLink,parents,appProperties,capabilities(canDownload,canReadRevisions)";
const DRIVE_REVISION_FIELDS = "id,mimeType,modifiedTime,size,keepForever,originalFilename,lastModifyingUser(displayName,emailAddress,photoLink)";

export async function listGoogleDriveMoodboards(accessToken, folderId) {
  if (!folderId) return [];
  const files = [];
  let pageToken = "";
  do {
    const params = new URLSearchParams({
      q: `'${folderId.replaceAll("'", "\\'")}' in parents and trashed = false`,
      spaces: "drive",
      orderBy: "modifiedTime desc",
      pageSize: "100",
      fields: `nextPageToken,files(${DRIVE_FILE_FIELDS})`,
    });
    if (pageToken) params.set("pageToken", pageToken);
    const result = await driveRequest(accessToken, `${DRIVE_API_ROOT}/files?${params}`);
    files.push(...(result?.files || []).filter((file) => file.name?.toLowerCase().endsWith(".moodboard")).map(normalizeDriveFile));
    pageToken = result?.nextPageToken || "";
  } while (pageToken);
  return files;
}

export async function getGoogleDriveFile(accessToken, fileId, { signal } = {}) {
  const result = await driveRequest(accessToken, `${DRIVE_API_ROOT}/files/${encodeURIComponent(fileId)}?fields=${encodeURIComponent(DRIVE_FILE_FIELDS)}`, { signal });
  return normalizeDriveFile(result);
}

export async function listGoogleDriveRevisions(accessToken, fileId, { signal } = {}) {
  if (!fileId) return [];
  const revisions = [];
  let pageToken = "";
  do {
    const params = new URLSearchParams({
      pageSize: "200",
      fields: `nextPageToken,revisions(${DRIVE_REVISION_FIELDS})`,
    });
    if (pageToken) params.set("pageToken", pageToken);
    const result = await driveRequest(
      accessToken,
      `${DRIVE_API_ROOT}/files/${encodeURIComponent(fileId)}/revisions?${params}`,
      { signal },
    );
    revisions.push(...(result?.revisions || []).map(normalizeDriveRevision).filter((revision) => revision.id));
    pageToken = String(result?.nextPageToken || "");
  } while (pageToken);
  return revisions.sort((a, b) => String(b.modifiedTime).localeCompare(String(a.modifiedTime)) || b.id.localeCompare(a.id));
}

export async function updateGoogleDriveRevisionRetention(accessToken, fileId, revisionId, keepForever, { signal } = {}) {
  if (!fileId || !revisionId) {
    throw new DriveApiError("Google Drive 版本缺少可辨識的 ID。", { code: "drive/revision" });
  }
  const result = await driveRequest(
    accessToken,
    `${DRIVE_API_ROOT}/files/${encodeURIComponent(fileId)}/revisions/${encodeURIComponent(revisionId)}?fields=${encodeURIComponent(DRIVE_REVISION_FIELDS)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keepForever: keepForever === true }),
      signal,
    },
  );
  return normalizeDriveRevision(result);
}

export async function enforceGoogleDriveRevisionRetention(accessToken, fileId, {
  maxRetained = MAX_RETAINED_DRIVE_REVISIONS,
  signal,
} = {}) {
  const limit = Math.max(0, Math.floor(Number(maxRetained) || 0));
  const revisions = await listGoogleDriveRevisions(accessToken, fileId, { signal });
  const retained = revisions.filter((revision) => revision.keepForever);
  const released = [];
  for (const revision of retained.slice(limit)) {
    await updateGoogleDriveRevisionRetention(accessToken, fileId, revision.id, false, { signal });
    released.push(revision.id);
  }
  return { revisions, released };
}

async function getGoogleDriveFileState(accessToken, fileId, { signal } = {}) {
  const { payload, response } = await driveRequest(
    accessToken,
    `${DRIVE_API_ROOT}/files/${encodeURIComponent(fileId)}?fields=${encodeURIComponent(DRIVE_FILE_FIELDS)}`,
    { signal, includeResponse: true },
  );
  return {
    file: normalizeDriveFile(payload),
    etag: String(response.headers?.get?.("etag") || ""),
  };
}

export async function downloadGoogleDriveMoodboard(accessToken, fileId, { revisionId = "", signal } = {}) {
  if (!accessToken) throw new DriveApiError("Google Drive 尚未連結。", { code: "drive/authorization", status: 401 });
  const encodedFileId = encodeURIComponent(fileId);
  const endpoint = revisionId
    ? `${DRIVE_API_ROOT}/files/${encodedFileId}/revisions/${encodeURIComponent(revisionId)}?alt=media`
    : `${DRIVE_API_ROOT}/files/${encodedFileId}?alt=media`;
  let response;
  try {
    response = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new DriveApiError(error?.message || "無法下載 Google Drive 檔案。", { code: "drive/network", details: error });
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw googleApiError(payload, response);
  }
  return response.text();
}

export async function uploadGoogleDriveMoodboard(accessToken, {
  board,
  content,
  filename,
  folderId,
  existingFile = null,
  expectedVersion = "",
  expectedHeadRevisionId = "",
  forceOverwrite = false,
  confirmedRemoteVersion = "",
  signal,
}) {
  if (forceOverwrite && (!existingFile?.id || !confirmedRemoteVersion)) {
    throw new DriveApiError("覆寫目標已變更，因此未更新 Google Drive。", {
      code: "drive/overwrite-target",
      details: { existingFile, confirmedRemoteVersion },
    });
  }
  let remoteState = null;
  if (existingFile?.id) {
    remoteState = await getGoogleDriveFileState(accessToken, existingFile.id, { signal });
    const matchesExpectedVersion = Boolean(expectedVersion && remoteState.file.version
      && String(remoteState.file.version) === String(expectedVersion));
    const matchesExpectedHead = Boolean(expectedHeadRevisionId && remoteState.file.headRevisionId
      && String(remoteState.file.headRevisionId) === String(expectedHeadRevisionId));
    const matchesConfirmedOverwrite = Boolean(forceOverwrite && confirmedRemoteVersion && remoteState.file.version
      && String(remoteState.file.version) === String(confirmedRemoteVersion));
    if (forceOverwrite ? !matchesConfirmedOverwrite : !matchesExpectedVersion && !matchesExpectedHead) {
      throw new DriveConflictError(remoteState.file);
    }
    // Drive v3 does not expose a JSON etag field. Requiring the HTTP ETag keeps
    // updates fail-closed instead of risking a cross-device lost update.
    if (!remoteState.etag) throw new DriveConflictError(remoteState.file);
    if (!remoteState.file.headRevisionId) {
      throw new DriveApiError("無法先保留目前 Drive 版本，因此已停止覆寫。", { code: "drive/revision", details: remoteState.file });
    }
    const protectedHeadRevisionId = remoteState.file.headRevisionId;
    await enforceGoogleDriveRevisionRetention(accessToken, existingFile.id, {
      maxRetained: MAX_RETAINED_DRIVE_REVISIONS - 1,
      signal,
    });
    await updateGoogleDriveRevisionRetention(accessToken, existingFile.id, protectedHeadRevisionId, true, { signal });
    remoteState = await getGoogleDriveFileState(accessToken, existingFile.id, { signal });
    // Retaining a revision changes Drive's file version even when the file
    // contents did not change. Compare the head revision instead, then use the
    // freshly returned ETag so our own metadata update is never misread as a
    // cross-device edit.
    if (!remoteState.etag || !remoteState.file.headRevisionId || remoteState.file.headRevisionId !== protectedHeadRevisionId) {
      throw new DriveConflictError(remoteState.file);
    }
  }

  const metadata = {
    name: filename,
    mimeType: DRIVE_FILE_MIME_TYPE,
    appProperties: {
      infiniteMoodboard: "true",
      boardId: String(board.id || ""),
      schemaVersion: String(board.schemaVersion || ""),
    },
  };
  if (!existingFile?.id && folderId) metadata.parents = [folderId];
  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", new Blob([content], { type: DRIVE_FILE_MIME_TYPE }));
  const endpoint = existingFile?.id
    ? `${DRIVE_UPLOAD_ROOT}/files/${encodeURIComponent(existingFile.id)}?uploadType=multipart&fields=${encodeURIComponent(DRIVE_FILE_FIELDS)}`
    : `${DRIVE_UPLOAD_ROOT}/files?uploadType=multipart&fields=${encodeURIComponent(DRIVE_FILE_FIELDS)}`;
  let result;
  try {
    result = await driveRequest(accessToken, endpoint, {
      method: existingFile?.id ? "PATCH" : "POST",
      headers: remoteState?.etag ? { "If-Match": remoteState.etag } : undefined,
      body: form,
      signal,
    });
  } catch (error) {
    if (error?.code === "drive/conflict" || error?.status === 412) throw new DriveConflictError(remoteState?.file || existingFile);
    throw error;
  }
  const saved = normalizeDriveFile(result);
  if (existingFile?.id) {
    const verified = await getGoogleDriveFile(accessToken, existingFile.id, { signal });
    if (!saved.version || verified.version !== saved.version) throw new DriveConflictError(verified);
  }
  return saved;
}
