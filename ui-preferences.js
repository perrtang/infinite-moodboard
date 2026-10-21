export const UI_TYPOGRAPHY_STORAGE_KEY = "infinite-moodboard-interface-typography-v1";
export const CANVAS_BACKGROUND_STORAGE_KEY = "infinite-moodboard-canvas-background-v1";

export const CANVAS_BACKGROUND_MODES = Object.freeze(["dots", "lines", "hidden"]);

export const DEFAULT_CANVAS_BACKGROUND = Object.freeze({
  mode: "dots",
  lastVisibleMode: "dots",
  dotsColor: "#777777",
  dotsOpacity: 0.68,
  linesColor: "#858585",
  linesOpacity: 0.45,
});

export const UI_FONT_SIZE_PRESETS = Object.freeze([
  { id: "compact", label: "較小", offset: -1 },
  { id: "default", label: "標準", offset: 0 },
  { id: "comfortable", label: "較大", offset: 2 },
]);

export const UI_FONT_FAMILY_PRESETS = Object.freeze([
  {
    id: "default",
    label: "Infinite 標準",
    family: '"Inter", "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif',
  },
  {
    id: "source-han",
    label: "思源黑體",
    family: '"Noto Sans TC", "Source Han Sans TC", "PingFang TC", sans-serif',
  },
  {
    id: "system",
    label: "系統黑體",
    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang TC", "Microsoft JhengHei", sans-serif',
  },
  {
    id: "mono",
    label: "科技等寬",
    family: '"JetBrains Mono", "SFMono-Regular", "Noto Sans TC", monospace',
  },
]);

export const DEFAULT_INTERFACE_TYPOGRAPHY = Object.freeze({
  sizeMode: "default",
  customOffset: 0,
  familyMode: "default",
  customFamily: "",
});

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function cleanCustomFamily(value) {
  return String(value || "")
    .replace(/[;{}\n\r]/g, "")
    .trim()
    .slice(0, 120);
}

function normalizeHexColor(value, fallback) {
  const compact = String(value || "").trim().toUpperCase();
  if (/^#[0-9A-F]{6}$/.test(compact)) return compact;
  if (/^#[0-9A-F]{3}$/.test(compact)) {
    return `#${compact.slice(1).split("").map((character) => character.repeat(2)).join("")}`;
  }
  return fallback;
}

function normalizeOpacity(value, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.round(clamp(numeric, 0.1, 1) * 100) / 100;
}

function hexColorChannels(value) {
  const normalized = normalizeHexColor(value, "#808080");
  return [1, 3, 5].map((index) => Number.parseInt(normalized.slice(index, index + 2), 16)).join(" ");
}

export function normalizeInterfaceTypography(value = {}) {
  const sizeModes = new Set([...UI_FONT_SIZE_PRESETS.map((item) => item.id), "custom"]);
  const familyModes = new Set([...UI_FONT_FAMILY_PRESETS.map((item) => item.id), "custom"]);
  const customFamily = cleanCustomFamily(value.customFamily);
  const requestedFamilyMode = familyModes.has(value.familyMode) ? value.familyMode : DEFAULT_INTERFACE_TYPOGRAPHY.familyMode;

  return {
    sizeMode: sizeModes.has(value.sizeMode) ? value.sizeMode : DEFAULT_INTERFACE_TYPOGRAPHY.sizeMode,
    customOffset: Math.round(clamp(Number(value.customOffset) || 0, -1, 4) * 2) / 2,
    familyMode: requestedFamilyMode === "custom" && !customFamily ? "default" : requestedFamilyMode,
    customFamily,
  };
}

export function resolveInterfaceTypography(value) {
  const normalized = normalizeInterfaceTypography(value);
  const sizePreset = UI_FONT_SIZE_PRESETS.find((item) => item.id === normalized.sizeMode);
  const familyPreset = UI_FONT_FAMILY_PRESETS.find((item) => item.id === normalized.familyMode);

  return {
    ...normalized,
    offset: sizePreset ? sizePreset.offset : normalized.customOffset,
    family: familyPreset ? familyPreset.family : normalized.customFamily,
  };
}

export function interfaceTypographyCssVariables(value) {
  const resolved = resolveInterfaceTypography(value);
  return {
    "--ui-font-offset": `${resolved.offset}px`,
    "--ui-font-family": resolved.family,
  };
}

export function normalizeCanvasBackground(value = {}) {
  const visibleModes = new Set(["dots", "lines"]);
  const mode = CANVAS_BACKGROUND_MODES.includes(value.mode)
    ? value.mode
    : DEFAULT_CANVAS_BACKGROUND.mode;
  const lastVisibleMode = visibleModes.has(value.lastVisibleMode)
    ? value.lastVisibleMode
    : visibleModes.has(mode)
      ? mode
      : DEFAULT_CANVAS_BACKGROUND.lastVisibleMode;

  return {
    mode,
    lastVisibleMode: visibleModes.has(mode) ? mode : lastVisibleMode,
    dotsColor: normalizeHexColor(value.dotsColor, DEFAULT_CANVAS_BACKGROUND.dotsColor),
    dotsOpacity: normalizeOpacity(value.dotsOpacity, DEFAULT_CANVAS_BACKGROUND.dotsOpacity),
    linesColor: normalizeHexColor(value.linesColor, DEFAULT_CANVAS_BACKGROUND.linesColor),
    linesOpacity: normalizeOpacity(value.linesOpacity, DEFAULT_CANVAS_BACKGROUND.linesOpacity),
  };
}

export function changeCanvasBackgroundMode(value, mode) {
  const current = normalizeCanvasBackground(value);
  if (!CANVAS_BACKGROUND_MODES.includes(mode)) return current;
  return normalizeCanvasBackground({
    ...current,
    mode,
    lastVisibleMode: mode === "hidden" ? current.lastVisibleMode : mode,
  });
}

export function resetCanvasBackgroundAppearance(value) {
  const current = normalizeCanvasBackground(value);
  return {
    ...current,
    dotsColor: DEFAULT_CANVAS_BACKGROUND.dotsColor,
    dotsOpacity: DEFAULT_CANVAS_BACKGROUND.dotsOpacity,
    linesColor: DEFAULT_CANVAS_BACKGROUND.linesColor,
    linesOpacity: DEFAULT_CANVAS_BACKGROUND.linesOpacity,
  };
}

export function canvasBackgroundCssVariables(value) {
  const resolved = normalizeCanvasBackground(value);
  return {
    "--canvas-grid-dots-rgb": hexColorChannels(resolved.dotsColor),
    "--canvas-grid-dots-opacity": String(resolved.dotsOpacity),
    "--canvas-grid-dots-minor-opacity": String(Math.round(resolved.dotsOpacity * 0.56 * 1000) / 1000),
    "--canvas-grid-lines-rgb": hexColorChannels(resolved.linesColor),
    "--canvas-grid-lines-opacity": String(resolved.linesOpacity),
    "--canvas-grid-lines-minor-opacity": String(Math.round(resolved.linesOpacity * 0.48 * 1000) / 1000),
  };
}

export function toggleCanvasBackgroundVisibility(value) {
  const current = normalizeCanvasBackground(value);
  return changeCanvasBackgroundMode(
    current,
    current.mode === "hidden" ? current.lastVisibleMode : "hidden",
  );
}
