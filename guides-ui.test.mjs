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
  assert.match(main, /aria-disabled=\{guidesLocked \|\| guide\.locked \|\| readOnly\}/);
  assert.match(main, /disabled=\{guidesLocked \|\| readOnly\}/);
  assert.match(main, /readOnly=\{cloudReadOnly\}/);
  assert.match(main, /if \(cloudReadOnly\) \{\s*announce\("目前為僅檢視；無法刪除輔助導引線。"/);
  assert.match(main, /guideMenuRef\.current\?\.querySelector\('\[role="menuitem"\]:not\(:disabled\)'\)\?\.focus\(\)/);
  assert.match(styles, /\.guide-context-menu \{[\s\S]*min-width: 216px;/);
  assert.match(styles, /\.guide-context-menu button:focus-visible/);
});

test("guides are never deleted by double-click", () => {
  assert.doesNotMatch(main, /onDoubleClick=\{\(event\) => \{ event\.stopPropagation\(\); onDeleteGuide\(guide\.id\); \}\}/);
  assert.doesNotMatch(main, /連按兩下刪除/);
  assert.match(main, /拖曳移動，按右鍵更多/);
  assert.match(main, /onDeleteGuide\(guide\.id, true\)/);
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

test("the ruler intersection is optically centered and the canvas pattern follows ruler metrics", () => {
  assert.match(main, /buildCanvasGridMetrics\(\{/);
  assert.match(main, /"--canvas-grid-major-step"/);
  assert.match(main, /"--canvas-grid-minor-step"/);
  assert.match(main, /"--canvas-grid-origin-x"/);
  assert.match(main, /style=\{canvasGridStyle\}/);
  assert.match(styles, /\.ruler-corner \{[\s\S]*box-sizing: border-box;[\s\S]*justify-content: center;/);
  assert.match(styles, /\.ruler-corner svg \{[\s\S]*display: block;/);
  assert.match(styles, /var\(--canvas-grid-major-step\)/);
  assert.match(styles, /var\(--canvas-grid-minor-step\)/);
  assert.match(styles, /var\(--canvas-grid-origin-x\) var\(--canvas-grid-origin-y\)/);
  assert.doesNotMatch(styles, /\.canvas-viewport\.canvas-background-dots\s*\{[^}]*16px 16px;/);
  assert.doesNotMatch(styles, /\.canvas-viewport\.canvas-background-lines\s*\{[^}]*24px 24px;/);
});

test("guides use a dedicated selectable layer above ordinary object layers", () => {
  const guideSection = main.indexOf('className="guide-layer-section"');
  const objectSection = main.indexOf('className="object-layer-section"');
  assert.ok(guideSection >= 0 && objectSection > guideSection);
  assert.match(main, /const \[guideLayerExpanded, setGuideLayerExpanded\] = useState\(false\)/);
  assert.match(main, /const \[objectLayerExpanded, setObjectLayerExpanded\] = useState\(true\)/);
  assert.match(main, /aria-expanded=\{guideLayerExpanded\}/);
  assert.match(main, /aria-expanded=\{objectLayerExpanded\}/);
  assert.match(main, /selectedGuideIds=\{selectedGuideIds\}/);
  assert.match(main, /aria-pressed=\{selectedGuideIds\.includes\(guide\.id\)\}/);
  assert.match(main, /selectedGuideIds\.length \? \(/);
  assert.match(main, /onDeleteGuides\(selectedGuideIds\)/);
  assert.match(main, /onToggleSelectedGuideGroup/);
  assert.match(main, /<strong>\{`\$\{orientation\}導引線`\}<\/strong>/);
  assert.match(main, /guide\.locked\)\.map\(\(guide\) => guide\.id\)/);
  assert.match(styles, /\.guide-layer-section,\s*\.object-layer-section \{/);
  assert.match(styles, /\.layer-section-disclosure:focus-visible/);
  assert.match(styles, /\.workspace-guide\.is-selected::after/);
  assert.match(styles, /\.workspace-measurement-layer \{[\s\S]*z-index: 17;/);
});

test("dragging a selected guide previews and moves every selected guide on the same axis", () => {
  assert.match(main, /resolveDraggedGuidePosition\(\{/);
  assert.match(main, /startClientPosition: guideAxis === "x" \? startPointer\.x : startPointer\.y/);
  assert.match(main, /if \(moved \|\| !existing\) update\(\)/);
  assert.match(main, /if \(!existing\) update\(\)/);
  assert.match(main, /activeSelection\.includes\(guide\.id\) && guide\.axis === guideAxis && !guide\.locked/);
  assert.match(main, /const delta = existing \? position - primaryStartPosition : 0/);
  assert.match(main, /members: baselines/);
  assert.match(main, /const preview = latest\.members\.find\(\(member\) => member\.id === guide\.id\)/);
  assert.match(main, /draggingById\.has\(guide\.id\) \? "is-dragging"/);
});

test("guide and object selection remain separate and Escape clears guides first", () => {
  assert.match(main, /const \[selectedGuideIds, setSelectedGuideIds\] = useState\(\[\]\)/);
  assert.match(main, /: \[id\];\s*selectedIdsRef\.current = \[\];\s*setSelectedIds\(\[\]\);\s*setKeyObjectId\(null\);\s*setTool\("select"\);\s*if \(existing\) \{/);
  assert.match(main, /else if \(selectedGuideIdsRef\.current\.length\) \{\s*selectedGuideIdsRef\.current = \[\];\s*setSelectedGuideIds\(\[\]\);/);
  assert.match(main, /if \(selectedGuideIdsRef\.current\.length\) \{\s*deleteGuides\(selectedGuideIdsRef\.current\);/);
});
