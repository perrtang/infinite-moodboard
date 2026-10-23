import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCanvasGridMetrics,
  buildRulerTicks,
  clampCanvasToolbarPosition,
  formatGuideValue,
  guideSnapIncrement,
  matchesListQuery,
  normalizeCanvasToolbarPosition,
  normalizeRulerUnit,
  resolveDraggedGuidePosition,
  pixelsToUnit,
  resolveGuidePosition,
  resolveRulerScale,
  shouldConfirmEscapeCancellation,
  snapGuidePosition,
  unitToPixels,
} from "./workspace-tools.js";

test("ruler units convert at CSS 96 PPI and reject unknown units", () => {
  assert.equal(normalizeRulerUnit("cm"), "cm");
  assert.equal(normalizeRulerUnit("pt"), "px");
  assert.equal(unitToPixels(1, "in"), 96);
  assert.ok(Math.abs(pixelsToUnit(96, "mm") - 25.4) < 0.0001);
  assert.equal(formatGuideValue(96, "in"), "1 inch");
});

test("guide snapping uses perceptible integer marks in the active unit", () => {
  assert.equal(guideSnapIncrement("px", 0.56), 20);
  assert.equal(guideSnapIncrement("mm", 0.56), 5);
  assert.equal(guideSnapIncrement("cm", 0.56), 1);
  assert.equal(guideSnapIncrement("in", 0.56), 1);
  assert.ok(guideSnapIncrement("px", 0.56) * unitToPixels(1, "px") * 0.56 >= 8);
  assert.ok(guideSnapIncrement("mm", 0.56) * unitToPixels(1, "mm") * 0.56 >= 8);
  assert.equal(snapGuidePosition(41.4, "px"), 40);
  assert.equal(snapGuidePosition(77, "in"), 96);
  assert.ok(Math.abs(snapGuidePosition(40, "cm") - unitToPixels(1, "cm")) < 0.0001);
});

test("guide pointer positions use canvas pan and zoom before optional Shift snapping", () => {
  assert.equal(resolveGuidePosition({
    clientPosition: 245,
    canvasStart: 5,
    viewOffset: 40,
    zoom: 2,
  }), 100);
  assert.equal(resolveGuidePosition({
    clientPosition: 123.4,
    canvasStart: 10,
    viewOffset: 20,
    zoom: 1,
    unit: "px",
    snap: true,
  }), 90);
  assert.equal(resolveGuidePosition({
    clientPosition: 123.4,
    canvasStart: 10,
    viewOffset: 20,
    zoom: 1,
    unit: "px",
    snap: true,
    origin: 20.5,
  }), 90.5);
  assert.ok(Math.abs(resolveGuidePosition({
    clientPosition: 171,
    canvasStart: 10,
    viewOffset: 20,
    zoom: 0.56,
    unit: "mm",
    snap: true,
    origin: 12,
  }) - (12 + unitToPixels(65, "mm"))) < 0.0001);
});

test("dragged guides preserve their grab offset and snap the guide rather than the pointer", () => {
  assert.equal(resolveDraggedGuidePosition({
    initialPosition: 100,
    startClientPosition: 95,
    clientPosition: 95,
    zoom: 1,
  }), 100);
  assert.equal(resolveDraggedGuidePosition({
    initialPosition: 100,
    startClientPosition: 95,
    clientPosition: 99,
    zoom: 2,
  }), 102);
  assert.equal(resolveDraggedGuidePosition({
    initialPosition: 103,
    startClientPosition: 95,
    clientPosition: 97,
    zoom: 1,
    unit: "px",
    snap: true,
  }), 110);
  assert.ok(Math.abs(resolveDraggedGuidePosition({
    initialPosition: unitToPixels(10.4, "mm"),
    startClientPosition: 200,
    clientPosition: 202,
    zoom: 1,
    unit: "mm",
    snap: true,
  }) - unitToPixels(10, "mm")) < 0.0001);
});

test("ruler ticks adapt to zoom and always expose major labels", () => {
  const ticks = buildRulerTicks(900, 120, 1.5, "px");
  assert.ok(ticks.length > 5);
  assert.ok(ticks.some((tick) => tick.major && tick.label === "0"));
  assert.ok(ticks.every((tick, index) => index === 0 || tick.position > ticks[index - 1].position));
});

test("ruler ticks measure from a custom world origin without moving the viewport", () => {
  const ticks = buildRulerTicks(400, 20, 2, "px", 50);
  const zero = ticks.find((tick) => tick.major && tick.label === "0");
  assert.equal(zero.position, 120);
});

test("canvas patterns and ruler ticks share one adaptive measurement scale", () => {
  for (const unit of ["px", "mm", "cm", "in"]) {
    for (const zoom of [0.5, 1, 2]) {
      const scale = resolveRulerScale(zoom, unit);
      const ticks = buildRulerTicks(900, 0, zoom, unit);
      assert.ok(Math.abs(scale.majorScreenStep - scale.minorScreenStep * 5) < 0.0001);
      assert.ok(Math.abs((ticks[1].position - ticks[0].position) - scale.minorScreenStep) < 0.0001);
      assert.ok(scale.minorScreenStep >= 12.5);
    }
  }
});

test("canvas pattern origin follows pan, zoom, and the ruler origin", () => {
  const metrics = buildCanvasGridMetrics({
    viewX: 42,
    viewY: -18,
    zoom: 1.5,
    unit: "mm",
    originX: 20,
    originY: -10,
  });
  assert.equal(metrics.screenOriginX, 72);
  assert.equal(metrics.screenOriginY, -33);
  assert.ok(metrics.majorScreenStep > metrics.minorScreenStep);
});

test("list search is normalized and can match across multiple fields", () => {
  assert.equal(matchesListQuery(["Mood Board", "構圖 01"], " mood  "), true);
  assert.equal(matchesListQuery(["ＡＢＣ"], "abc"), true);
  assert.equal(matchesListQuery(["圖層", "Image"], "video"), false);
});

test("Escape confirmation is reserved for changed document gestures", () => {
  assert.equal(shouldConfirmEscapeCancellation({ affectsDocument: true, hasChanges: true }), true);
  assert.equal(shouldConfirmEscapeCancellation({ affectsDocument: true, hasChanges: false }), false);
  assert.equal(shouldConfirmEscapeCancellation({ affectsDocument: false, hasChanges: true }), false);
  assert.equal(shouldConfirmEscapeCancellation(), false);
});

test("canvas toolbar positions reject malformed storage and round valid coordinates", () => {
  assert.equal(normalizeCanvasToolbarPosition(null), null);
  assert.equal(normalizeCanvasToolbarPosition({ x: "bad", y: 20 }), null);
  assert.deepEqual(normalizeCanvasToolbarPosition({ x: 18.6, y: "40.2" }), { x: 19, y: 40 });
});

test("canvas toolbar positions stay inside the visible workspace", () => {
  const bounds = { width: 900, height: 640 };
  const toolbar = { width: 520, height: 44 };
  assert.deepEqual(
    clampCanvasToolbarPosition({ x: -100, y: -40 }, bounds, toolbar, { margin: 8 }),
    { x: 8, y: 8 },
  );
  assert.deepEqual(
    clampCanvasToolbarPosition({ x: 800, y: 800 }, bounds, toolbar, { margin: 8 }),
    { x: 372, y: 588 },
  );
  assert.deepEqual(
    clampCanvasToolbarPosition({ x: 50, y: 50 }, { width: 200, height: 30 }, toolbar, { margin: 8 }),
    { x: 8, y: 8 },
  );
});
