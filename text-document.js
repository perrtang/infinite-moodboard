const MAX_DOCUMENT_BYTES = 8 * 1024 * 1024;

export async function readTextDocument(file) {
  if (!file || file.size > MAX_DOCUMENT_BYTES) throw new Error("文件大小不可超過 8 MB。" );
  const extension = String(file.name || "").split(".").pop().toLowerCase();
  if (extension === "doc") throw new Error("舊版 .doc 請先轉存為 .docx 再匯入。" );
  let text;
  if (extension === "docx") {
    const mammoth = await import("mammoth/mammoth.browser.js");
    const result = await (mammoth.extractRawText || mammoth.default.extractRawText)({ arrayBuffer: await file.arrayBuffer() });
    text = result.value;
  } else if (["txt", "md", "markdown", "csv"].includes(extension)) {
    text = await file.text();
  } else throw new Error("支援 TXT、Markdown、CSV 和 Word .docx 文件。" );
  if (!text.trim()) throw new Error("文件沒有可匯入的文字。" );
  return text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
}
