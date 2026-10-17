# Infinite Moodboard 公開 Beta 資料說明

更新日期：2026-10-18

## 不登入時

- Moodboard、匯入素材、自動儲存與本機版本預設保存在目前瀏覽器的 IndexedDB。
- 只有使用者主動下載、匯出或選擇檔案時，資料才會離開目前瀏覽器工作區。
- GitHub Pages 只提供靜態程式檔；目前沒有接收 Moodboard 內容的應用程式後端。

## 登入時

- Google 或 Email 驗證登入由 Google Firebase Authentication 處理。
- Infinite Moodboard 會在瀏覽器中取得 Firebase UID、顯示名稱、頭像、Email、Email 驗證狀態與登入提供者，用於識別帳號及判斷進階功能存取。
- 登入、登出或切換帳號都不會自動上傳或刪除 Moodboard。
- 「保持登入」未勾選時使用瀏覽工作階段保存；勾選時才會在該裝置持續登入。

## 目前不會做的事

- 不會把 Moodboard、圖片、影片、SVG、版本或構圖上傳至 PETFASHION、GitHub 或 Google Drive。
- 不會啟用跨裝置即時共編或雲端備份。
- 產品 Email 偏好只保存在目前瀏覽器，不會加入寄送名單；正式啟用前會再次取得同意。
- 不會公開 Facebook 登入入口。

## 使用者控制

- Settings > 帳號與隱私可登出、清除目前裝置的自動儲存與本機版本，或前往 PETFASHION 管理／刪除帳號。
- 使用共用電腦時，應下載需要保留的 `.moodboard` 檔、登出，再清除本機資料。

PETFASHION 的正式政策：[隱私權政策](https://petfashion.tw/privacy)與[服務條款](https://petfashion.tw/terms)。若兩者與本說明有衝突，正式政策優先；公開推廣前仍應由負責人進行法律與政策文字審查。
