import assert from "node:assert/strict";
import test from "node:test";
import {
  MOODBOARD_ACCESS_CONSENT_VERSION,
  MOODBOARD_MARKETING_CONSENT_VERSION,
  accountInitials,
  accountProviderLabel,
  getMoodboardAccessReceipt,
  hasMoodboardAccessConsent,
  isMoodboardIdentityEligible,
  moodboardMembershipActivationPayload,
  moodboardAuthErrorMessage,
  saveMoodboardAccessConsent,
  saveMoodboardMarketingPreference,
} from "./auth-policy.js";

function createStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, String(value)); },
  };
}

test("account consent is versioned per PETFASHION user", () => {
  const storage = createStorage();
  const user = { uid: "member-1", displayName: "Perr Tang", email: "perr@example.com", providerIds: ["google.com"] };
  assert.equal(hasMoodboardAccessConsent(storage, user.uid), false);
  const receipt = saveMoodboardAccessConsent(storage, user, {
    acceptedAt: "2026-10-18T12:00:00.000Z",
    feature: "3d",
    isNewUser: true,
    marketingOptIn: false,
    rememberSession: false,
  });
  assert.equal(receipt.version, MOODBOARD_ACCESS_CONSENT_VERSION);
  assert.equal(receipt.moodboardUpload, false);
  assert.equal(receipt.authPersistence, "session");
  assert.equal(receipt.productActivation.firstJoinSource, "infinite-moodboard");
  assert.equal(receipt.productActivation.reason, "advanced-feature:3d");
  assert.equal(receipt.marketing.enabled, false);
  assert.equal(receipt.marketing.version, MOODBOARD_MARKETING_CONSENT_VERSION);
  assert.equal(hasMoodboardAccessConsent(storage, user.uid), true);
  assert.equal(hasMoodboardAccessConsent(storage, "member-2"), false);
});

test("existing PETFASHION member keeps the original join source", () => {
  const storage = createStorage();
  const user = { uid: "member-existing", providerIds: ["google.com"] };
  const receipt = saveMoodboardAccessConsent(storage, user, {
    acceptedAt: "2026-10-18T13:00:00.000Z",
    feature: "collaboration",
    isNewUser: false,
    marketingOptIn: true,
    rememberSession: true,
  });
  assert.equal(receipt.productActivation.firstJoinSource, null);
  assert.equal(receipt.productActivation.preserveOriginalJoinSource, true);
  assert.equal(receipt.authPersistence, "local");
  const payload = moodboardMembershipActivationPayload(user, receipt);
  assert.equal(payload.activationSource, "infinite-moodboard");
  assert.equal(payload.accountRelationship, "existing-member");
  assert.equal(payload.marketing.enabled, true);
});

test("reaccepting access never rewrites the original membership relationship", () => {
  const storage = createStorage();
  const user = { uid: "member-new", email: "new@example.com", emailVerified: true, providerIds: ["google.com"] };
  saveMoodboardAccessConsent(storage, user, {
    acceptedAt: "2026-10-18T11:00:00.000Z",
    isNewUser: true,
  });
  const repeated = saveMoodboardAccessConsent(storage, user, {
    acceptedAt: "2026-10-18T15:00:00.000Z",
    isNewUser: false,
  });
  assert.equal(repeated.productActivation.accountRelationship, "created-through-product");
  assert.equal(repeated.productActivation.firstJoinSource, "infinite-moodboard");
  assert.equal(repeated.productActivation.preserveOriginalJoinSource, false);
  assert.equal(repeated.productActivation.firstActivatedAt, "2026-10-18T11:00:00.000Z");
});

test("marketing preference is optional, versioned, and independently reversible", () => {
  const storage = createStorage();
  const user = { uid: "member-1", providerIds: ["google.com"] };
  const original = saveMoodboardAccessConsent(storage, user, {
    acceptedAt: "2026-10-18T12:00:00.000Z",
    marketingOptIn: true,
  });
  const updated = saveMoodboardMarketingPreference(storage, user, false, "2026-10-18T14:00:00.000Z");
  assert.equal(updated.marketing.enabled, false);
  assert.equal(updated.marketing.decidedAt, "2026-10-18T14:00:00.000Z");
  assert.equal(updated.acceptedAt, original.acceptedAt);
  assert.equal(updated.productActivation.firstActivatedAt, original.productActivation.firstActivatedAt);
  assert.equal(getMoodboardAccessReceipt(storage, user.uid).marketing.enabled, false);
});

test("invalid or legacy stored consent fails closed", () => {
  const storage = createStorage({ "infinite-moodboard-account-consent-v1": "not-json" });
  assert.equal(hasMoodboardAccessConsent(storage, "member-1"), false);
});

test("auth errors remain actionable and offline-aware", () => {
  assert.match(moodboardAuthErrorMessage({ code: "auth/popup-blocked" }), /彈出式視窗/);
  assert.match(moodboardAuthErrorMessage({ code: "auth/network-request-failed" }), /網路/);
  assert.match(moodboardAuthErrorMessage({}, false), /首次登入/);
  assert.match(moodboardAuthErrorMessage({ code: "auth/credential-already-in-use" }), /無法自動合併/);
  assert.match(moodboardAuthErrorMessage({ code: "auth/invalid-action-code" }), /重新寄送/);
});

test("account initials support Latin and CJK names", () => {
  assert.equal(accountInitials({ displayName: "Perr Tang" }), "PT");
  assert.equal(accountInitials({ displayName: "唐佩怡" }), "唐佩");
});

test("account provider labels reflect linked sign-in methods", () => {
  assert.equal(accountProviderLabel({ providerIds: ["google.com"] }), "Google 登入");
  assert.equal(accountProviderLabel({ providerIds: ["password"] }), "Email 驗證登入");
  assert.equal(accountProviderLabel({ providerIds: ["google.com", "password"] }), "Google＋Email 驗證");
});

test("protected features fail closed for unverified or unknown identities", () => {
  assert.equal(isMoodboardIdentityEligible({ uid: "member-1", email: "p@example.com", emailVerified: true, providerIds: ["google.com"] }), true);
  assert.equal(isMoodboardIdentityEligible({ uid: "member-1", email: "p@example.com", emailVerified: false, providerIds: ["google.com"] }), false);
  assert.equal(isMoodboardIdentityEligible({ uid: "member-1", email: "p@example.com", emailVerified: true, providerIds: ["unknown.example"] }), false);
  assert.match(moodboardAuthErrorMessage({ code: "auth/unverified-email" }), /尚未完成驗證/);
});
