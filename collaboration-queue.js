export const COLLABORATION_QUEUE_DATABASE = "infinite-moodboard-collaboration";
export const COLLABORATION_QUEUE_VERSION = 1;
const PENDING_STORE = "pendingUpdates";

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("協作離線佇列讀取失敗。"));
  });
}

function transactionDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("協作離線佇列寫入失敗。"));
    transaction.onabort = () => reject(transaction.error || new Error("協作離線佇列已中止。"));
  });
}

function openQueueDatabase() {
  if (!("indexedDB" in globalThis)) return Promise.reject(new Error("這個瀏覽器不支援協作離線佇列。"));
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(COLLABORATION_QUEUE_DATABASE, COLLABORATION_QUEUE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(PENDING_STORE)) {
        const store = database.createObjectStore(PENDING_STORE, { keyPath: "id" });
        store.createIndex("roomId", "roomId", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("無法開啟協作離線佇列。"));
    request.onblocked = () => reject(new Error("另一個分頁正在更新協作離線佇列。"));
  });
}

async function withQueue(callback) {
  const database = await openQueueDatabase();
  try { return await callback(database); } finally { database.close(); }
}

export async function queueCollaborationUpdate(record) {
  if (!record?.id || !record?.roomId || !Array.isArray(record?.chunks) || !record.chunks.length) {
    throw new Error("協作更新佇列資料不完整。");
  }
  const normalized = {
    id: String(record.id),
    roomId: String(record.roomId),
    clientId: String(record.clientId || ""),
    senderUid: String(record.senderUid || ""),
    chunks: record.chunks.map(String),
    byteLength: Number(record.byteLength || 0),
    createdAt: String(record.createdAt || new Date().toISOString()),
    attemptCount: Number(record.attemptCount || 0),
    lastError: String(record.lastError || ""),
  };
  await withQueue(async (database) => {
    const transaction = database.transaction(PENDING_STORE, "readwrite");
    transaction.objectStore(PENDING_STORE).put(normalized);
    await transactionDone(transaction);
  });
  return normalized;
}

export async function listQueuedCollaborationUpdates(roomId = "") {
  return withQueue(async (database) => {
    const transaction = database.transaction(PENDING_STORE, "readonly");
    const store = transaction.objectStore(PENDING_STORE);
    const records = roomId
      ? await requestResult(store.index("roomId").getAll(String(roomId)))
      : await requestResult(store.getAll());
    return records.sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
  });
}

export async function updateQueuedCollaborationUpdate(id, patch = {}) {
  return withQueue(async (database) => {
    const transaction = database.transaction(PENDING_STORE, "readwrite");
    const store = transaction.objectStore(PENDING_STORE);
    const current = await requestResult(store.get(String(id)));
    if (!current) return null;
    const next = { ...current, ...patch, id: current.id, roomId: current.roomId };
    store.put(next);
    await transactionDone(transaction);
    return next;
  });
}

export async function removeQueuedCollaborationUpdate(id) {
  return withQueue(async (database) => {
    const transaction = database.transaction(PENDING_STORE, "readwrite");
    transaction.objectStore(PENDING_STORE).delete(String(id));
    await transactionDone(transaction);
  });
}

export async function clearCollaborationQueue() {
  if (!("indexedDB" in globalThis)) return;
  await withQueue(async (database) => {
    const transaction = database.transaction(PENDING_STORE, "readwrite");
    transaction.objectStore(PENDING_STORE).clear();
    await transactionDone(transaction);
  });
}
