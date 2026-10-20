import { createId, ensureBoard } from "./model.js";

export function createRecoveredMoodboard(source, {
  label = "Drive 復原",
  now = new Date().toISOString(),
  idFactory = () => createId("board"),
} = {}) {
  const recovered = ensureBoard(source);
  const suffix = String(label || "Drive 復原").trim();
  return ensureBoard({
    ...recovered,
    id: idFactory(),
    name: suffix ? `${recovered.name} — ${suffix}` : recovered.name,
    createdAt: now,
    updatedAt: now,
    revision: 0,
  });
}

export function describeDriveConflict(localBoard, remoteFile) {
  return {
    local: {
      revision: Math.max(0, Number(localBoard?.revision || 0)),
      updatedAt: String(localBoard?.updatedAt || ""),
      objectCount: Array.isArray(localBoard?.objects) ? localBoard.objects.length : 0,
    },
    remote: {
      version: String(remoteFile?.version || ""),
      modifiedTime: String(remoteFile?.modifiedTime || ""),
      size: Math.max(0, Number(remoteFile?.size || 0)),
      headRevisionId: String(remoteFile?.headRevisionId || ""),
    },
  };
}
