import assert from "node:assert/strict";
import test from "node:test";
import {
  buildRulerTicks,
  formatGuideValue,
  matchesListQuery,
  normalizeRulerUnit,
  pixelsToUnit,
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

test("guide snapping follows integer marks in the active unit", () => {
  assert.equal(snapGuidePosition(41.4, "px"), 41);
  assert.equal(snapGuidePosition(77, "in"), 96);
  assert.ok(Math.abs(snapGuidePosition(40, "cm") - unitToPixels(1, "cm")) < 0.0001);
});

test("ruler ticks adapt to zoom and always expose major labels", () => {
  const ticks = buildRulerTicks(900, 120, 1.5, "px");
  assert.ok(ticks.length > 5);
  assert.ok(ticks.some((tick) => tick.major && tick.label === "0"));
  assert.ok(ticks.every((tick, index) => index === 0 || tick.position > ticks[index - 1].position));
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
