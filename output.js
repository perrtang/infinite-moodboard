export const COMPOSITION_OUTPUT_FORMATS = Object.freeze({
  png: Object.freeze({ extension: "png", label: "PNG", mime: "image/png" }),
  webp: Object.freeze({ extension: "webp", label: "WebP", mime: "image/webp" }),
  avif: Object.freeze({ extension: "avif", label: "AVIF", mime: "image/avif" }),
  pdf: Object.freeze({ extension: "pdf", label: "PDF", mime: "application/pdf" }),
});

const DEFAULT_MAX_SIDE = 8192;
const DEFAULT_MAX_AREA = 32 * 1024 * 1024;

export function compositionOutputFormat(value) {
  return COMPOSITION_OUTPUT_FORMATS[value] || COMPOSITION_OUTPUT_FORMATS.png;
}

export function planCompositionSize(logicalWidth, logicalHeight, requestedScale = 1, limits = {}) {
  const width = Math.max(1, Number(logicalWidth) || 1);
  const height = Math.max(1, Number(logicalHeight) || 1);
  const scale = Math.max(0.25, Number(requestedScale) || 1);
  const maxSide = Math.max(1, Number(limits.maxSide) || DEFAULT_MAX_SIDE);
  const maxArea = Math.max(1, Number(limits.maxArea) || DEFAULT_MAX_AREA);
  const requestedWidth = Math.max(1, Math.ceil(width * scale));
  const requestedHeight = Math.max(1, Math.ceil(height * scale));
  const limitScale = Math.min(
    1,
    maxSide / requestedWidth,
    maxSide / requestedHeight,
    Math.sqrt(maxArea / (requestedWidth * requestedHeight)),
  );
  const pixelWidth = Math.max(1, Math.floor(requestedWidth * limitScale));
  const pixelHeight = Math.max(1, Math.floor(requestedHeight * limitScale));

  return {
    pixelWidth,
    pixelHeight,
    renderScale: Math.min(pixelWidth / width, pixelHeight / height),
    reduced: limitScale < 0.9999,
  };
}

function concatByteChunks(chunks, totalLength) {
  const result = new Uint8Array(totalLength);
  let offset = 0;
  chunks.forEach((chunk) => {
    result.set(chunk, offset);
    offset += chunk.length;
  });
  return result;
}

function pdfNumber(value) {
  return Number(value.toFixed(3)).toString();
}

export function buildImagePdf(jpegData, pixelWidth, pixelHeight) {
  const jpegBytes = jpegData instanceof Uint8Array ? jpegData : new Uint8Array(jpegData);
  const width = Math.max(1, Math.round(Number(pixelWidth) || 1));
  const height = Math.max(1, Math.round(Number(pixelHeight) || 1));
  const pointScale = Math.min(0.75, 14400 / width, 14400 / height);
  const pageWidth = Math.max(1, width * pointScale);
  const pageHeight = Math.max(1, height * pointScale);
  const encoder = new TextEncoder();
  const chunks = [];
  const offsets = new Array(6).fill(0);
  let byteLength = 0;

  const pushBytes = (value) => {
    const bytes = typeof value === "string" ? encoder.encode(value) : value;
    chunks.push(bytes);
    byteLength += bytes.length;
  };
  const beginObject = (number) => {
    offsets[number] = byteLength;
    pushBytes(`${number} 0 obj\n`);
  };

  pushBytes("%PDF-1.4\n%\u00e2\u00e3\u00cf\u00d3\n");

  beginObject(1);
  pushBytes("<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  beginObject(2);
  pushBytes("<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");

  beginObject(3);
  pushBytes(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pdfNumber(pageWidth)} ${pdfNumber(pageHeight)}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`);

  beginObject(4);
  pushBytes(`<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`);
  pushBytes(jpegBytes);
  pushBytes("\nendstream\nendobj\n");

  const contentStream = `q\n${pdfNumber(pageWidth)} 0 0 ${pdfNumber(pageHeight)} 0 0 cm\n/Im0 Do\nQ\n`;
  const contentBytes = encoder.encode(contentStream);
  beginObject(5);
  pushBytes(`<< /Length ${contentBytes.length} >>\nstream\n`);
  pushBytes(contentBytes);
  pushBytes("endstream\nendobj\n");

  const xrefOffset = byteLength;
  pushBytes("xref\n0 6\n0000000000 65535 f \n");
  for (let index = 1; index <= 5; index += 1) {
    pushBytes(`${String(offsets[index]).padStart(10, "0")} 00000 n \n`);
  }
  pushBytes(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);

  return concatByteChunks(chunks, byteLength);
}
