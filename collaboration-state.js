export const COLLABORATION_RESUME_STORAGE_KEY = "infinite-moodboard-collaboration-v1";

export function normalizeCollaborationRole(value) {
  return ["owner", "editor", "viewer"].includes(value) ? value : "viewer";
}

export function collaborationRoleLabel(value) {
  return { owner: "擁有者", editor: "可編輯", viewer: "僅檢視" }[normalizeCollaborationRole(value)];
}

export function normalizeCollaborationAccessRequestStatus(value) {
  return ["pending", "approved", "denied"].includes(value) ? value : "none";
}

export function collaborationAccessRequestStatusLabel(value) {
  return {
    pending: "等待擁有者回覆",
    approved: "已核准編輯",
    denied: "擁有者未核准",
    none: "尚未提出申請",
  }[normalizeCollaborationAccessRequestStatus(value)];
}

export function normalizeCollaborationInvite(value, baseUrl = globalThis.location?.href || "https://moodboard.invalid/") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  let candidate = raw;
  try {
    const url = new URL(raw, baseUrl);
    candidate = url.searchParams.get("collab") || raw;
  } catch {
    candidate = raw;
  }
  candidate = candidate.trim();
  return /^invite_[A-Za-z0-9_-]{20,96}$/.test(candidate) ? candidate : "";
}

export function loadCollaborationResume(storage = globalThis.localStorage) {
  try {
    const parsed = JSON.parse(storage?.getItem(COLLABORATION_RESUME_STORAGE_KEY) || "null");
    if (!parsed?.roomId || !parsed?.boardId) return null;
    return {
      roomId: String(parsed.roomId),
      boardId: String(parsed.boardId),
      inviteId: normalizeCollaborationInvite(parsed.inviteId) || "",
      savedAt: String(parsed.savedAt || ""),
    };
  } catch {
    return null;
  }
}

export function saveCollaborationResume(storage, value) {
  if (!value?.roomId || !value?.boardId) throw new Error("協作續接資料不完整。");
  const normalized = {
    roomId: String(value.roomId),
    boardId: String(value.boardId),
    inviteId: normalizeCollaborationInvite(value.inviteId) || "",
    savedAt: new Date().toISOString(),
  };
  storage?.setItem(COLLABORATION_RESUME_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function clearCollaborationResume(storage = globalThis.localStorage) {
  try { storage?.removeItem(COLLABORATION_RESUME_STORAGE_KEY); } catch { /* no-op */ }
}
