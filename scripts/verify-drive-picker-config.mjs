const apiKey = String(process.env.VITE_GOOGLE_DRIVE_PICKER_API_KEY || "").trim();
const projectNumber = String(process.env.VITE_GOOGLE_DRIVE_PROJECT_NUMBER || "").trim();

if (!/^AIza[0-9A-Za-z_-]{35}$/.test(apiKey)) {
  throw new Error("Google Drive Picker API key is missing or malformed.");
}
if (!/^\d{6,20}$/.test(projectNumber)) {
  throw new Error("Google Drive project number is missing or malformed.");
}

console.log("Google Drive Picker production configuration format verified.");
