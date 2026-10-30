# Infinite Studio 公開 Beta 資料說明

更新日期：2026-10-30

## 不登入時

- Moodboard、匯入素材、自動儲存與本機版本預設保存在目前瀏覽器的 IndexedDB。
- 只有使用者主動下載、匯出或選擇檔案時，資料才會離開目前瀏覽器工作區。
- GitHub Pages 只提供靜態程式檔；目前沒有接收 Moodboard 內容的應用程式後端。

## 登入時

- Google 或 Email 驗證登入由 Google Firebase Authentication 處理。
- Infinite Studio 會在瀏覽器中取得 Firebase UID、顯示名稱、頭像、Email、Email 驗證狀態與登入提供者，用於識別帳號及判斷進階功能存取。
- 登入、登出或切換帳號都不會自動上傳或刪除 Moodboard。
- 「保持登入」未勾選時使用瀏覽工作階段保存；勾選時才會在該裝置持續登入。

## 連結 Google Drive 時

- PETFASHION 登入只負責身份識別；Google Drive 會另外顯示授權流程，兩者不會互相代替。
- Infinite Studio 只要求 `drive.file` 權限，用來建立、讀取與更新本服務建立或由使用者交給本服務的檔案，不會掃描整個 Google Drive。
- 連結時會讀取 Google Drive 顯示名稱、Email 與儲存空間用量，分別用來確認目前帳號及在上傳前檢查容量。
- Drive 存取權杖只保留在目前分頁記憶體，不寫入 IndexedDB 或 localStorage；重新開啟時可在既有 Google 授權下靜默取得新權杖，無法恢復時才要求使用者重新連結。
- 瀏覽器只會在本機保存 Infinite Studio 資料夾 ID、檔案 ID、Drive resource key、遠端版本、同步時間與自動同步偏好，方便辨識對應工作檔與同步狀態。
- 連結 Drive 不會立即上傳。使用者第一次主動儲存後，才建立 `.studio` 或既有 `.moodboard` 雲端工作檔；啟用自動同步時，後續變更會先完成本機保存，再延遲同步到同一檔案。
- 更新既有雲端檔案時會使用遠端版本與條件式請求；更新前會保留先前 Drive 版本；以最後成功更新的內容為準。無法確認更新條件或競爭持續發生時會停止並提示使用者。
- 中斷 Drive 只會丟棄目前分頁記憶體中的存取權杖，不刪除 Google Drive 檔案、本機 Moodboard，也不會撤銷 PETFASHION 登入。若要完整撤銷已授予的 Drive 權限，可由 Google 帳戶的第三方連結設定處理。

## 分享與共同編輯時

- 分享單位就是目前這一份 `.studio` 或既有 `.moodboard` Google Drive 檔案；Infinite Studio 不會在 Cloud Firestore 或 PETFASHION 伺服器另建分享空間、作品副本或成員清單。
- 分享面板透過 Google Drive API 讀取與更新同一檔案的權限。擁有者可設為受限或「知道連結的人可檢視」，也可用 Google 帳號 Email 個別邀請檢視者或編輯者、變更角色或移除權限。
- 只有 Google Drive 回報具分享管理能力的帳號才會看到成員清單與成員 Email；一般檢視者只會看到自己的有效角色與在 Drive 開啟的選項。
- App 分享網址只包含 Drive 檔案 ID 與必要的 resource key，用來開啟正確檔案；網址本身不授予權限，實際存取仍完全由 Google Drive 判定。
- 檢視者只能檢視、選取、檢查與輸出；只有 Drive 回報具編輯能力時才可修改。每次儲存仍使用 Drive 版本與衝突保護，不宣稱為多人游標或無延遲即時共編。
- Google Drive API 不能替檢視者建立原生存取申請。需要編輯權時，檢視者須在 Google Drive 使用可用的申請流程，或把 Google 帳號 Email 提供給檔案擁有者。

## 目前不會做的事

- 不會把 Moodboard、圖片、影片、SVG、版本或構圖上傳至 PETFASHION 或 GitHub。
- 未經另外連結 Drive 與第一次主動儲存，不會把 Moodboard 上傳至 Google Drive。
- 分享不會把 Moodboard 或協作者清單傳送到 Firestore；Google Drive 保存完整工作檔與 ACL 權限，但不等於多人游標式即時共編服務。
- 產品 Email 偏好只保存在目前瀏覽器，不會加入寄送名單；正式啟用前會再次取得同意。
- 不會公開 Facebook 登入入口。

## 使用者控制

- Settings > 帳號與隱私可登出、清除目前裝置的自動儲存與本機版本，或前往 PETFASHION 管理／刪除帳號；清除本機資料不會刪除 Drive 檔案。
- Settings > 儲存與同步可關閉自動同步、中斷 Drive、檢查可用空間，或開啟既有雲端工作檔。
- 分享視窗可直接調整目前 Drive 檔案的一般存取權與成員角色；關閉視窗不會刪除 Drive 檔案或改變尚未送出的本機內容。
- 使用共用電腦時，應下載需要保留的 `.studio` 或既有 `.moodboard` 檔、登出，再清除本機資料。

PETFASHION 的正式政策：[隱私權政策](https://petfashion.tw/privacy)與[服務條款](https://petfashion.tw/terms)。若兩者與本說明有衝突，正式政策優先；公開推廣前仍應由負責人進行法律與政策文字審查。
