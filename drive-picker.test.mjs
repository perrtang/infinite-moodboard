import assert from "node:assert/strict";
import test from "node:test";
import {
  getGoogleDrivePickerConfiguration,
  normalizeGoogleDrivePickerDocument,
  openGoogleDriveMoodboardPicker,
  resolveGoogleDrivePickerSelection,
} from "./drive-picker.js";

test("Picker configuration reports every missing browser setting", () => {
  const configuration = getGoogleDrivePickerConfiguration({
    clientId: "",
    apiKey: "",
    projectNumber: "",
    origin: "",
  });
  assert.equal(configuration.configured, false);
  assert.deepEqual(configuration.missing, ["clientId", "apiKey", "projectNumber", "origin"]);
});

test("Picker documents normalize Drive identifiers and security resource keys", () => {
  assert.deepEqual(normalizeGoogleDrivePickerDocument({
    id: "drive-file-123",
    name: "研究.moodboard",
    mimeType: "application/json",
    resourceKey: "resource-123",
  }), {
    id: "drive-file-123",
    name: "研究.moodboard",
    mimeType: "application/json",
    resourceKey: "resource-123",
  });
});

test("Picker only accepts the file named by the share URL and prefers its current resource key", () => {
  assert.deepEqual(resolveGoogleDrivePickerSelection([
    { id: "drive-file-123", name: "研究.moodboard", resourceKey: "picker-resource" },
  ], {
    expectedFileId: "drive-file-123",
    expectedResourceKey: "link-resource",
  }), {
    id: "drive-file-123",
    name: "研究.moodboard",
    mimeType: "application/json",
    resourceKey: "picker-resource",
  });
  assert.equal(resolveGoogleDrivePickerSelection([
    { id: "drive-file-123", name: "研究.moodboard" },
  ], {
    expectedFileId: "drive-file-123",
    expectedResourceKey: "link-resource",
  }).resourceKey, "link-resource");
  assert.throws(
    () => resolveGoogleDrivePickerSelection([{ id: "other-file-456" }], { expectedFileId: "drive-file-123" }),
    (error) => error.code === "drive/picker-mismatch" && /沒有開啟任何內容/.test(error.message),
  );
});

test("Picker never treats an empty selection as a blank Moodboard", () => {
  assert.throws(
    () => resolveGoogleDrivePickerSelection([], { expectedFileId: "drive-file-123" }),
    (error) => error.code === "drive/picker-empty" && /沒有回傳可開啟的檔案/.test(error.message),
  );
});

function installPickerMock(t, responseFactory) {
  const previousGoogle = globalThis.google;
  const previousGapi = globalThis.gapi;
  const builderState = {};
  t.after(() => {
    if (previousGoogle === undefined) delete globalThis.google;
    else globalThis.google = previousGoogle;
    if (previousGapi === undefined) delete globalThis.gapi;
    else globalThis.gapi = previousGapi;
  });

  class DocsView {
    setMimeTypes(value) { builderState.mimeType = value; return this; }
    setIncludeFolders(value) { builderState.includeFolders = value; return this; }
    setMode(value) { builderState.mode = value; return this; }
    setFileIds(value) { builderState.fileIds = value; return this; }
    setQuery(value) { builderState.query = value; return this; }
  }
  class PickerBuilder {
    addView(value) { builderState.view = value; return this; }
    setOAuthToken(value) { builderState.accessToken = value; return this; }
    setDeveloperKey(value) { builderState.apiKey = value; return this; }
    setAppId(value) { builderState.projectNumber = value; return this; }
    setOrigin(value) { builderState.origin = value; return this; }
    setTitle(value) { builderState.title = value; return this; }
    setCallback(value) { builderState.callback = value; return this; }
    build() {
      return {
        setVisible(value) {
          builderState.visible = value;
          queueMicrotask(() => builderState.callback(responseFactory()));
        },
      };
    }
  }
  globalThis.gapi = { load: (_name, options) => options.callback() };
  globalThis.google = {
    picker: {
      Action: { PICKED: "picked", CANCEL: "cancel", ERROR: "error" },
      DocsView,
      DocsViewMode: { LIST: "list" },
      PickerBuilder,
      Response: { ACTION: "action", DOCUMENTS: "docs" },
      ViewId: { DOCS: "docs" },
    },
  };
  return builderState;
}

test("Picker cancellation never returns a file", async (t) => {
  installPickerMock(t, () => ({ action: "cancel" }));
  const result = await openGoogleDriveMoodboardPicker({
    accessToken: "token",
    expectedFileId: "drive-file-123",
    clientId: "client",
    apiKey: "key",
    projectNumber: "123",
    origin: "https://moodboard.petfashion.tw",
    timeoutMs: 1_000,
  });
  assert.deepEqual(result, { status: "cancelled" });
});

test("Picker returns only the exact shared file and configures least-privilege selection", async (t) => {
  const builderState = installPickerMock(t, () => ({
    action: "picked",
    docs: [{ id: "drive-file-123", name: "研究.moodboard", resourceKey: "picker-resource" }],
  }));
  const result = await openGoogleDriveMoodboardPicker({
    accessToken: "token",
    expectedFileId: "drive-file-123",
    expectedResourceKey: "link-resource",
    clientId: "client",
    apiKey: "key",
    projectNumber: "123",
    origin: "https://moodboard.petfashion.tw",
    timeoutMs: 1_000,
  });
  assert.equal(result.status, "picked");
  assert.equal(result.file.id, "drive-file-123");
  assert.equal(result.file.resourceKey, "picker-resource");
  assert.equal(builderState.mimeType, "application/json");
  assert.equal(builderState.includeFolders, false);
  assert.equal(builderState.mode, "list");
  assert.equal(builderState.fileIds, "drive-file-123");
  assert.equal(builderState.query, undefined);
  assert.equal(builderState.accessToken, "token");
  assert.equal(builderState.visible, true);
});
