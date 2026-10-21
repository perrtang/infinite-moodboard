import * as Y from "yjs";
import { ensureBoard } from "./model.js";

export const COLLABORATION_CHUNK_BYTES = 320 * 1024;
export const COLLABORATION_MAX_UPDATE_BYTES = 48 * 1024 * 1024;
export const COLLABORATION_INVITE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const COLLABORATION_RESUME_STORAGE_KEY = "infinite-moodboard-collaboration-v1";
export const COLLABORATION_DEFAULT_INVITE_ROLE = "viewer";

export const LOCAL_COLLABORATION_ORIGIN = Object.freeze({ source: "local" });
export const REMOTE_COLLABORATION_ORIGIN = Object.freeze({ source: "remote" });

const BOARD_COLLECTIONS = Object.freeze(["objects", "groups", "guides", "captures"]);
const BOARD_META_KEYS = Object.freeze([
  "schemaVersion",
  "id",
  "name",
  "createdAt",
  "updatedAt",
  "revision",
  "guidesLocked",
  "rulerOrigin",
  "lastComposition",
]);

function randomBytes(length) {
  const bytes = new Uint8Array(length);
  if (globalThis.crypto?.getRandomValues) return globalThis.crypto.getRandomValues(bytes);
  for (let index = 0; index < length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
  return bytes;
}

export function collaborationId(prefix = "id", length = 18) {
  const value = encodeCollaborationBytes(randomBytes(length))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/g, "");
  return `${prefix}_${value}`;
}

export function assertVerifiedCollaborationUser(user) {
  if (!user?.uid || !user?.emailVerified) {
    const error = new Error("即時共編需要已完成 Email 驗證的 PETFASHION 帳號。");
    error.code = "collaboration/verified-account-required";
    throw error;
  }
  return user;
}

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

export function encodeCollaborationBytes(value) {
  const bytes = value instanceof Uint8Array ? value : new Uint8Array(value || []);
  let binary = "";
  const stride = 0x8000;
  for (let index = 0; index < bytes.length; index += stride) {
    binary += String.fromCharCode(...bytes.subarray(index, index + stride));
  }
  if (typeof btoa === "function") return btoa(binary);
  return Buffer.from(bytes).toString("base64");
}

export function decodeCollaborationBytes(value) {
  const encoded = String(value || "");
  if (typeof atob === "function") {
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  }
  return new Uint8Array(Buffer.from(encoded, "base64"));
}

export function splitCollaborationUpdate(value, chunkBytes = COLLABORATION_CHUNK_BYTES) {
  const bytes = value instanceof Uint8Array ? value : new Uint8Array(value || []);
  if (!bytes.byteLength) throw new Error("協作更新沒有內容。");
  if (bytes.byteLength > COLLABORATION_MAX_UPDATE_BYTES) {
    const error = new Error("這次協作更新超過 48 MB；畫布仍保存在這台裝置，請先壓縮大型影片或圖片。");
    error.code = "collaboration/update-too-large";
    throw error;
  }
  const size = Math.max(32 * 1024, Math.min(Number(chunkBytes) || COLLABORATION_CHUNK_BYTES, 360 * 1024));
  const chunks = [];
  for (let index = 0; index < bytes.byteLength; index += size) {
    chunks.push(encodeCollaborationBytes(bytes.subarray(index, index + size)));
  }
  return chunks;
}

