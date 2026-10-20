# Security Policy

## Supported version

目前只維護 GitHub Pages 公開 Beta 所標示的最新版本。

## Reporting a vulnerability

請使用 GitHub 儲存庫的 Private vulnerability reporting，不要在公開 Issue 張貼帳號、Email 驗證連結、Firebase token、Moodboard 或私人素材。

回報請包含：受影響版本、重現步驟、預期與實際結果，以及已移除私人資料的最小證據。請勿測試或存取其他使用者的帳號與資料。

## 即時共編安全邊界

- Cloud Firestore 只接受已完成 Email 驗證的 Firebase 身份；房間不可列舉，讀取必須是房間成員。
- 只有擁有者與編輯者能寫入共編更新；只有擁有者能管理成員、房間與邀請。
- 邀請連結是具期限的 bearer token。不要把連結放在公開 Issue、紀錄或螢幕截圖中。
- 共編更新採分段上傳，單次更新限制 48 MiB；完成發布後不可覆寫內容，避免已同步歷史遭竄改。
- `firestore.rules` 必須和應用版本一起審查及部署。GitHub Pages 發布成功不代表 Firestore 規則已部署。
