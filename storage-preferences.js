export const STORAGE_PREFERENCES_STORAGE_KEY = "infinite-moodboard-storage-preferences-v1";

const STORAGE_TARGETS = new Set(["local", "drive"]);

function defaultStoragePreferences() {
  return {
    autoSave: true,
    showSaveStatus: true,
    targets: {},
    uploadPaused: {},
    loadRecoveries: {},
  };
}

export function normalizeStoragePreferences(value) {
  const fallback = defaultStoragePreferences();
  if (!value || typeof value !== "object") return fallback;

  const targets = {};
  for (const [boardId, target] of Object.entries(value.targets || {})) {
    if (!boardId || !STORAGE_TARGETS.has(target)) continue;
    targets[String(boardId)] = target;
  }

  return {
    autoSave: value.autoSave !== false,
    showSaveStatus: value.showSaveStatus !== false,
    targets,
    uploadPaused: Object.fromEntries(Object.entries(value.uploadPaused || {}).filter(([id, paused]) => id && paused === true)),
    loadRecoveries: Object.fromEntries(Object.entries(value.loadRecoveries || {}).filter(([id, record]) => id && record?.boardId && record?.versionId).map(([id, record]) => [id, { boardId: String(record.boardId), versionId: String(record.versionId), target: record.target === "drive" ? "drive" : "local" }])),
  };
}

export function loadStoragePreferences(storage = globalThis.localStorage) {
  try {
    return normalizeStoragePreferences(JSON.parse(storage?.getItem(STORAGE_PREFERENCES_STORAGE_KEY) || "null"));
  } catch {
    return defaultStoragePreferences();
  }
}

export function saveStoragePreferences(storage, value) {
  const preferences = normalizeStoragePreferences(value);
  try {
    storage?.setItem(STORAGE_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Editing remains available when browser storage is unavailable.
  }
  return preferences;
}

export function storageTargetForBoard(preferences, boardId) {
  const id = String(boardId || "");
  if (!id) return null;
  const target = normalizeStoragePreferences(preferences).targets[id];
  return STORAGE_TARGETS.has(target) ? target : null;
}

export function setBoardStorageTarget(preferences, boardId, target) {
  const normalized = normalizeStoragePreferences(preferences);
  const id = String(boardId || "");
  if (!id) return normalized;

  const targets = { ...normalized.targets };
  if (STORAGE_TARGETS.has(target)) targets[id] = target;
  else delete targets[id];

  return normalizeStoragePreferences({ ...normalized, targets });
}

export function isCurrentStorageTargetOperation({
  expectedEpoch,
  currentEpoch,
  expectedBoardId,
  currentBoardId,
}) {
  return Number(expectedEpoch) === Number(currentEpoch)
    && String(expectedBoardId || "") === String(currentBoardId || "");
}
