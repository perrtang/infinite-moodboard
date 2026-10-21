export const SOURCE_VIEW_MIN_ZOOM = 0.005;
export const SOURCE_VIEW_MAX_ZOOM = 8;

function finite(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function clampSourceZoom(value) {
  return Math.min(SOURCE_VIEW_MAX_ZOOM, Math.max(SOURCE_VIEW_MIN_ZOOM, finite(value, 1)));
}

export function normalizeSourceView(value) {
  return {
    x: finite(value?.x, 0),
    y: finite(value?.y, 0),
    zoom: clampSourceZoom(value?.zoom),
  };
}

export function fitSourceView(viewport, media, padding = 48) {
  const viewportWidth = Math.max(1, finite(viewport?.width, 1));
  const viewportHeight = Math.max(1, finite(viewport?.height, 1));
  const mediaWidth = Math.max(1, finite(media?.width, 1));
  const mediaHeight = Math.max(1, finite(media?.height, 1));
  const safePadding = Math.max(0, finite(padding, 48));
  const availableWidth = Math.max(1, viewportWidth - safePadding * 2);
  const availableHeight = Math.max(1, viewportHeight - safePadding * 2);
  return {
    x: 0,
    y: 0,
    zoom: clampSourceZoom(Math.min(1, availableWidth / mediaWidth, availableHeight / mediaHeight)),
  };
}

export function panSourceView(view, deltaX, deltaY) {
  const normalized = normalizeSourceView(view);
  return {
    ...normalized,
    x: normalized.x + finite(deltaX, 0),
    y: normalized.y + finite(deltaY, 0),
  };
}

export function zoomSourceViewAtPoint(view, nextZoom, point, viewport) {
  const normalized = normalizeSourceView(view);
  const zoom = clampSourceZoom(nextZoom);
  const centerX = Math.max(1, finite(viewport?.width, 1)) / 2;
  const centerY = Math.max(1, finite(viewport?.height, 1)) / 2;
  const pointerX = finite(point?.x, centerX);
  const pointerY = finite(point?.y, centerY);
  const worldX = (pointerX - centerX - normalized.x) / normalized.zoom;
  const worldY = (pointerY - centerY - normalized.y) / normalized.zoom;
  return {
    x: pointerX - centerX - worldX * zoom,
    y: pointerY - centerY - worldY * zoom,
    zoom,
  };
}
