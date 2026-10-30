# Security Policy

## Supported version

目前只維護 GitHub Pages 公開 Beta 所標示的最新版本。

## Reporting a vulnerability

請使用 GitHub 儲存庫的 Private vulnerability reporting，不要在公開 Issue 張貼帳號、Email 驗證連結、Firebase token、Moodboard 或私人素材。

回報請包含：受影響版本、重現步驟、預期與實際結果，以及已移除私人資料的最小證據。請勿測試或存取其他使用者的帳號與資料。

## Google Drive 分享安全邊界

- 雲端作品、版本與成員權限都附著在使用者自己的 Google Drive `.studio` 或舊 `.moodboard` 檔案；正式應用程式不會另建 Firestore 分享空間。
- App 只要求 `drive.file`，只能處理由 Infinite Moodboard 建立或使用者明確交給 App 的檔案。所有讀寫與權限變更仍受 Google Drive ACL、檔案能力與 Workspace 管理政策限制。
- 分享網址中的 Drive file ID 與 resource key 只用於定位檔案，不取代權限檢查。不要把受限檔案連結放進公開 Issue、紀錄或螢幕截圖。
- 只有 Drive 回報可分享的帳號能邀請成員、變更 viewer/editor 角色或移除權限；只有 Drive 回報可編輯時，App 才允許修改內容。
- 每次更新既有檔案都保留版本與衝突檢查；發現較新 Drive 內容時停止自動覆寫，直到使用者明確解決衝突。
- 可選密碼連結只保護連結中的 Drive 定位資訊，不加密工作檔，也不改變 Drive 權限；原始 Drive 連結與舊分享連結仍可依權限使用。密碼可被離線猜測，請使用高強度密碼並透過另一管道傳送；需要撤銷舊連結時應調整 Drive 存取權。

## 舊版 Firestore 檔案

倉庫仍保留舊共編原型與規則片段供遷移稽核，但正式入口不再載入。不得從本倉庫部署 `firestore.rules`，也不得把舊 `?collab=` 連結重新接回 Firestore。
