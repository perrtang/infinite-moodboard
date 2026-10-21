const runtimeEnv = import.meta.env || {};

export const GOOGLE_DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
export const GOOGLE_DRIVE_FOLDER_NAME = "Infinite Moodboard";
export const GOOGLE_DRIVE_CLIENT_ID = runtimeEnv.VITE_GOOGLE_DRIVE_CLIENT_ID
  || "1068479226042-u90bs7m2d64p0q7r9ip53uca2ir3la50.apps.googleusercontent.com";
export const DRIVE_STATE_STORAGE_KEY = "infinite-moodboard-drive-state-v1";
export const DRIVE_FILE_MIME_TYPE = "application/json";

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

export function evaluateDriveQuota(storageQuota, uploadBytes, { safetyBytes = 64 * 1024 } = {}) {
  const quota = normalizeDriveQuota(storageQuota);
  const upload = finiteNumber(uploadBytes);
  const safety = Math.max(finiteNumber(safetyBytes), Math.ceil(upload * 0.1));
  const required = upload + safety;
  if (quota.limit === null) return { allowed: true, level: "unknown", required, ...quota };
  if (quota.remaining < required) return { allowed: false, level: "insufficient", required, ...quota };
  if (quota.remaining < required * 3) return { allowed: true, level: "low", required, ...quota };
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

function defaultDriveState() {
  return {
    enabled: false,
    autoSync: true,
    folderId: "",
    connectionOwnerUid: "",
    connectionEmail: "",
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
    connectionOwnerUid: String(value.connectionOwnerUid || ""),
    connectionEmail: String(value.connectionEmail || ""),
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

export function driveErrorMessage(error) {
  const reason = error?.reason || error?.details?.error?.errors?.[0]?.reason || "";
  if (error?.code === "drive/conflict") return "這台裝置與 Drive 的內容不同；同步已暫停，兩份內容都已保留。";
  if (error?.code === "drive/revision") return error?.message || "無法安全建立或讀取 Google Drive 版本；目前 Moodboard 未受影響。";
  if (reason === "storageQuotaExceeded" || error?.code === "drive/quota") return "Google Drive 空間不足；畫布仍安全保存在這台裝置。";
  if (["authError", "invalidCredentials"].includes(reason) || error?.status === 401) return "Google Drive 授權已失效；請重新連結後再同步。";
  if (["insufficientPermissions", "forbidden"].includes(reason) || error?.status === 403) return "目前沒有權限存取這個 Google Drive 檔案。";
  if (["rateLimitExceeded", "userRateLimitExceeded"].includes(reason) || error?.status === 429) return "Google Drive 暫時忙碌；本機版本已保留，稍後會再同步。";
  if (error?.code === "drive/offline") return "目前離線；變更已保存在這台裝置，連線後可再同步。";
  if (error?.name === "AbortError" || error?.code === "drive/cancelled") return "Google Drive 操作已取消；本機版本未受影響。";
  return error?.message || "Google Drive 暫時無法使用；畫布仍保存在這台裝置。";
}
