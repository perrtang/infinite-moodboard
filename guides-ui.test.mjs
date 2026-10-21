import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [main, styles] = await Promise.all([
  readFile(new URL("./main.jsx", import.meta.url), "utf8"),
  readFile(new URL("./styles.css", import.meta.url), "utf8"),
]);

test("guide drag feedback uses an unclipped overlay with an explicit snapped state", () => {
  assert.match(main, /className="workspace-guide-readout"/);
  assert.match(main, /draggingGuide\.snapped \? <strong>已吸附<\/strong>/);
  assert.match(main, /window\.addEventListener\("keydown", keyDown, true\)/);
  assert.match(main, /window\.addEventListener\("keyup", keyUp, true\)/);
  assert.match(styles, /\.workspace-guide-readout \{[\s\S]*pointer-events: none;[\s\S]*z-index: 4;/);
  assert.doesNotMatch(styles, /\.workspace-guide > span/);
});

test("global guide locking blocks creation, movement, and deletion while staying file-backed", () => {
  assert.match(main, /boardRef\.current\.guidesLocked/);
  assert.match(main, /guidesLocked=\{Boolean\(board\.guidesLocked\)\}/);
  assert.match(main, /className=\{`workspace-ruler is-horizontal \$\{guidesLocked \|\| readOnly \? "is-guide-locked"/);
  assert.match(main, /guidesLocked \|\| guide\.locked \|\| readOnly/);
  assert.match(main, /applyBoard\(\(current\) => \(\{ \.\.\.current, guidesLocked: nextLocked \}\)\)/);
});

test("each guide exposes a keyboard-accessible right-click menu for lock and delete", () => {
  assert.match(main, /onContextMenu=\{\(event\) => openGuideMenu\(event, guide, screenPosition\)\}/);
  assert.match(main, /event\.key !== "ContextMenu" && !\(event\.shiftKey && event\.key === "F10"\)/);
  assert.match(main, /pointerPositionAvailable \? event\.clientX : fallbackX/);
  assert.match(main, /className="guide-context-menu"/);
  assert.match(main, /guideMenu\.guide\.locked \? "解除鎖定此導引線" : "鎖定此導引線"/);
  assert.match(main, /onDeleteGuide\(guide\.id, true\)/);
  assert.match(main, /aria-disabled=\{guidesLocked \|\| readOnly\}/);
  assert.match(main, /disabled=\{guidesLocked \|\| readOnly\}/);
  assert.match(main, /readOnly=\{cloudReadOnly\}/);
  assert.match(main, /if \(cloudReadOnly\) \{\s*announce\("目前為僅檢視；無法刪除輔助導引線。"/);
  assert.match(main, /guideMenuRef\.current\?\.querySelector\('\[role="menuitem"\]:not\(:disabled\)'\)\?\.focus\(\)/);
  assert.match(styles, /\.guide-context-menu \{[\s\S]*min-width: 216px;/);
  assert.match(styles, /\.guide-context-menu button:focus-visible/);
});

test("the unexplained world-origin corner is removed", () => {
  assert.doesNotMatch(main, /className="world-origin"/);
  assert.doesNotMatch(styles, /\.world-origin/);
});

test("the ruler intersection can reposition a shared origin without moving guides", () => {
  assert.match(main, /onPointerDown=\{startOriginDrag\}/);
  assert.match(main, /onSetRulerOrigin\(\{ x: latest\.worldX, y: latest\.worldY \}\)/);
  assert.match(main, /rulerOrigin=\{board\.rulerOrigin\}/);
  assert.match(main, /guide\.position - \(guide\.axis === "x" \? origin\.x : origin\.y\)/);
  assert.match(styles, /\.ruler-origin-preview \{/);
});
