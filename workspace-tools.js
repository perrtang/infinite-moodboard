export const RULER_UNITS = Object.freeze({
  px: { label: "px", pixelsPerUnit: 1, precision: 0 },
  mm: { label: "mm", pixelsPerUnit: 96 / 25.4, precision: 1 },
  cm: { label: "cm", pixelsPerUnit: 96 / 2.54, precision: 2 },
  in: { label: "inch", pixelsPerUnit: 96, precision: 2 },
});

const UNIT_IDS = new Set(Object.keys(RULER_UNITS));
const MAJOR_STEPS = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000];
const GUIDE_SNAP_STEPS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000];
const GUIDE_MINIMUM_SCREEN_STEP = 8;

export function normalizeRulerUnit(value) {
  return UNIT_IDS.has(value) ? value : "px";
}

export function unitToPixels(value, unit = "px") {
  const resolved = RULER_UNITS[normalizeRulerUnit(unit)];
  const number = Number(value);
  return (Number.isFinite(number) ? number : 0) * resolved.pixelsPerUnit;
}

export function pixelsToUnit(value, unit = "px") {
  const resolved = RULER_UNITS[normalizeRulerUnit(unit)];
  const number = Number(value);
  return (Number.isFinite(number) ? number : 0) / resolved.pixelsPerUnit;
}

export function guideSnapIncrement(unit = "px", zoom = 1, minimumScreenStep = GUIDE_MINIMUM_SCREEN_STEP) {
  const resolvedUnit = normalizeRulerUnit(unit);
  const safeZoom = Math.max(0.01, Number(zoom) || 1);
  const screenPixelsPerUnit = RULER_UNITS[resolvedUnit].pixelsPerUnit * safeZoom;
  const requiredUnits = Math.max(1, Math.ceil(Math.max(1, Number(minimumScreenStep) || 0) / screenPixelsPerUnit));
  return GUIDE_SNAP_STEPS.find((step) => step >= requiredUnits) || GUIDE_SNAP_STEPS.at(-1);
}

export function snapGuidePosition(value, unit = "px", { zoom = 1, minimumScreenStep } = {}) {
  const increment = guideSnapIncrement(unit, zoom, minimumScreenStep);
  const units = pixelsToUnit(value, unit);
  return unitToPixels(Math.round(units / increment) * increment, unit);
}

export function resolveGuidePosition({
  clientPosition,
  canvasStart = 0,
  viewOffset = 0,
  zoom = 1,
  unit = "px",
  snap = false,
  origin = 0,
} = {}) {
  const safeZoom = Math.max(0.01, Number(zoom) || 1);
  const position = (
    (Number(clientPosition) || 0)
    - (Number(canvasStart) || 0)
    - (Number(viewOffset) || 0)
  ) / safeZoom;
  const safeOrigin = Number(origin) || 0;
  return snap ? safeOrigin + snapGuidePosition(position - safeOrigin, unit, { zoom: safeZoom }) : position;
}

export function formatGuideValue(value, unit = "px") {
  const resolvedUnit = normalizeRulerUnit(unit);
  const resolved = RULER_UNITS[resolvedUnit];
  const converted = pixelsToUnit(value, resolvedUnit);
  const rounded = Number(converted.toFixed(resolved.precision));
  return `${rounded} ${resolved.label}`;
}

export function resolveRulerScale(zoom = 1, unit = "px") {
  const safeZoom = Math.max(0.01, Number(zoom) || 1);
  const resolvedUnit = normalizeRulerUnit(unit);
  const pixelsPerUnit = RULER_UNITS[resolvedUnit].pixelsPerUnit;
  const majorStep = MAJOR_STEPS.find((step) => step * pixelsPerUnit * safeZoom >= 64)
    || MAJOR_STEPS.at(-1);
  const minorStep = majorStep / 5;
  return {
    unit: resolvedUnit,
    zoom: safeZoom,
    pixelsPerUnit,
    majorStep,
    minorStep,
    majorScreenStep: majorStep * pixelsPerUnit * safeZoom,
    minorScreenStep: minorStep * pixelsPerUnit * safeZoom,
  };
}

export function buildCanvasGridMetrics({
  viewX = 0,
  viewY = 0,
  zoom = 1,
  unit = "px",
  originX = 0,
  originY = 0,
} = {}) {
  const scale = resolveRulerScale(zoom, unit);
  return {
    ...scale,
    screenOriginX: (Number(viewX) || 0) + (Number(originX) || 0) * scale.zoom,
    screenOriginY: (Number(viewY) || 0) + (Number(originY) || 0) * scale.zoom,
  };
}

export function buildRulerTicks(length, viewOffset, zoom, unit = "px", origin = 0) {
  const safeLength = Math.max(0, Number(length) || 0);
  const safeOffset = Number(viewOffset) || 0;
  const scale = resolveRulerScale(zoom, unit);
  const { majorStep, minorStep, pixelsPerUnit, unit: resolvedUnit, zoom: safeZoom } = scale;
  const safeOrigin = Number(origin) || 0;
  const firstValue = Math.floor((((-safeOffset / safeZoom) - safeOrigin) / pixelsPerUnit) / minorStep) * minorStep;
  const lastValue = ((((safeLength - safeOffset) / safeZoom) - safeOrigin) / pixelsPerUnit) + minorStep;
  const ticks = [];
  const maximumTickCount = 240;

  for (let value = firstValue, index = 0; value <= lastValue && index < maximumTickCount; value += minorStep, index += 1) {
    const normalizedValue = Math.abs(value) < minorStep / 100 ? 0 : value;
    const position = safeOffset + (safeOrigin + unitToPixels(normalizedValue, resolvedUnit)) * safeZoom;
    const majorRatio = normalizedValue / majorStep;
    const major = Math.abs(majorRatio - Math.round(majorRatio)) < 0.0001;
    ticks.push({
      position,
      value: normalizedValue,
      major,
      label: major ? String(Number(normalizedValue.toFixed(4))) : "",
    });
  }
  return ticks;
}

export function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase();
}

export function matchesListQuery(values, query) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;
  return values.some((value) => normalizeSearchText(value).includes(normalizedQuery));
}

export function shouldConfirmEscapeCancellation({ affectsDocument = false, hasChanges = false } = {}) {
  return Boolean(affectsDocument && hasChanges);
}

export function normalizeCanvasToolbarPosition(value) {
  if (!value || typeof value !== "object") return null;
  const x = Number(value.x);
  const y = Number(value.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return { x: Math.round(x), y: Math.round(y) };
}

export function clampCanvasToolbarPosition(position, bounds, toolbarSize, options = {}) {
  const normalized = normalizeCanvasToolbarPosition(position) || { x: 0, y: 0 };
  const width = Math.max(0, Number(bounds?.width) || 0);
  const height = Math.max(0, Number(bounds?.height) || 0);
  const toolbarWidth = Math.max(0, Number(toolbarSize?.width) || 0);
  const toolbarHeight = Math.max(0, Number(toolbarSize?.height) || 0);
  const margin = Math.max(0, Number(options.margin) || 0);
  const minimumY = Math.max(margin, Number(options.minimumY) || margin);
  const maximumX = Math.max(margin, width - toolbarWidth - margin);
  const maximumY = Math.max(minimumY, height - toolbarHeight - margin);
  return {
    x: Math.round(Math.min(maximumX, Math.max(margin, normalized.x))),
    y: Math.round(Math.min(maximumY, Math.max(minimumY, normalized.y))),
  };
}
