import test from "node:test";
import assert from "node:assert/strict";
import { readPublicSharedBoard } from "./drive-public.js";

const fileId = "public_file_123456";
const meta = { id: fileId, name: "Demo.moodboard", mimeType: "application/json", version: "7" };
const response = (body, status = 200) => new Response(typeof body === "string" ? body : JSON.stringify(body), { status });

test("a public link reads only its exact file without an OAuth token and preserves resource key", async () => {
  const requests = [];
  const fetchImpl = async (url, options) => {
    requests.push({ url, options });
    return response(url.includes("alt=media") ? '{"objects":[{"id":"one"}]}' : meta);
  };
  const result = await readPublicSharedBoard({ fileId, resourceKey: "resource_key_123", apiKey: "public-api-key", fetchImpl });
  assert.equal(JSON.parse(result.content).objects.length, 1);
  assert.equal(requests.length, 3);
  assert.ok(requests.every(({ url, options }) => url.includes(fileId) && !new Headers(options.headers).has("Authorization") && new Headers(options.headers).get("X-Goog-Drive-Resource-Keys") === `${fileId}/resource_key_123`));
});

test("a denied public link never reads or returns board content", async () => {
  let calls = 0;
  await assert.rejects(readPublicSharedBoard({ fileId, apiKey: "key", fetchImpl: async () => { calls++; return response("denied", 403); } }), /無法免登入開啟/);
  assert.equal(calls, 1);
});

test("a changing or wrong file cannot be shown as the requested board", async () => {
  let count = 0;
  const fetchImpl = async (url) => url.includes("alt=media") ? response('{"objects":[]}') : response({ ...meta, version: String(++count) });
  await assert.rejects(readPublicSharedBoard({ fileId, apiKey: "key", fetchImpl }), /讀取期間已變更/);
  await assert.rejects(readPublicSharedBoard({ fileId, apiKey: "key", fetchImpl: async () => response({ ...meta, id: "other_file_123456" }) }), /身分或格式/);
});

test("a stalled public read times out without producing board content", async () => {
  await assert.rejects(readPublicSharedBoard({ fileId, apiKey: "key", metadataTimeoutMs: 10, fetchImpl: () => new Promise(() => {}) }), /逾時/);
});
