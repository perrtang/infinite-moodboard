import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const mainSource = fs.readFileSync(new URL("./main.jsx", import.meta.url), "utf8");
const styles = fs.readFileSync(new URL("./styles.css", import.meta.url), "utf8");

test("Zoom Window is a one-shot canvas viewport tool near the zoom controls", () => {
  assert.match(mainSource, /label="縮放視窗：拖曳框住要放大的區域；Esc 取消" active=\{tool === "zoom-window"\}/);
  assert.match(mainSource, /<span>縮放視窗<\/span>[\s\S]*拖曳放大區域/);
  assert.match(mainSource, /onPointerDownCapture=\{sourceModeActive \? undefined : onZoomWindowPointerDown\}/);
  assert.match(mainSource, /viewWorldRectInViewport\([\s\S]*padding: 36,[\s\S]*maxZoom: MAX_ZOOM/);
  assert.match(mainSource, /setTool\(\(current\) => current === "zoom-window" \? zoomWindowReturnToolRef\.current/);
  assert.match(mainSource, /else if \(tool === "zoom-window"\) finishZoomWindowTool\(\)/);
});

test("Zoom Window owns object drags while Space keeps temporary Hand priority", () => {
  assert.match(mainSource, /if \(tool !== "zoom-window" \|\| spaceDown \|\| event\.button !== 0\) return/);
  assert.match(mainSource, /selectionEnabled=\{\(tool !== "hand" \|\| modifierDown\) && tool !== "zoom-window"\}/);
  assert.match(mainSource, /zoom-window-marquee/);
  assert.match(mainSource, /zoomWindowRect\.width >= 96 && zoomWindowRect\.height >= 48/);
  assert.match(styles, /\.canvas-viewport\.uses-zoom-window:not\(\.uses-hand\)[\s\S]*cursor: crosshair/);
  assert.match(styles, /\.zoom-window-marquee[\s\S]*pointer-events: none/);
});
