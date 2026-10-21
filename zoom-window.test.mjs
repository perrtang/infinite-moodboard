import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const mainSource = fs.readFileSync(new URL("./main.jsx", import.meta.url), "utf8");
const styles = fs.readFileSync(new URL("./styles.css", import.meta.url), "utf8");

test("Zoom Area is a one-shot tool beside Hand with an Option or Alt inverse", () => {
  assert.match(mainSource, /平移工具[\s\S]*className="desktop-zoom-window-tool"[\s\S]*進階 3D/);
  assert.match(mainSource, /altDown \? <ZoomOut size=\{18\} \/> : <ZoomIn size=\{18\} \/>/);
  assert.match(mainSource, /zoomWindowZoomOut=\{altDown\}/);
  assert.match(mainSource, /<span>縮放視窗<\/span>[\s\S]*拖曳縮小區域[\s\S]*拖曳放大區域/);
  assert.match(mainSource, /onPointerDownCapture=\{sourceModeActive \? undefined : onZoomWindowPointerDown\}/);
  assert.match(mainSource, /viewWorldRectInViewport\([\s\S]*padding: 36,[\s\S]*maxZoom: MAX_ZOOM/);
  assert.match(mainSource, /const zoomOut = pointerEvent\.altKey \|\| altDownRef\.current/);
  assert.match(mainSource, /announce\(zoomOut \? "已縮小框選區域。" : "已放大框選區域。"/);
  assert.match(mainSource, /setTool\(\(current\) => current === "zoom-window" \? zoomWindowReturnToolRef\.current/);
  assert.match(mainSource, /else if \(tool === "zoom-window"\) finishZoomWindowTool\(\)/);
  assert.match(mainSource, /<IconButton label="縮小"[\s\S]*<Minus size=\{17\} \/>[\s\S]*<IconButton label="放大"[\s\S]*<Plus size=\{17\} \/>/);
  assert.match(styles, /@media \(max-width: 420px\)[\s\S]*\.canvas-toolbar \.desktop-zoom-window-tool \{[\s\S]*display: none;/);
});

test("Zoom Window owns object drags while Space keeps temporary Hand priority", () => {
  assert.match(mainSource, /if \(tool !== "zoom-window" \|\| spaceDown \|\| event\.button !== 0\) return/);
  assert.match(mainSource, /selectionEnabled=\{\(tool !== "hand" \|\| modifierDown\) && tool !== "zoom-window"\}/);
  assert.match(mainSource, /zoom-window-marquee/);
  assert.match(mainSource, /zoomWindowRect\.width >= 96 && zoomWindowRect\.height >= 48/);
  assert.match(styles, /\.canvas-viewport\.uses-zoom-window:not\(\.uses-hand\)[\s\S]*cursor: crosshair/);
  assert.match(styles, /\.zoom-window-marquee[\s\S]*pointer-events: none/);
});
