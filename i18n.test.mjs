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

test("paper, annotation, grid, and semantic grouping copy is localized", () => {
  assert.equal(translateInterfaceText("紙張", "en"), "Paper");
  assert.equal(translateInterfaceText("符合內容", "en"), "Fit to content");
  assert.equal(translateInterfaceText("右下外側", "en"), "Bottom right outside");
  assert.equal(translateInterfaceText("紙張＋內容", "en"), "Paper + content");
  assert.equal(translateInterfaceText("3 欄、2 列、共 6 個物件", "en"), "3 columns, 2 rows, 6 objects total");
  assert.equal(translateInterfaceText("已建立 3 欄、2 列，共 6 個物件的 Grid。", "en"), "Created a 3-column × 2-row grid with 6 objects.");
  assert.equal(translateInterfaceText("已將 4 個物件建立為群組；按住 ⌘／Ctrl 可穿透選取。", "en"), "Grouped 4 objects. Hold ⌘/Ctrl to select through the group.");
  assert.equal(translateInterfaceText("右下外側", "zh-Hans"), "右下外侧");
  assert.equal(translateInterfaceText("紙張＋內容", "zh-Hans"), "纸张＋内容");
});

test("shape quick sizes and editable polygon or star controls are localized", () => {
  assert.equal(translateInterfaceText("多邊形", "en"), "Polygon");
  assert.equal(translateInterfaceText("多邊形邊數", "en"), "Polygon sides");
  assert.equal(translateInterfaceText("星形樣式", "en"), "Star style");
  assert.equal(translateInterfaceText("內縮比例", "en"), "Inner radius");
  assert.equal(translateInterfaceText("快速尺寸", "en"), "Quick sizes");
  assert.equal(translateInterfaceText("紙張尺寸", "en"), "Paper sizes");
  assert.equal(translateInterfaceText("限時動態／短影音", "en"), "Story / short video");
  assert.equal(translateInterfaceText("12 芒 · 32%", "en"), "12 points · 32%");
  assert.equal(translateInterfaceText("紙張尺寸", "zh-Hans"), "纸张尺寸");
  assert.equal(translateInterfaceText("多邊形邊數", "zh-Hans"), "多边形边数");
});

test("workspace search, ruler, and shortcut copy is localized", () => {
  assert.equal(translateInterfaceText("搜尋或篩選圖層", "en"), "Search or filter layers");
  assert.equal(translateInterfaceText("尺規與輔助導引線", "en"), "Rulers and guides");
  assert.equal(translateInterfaceText("平移工具 Shift+H（按住 Shift 可暫時選取）", "en"), "Hand tool Shift+H (hold Shift to select temporarily)");
  assert.equal(translateInterfaceText("搜尋快速鍵", "en"), "Search shortcuts");
  assert.equal(translateInterfaceText("顯示或隱藏兩側欄", "en"), "Show or hide both side panels");
  assert.equal(translateInterfaceText("取消目前調整？", "en"), "Cancel the current adjustment?");
  assert.equal(translateInterfaceText("移動 3 個物件", "en"), "Move 3 objects");
  assert.equal(translateInterfaceText("調整「標題」文字框", "en"), "Resize the text frame for “標題”");
  assert.equal(translateInterfaceText("3D 旋轉物件", "en"), "Rotate object in 3D");
  assert.equal(translateInterfaceText("搜尋構圖名稱", "zh-Hans"), "搜索构图名称");
});

test("Google Drive storage and recovery copy is localized", () => {
  assert.equal(translateInterfaceText("儲存與同步", "en"), "Storage & sync");
  assert.equal(translateInterfaceText("只要求 drive.file 最小權限", "en"), "Requests only the minimum drive.file permission");
  assert.match(translateInterfaceText("Google Drive 是主要保存位置；每次編輯仍會先安全保存在這台裝置。", "en"), /saved on this device first/);
  assert.equal(translateInterfaceText("Google Drive 已同步", "en"), "Google Drive synced");
  assert.equal(translateInterfaceText("本機安全暫存", "en"), "Local safety cache");
  assert.equal(translateInterfaceText("等待同步", "en"), "Waiting to sync");
  assert.equal(translateInterfaceText("新增 Moodboard", "en"), "New Moodboard");
  assert.equal(translateInterfaceText("Google Drive 版本", "en"), "Google Drive versions");
  assert.equal(translateInterfaceText("Drive 版本 19", "en"), "Drive version 19");
  assert.equal(translateInterfaceText("內容 r12 · 2 個物件 · 10/20 15:20", "en"), "Content r12 · 2 objects · 10/20 15:20");
  assert.equal(translateInterfaceText("2 / 5 份 Moodboard", "en"), "2 / 5 Moodboards");
  assert.equal(translateInterfaceText("2 / 5 個 Drive 檔案", "en"), "2 / 5 Drive files");
  assert.equal(translateInterfaceText("目前 Drive 帳號：person@example.com", "en"), "Current Drive account: person@example.com");
  assert.match(translateInterfaceText("Google Drive 空間不足；畫布仍安全保存在這台裝置。", "en"), /remains safely saved/);
  assert.match(translateInterfaceText("正在先保存本機版本，再確認 Drive 空間與遠端版本…", "en"), /Saving the local version first/);
  assert.match(translateInterfaceText("已中斷這個分頁的 Google Drive；雲端檔案、本機畫布與 PETFASHION 登入都未受影響。", "en"), /disconnected from this tab/);
  assert.equal(translateInterfaceText("儲存與同步", "zh-Hans"), "保存与同步");
  assert.equal(translateInterfaceText("中斷 Drive 連結", "zh-Hans"), "中断 Drive 连接");
});

test("real-time collaboration copy is localized", () => {
  assert.equal(translateInterfaceText("建立共編空間", "en"), "Create collaboration room");
  assert.equal(translateInterfaceText("可編輯", "en"), "Can edit");
  assert.equal(translateInterfaceText("3 個變更等待同步", "en"), "3 changes waiting to sync");
  assert.equal(translateInterfaceText("協作，2 位成員在線", "en"), "Collaboration, 2 collaborators online");
  assert.equal(translateInterfaceText("所有變更已同步。", "en"), "All changes are synced.");
  assert.match(translateInterfaceText("目前帳號沒有這個共編空間的權限，或雲端安全規則尚未啟用。", "en"), /cannot access/);
  assert.equal(translateInterfaceText("離線與隱私", "zh-Hans"), "离线与隐私");
});
