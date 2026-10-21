import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const main = await readFile(new URL("./main.jsx", import.meta.url), "utf8");
const styles = await readFile(new URL("./styles.css", import.meta.url), "utf8");

test("paper can be added repeatedly behind any visible selection", () => {
  const addPaperWorkflow = main.match(/const addArtboardBehindSelection = useCallback\([\s\S]*?\n  \}, \[[^\]]*\]\);/)?.[0] || "";
  assert.match(main, /function SelectionActionBar\(\{ count, grouped,/);
  assert.match(main, /label="在選取物件後方加入紙張" onClick=\{onAddArtboard\}/);
  assert.doesNotMatch(main, /disabled=\{hasArtboard\}/);
  assert.match(addPaperWorkflow, /selected\.has\(object\.id\) && object\.visible\);/);
  assert.doesNotMatch(addPaperWorkflow, /selected\.has\(object\.id\) && object\.visible && !isArtboardObject\(object\)/);
});

test("paper padding remains sizing metadata without a persistent canvas guide", () => {
  assert.match(main, /符合內容的參考邊距/);
  assert.match(main, /只在建立或手動重新符合紙張時計算/);
  assert.doesNotMatch(main, /"--paper-padding"/);
  assert.doesNotMatch(styles, /\.board-object\.is-artboard \.object-frame::before/);
});
