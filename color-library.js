export const OBJECT_COLOR_LIBRARY_STORAGE_KEY = "infinite-moodboard-object-colors-v1";
export const OBJECT_COLOR_LIBRARY_FILE_KIND = "infinite-moodboard-object-colors";
export const OBJECT_COLOR_LIBRARY_FILE_VERSION = 1;
export const OBJECT_COLOR_LIBRARY_LIMIT = 48;

export const DEFAULT_OBJECT_COLORS = Object.freeze([
  "#FFFFFF",
  "#111111",
  "#737373",
  "#D9D9D9",
  "#EB5757",
  "#F2994A",
  "#F2C94C",
  "#27AE60",
  "#2F80ED",
  "#9B51E0",
]);

export function normalizeObjectColor(value) {
  const color = String(value || "").trim();
  const short = color.match(/^#([0-9a-f]{3})$/i);
  if (short) return `#${[...short[1]].map((digit) => `${digit}${digit}`).join("")}`.toUpperCase();
  if (!/^#[0-9a-f]{6}$/i.test(color)) return null;
  return color.toUpperCase();
}

export function mergeObjectColorLibrary(...collections) {
  const colors = [];
  const seen = new Set();
  collections.flat().forEach((value) => {
    const color = normalizeObjectColor(value);
    if (!color || seen.has(color) || colors.length >= OBJECT_COLOR_LIBRARY_LIMIT) return;
    seen.add(color);
    colors.push(color);
  });
  return colors;
}

export function loadObjectColorLibrary(storage = globalThis.localStorage) {
  try {
    const stored = JSON.parse(storage?.getItem(OBJECT_COLOR_LIBRARY_STORAGE_KEY) || "[]");
    const storedColors = Array.isArray(stored) ? stored : stored?.colors;
    return mergeObjectColorLibrary(DEFAULT_OBJECT_COLORS, Array.isArray(storedColors) ? storedColors : []);
  } catch {
    return [...DEFAULT_OBJECT_COLORS];
  }
}

export function saveObjectColorLibrary(storage = globalThis.localStorage, colors = []) {
  const normalized = mergeObjectColorLibrary(DEFAULT_OBJECT_COLORS, colors);
  try {
    storage?.setItem(OBJECT_COLOR_LIBRARY_STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    // Private or embedded browsing contexts may deny storage; the in-memory palette remains usable.
  }
  return normalized;
}

export function serializeObjectColorLibrary(colors = []) {
  return JSON.stringify({
    product: "Infinite Moodboard",
    kind: OBJECT_COLOR_LIBRARY_FILE_KIND,
    version: OBJECT_COLOR_LIBRARY_FILE_VERSION,
    colors: mergeObjectColorLibrary(colors),
  }, null, 2);
}

export function parseObjectColorLibraryFile(text) {
  let parsed;
  try {
    parsed = JSON.parse(String(text || ""));
  } catch {
    throw new Error("色彩庫檔案不是有效的 JSON。");
  }
  if (parsed?.kind && parsed.kind !== OBJECT_COLOR_LIBRARY_FILE_KIND) {
    throw new Error("這不是 Infinite Moodboard 的物件色彩庫。");
  }
  if (parsed?.version && Number(parsed.version) !== OBJECT_COLOR_LIBRARY_FILE_VERSION) {
    throw new Error("這個色彩庫版本目前不支援。");
  }
  const values = Array.isArray(parsed) ? parsed : parsed?.colors;
  if (!Array.isArray(values)) throw new Error("色彩庫缺少 colors 清單。");
  const colors = mergeObjectColorLibrary(values);
  if (!colors.length) throw new Error("色彩庫沒有可使用的色彩。");
  return colors;
}
