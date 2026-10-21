export function serializeLocalMoodboard(board) {
  return `${JSON.stringify(board, null, 2)}\n`;
}

export function shouldWriteLocalAutosaveFile({ autoSave, target, status, hasHandle }) {
  return Boolean(autoSave && target === "local" && status === "linked" && hasHandle);
}

export function localMoodboardFilename(name) {
  const safeName = String(name || "moodboard")
    .trim()
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-")
    .replace(/[. ]+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 120);
  return `${safeName || "moodboard"}.moodboard`;
}

export async function localFileWritePermission(handle, { request = false } = {}) {
  if (!handle) return "denied";
  if (typeof handle.queryPermission !== "function") return "granted";
  let permission = await handle.queryPermission({ mode: "readwrite" });
  if (permission !== "granted" && request && typeof handle.requestPermission === "function") {
    permission = await handle.requestPermission({ mode: "readwrite" });
  }
  return permission;
}

export async function writeMoodboardToLocalFile(handle, board, { requestPermission = false } = {}) {
  if (!handle || typeof handle.createWritable !== "function") {
    const error = new Error("找不到可寫入的本機 .moodboard 檔案。");
    error.code = "local-file/missing";
    throw error;
  }
  const permission = await localFileWritePermission(handle, { request: requestPermission });
  if (permission !== "granted") {
    const error = new Error("需要重新授權本機 .moodboard 檔案。");
    error.code = "local-file/permission-required";
    throw error;
  }
  const writable = await handle.createWritable();
  try {
    const content = serializeLocalMoodboard(board);
    await writable.write(content);
    await writable.close();
    return { handle, filename: String(handle.name || "Moodboard.moodboard"), bytes: new TextEncoder().encode(content).byteLength };
  } catch (error) {
    await writable.abort?.().catch(() => undefined);
    throw error;
  }
}

export async function pickMoodboardLocalFile(board, picker = globalThis.showSaveFilePicker) {
  if (typeof picker !== "function") {
    const error = new Error("這個瀏覽器不支援持續寫入本機檔案。");
    error.code = "local-file/unsupported";
    throw error;
  }
  const filename = localMoodboardFilename(board?.name);
  const handle = await picker({
    suggestedName: filename,
    types: [{ description: "Infinite Moodboard 檔案", accept: { "application/json": [".moodboard"] } }],
  });
  await writeMoodboardToLocalFile(handle, board, { requestPermission: true });
  return handle;
}
