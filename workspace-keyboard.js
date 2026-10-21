const EDITABLE_SHORTCUT_SELECTOR = [
  "input",
  "textarea",
  "select",
  '[contenteditable]:not([contenteditable="false"])',
  '[role="textbox"]',
].join(", ");

export function isEditableShortcutTarget(target) {
  if (!target || typeof target !== "object") return false;
  const tagName = String(target.tagName || "").toUpperCase();
  if (["INPUT", "TEXTAREA", "SELECT"].includes(tagName) || target.isContentEditable) return true;
  return typeof target.closest === "function" && Boolean(target.closest(EDITABLE_SHORTCUT_SELECTOR));
}

export function isEditableShortcutEvent(event, activeElement = globalThis.document?.activeElement) {
  return isEditableShortcutTarget(event?.target) || isEditableShortcutTarget(activeElement);
}
