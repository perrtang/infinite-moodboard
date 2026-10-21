import assert from "node:assert/strict";
import test from "node:test";
import {
  SOURCE_VIEW_MAX_ZOOM,
  fitSourceView,
  normalizeSourceView,
  panSourceView,
  zoomSourceViewAtPoint,
} from "./source-view.js";

test("source media fits inside its own viewport without upscaling small originals", () => {
  assert.deepEqual(fitSourceView({ width: 1000, height: 700 }, { width: 2000, height: 1000 }, 50), {
    x: 0,
    y: 0,
    zoom: 0.45,
  });
  assert.equal(fitSourceView({ width: 1000, height: 700 }, { width: 200, height: 100 }, 50).zoom, 1);
});

test("source zoom keeps the pointed media coordinate under the pointer", () => {
  const view = { x: 30, y: -20, zoom: 0.5 };
  const viewport = { width: 800, height: 600 };
  const point = { x: 650, y: 220 };
  const before = {
    x: (point.x - viewport.width / 2 - view.x) / view.zoom,
    y: (point.y - viewport.height / 2 - view.y) / view.zoom,
  };
  const next = zoomSourceViewAtPoint(view, 1.25, point, viewport);
  assert.ok(Math.abs((point.x - viewport.width / 2 - next.x) / next.zoom - before.x) < 0.0001);
  assert.ok(Math.abs((point.y - viewport.height / 2 - next.y) / next.zoom - before.y) < 0.0001);
});

test("source pan and normalization stay isolated and bounded", () => {
  const boardView = Object.freeze({ x: 10, y: 20, zoom: 0.8 });
  assert.deepEqual(panSourceView(boardView, 15, -5), { x: 25, y: 15, zoom: 0.8 });
  assert.deepEqual(boardView, { x: 10, y: 20, zoom: 0.8 });
  assert.equal(normalizeSourceView({ zoom: 999 }).zoom, SOURCE_VIEW_MAX_ZOOM);
});
