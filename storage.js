export const LOCAL_DATABASE_NAME = "moodboard-lab";
export const LOCAL_DATABASE_VERSION = 2;

const STATE_STORE = "state";
const VERSION_STORE = "versions";
const BOARD_STORE = "boards";
const SYNC_QUEUE_STORE = "syncQueue";
const META_STORE = "meta";
const CURRENT_BOARD_KEY = "current-board";
const ACTIVE_BOARD_KEY = "active-board-id";
const MAX_VERSIONS_PER_BOARD = 24;

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("IndexedDB request failed"));
  });
}

function transactionToPromise(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("IndexedDB transaction failed"));
    transaction.onabort = () => reject(transaction.error || new Error("IndexedDB transaction aborted"));
  });
}

function textByteLength(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return new TextEncoder().encode(text).byteLength;
}

function localBoardRecord(board, savedAt = new Date().toISOString()) {
  if (!board?.id) throw new Error("Moodboard 缺少可辨識的 ID。");
  return {
    id: String(board.id),
    name: String(board.name || "未命名 Infinite Moodboard"),
    nameNormalized: String(board.name || "").trim().toLocaleLowerCase(),
    createdAt: String(board.createdAt || savedAt),
    updatedAt: String(board.updatedAt || savedAt),
    savedAt,
    revision: Number.isFinite(Number(board.revision)) ? Number(board.revision) : 0,
    objectCount: Array.isArray(board.objects) ? board.objects.length : 0,
    byteSize: textByteLength(board),
    board,
  };
}

function ensureIndex(store, name, keyPath) {
  if (!store.indexNames.contains(name)) store.createIndex(name, keyPath, { unique: false });
}

