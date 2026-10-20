# Infinite Moodboard

> A free, local-first infinite canvas for visual research, references, layouts, and moodboards — built by PETFASHION.

[![Open the app](https://img.shields.io/badge/Open-Infinite_Moodboard-111111?style=for-the-badge)](https://moodboard.petfashion.tw/)
[![Latest release](https://img.shields.io/github/v/release/perrtang/infinite-moodboard?display_name=tag&style=for-the-badge)](https://github.com/perrtang/infinite-moodboard/releases/latest)
[![Test and deploy](https://github.com/perrtang/infinite-moodboard/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/perrtang/infinite-moodboard/actions/workflows/deploy-pages.yml)

**English** · [繁體中文](#繁體中文) · [简体中文](#简体中文)

Infinite Moodboard runs the canvas, imported media, transforms, exports, and version history in your browser. No account is required for local editing, saving, opening, or exporting. Sign-in is requested only when you choose Google Drive, realtime collaboration, or other connected features.

## Start here

- **Recommended:** [open the web app](https://moodboard.petfashion.tw/). Your work is saved locally in the current browser until you explicitly download, export, connect Drive, or start collaboration.
- **Editable files:** download a `.moodboard` file from the app and reopen it in the online app at any time.
- **Self-hosting:** download the latest `self-hosted.zip` from [GitHub Releases](https://github.com/perrtang/infinite-moodboard/releases/latest). It is a static web build, not a native desktop installer; follow the included `SELF_HOSTING.md` instead of double-clicking `index.html`.

## Highlights

- Infinite canvas with drag-and-drop or paste for images, video, and SVG.
- Text, common shapes, custom SVG, groups, grids, papers, rulers, guides, and print/social presets.
- Multi-selection, nine-point transform pivots, proportional group scaling, alignment, distribution, layers, markers, and filtering.
- Composition snapshots, local version history, `.moodboard` working files, and PNG, WebP, AVIF, PDF, asset, and read-only HTML output.
- Traditional Chinese, Simplified Chinese, and English interfaces.
- Optional Google Drive file storage and opt-in realtime collaboration with view/edit permission requests.
- 3D, Drive, collaboration, and export runtimes are loaded only when used, keeping the opening bundle smaller.

## v0.27.0 — PETFASHION custom-domain release

- Publishes the install-free GitHub Pages app at `moodboard.petfashion.tw`.
- Builds Pages from the domain root while preserving the portable relative-path self-hosted ZIP.
- Keeps the previous GitHub Pages URL as GitHub's managed redirect and retains versioned rollback tags and external backups.

## v0.26.0 — GitHub distribution release

- Publishes the current app through tested GitHub Pages and a versioned GitHub Release.
- Adds a reproducible self-hosted ZIP and SHA-256 checksum for every release tag.
- Reworks this README around a direct online-app path, clear privacy boundaries, searchable product language, and multilingual orientation.
- Prevents this standalone repository from deploying a partial Firestore rule file over PETFASHION's central production rules.

## Privacy and connected features

- Imported content, local autosaves, and local versions live in the current browser's IndexedDB by default.
- Signing in does **not** upload a Moodboard.
- Google Drive requires a separate `drive.file` consent and only creates a remote file after the user actively saves.
- Realtime collaboration uploads only the Moodboard whose owner explicitly creates or joins a room.
- Drive tokens remain in the current tab memory and are not written to IndexedDB or `localStorage`.
- Marketing consent is separate from account creation.

Read the complete [public beta data notice](PRIVACY.md) and [security policy](SECURITY.md) before enabling connected features on a fork.

## Development

Requirements: Node.js 22 or a compatible runtime.

```bash
npm install
npm run dev
```

Verification:

```bash
npm test
npm run build
```

Create the self-hosted release asset:

```bash
npm run release:package -- 0.27.0
```

Google Drive uses the least-privilege `drive.file` scope. A fork must supply its own OAuth client and approved origins:

```bash
VITE_GOOGLE_DRIVE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
```

### Firestore rule integration — important

`firestore.rules` in this repository is a **Moodboard-only fragment for review and tests**. PETFASHION's production Firestore serves other products from the same project, so this fragment must never be deployed by itself. Merge and review it in the authoritative central ruleset, verify unrelated rules remain intact, then deploy from that central repository. GitHub Pages deployment intentionally cannot deploy Firestore rules.

## Release and recovery

- A push to `main` runs tests and a production build before GitHub Pages deployment.
- A `vX.Y.Z` tag runs tests again and creates a GitHub Release with a self-hosted ZIP and checksum.
- Every accepted milestone also has a `backup/vX.Y.Z` Git tag plus an external Git bundle and source snapshot.
- See [SELF_HOSTING.md](SELF_HOSTING.md) for the downloaded web build and [RELEASING.md](RELEASING.md) for the maintainer checklist.

## License status

No open-source license has been selected. Public source visibility does not grant permission to reproduce, redistribute, or create derivative software. Using the public web app is not restricted by this repository-source notice.

## 繁體中文

Infinite Moodboard 是 PETFASHION 的免費、本機優先無限畫布。圖片、影片、文字、SVG、版本與輸出主要在瀏覽器內處理；不登入也能編輯、儲存、開啟與輸出。建議直接使用[線上版](https://moodboard.petfashion.tw/)，並定期下載可再次編輯的 `.moodboard` 工作檔。只有主動使用 Google Drive、即時共編等連線功能時才需要登入與另外授權。

下載的 `self-hosted.zip` 是供自行架站的靜態網頁版本，不是桌面安裝程式。資料與權限界線請讀 [PRIVACY.md](PRIVACY.md)。

## 简体中文

Infinite Moodboard 是 PETFASHION 的免费、本地优先无限画布。图片、视频、文字、SVG、版本与输出主要在浏览器内处理；无需登录也能编辑、保存、打开与导出。建议直接使用[在线版](https://moodboard.petfashion.tw/)，并定期下载可再次编辑的 `.moodboard` 工作文件。只有主动使用 Google Drive、实时协作等联网功能时才需要登录与另外授权。

下载的 `self-hosted.zip` 是供自行部署的静态网页版本，不是桌面安装程序。数据与权限边界请阅读 [PRIVACY.md](PRIVACY.md)。
