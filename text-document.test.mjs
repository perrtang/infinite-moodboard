import test from "node:test";
import assert from "node:assert/strict";
import { readTextDocument } from "./text-document.js";
import JSZip from "jszip";

test("text documents preserve their contents and normalize line endings", async () => {
  for (const ext of ["txt", "md", "csv"]) {
    assert.equal(await readTextDocument(new File(["\ufeff第一行\r\n第二行"], `sample.${ext}`)), "第一行\n第二行");
  }
  await assert.rejects(readTextDocument(new File(["legacy"], "old.doc")), /docx/);
  await assert.rejects(readTextDocument(new File([" "], "empty.txt")), /沒有可匯入/);
});

test("imports editable text from a Word docx document", async () => {
  const zip = new JSZip();
  zip.file("[Content_Types].xml", '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
  zip.file("_rels/.rels", '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
  zip.file("word/document.xml", '<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>文字文件驗證</w:t></w:r></w:p></w:body></w:document>');
  const bytes = await zip.generateAsync({ type: "uint8array" });
  assert.match(await readTextDocument(new File([bytes], "test.docx")), /文字文件驗證/);
});
