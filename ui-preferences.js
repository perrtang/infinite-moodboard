export const UI_TYPOGRAPHY_STORAGE_KEY = "infinite-moodboard-interface-typography-v1";
export const CANVAS_BACKGROUND_STORAGE_KEY = "infinite-moodboard-canvas-background-v1";

export const CANVAS_BACKGROUND_MODES = Object.freeze(["dots", "lines", "hidden"]);

export const DEFAULT_CANVAS_BACKGROUND = Object.freeze({
  mode: "dots",
  lastVisibleMode: "dots",
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
  };
}

export function changeCanvasBackgroundMode(value, mode) {
  const current = normalizeCanvasBackground(value);
  if (!CANVAS_BACKGROUND_MODES.includes(mode)) return current;
  return normalizeCanvasBackground({
    mode,
    lastVisibleMode: mode === "hidden" ? current.lastVisibleMode : mode,
  });
}

export function toggleCanvasBackgroundVisibility(value) {
  const current = normalizeCanvasBackground(value);
  return changeCanvasBackgroundMode(
    current,
    current.mode === "hidden" ? current.lastVisibleMode : "hidden",
  );
}
