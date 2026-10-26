import { readFile } from "node:fs/promises";

const apiKey = String(process.env.VITE_GOOGLE_DRIVE_PICKER_API_KEY || "").trim();
const projectNumber = String(process.env.VITE_GOOGLE_DRIVE_PROJECT_NUMBER || "").trim();

if (!/^AIza[0-9A-Za-z_-]{35}$/.test(apiKey)) {
  throw new Error("Google Drive Picker API key is missing or malformed.");
}
if (!/^\d{6,20}$/.test(projectNumber)) {
  throw new Error("Google Drive project number is missing or malformed.");
}

const documentSource = await readFile(new URL("../index.html", import.meta.url), "utf8");
if (!/<meta\s+name="referrer"\s+content="strict-origin-when-cross-origin"\s*\/>/.test(documentSource)) {
  throw new Error("Google Drive Picker requires an origin referrer for website-restricted keys. Use strict-origin-when-cross-origin so sharing paths and query parameters remain private.");
}

console.log("Google Drive Picker key format, project number, and origin-only referrer policy verified. Live Google acceptance still requires a real recipient account.");
