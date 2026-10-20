import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const rules = await readFile(new URL("./firestore.rules", import.meta.url), "utf8");
const collaborationSource = await readFile(new URL("./collaboration-firestore.js", import.meta.url), "utf8");

test("collaboration rules require verified identities and deny room listing", () => {
  assert.match(rules, /request\.auth\.token\.email_verified == true/);
  assert.match(rules, /match \/infiniteMoodboardRooms\/\{roomId\}/);
  assert.match(rules, /allow list: if false/);
});

test("collaboration rules gate edits by owner or editor membership", () => {
  assert.match(rules, /currentMember\(roomId\)\.data\.role in \['owner', 'editor'\]/);
  assert.match(rules, /request\.resource\.data\.senderUid == request\.auth\.uid/);
});

test("collaboration rules validate bearer invites and cap chunk size", () => {
  assert.match(rules, /validInvite\(request\.resource\.data\.inviteId, roomId, request\.resource\.data\.role\)/);
  assert.match(rules, /request\.resource\.data\.data\.size\(\) <= 500000/);
  assert.match(rules, /request\.resource\.data\.byteLength <= 50331648/);
});

test("published updates and invite room ownership fields cannot be rewritten", () => {
  assert.match(rules, /resource\.data\.ready == false/);
  assert.match(rules, /request\.resource\.data\.committedAt == request\.time/);
  assert.match(rules, /affectedKeys\(\)\.hasOnly\(\['ready', 'committedAt'\]\)/);
  assert.match(rules, /request\.resource\.data\.roomId == resource\.data\.roomId/);
  assert.match(rules, /request\.resource\.data\.createdBy == resource\.data\.createdBy/);
});

test("member records minimize identity data and keep membership identity immutable", () => {
  assert.match(rules, /keys\(\)\.hasOnly\(\['uid', 'role', 'name', 'joinedAt', 'inviteId'\]\)/);
  assert.match(rules, /request\.resource\.data\.uid == resource\.data\.uid/);
  assert.doesNotMatch(rules, /request\.resource\.data\.email/);
});

test("viewers can request edit access while only owners can decide or change roles", () => {
  assert.match(rules, /match \/accessRequests\/\{requesterUid\}/);
  assert.match(rules, /currentMember\(roomId\)\.data\.role == 'viewer'/);
  assert.match(rules, /request\.resource\.data\.requestedRole == 'editor'/);
  assert.match(rules, /request\.resource\.data\.status == 'pending'/);
  assert.match(rules, /isOwner\(roomId\)[\s\S]*request\.resource\.data\.status in \['approved', 'denied'\]/);
  assert.match(rules, /resource\.data\.role in \['editor', 'viewer'\]/);
  assert.match(rules, /request\.resource\.data\.role in \['editor', 'viewer'\]/);
  assert.match(collaborationSource, /role: COLLABORATION_DEFAULT_INVITE_ROLE/);
});
