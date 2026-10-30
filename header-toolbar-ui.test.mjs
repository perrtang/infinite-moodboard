import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const main = await readFile(new URL("./main.jsx", import.meta.url), "utf8");
const styles = await readFile(new URL("./styles.css", import.meta.url), "utf8");
const headerStart = main.indexOf('<header className="app-topbar"');
const appHeader = main.slice(headerStart, main.indexOf("</header>", headerStart));

test("the header keeps only the centered board name as visible text", () => {
  assert.match(appHeader, /className="topbar-primary"[\s\S]*className="brand-block" role="img" aria-label="Infinite Studio"/);
  assert.match(appHeader, /<small className="sr-only" aria-live="polite">/);
  assert.doesNotMatch(appHeader, /<strong>Infinite Studio<\/strong>/);
  assert.doesNotMatch(appHeader, /<span>檔案<\/span>/);
  assert.match(styles, /\.app-topbar \{[\s\S]*grid-template-columns: minmax\(0, 1fr\) minmax\(180px, min\(700px, calc\(100% - 800px\)\)\) minmax\(0, 1fr\);/);
  assert.match(styles, /\.account-menu-button \{[\s\S]*max-width: 36px;[\s\S]*width: 36px;/);
});

test("primary insert actions are icon-only with accessible tooltips", () => {
  for (const label of ["加入文字", "加入圖片", "加入影片"]) {
    assert.match(main, new RegExp(`aria-label="${label}"[\\s\\S]{0,100}title=`));
  }
  assert.match(main, /aria-label="加入形狀"\s*title="加入形狀或匯入 SVG"/);
  assert.doesNotMatch(main, /className="insert-tool-label"/);
  assert.doesNotMatch(main, /className="insert-tool-chevron"/);
  assert.match(styles, /\.insert-tool \{[\s\S]*min-width: 34px;[\s\S]*padding: 0;/);
});
