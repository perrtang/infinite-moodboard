# Infinite Moodboard

Infinite Moodboard 是 PETFASHION 的免費、離線優先視覺工作台。圖片、影片、文字、SVG、版本與構圖運算都在瀏覽器中進行；使用者可下載可編輯的 `.moodboard` 工作檔，或輸出 PNG、WebP、AVIF、PDF 與唯讀 HTML。

## v0.7.0 重點

- 依選取範圍建立具有 40px 預設邊距的紙張，支援 A3、A4、A5、B5、Letter、自訂尺寸、方向與色彩。
- 可在選取範圍八個方位加入可獨立編輯的標題或說明。
- Grid 可複製選取物件至指定數量；無選取時會建立可編輯的矩形預留位置。
- 支援群組／解散群組、`⌘/Ctrl + G`、`⇧⌘/Ctrl + G`，以及按住 `⌘/Ctrl` 穿透選取群組成員。
- 圖層可依類型篩選，並對多選物件批次顯示、隱藏、匯出、合成輸出與刪除。

線上公開 Beta：<https://perrtang.github.io/infinite-moodboard/>

## 目前邊界

- 不登入也能使用本機編輯、儲存、開啟與輸出。
- Google 與免密碼 Email 登入只用於識別 PETFASHION 帳號及解鎖進階功能。
- 登入不會自動上傳 Moodboard、素材或版本。
- 同裝置多分頁同步可用；跨裝置共編、Google Drive 儲存與 PETFASHION 會員後台同步尚未啟用。
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

## 發布

`main` 分支的每次推送都會先執行測試與建置；兩者通過後才部署至 GitHub Pages。公開站使用 `/infinite-moodboard/` 基底路徑，Firebase Authentication 必須另外允許 `perrtang.github.io` 網域。

## 授權狀態

此儲存庫目前尚未選定開源授權。公開原始碼不代表自動授予重製、散布或衍生作品的權利；使用線上公開 Beta 不受此段影響。
