export const APP_VERSION = "0.9.0";
export const APP_VERSION_LABEL = `App v${APP_VERSION}`;
export const APP_RELEASE_DATE = "2026-10-20";
const APP_BASE_URL = import.meta.env?.BASE_URL || "/";
export const APP_UPDATE_MANIFEST_URL = import.meta.env?.VITE_MOODBOARD_UPDATE_MANIFEST_URL
  || `${APP_BASE_URL.endsWith("/") ? APP_BASE_URL : `${APP_BASE_URL}/`}infinite-moodboard-update.json`;

const SEMANTIC_VERSION_PATTERN = /^(\d+)\.(\d+)\.(\d+)$/;

function semanticVersionParts(version) {
  const match = String(version || "").trim().match(SEMANTIC_VERSION_PATTERN);
  if (!match) throw new Error("版本編號格式不正確。");
  return match.slice(1).map(Number);
}

export function compareSemanticVersions(currentVersion, latestVersion) {
  const current = semanticVersionParts(currentVersion);
  const latest = semanticVersionParts(latestVersion);
  for (let index = 0; index < current.length; index += 1) {
    if (current[index] < latest[index]) return -1;
    if (current[index] > latest[index]) return 1;
  }
  return 0;
}

export function normalizeUpdateManifest(value) {
  if (!value || typeof value !== "object") throw new Error("更新資訊格式不正確。");
  const version = String(value.version || "").trim();
  semanticVersionParts(version);
  return {
    product: String(value.product || "Infinite Moodboard").trim(),
    channel: String(value.channel || "stable").trim(),
    version,
    releasedAt: String(value.releasedAt || "").trim(),
    summary: String(value.summary || "").trim(),
    url: String(value.url || "").trim(),
  };
}