export function combineCollaborationChunks(chunks) {
  const decoded = (Array.isArray(chunks) ? chunks : []).map(decodeCollaborationBytes);
  const size = decoded.reduce((total, bytes) => total + bytes.byteLength, 0);
  if (!size || size > COLLABORATION_MAX_UPDATE_BYTES) throw new Error("協作更新分段不完整或超過安全上限。");
  const merged = new Uint8Array(size);
  let offset = 0;
  decoded.forEach((bytes) => {
    merged.set(bytes, offset);
    offset += bytes.byteLength;
  });
  return merged;
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

export function createCollaborationInviteUrl(inviteId, baseUrl = globalThis.location?.href || "https://moodboard.invalid/") {
  const normalized = normalizeCollaborationInvite(inviteId);
  if (!normalized) throw new Error("協作邀請代碼格式不正確。");
  const url = new URL(baseUrl);
  url.searchParams.set("collab", normalized);
  url.hash = "";
  return url.toString();
}

function itemId(item, index, collectionName) {
  if (typeof item?.id === "string" && item.id) return item.id;
  return `${collectionName}-${index + 1}`;
}

function objectWithoutAsset(object) {
  if (!object || typeof object !== "object") return object;
  const { src: _src, ...rest } = object;
  return rest;
}

function syncMap(yMap, values, collectionName, serializer = (value) => value) {
  const entries = (Array.isArray(values) ? values : []).map((value, index) => [itemId(value, index, collectionName), value]);
  const incomingIds = new Set(entries.map(([id]) => id));
  [...yMap.keys()].forEach((id) => {
    if (!incomingIds.has(id)) yMap.delete(id);
  });
  entries.forEach(([id, value]) => {
    const serialized = JSON.stringify(serializer(value));
    if (yMap.get(id) !== serialized) yMap.set(id, serialized);
  });
  return entries.map(([id]) => id);
}

function liveAssets(objects) {
  const assets = new Map();
  (Array.isArray(objects) ? objects : []).forEach((object) => {
    if (!["image", "video"].includes(object?.type) || typeof object.src !== "string") return;
    const key = String(object.sourceId || object.id || "");
    if (key) assets.set(key, object.src);
  });
  return assets;
}

export function writeBoardToCollaborationDocument(document, board, origin = LOCAL_COLLABORATION_ORIGIN) {
  if (!(document instanceof Y.Doc)) throw new Error("協作文件格式不正確。");
  const normalized = ensureBoard(board);
  document.transact(() => {
    const meta = document.getMap("meta");
    BOARD_META_KEYS.forEach((key) => {
      const serialized = JSON.stringify(normalized[key] ?? null);
      if (meta.get(key) !== serialized) meta.set(key, serialized);
    });

    const order = document.getMap("order");
    BOARD_COLLECTIONS.forEach((collectionName) => {
      const ids = syncMap(
        document.getMap(collectionName),
        normalized[collectionName],
        collectionName,
        collectionName === "objects" ? objectWithoutAsset : (value) => value,
      );
      const serializedOrder = JSON.stringify(ids);
      if (order.get(collectionName) !== serializedOrder) order.set(collectionName, serializedOrder);
    });

    const assets = document.getMap("assets");
    const currentAssets = liveAssets(normalized.objects);
    [...assets.keys()].forEach((key) => {
      if (!currentAssets.has(key)) assets.delete(key);
    });
    currentAssets.forEach((src, key) => {
      if (assets.get(key) !== src) assets.set(key, src);
    });
  }, origin);
  return normalized;
}

function parseJson(value, fallback) {
  if (typeof value !== "string") return fallback;
  try { return JSON.parse(value); } catch { return fallback; }
}

function readOrderedCollection(document, name) {
  const collection = document.getMap(name);
  const order = parseJson(document.getMap("order").get(name), []);
  const keys = [...new Set([
    ...(Array.isArray(order) ? order : []),
    ...collection.keys(),
  ])];
  return keys.map((key) => parseJson(collection.get(key), null)).filter(Boolean);
}

export function readBoardFromCollaborationDocument(document, fallbackBoard, view = fallbackBoard?.view) {
  if (!(document instanceof Y.Doc)) throw new Error("協作文件格式不正確。");
  const fallback = ensureBoard(fallbackBoard || {});
  const meta = document.getMap("meta");
  const board = { ...fallback };
  BOARD_META_KEYS.forEach((key) => {
    board[key] = parseJson(meta.get(key), fallback[key]);
  });
  BOARD_COLLECTIONS.forEach((name) => {
    board[name] = readOrderedCollection(document, name);
  });
  const assets = document.getMap("assets");
  board.objects = board.objects.map((object) => {
    if (!["image", "video"].includes(object?.type)) return object;
    const key = String(object.sourceId || object.id || "");
    return { ...object, src: String(assets.get(key) || "") };
  });
  board.view = view || fallback.view;
  return ensureBoard(board);
}

export function createCollaborationDocument(board = null) {
  const document = new Y.Doc();
  if (board) writeBoardToCollaborationDocument(document, board, LOCAL_COLLABORATION_ORIGIN);
  return document;
}

export function encodeCollaborationDocument(document) {
  return Y.encodeStateAsUpdate(document);
}

export function applyCollaborationUpdate(document, update, origin = REMOTE_COLLABORATION_ORIGIN) {
  Y.applyUpdate(document, update, origin);
}

export function listenToCollaborationUpdates(document, callback) {
  const listener = (update, origin) => callback(update, origin);
  document.on("update", listener);
  return () => document.off("update", listener);
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
