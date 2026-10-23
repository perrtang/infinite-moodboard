// A download may replace the canvas only while its starting document and read
// generation are still current. Reference identity also catches unstamped drags.
export function workspaceReadIsCurrent(startBoard, currentBoard, expectedRead, currentRead, expectedEpoch, currentEpoch) {
  return Boolean(startBoard && startBoard === currentBoard
    && expectedRead === currentRead && expectedEpoch === currentEpoch);
}

export function remoteContentChanged(link, file) {
  if (!link || !file || link.fileId !== file.id) return false;
  if (link.headRevisionId && file.headRevisionId) return link.headRevisionId !== file.headRevisionId;
  return Boolean(link.version && file.version && String(link.version) !== String(file.version));
}