function openDatabase() {
  if (!("indexedDB" in globalThis)) {
    return Promise.reject(new Error("這個瀏覽器不支援 IndexedDB。"));
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(LOCAL_DATABASE_NAME, LOCAL_DATABASE_VERSION);
    request.onupgradeneeded = (event) => {
      const database = request.result;
      const transaction = request.transaction;
      const oldVersion = Number(event.oldVersion || 0);

      if (!database.objectStoreNames.contains(STATE_STORE)) {
        database.createObjectStore(STATE_STORE, { keyPath: "key" });
      }
      if (!database.objectStoreNames.contains(VERSION_STORE)) {
        const store = database.createObjectStore(VERSION_STORE, { keyPath: "id" });
        store.createIndex("boardId", "boardId", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
      if (!database.objectStoreNames.contains(BOARD_STORE)) {
        const store = database.createObjectStore(BOARD_STORE, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
        store.createIndex("nameNormalized", "nameNormalized", { unique: false });
      } else {
        const store = transaction.objectStore(BOARD_STORE);
        ensureIndex(store, "updatedAt", "updatedAt");
        ensureIndex(store, "nameNormalized", "nameNormalized");
      }
      if (!database.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
        const store = database.createObjectStore(SYNC_QUEUE_STORE, { keyPath: "id" });
        store.createIndex("state", "state", { unique: false });
        store.createIndex("nextAttemptAt", "nextAttemptAt", { unique: false });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
      }
      if (!database.objectStoreNames.contains(META_STORE)) {
        database.createObjectStore(META_STORE, { keyPath: "key" });
      }

      if (oldVersion < 2) {
        const legacyRequest = transaction.objectStore(STATE_STORE).get(CURRENT_BOARD_KEY);
        legacyRequest.onsuccess = () => {
          const legacyBoard = legacyRequest.result?.board;
          if (!legacyBoard?.id) return;
          const savedAt = String(legacyRequest.result?.savedAt || new Date().toISOString());
          transaction.objectStore(BOARD_STORE).put(localBoardRecord(legacyBoard, savedAt));
          transaction.objectStore(META_STORE).put({ key: ACTIVE_BOARD_KEY, value: String(legacyBoard.id), updatedAt: savedAt });
        };
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("無法開啟本機資料庫。"));
    request.onblocked = () => reject(new Error("另一個分頁正在更新本機 Moodboard 資料庫，請關閉舊分頁後重試。"));
  });
}

async function withDatabase(callback) {
  const database = await openDatabase();
  try {
    return await callback(database);
  } finally {
    database.close();
  }
}

export async function getActiveBoardId() {
  return withDatabase(async (database) => {
    const transaction = database.transaction(META_STORE, "readonly");
    const result = await requestToPromise(transaction.objectStore(META_STORE).get(ACTIVE_BOARD_KEY));
    return result?.value || "";
  });
}

export async function setActiveBoardId(boardId) {
  return withDatabase(async (database) => {
    const transaction = database.transaction(META_STORE, "readwrite");
    if (boardId) {
      transaction.objectStore(META_STORE).put({ key: ACTIVE_BOARD_KEY, value: String(boardId), updatedAt: new Date().toISOString() });
    } else {
      transaction.objectStore(META_STORE).delete(ACTIVE_BOARD_KEY);
    }
    await transactionToPromise(transaction);
  });
}

export async function getLocalBoard(boardId) {
  if (!boardId) return null;
  return withDatabase(async (database) => {
    const transaction = database.transaction(BOARD_STORE, "readonly");
    const result = await requestToPromise(transaction.objectStore(BOARD_STORE).get(String(boardId)));
    return result || null;
  });
}

export async function listLocalBoards() {
  return withDatabase(async (database) => {
    const transaction = database.transaction(BOARD_STORE, "readonly");
    const records = await requestToPromise(transaction.objectStore(BOARD_STORE).getAll());
    return records.sort((a, b) => String(b.updatedAt || b.savedAt).localeCompare(String(a.updatedAt || a.savedAt)));
  });
}

export async function upsertLocalBoard(board) {
  const record = localBoardRecord(board);
  await withDatabase(async (database) => {
    const transaction = database.transaction(BOARD_STORE, "readwrite");
    transaction.objectStore(BOARD_STORE).put(record);
    await transactionToPromise(transaction);
  });
  return record;
}

export async function loadCurrentBoard() {
  return withDatabase(async (database) => {
    const transaction = database.transaction([META_STORE, BOARD_STORE, STATE_STORE], "readonly");
    const meta = await requestToPromise(transaction.objectStore(META_STORE).get(ACTIVE_BOARD_KEY));
    if (meta?.value) {
      const record = await requestToPromise(transaction.objectStore(BOARD_STORE).get(meta.value));
      if (record?.board) return record.board;
    }
    const legacy = await requestToPromise(transaction.objectStore(STATE_STORE).get(CURRENT_BOARD_KEY));
    return legacy?.board || null;
  });
}

export async function saveCurrentBoard(board) {
  const savedAt = new Date().toISOString();
  const record = localBoardRecord(board, savedAt);
  await withDatabase(async (database) => {
    const transaction = database.transaction([STATE_STORE, BOARD_STORE, META_STORE], "readwrite");
    transaction.objectStore(STATE_STORE).put({ key: CURRENT_BOARD_KEY, board, savedAt });
    transaction.objectStore(BOARD_STORE).put(record);
    transaction.objectStore(META_STORE).put({ key: ACTIVE_BOARD_KEY, value: record.id, updatedAt: savedAt });
    await transactionToPromise(transaction);
  });
  return record;
}

export async function deleteLocalBoard(boardId, { deleteVersions = true } = {}) {
  if (!boardId) return;
  await withDatabase(async (database) => {
    const stores = [BOARD_STORE, SYNC_QUEUE_STORE, META_STORE, STATE_STORE];
    if (deleteVersions) stores.push(VERSION_STORE);
    const transaction = database.transaction(stores, "readwrite");
    transaction.objectStore(BOARD_STORE).delete(boardId);
    transaction.objectStore(SYNC_QUEUE_STORE).delete(boardId);

    const activeRequest = transaction.objectStore(META_STORE).get(ACTIVE_BOARD_KEY);
    activeRequest.onsuccess = () => {
      if (activeRequest.result?.value === boardId) {
        transaction.objectStore(META_STORE).delete(ACTIVE_BOARD_KEY);
        transaction.objectStore(STATE_STORE).delete(CURRENT_BOARD_KEY);
      }
    };

    if (deleteVersions) {
      const cursorRequest = transaction.objectStore(VERSION_STORE).index("boardId").openCursor(boardId);
      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (!cursor) return;
        cursor.delete();
        cursor.continue();
      };
    }
    await transactionToPromise(transaction);
  });
}

export async function enqueueSync(board, metadata = {}) {
  if (!board?.id) throw new Error("無法排入沒有 ID 的 Moodboard。");
  const now = new Date().toISOString();
  const id = String(board.id);
  await withDatabase(async (database) => {
    const transaction = database.transaction(SYNC_QUEUE_STORE, "readwrite");
    const store = transaction.objectStore(SYNC_QUEUE_STORE);
    const existingRequest = store.get(id);
    existingRequest.onsuccess = () => {
      const existing = existingRequest.result;
      store.put({
        id,
        boardId: id,
        board,
        fileId: String(metadata.fileId || existing?.fileId || ""),
        expectedVersion: String(metadata.expectedVersion || existing?.expectedVersion || ""),
        state: "pending",
        attemptCount: Number(existing?.attemptCount || 0),
        lastError: "",
        createdAt: String(existing?.createdAt || now),
        updatedAt: now,
        nextAttemptAt: now,
      });
    };
    await transactionToPromise(transaction);
  });
  return getSyncJob(id);
}

export async function getSyncJob(boardId) {
  if (!boardId) return null;
  return withDatabase(async (database) => {
    const transaction = database.transaction(SYNC_QUEUE_STORE, "readonly");
    return (await requestToPromise(transaction.objectStore(SYNC_QUEUE_STORE).get(String(boardId)))) || null;
  });
}

export async function listSyncJobs() {
  return withDatabase(async (database) => {
    const transaction = database.transaction(SYNC_QUEUE_STORE, "readonly");
    const records = await requestToPromise(transaction.objectStore(SYNC_QUEUE_STORE).getAll());
    return records.sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
  });
}

export async function getDueSyncJobs(now = new Date()) {
  const timestamp = now instanceof Date ? now.toISOString() : new Date(now).toISOString();
  const jobs = await listSyncJobs();
  return jobs.filter((job) => job.state !== "syncing" && String(job.nextAttemptAt || "") <= timestamp);
}

export async function updateSyncJob(boardId, patch = {}) {
  if (!boardId) return null;
  const current = await getSyncJob(boardId);
  if (!current) return null;
  const updated = {
    ...current,
    ...patch,
    id: current.id,
    boardId: current.boardId,
    updatedAt: new Date().toISOString(),
  };
  await withDatabase(async (database) => {
    const transaction = database.transaction(SYNC_QUEUE_STORE, "readwrite");
    transaction.objectStore(SYNC_QUEUE_STORE).put(updated);
    await transactionToPromise(transaction);
  });
  return updated;
}

export async function removeSyncJob(boardId) {
  if (!boardId) return;
  await withDatabase(async (database) => {
    const transaction = database.transaction(SYNC_QUEUE_STORE, "readwrite");
    transaction.objectStore(SYNC_QUEUE_STORE).delete(String(boardId));
    await transactionToPromise(transaction);
  });
}

export async function localStorageEstimate() {
  const storage = globalThis.navigator?.storage;
  const estimate = await storage?.estimate?.().catch(() => null);
  const persisted = await storage?.persisted?.().catch(() => null);
  return {
    usage: Number.isFinite(Number(estimate?.usage)) ? Number(estimate.usage) : null,
    quota: Number.isFinite(Number(estimate?.quota)) ? Number(estimate.quota) : null,
    persisted: typeof persisted === "boolean" ? persisted : null,
  };
}

export async function getLocalLibrarySummary() {
  const [boards, queue, storage] = await Promise.all([
    listLocalBoards(),
    listSyncJobs(),
    localStorageEstimate(),
  ]);
  return {
    boardCount: boards.length,
    pendingSyncCount: queue.length,
    estimatedBoardBytes: boards.reduce((total, record) => total + Number(record.byteSize || 0), 0),
    storage,
  };
}

export async function listVersions(boardId) {
  return withDatabase(async (database) => {
    const transaction = database.transaction(VERSION_STORE, "readonly");
    const index = transaction.objectStore(VERSION_STORE).index("boardId");
    const versions = await requestToPromise(index.getAll(boardId));
    return versions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  });
}

export async function saveVersion(board, label, kind = "manual") {
  const createdAt = new Date().toISOString();
  const version = {
    id: `version-${board.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    boardId: board.id,
    createdAt,
    label: String(label || "未命名版本").trim().slice(0, 80) || "未命名版本",
    kind,
    objectCount: board.objects.length,
    board,
  };

  await withDatabase(async (database) => {
    const transaction = database.transaction(VERSION_STORE, "readwrite");
    transaction.objectStore(VERSION_STORE).put(version);
    await transactionToPromise(transaction);
  });

  const versions = await listVersions(board.id);
  const overflow = versions.slice(MAX_VERSIONS_PER_BOARD);
  if (overflow.length) {
    await withDatabase(async (database) => {
      const transaction = database.transaction(VERSION_STORE, "readwrite");
      overflow.forEach((item) => transaction.objectStore(VERSION_STORE).delete(item.id));
      await transactionToPromise(transaction);
    });
  }

  return version;
}

export async function deleteVersion(versionId) {
  return withDatabase(async (database) => {
    const transaction = database.transaction(VERSION_STORE, "readwrite");
    transaction.objectStore(VERSION_STORE).delete(versionId);
    await transactionToPromise(transaction);
  });
}

export async function clearLocalMoodboardData() {
  return withDatabase(async (database) => {
    const transaction = database.transaction([STATE_STORE, VERSION_STORE, BOARD_STORE, SYNC_QUEUE_STORE, META_STORE], "readwrite");
    transaction.objectStore(STATE_STORE).clear();
    transaction.objectStore(VERSION_STORE).clear();
    transaction.objectStore(BOARD_STORE).clear();
    transaction.objectStore(SYNC_QUEUE_STORE).clear();
    transaction.objectStore(META_STORE).clear();
    await transactionToPromise(transaction);
  });
}
