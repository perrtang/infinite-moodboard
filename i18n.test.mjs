import assert from "node:assert/strict";
import test from "node:test";
import { translateInterfaceText } from "./i18n.js";

test("account access copy is available in all built-in locales", () => {
  assert.equal(translateInterfaceText("帳號與隱私", "en"), "Account & privacy");
  assert.equal(translateInterfaceText("使用 Google 帳號登入", "en"), "Sign in with Google");
  assert.equal(translateInterfaceText("Email 驗證登入", "en"), "Verified email sign-in");
  assert.equal(translateInterfaceText("Facebook（僅限本機測試）", "en"), "Facebook (local test only)");
  assert.equal(translateInterfaceText("寄送連結", "en"), "Send link");
  assert.match(translateInterfaceText("登入方式沒有連結到原本帳號，已停止處理；原 Moodboard 不受影響。", "en"), /original account/);
  assert.equal(translateInterfaceText("會員身份由 PETFASHION 統一管理", "en"), "Membership is managed through PETFASHION");
  assert.match(translateInterfaceText("共用電腦使用完畢後，請登出並從設定清除本機 Moodboard；關閉登入工作階段不會自動刪除工作檔。", "en"), /shared computer/);
  assert.match(translateInterfaceText("這是可選項，不影響登入、同步或 3D 功能。", "en"), /optional/);
  assert.equal(translateInterfaceText("登入與資料說明", "en"), "Sign-in and data details");
  assert.match(translateInterfaceText("作品、素材與版本預設保存在這台裝置，不會自動上傳。", "en"), /never uploaded automatically/);
  assert.match(translateInterfaceText("公開 Beta 只保存在此裝置，不會加入寄送名單；正式啟用前會再次確認。", "en"), /does not add you to a mailing list/);
  assert.equal(translateInterfaceText("選填，只保存在此裝置", "zh-Hans"), "选填，只保存在此设备");
  assert.equal(translateInterfaceText("選填，可隨時取消", "zh-Hans"), "选填，可随时取消");
  assert.equal(translateInterfaceText("。", "en"), ".");
  assert.equal(translateInterfaceText("帳號與隱私", "zh-Hans"), "账号与隐私");
});

test("dynamic account labels retain the user name", () => {
  assert.equal(translateInterfaceText("帳號：Perr Tang", "en"), "Account: Perr Tang");
});
