# Infinite Moodboard

Infinite Moodboard 是 PETFASHION 的免費、離線優先視覺工作台。圖片、影片、文字、SVG、版本與構圖運算都在瀏覽器中進行；使用者可下載可編輯的 `.moodboard` 工作檔，或輸出 PNG、WebP、AVIF、PDF 與唯讀 HTML。

## v0.11.0 重點（本機待發布）

- IndexedDB 升級為多 Moodboard 本機資料庫；舊版目前畫布會自動移轉，並保留相容資料以支援版本回復。
- 新增可持續保存、合併同一 Moodboard 最新變更的離線同步佇列；離線、授權、容量與衝突狀態可安全保留。
- 設定內顯示本機 Moodboard 數量、等待同步數量及瀏覽器提供的容量資訊。

## v0.10.0 重點

- 完成 Google Drive 授權、開啟與儲存流程；授權結果必須包含精確的 `drive.file` 權限，過期權杖會安全要求重新連結。
- 保留首次連結不建立資料夾、不上傳檔案的明確邊界；第一次主動儲存後才建立雲端工作檔。
- Drive 檔案更新維持版本、HTTP ETag 與寫後讀回三重檢查，無法安全判斷時停止覆寫。

## v0.9.0 重點

- 新增 Google Drive 優先保存：PETFASHION 身份登入與 Drive 檔案授權分開，使用 `drive.file` 最小權限，只存取 Infinite Moodboard 建立的工作檔。
- 每次編輯仍先寫入 IndexedDB；離線、Drive 額滿、授權失效或版本衝突都不會中斷本機工作。
- 儲存前檢查 Drive 可用空間；同一檔案在其他裝置更新時停止覆寫，提供開啟雲端版本或另存複本的復原路徑。
- Settings > 儲存與同步可管理 Drive、容量狀態與自動同步；「我的 Moodboards」可搜尋、開啟與檢查既有雲端工作檔。

## v0.8.0 重點

- 所有內容列表的搜尋／篩選預設收合，按圖示或 `⌘/Ctrl + F` 才展開，並保留查詢與結果數。
- 新增 px、mm、cm、inch 尺規與可拖曳導引線；拖曳時按住 Shift 會吸附整數刻度。
- 工作區快速鍵統一使用 Shift；新增左右側欄、雙側欄、專注模式與可搜尋的快速鍵清單。`Esc` 依最上層暫時狀態取消，若會放棄已產生的物件調整則先詢問是否保留。
- Hand 模式按住 Shift 可暫時選取；標準儲存、開啟、復原、複製、貼上與尋找仍沿用 `⌘/Ctrl` 語意。
- 依選取範圍建立具有 40px 預設邊距的紙張，支援 A3、A4、A5、B5、Letter、自訂尺寸、方向與色彩。
- 可在選取範圍八個方位加入可獨立編輯的標題或說明。
- Grid 可複製選取物件至指定數量；無選取時會建立可編輯的矩形預留位置。
- 支援群組／解散群組、`Shift + G`，以及按住 `⌘/Ctrl` 點擊穿透選取群組成員。
- 圖層可依類型篩選，並對多選物件批次顯示、隱藏、匯出、合成輸出與刪除。

線上公開 Beta：<https://perrtang.github.io/infinite-moodboard/>

## 目前邊界

- 不登入也能使用本機編輯、儲存、開啟與輸出。
- Google 與免密碼 Email 登入只用於識別 PETFASHION 帳號及解鎖進階功能。
- 登入本身不會上傳 Moodboard、素材或版本；必須另外連結 Google Drive，第一次仍需主動儲存。
- 同裝置多分頁同步與 Google Drive 工作檔保存已完成；跨裝置即時共編與 PETFASHION 會員後台同步尚未啟用。
- Facebook 登入仍為非公開測試，不出現在正常入口。
- 產品 Email 偏好目前只保存在瀏覽器，不會加入寄送名單。

完整資料邊界請見 [PRIVACY.md](PRIVACY.md)。

## 本機開發

需要 Node.js 22 或相容版本：

```bash
npm install
npm run dev
```

執行驗證：

```bash
npm test
npm run build
```

Google Drive 使用公開的 OAuth Web Client ID。正式部署可在 `.env` 覆寫：

```bash
VITE_GOOGLE_DRIVE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
```

對應 Google Cloud 專案必須啟用 Google Drive API，且 OAuth 用戶端需允許本機與正式站來源。Drive 存取權杖只存在當前分頁記憶體，不會寫入瀏覽器儲存空間。

## 發布

`main` 分支的每次推送都會先執行測試與建置；兩者通過後才部署至 GitHub Pages。公開站使用 `/infinite-moodboard/` 基底路徑，Firebase Authentication 必須另外允許 `perrtang.github.io` 網域。

## 授權狀態

此儲存庫目前尚未選定開源授權。公開原始碼不代表自動授予重製、散布或衍生作品的權利；使用線上公開 Beta 不受此段影響。
