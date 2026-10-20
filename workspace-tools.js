export const RULER_UNITS = Object.freeze({
  px: { label: "px", pixelsPerUnit: 1, precision: 0 },
  mm: { label: "mm", pixelsPerUnit: 96 / 25.4, precision: 1 },
  cm: { label: "cm", pixelsPerUnit: 96 / 2.54, precision: 2 },
  in: { label: "inch", pixelsPerUnit: 96, precision: 2 },
});

const UNIT_IDS = new Set(Object.keys(RULER_UNITS));
const MAJOR_STEPS = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000];

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

export function snapGuidePosition(value, unit = "px") {
  return unitToPixels(Math.round(pixelsToUnit(value, unit)), unit);
}

export function formatGuideValue(value, unit = "px") {
  const resolvedUnit = normalizeRulerUnit(unit);
  const resolved = RULER_UNITS[resolvedUnit];
  const converted = pixelsToUnit(value, resolvedUnit);
  const rounded = Number(converted.toFixed(resolved.precision));
  return `${rounded} ${resolved.label}`;
}

export function buildRulerTicks(length, viewOffset, zoom, unit = "px") {
  const safeLength = Math.max(0, Number(length) || 0);
  const safeOffset = Number(viewOffset) || 0;
  const safeZoom = Math.max(0.01, Number(zoom) || 1);
  const resolvedUnit = normalizeRulerUnit(unit);
  const pixelsPerUnit = RULER_UNITS[resolvedUnit].pixelsPerUnit;
  const majorStep = MAJOR_STEPS.find((step) => step * pixelsPerUnit * safeZoom >= 64)
    || MAJOR_STEPS.at(-1);
  const minorStep = majorStep / 5;
  const firstValue = Math.floor(((-safeOffset / safeZoom) / pixelsPerUnit) / minorStep) * minorStep;
  const lastValue = (((safeLength - safeOffset) / safeZoom) / pixelsPerUnit) + minorStep;
  const ticks = [];
  const maximumTickCount = 240;

  for (let value = firstValue, index = 0; value <= lastValue && index < maximumTickCount; value += minorStep, index += 1) {
    const normalizedValue = Math.abs(value) < minorStep / 100 ? 0 : value;
    const position = safeOffset + unitToPixels(normalizedValue, resolvedUnit) * safeZoom;
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
