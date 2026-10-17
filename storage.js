const DATABASE_NAME = "moodboard-lab";
const DATABASE_VERSION = 1;
const STATE_STORE = "state";
const VERSION_STORE = "versions";
const CURRENT_BOARD_KEY = "current-board";
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

function openDatabase() {
  if (!("indexedDB" in globalThis)) {
    return Promise.reject(new Error("這個瀏覽器不支援 IndexedDB。"));
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STATE_STORE)) {
        database.createObjectStore(STATE_STORE, { keyPath: "key" });
      }
      if (!database.objectStoreNames.contains(VERSION_STORE)) {
        const store = database.createObjectStore(VERSION_STORE, { keyPath: "id" });
        store.createIndex("boardId", "boardId", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("無法開啟本機資料庫。"));
  });
}

export async function loadCurrentBoard() {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STATE_STORE, "readonly");
    const result = await requestToPromise(transaction.objectStore(STATE_STORE).get(CURRENT_BOARD_KEY));
    return result?.board || null;
  } finally {
    database.close();
  }
}

export async function saveCurrentBoard(board) {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STATE_STORE, "readwrite");
    transaction.objectStore(STATE_STORE).put({
      key: CURRENT_BOARD_KEY,
      board,
      savedAt: new Date().toISOString(),
    });
    await transactionToPromise(transaction);
  } finally {
    database.close();
  }
}

export async function listVersions(boardId) {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(VERSION_STORE, "readonly");
    const index = transaction.objectStore(VERSION_STORE).index("boardId");
    const versions = await requestToPromise(index.getAll(boardId));
    return versions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } finally {
    database.close();
  }
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

  const database = await openDatabase();
  try {
    const transaction = database.transaction(VERSION_STORE, "readwrite");
    transaction.objectStore(VERSION_STORE).put(version);
    await transactionToPromise(transaction);
  } finally {
    database.close();
  }

  const versions = await listVersions(board.id);
  const overflow = versions.slice(MAX_VERSIONS_PER_BOARD);
  if (overflow.length) {
    const cleanupDatabase = await openDatabase();
    try {
      const cleanupTransaction = cleanupDatabase.transaction(VERSION_STORE, "readwrite");
      overflow.forEach((item) => cleanupTransaction.objectStore(VERSION_STORE).delete(item.id));
      await transactionToPromise(cleanupTransaction);
    } finally {
      cleanupDatabase.close();
    }
  }

  return version;
}

export async function deleteVersion(versionId) {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(VERSION_STORE, "readwrite");
    transaction.objectStore(VERSION_STORE).delete(versionId);
    await transactionToPromise(transaction);
  } finally {
    database.close();
  }
}

export async function clearLocalMoodboardData() {
  const database = await openDatabase();
  try {
    const transaction = database.transaction([STATE_STORE, VERSION_STORE], "readwrite");
    transaction.objectStore(STATE_STORE).clear();
    transaction.objectStore(VERSION_STORE).clear();
    await transactionToPromise(transaction);
  } finally {
    database.close();
  }
}
