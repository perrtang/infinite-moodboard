export function isCloudBoardReadOnly(sharing, link) {
  if (!sharing?.fileId || sharing.fileId !== link?.fileId) return false;
  if (["ready", "linked"].includes(sharing.status)) return !sharing.canEdit;
  return !link.canEdit && !link.ownedByMe;
}
