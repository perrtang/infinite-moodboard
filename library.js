const SYNC_STATES = new Set(["pending", "syncing", "offline", "quota", "authorization-required", "conflict", "error"]);

function newestTimestamp(...values) {
  return values
    .map((value) => String(value || ""))
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a))[0] || "";
}

function linkedBoardIdForFile(fileId, links) {
  return Object.entries(links || {}).find(([, link]) => link?.fileId === fileId)?.[0] || "";
}

export function moodboardLibraryStatus(item) {
  if (item.syncJob && SYNC_STATES.has(item.syncJob.state)) return item.syncJob.state;
  if (item.local && item.remote) {
    const linkedVersion = String(item.link?.version || "");
    const remoteVersion = String(item.remote?.version || "");
    if (linkedVersion && remoteVersion && linkedVersion !== remoteVersion) return "needs-review";
    const localRevision = Number(item.local?.revision ?? item.local?.board?.revision ?? 0);
    const syncedRevision = Number(item.link?.syncedRevision ?? 0);
    const localUpdatedAt = String(item.local?.updatedAt || item.local?.board?.updatedAt || "");
    const syncedUpdatedAt = String(item.link?.syncedUpdatedAt || "");
    const hasSyncFingerprint = Boolean(syncedUpdatedAt) || syncedRevision > 0;
    if (hasSyncFingerprint && (
      localRevision !== syncedRevision
      || (syncedUpdatedAt && localUpdatedAt && localUpdatedAt !== syncedUpdatedAt)
    )) return "local-changed";
    return "synced";
  }
  if (item.local && item.linkedFileId) return "linked";
  if (item.local) return "local-only";
  return "remote-only";
}

export function mergeMoodboardLibrary({ localBoards = [], remoteFiles = [], syncJobs = [], links = {} } = {}) {
  const items = new Map();
  const jobsByBoard = new Map(syncJobs.map((job) => [job.boardId || job.id, job]));

  for (const local of localBoards) {
    const boardId = String(local?.id || local?.board?.id || "");
    if (!boardId) continue;
    const link = links?.[boardId] || null;
    items.set(boardId, {
      key: `board:${boardId}`,
      boardId,
      name: String(local.name || local.board?.name || "未命名 Infinite Moodboard"),
      local,
      remote: null,
      syncJob: jobsByBoard.get(boardId) || null,
      link,
      linkedFileId: String(link?.fileId || ""),
      updatedAt: newestTimestamp(local.updatedAt, local.savedAt),
    });
  }

  for (const remote of remoteFiles) {
    const boardId = String(remote?.boardId || linkedBoardIdForFile(remote?.id, links));
    const key = boardId || `remote:${remote.id}`;
    const existing = items.get(key);
    const name = String(existing?.name || remote.name || "未命名 Infinite Moodboard").replace(/\.moodboard$/i, "");
    items.set(key, {
      key: boardId ? `board:${boardId}` : `remote:${remote.id}`,
      boardId,
      name,
      local: existing?.local || null,
      remote,
      syncJob: existing?.syncJob || (boardId ? jobsByBoard.get(boardId) : null) || null,
      link: existing?.link || (boardId ? links?.[boardId] : null) || null,
      linkedFileId: String(remote.id || existing?.linkedFileId || ""),
      updatedAt: newestTimestamp(existing?.updatedAt, remote.modifiedTime, remote.createdTime),
    });
  }

  for (const job of syncJobs) {
    const boardId = String(job?.boardId || job?.id || "");
    if (!boardId || items.has(boardId)) continue;
    items.set(boardId, {
      key: `board:${boardId}`,
      boardId,
      name: String(job.board?.name || "未命名 Infinite Moodboard"),
      local: null,
      remote: null,
      syncJob: job,
      link: links?.[boardId] || null,
      linkedFileId: String(job.fileId || links?.[boardId]?.fileId || ""),
      updatedAt: newestTimestamp(job.updatedAt, job.board?.updatedAt),
    });
  }

  return [...items.values()]
    .map((item) => ({ ...item, status: moodboardLibraryStatus(item) }))
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)) || a.name.localeCompare(b.name));
}
