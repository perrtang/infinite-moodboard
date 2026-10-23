import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repoDir = fileURLToPath(new URL("../", import.meta.url));
const read = (relativePath) => readFile(path.join(repoDir, relativePath), "utf8");
const packageJson = JSON.parse(await read("package.json"));
const version = String(process.argv[2] || packageJson.version || "").trim();

if (!/^\d+\.\d+\.\d+$/.test(version)) {
  throw new Error("Usage: node scripts/verify-release-notes.mjs X.Y.Z");
}

const [lockJson, versionSource, manifest] = await Promise.all([
  read("package-lock.json").then(JSON.parse),
  read("version.js"),
  read("public/infinite-moodboard-update.json").then(JSON.parse),
]);
const expectedNotesUrl = `release-notes/v${version}.html`;

if (packageJson.version !== version) throw new Error(`package.json is ${packageJson.version}, not ${version}.`);
if (lockJson.version !== version || lockJson.packages?.[""]?.version !== version) throw new Error("package-lock.json version does not match.");
if (!versionSource.includes(`APP_VERSION = "${version}"`)) throw new Error("version.js does not match.");
if (manifest.version !== version) throw new Error("Update manifest version does not match.");
if (!String(manifest.summary || "").trim()) throw new Error("Update manifest summary is missing.");
if (!/^\d{4}-\d{2}-\d{2}$/.test(String(manifest.releasedAt || ""))) throw new Error("Update manifest release date is missing or invalid.");
if (manifest.notesUrl !== expectedNotesUrl) throw new Error(`Update manifest notesUrl must be ${expectedNotesUrl}.`);

const notes = await read(path.join("public", expectedNotesUrl));
if (!notes.includes(`<title>Infinite Moodboard v${version}`)) throw new Error("Release notes title does not match the version.");
if (!notes.includes(`發布日期：${manifest.releasedAt}`)) throw new Error("Release notes date does not match the update manifest.");
if (!notes.includes("更新內容") || !notes.includes("修正") || !notes.includes("注意事項") || !notes.includes("回復與備份")) {
  throw new Error("Release notes must include changes, fixes, attention items, and recovery information.");
}

console.log(`Release notes verified: ${expectedNotesUrl}`);
