import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { isEditableShortcutEvent, isEditableShortcutTarget } from "./workspace-keyboard.js";

test("temporary workspace shortcuts leave native and custom text editors alone", () => {
  assert.equal(isEditableShortcutTarget({ tagName: "INPUT" }), true);
  assert.equal(isEditableShortcutTarget({ tagName: "textarea" }), true);
  assert.equal(isEditableShortcutTarget({ tagName: "SELECT" }), true);
  assert.equal(isEditableShortcutTarget({ tagName: "DIV", isContentEditable: true }), true);
  assert.equal(isEditableShortcutTarget({ tagName: "SPAN", closest: () => ({ role: "textbox" }) }), true);
  assert.equal(isEditableShortcutTarget({ tagName: "DIV", closest: () => null }), false);
  assert.equal(isEditableShortcutEvent({ target: { tagName: "DIV", closest: () => null } }, { tagName: "INPUT" }), true);
});

test("Space visibly and temporarily activates Hand without replacing the selected tool", () => {
  const source = fs.readFileSync(new URL("./main.jsx", import.meta.url), "utf8");
  assert.match(source, /if \(event\.code === "Space"\) \{\s*event\.preventDefault\(\);\s*if \(!event\.repeat\) setSpaceDown\(true\);\s*return;/);
  assert.match(source, /if \(event\.code === "Space"\) setSpaceDown\(false\)/);
  assert.match(source, /const blur = \(\) => \{\s*setSpaceDown\(false\)/);
  assert.match(source, /active=\{tool === "hand" \|\| spaceDown\}/);
  assert.match(source, /className=\{`canvas-viewport[\s\S]*tool === "hand" \|\| spaceDown \? "uses-hand"/);
  assert.match(source, /\(tool === "hand" \|\| spaceDown\)[\s\S]*startCanvasPan\(event\)/);
});
