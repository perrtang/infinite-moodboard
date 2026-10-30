import { normalizeDriveFileId, normalizeDriveResourceKey } from "./drive-share.js";

// Protects the link's Drive identifier, not the file itself or Drive permissions.
const ITERATIONS = 310000;
const encoder = new TextEncoder();
const encode = (bytes) => btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
function decode(value) {
  if (!/^[A-Za-z0-9_-]{1,2048}$/.test(value)) throw new Error("分享連結格式不正確。");
  try {
    const binary = atob(value.replaceAll("-", "+").replaceAll("_", "/") + "=".repeat((4 - value.length % 4) % 4));
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch { throw new Error("分享連結格式不正確。"); }
}
async function keyFor(password, salt) {
  const material = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" }, material, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}
export async function createProtectedShareLink({ fileId, resourceKey = "" }, password, baseUrl) {
  if (typeof password !== "string" || password.length < 8 || password.length > 128) throw new Error("密碼須為 8 至 128 個字元。");
  const id = normalizeDriveFileId(fileId);
  const key = resourceKey ? normalizeDriveResourceKey(resourceKey) : "";
  if (!id || (resourceKey && !key)) throw new Error("分享檔案資訊不正確。");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const payload = encoder.encode(JSON.stringify({ fileId: id, resourceKey: key }));
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await keyFor(password, salt), payload));
  const bytes = new Uint8Array(1 + salt.length + iv.length + encrypted.length);
  bytes.set([1]); bytes.set(salt, 1); bytes.set(iv, 17); bytes.set(encrypted, 29);
  const url = new URL(baseUrl); url.search = ""; url.hash = ""; url.searchParams.set("lockedShare", encode(bytes));
  return url.href;
}
export async function unlockProtectedShare(value, password) {
  const bytes = decode(value);
  if (bytes.length < 46 || bytes.length > 1000 || bytes[0] !== 1 || typeof password !== "string" || password.length > 128) throw new Error("分享連結或密碼不正確。");
  try {
    const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv: bytes.slice(17, 29) }, await keyFor(password, bytes.slice(1, 17)), bytes.slice(29));
    const payload = JSON.parse(new TextDecoder().decode(plaintext));
    const fileId = normalizeDriveFileId(payload.fileId);
    const resourceKey = payload.resourceKey ? normalizeDriveResourceKey(payload.resourceKey) : "";
    if (!fileId || (payload.resourceKey && !resourceKey)) throw new Error("invalid");
    return { fileId, resourceKey };
  } catch { throw new Error("分享連結或密碼不正確。"); }
}
