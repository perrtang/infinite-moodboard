# Infinite Moodboard

> A free, local-first infinite canvas for visual research, references, layouts, and moodboards — built by PETFASHION.

[![Open the app](https://img.shields.io/badge/Open-Infinite_Moodboard-111111?style=for-the-badge)](https://moodboard.petfashion.tw/)
[![Latest release](https://img.shields.io/github/v/release/perrtang/infinite-moodboard?display_name=tag&style=for-the-badge)](https://github.com/perrtang/infinite-moodboard/releases/latest)
[![Test and deploy](https://github.com/perrtang/infinite-moodboard/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/perrtang/infinite-moodboard/actions/workflows/deploy-pages.yml)

**English** · [繁體中文](#繁體中文) · [简体中文](#简体中文)

Infinite Moodboard runs the canvas, imported media, transforms, exports, and version history in your browser. No account is required for local editing, saving, opening, or exporting. Sign-in is requested only when you choose Google Drive, realtime collaboration, or other connected features.

## Start here

- **Recommended:** [open the web app](https://moodboard.petfashion.tw/). On first use, choose this device or Google Drive as that Moodboard's one primary storage location; a local recovery copy remains available in either mode.
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

## v0.45.0 — ruler-aligned workspace release

- Aligns canvas dots and grid lines with the active ruler unit, origin, pan, and zoom instead of using unrelated fixed pixel spacing.
- Uses matching major/minor ruler divisions so the background remains a meaningful measurement aid at every supported zoom level.
- Centers the ruler intersection control within the complete ruler composition.
- Verifies the public stable-version manifest after every GitHub Pages deployment, preventing an older deployed feed from being reported as current.

## v0.44.0 — guide layers release

- Adds a dedicated Guides section above ordinary object layers, matching the rule that every visible workspace element must remain discoverable in Layers.
- Supports guide multi-selection, semantic guide groups, same-axis batch movement, batch locking, ungrouping, and batch deletion without mixing guides into object transforms or exports.
- Makes global and per-guide locks remove guides from selection while keeping explicit unlock and management actions available.
- Preserves guide groups in `.moodboard` files and realtime collaboration, migrates older boards safely, and keeps guide selection separate from object selection.

## v0.43.0 — workspace precision release

- Makes Shift-dragged guides visibly magnetic in px and mm by adapting to perceptible integer ruler marks at the current zoom; cm and inch retain integer-unit snapping.
- Keeps only the centered Moodboard filename as visible Header text while preserving accessible tooltips and live Drive status.
- Reorganizes the primary toolbar with icon-only creation tools, Zoom Area beside Hand, Option/Alt inverse zooming, and plain minus/plus zoom steps.
- Restores an already granted Google Drive session silently after refresh for the same signed-in PETFASHION account without persisting OAuth access tokens.

## v0.42.0 — Zoom Window release

- Adds a one-shot Zoom Window tool beside the desktop zoom controls and inside the mobile More menu.
- Drag over blank canvas or objects to fit that region in the viewport without changing the Moodboard, history, or autosave state.
- Restores the previous tool after zooming or pressing Escape, while Space retains temporary Hand priority.
- Keeps small selection labels out of the way and preserves keyboard-only focus outlines for Tab navigation.

## v0.41.0 — safe Drive conflict recovery release

- Stops treating Drive revision-retention metadata updates as newer content.
- Keeps auto-sync paused while a local/Drive conflict remains unresolved and shows one readable recovery panel.
- Adds a confirmed overwrite path bound to the reviewed Moodboard, Drive file, and remote version, while retaining a recoverable Drive revision.
- Keeps save-as-copy independent from the current Drive link and sync queue, and preserves actionable failure details until the conflict is resolved.

## v0.40.0 — quiet temporary-Hand release

- Keeps the selected Select or Hand tool visually unchanged while Space temporarily pans the workspace.
- Removes pointer-created focus outlines from primary canvas tools while retaining keyboard focus for Tab navigation.
- Lets Space keep its native activation behavior when an actionable control has keyboard focus.

## v0.39.0 — immersive source-view release

- Replaces the central Moodboard editing surface with a dedicated Source workspace while inspecting imported media.
- Adds source-only pan, wheel zoom, 100%, and fit-to-window controls without mutating the Moodboard viewport.
- Hides canvas tools, rulers, objects, status HUD, and export controls in Source mode, then restores the exact Moodboard view on return.
- Keeps desktop and mobile controls touch-accessible and preserves source navigation, search, metadata, and original-file actions.

## v0.38.0 — movable ruler-origin release

- Drag the ruler intersection to redefine the shared zero point without moving objects or guides.
- Recalculate ruler ticks, guide readouts, and Shift snapping relative to the new origin.
- Save and synchronize the origin in `.moodboard` files while keeping ruler visibility and units device-local.

## v0.37.0 — temporary Hand tool release

- Hold Space from any canvas tool to temporarily activate Hand and pan from blank canvas or over an object.
- Restore the prior tool immediately on keyup or window blur, while changing only the canvas cursor and behavior—not the selected toolbar control.
- Leave Space untouched inside native fields, contenteditable text, and custom textbox widgets.

## v0.36.0 — global Color Set release

- Adds named device-global Color Sets shared by text, shape fills, and paper colors across every Moodboard.
- Keeps a protected built-in palette while supporting custom set creation, rename, color removal, and confirmed deletion.
- Imports and exports portable `.moodcolors` v2 files, appends collision-safe copies, and migrates legacy v1 color libraries without losing custom colors.
- Adds responsive Inspector management, keyboard-visible focus states, and Traditional Chinese, Simplified Chinese, and English interface copy.

## v0.35.0 — guide control release

- Keeps the guide position readout fully visible while dragging and shows when Shift snapping is active.
- Snaps guides to integer marks in the selected ruler unit, including when Shift is pressed after dragging begins.
- Adds persistent all-guide locking in File plus per-guide right-click lock, unlock, and explicit delete actions.
- Synchronizes global and individual guide locks in shared boards and removes the unexplained canvas-origin corner artifact.

## v0.34.0 — explicit file workflow release

- Consolidates open, save, save-as, browser HTML, output, sharing, versions, and about actions in one File menu.
- Asks local-first users to choose a `.moodboard` destination through Finder or the system file picker, then autosaves to that file while retaining a browser recovery copy.
- Shows Google Drive sync state beside Undo and Redo only when Drive is the current Moodboard's primary location.
- Keeps papers independent from nearby objects, allows repeated paper insertion, and removes the misleading padding guide.
- Rejects stale file-picker results after board or storage-target changes and immediately persists newly opened files for recovery.

## v0.33.0 — collision-free canvas HUD release

- Places the lower-left status group and lower-right export controls in one shared responsive HUD row.
- Offsets the status group from the visible ruler while preserving ruler drag interactions.
- Truncates secondary status details before controls can overlap and keeps the mobile app-version treatment intact.

## v0.32.0 — source workspace isolation release

- Turns Sources into an independent workspace with source-specific tools, details, original-file download, and visible-instance locating.
- Prevents pointer, keyboard, paste, drop, Inspector, export, history, and title edits from changing hidden Moodboard objects while inspecting sources.
- Creates clean independent canvas instances at their original dimensions and restores the previous Moodboard selection when returning.
- Adds Traditional Chinese, Simplified Chinese, and English copy for the complete source workflow.

## v0.31.0 — link-first sharing release

- Adds one clear Share action that creates a link for the current Moodboard.
- Opens a shared link automatically after verified sign-in, with view-only access by default and an explicit request-to-edit flow.
- Keeps collaboration sharing separate from Google Drive storage and explains that boundary in the interface.
- Restricts bearer invites to viewer access and prevents an owner from creating another owner through the collaboration API.

## v0.30.0 — storage destination release

- Gives every Moodboard one clear primary storage location: this device or Google Drive.
- Keeps IndexedDB as a local recovery copy even when primary autosave is disabled or Drive is selected.
- Combines local records and app-accessible Drive files in My Moodboards, with local-change, sync, conflict, quota, offline, and authorization states.
- Consolidates the top bar to My Moodboards and one destination-aware Save action; portable files are explicitly downloaded as `.moodboard` backups.

## v0.29.0 — intrinsic image sizing release

- Keeps an imported image or SVG at its intrinsic pixel dimensions instead of silently shrinking its longest edge to 420px.
- Stores the actual intrinsic dimensions for reliable one-click original-size recovery.
- Keeps width and height input drafts stable while typing, applies once on Enter or blur, and restores the current value with Escape.

## v0.28.0 — branded authentication release

- Moves Google and Email verification handlers to `auth.petfashion.tw` so the sign-in flow stays visibly within PETFASHION.
- Keeps the previous Firebase callback available for existing PETFASHION services while adding the branded OAuth callback.
- Verifies the branded authentication domain as part of the release test suite.

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
npm run release:package -- 0.30.0
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
