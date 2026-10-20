import assert from "node:assert/strict";
import test from "node:test";
import {
  alignObjectsToKey,
  arrangeObjectsInGrid,
  boundsAnchorPoint,
  compactBoardStructure,
  createArtboardFromObjects,
  createGroup,
  createObjectDuplicate,
  createViewCapture,
  distributeObjectsByGap,
  ensureBoard,
  findCompositionsAffectedByObjectDeletion,
  matchesFilters,
  movePivotPreservingPlacement,
  objectIntersectsWorldRect,
  objectWorldCorners,
  objectsForExport,
  reorderCapturesByVisualDrop,
  reorderObjectsByVisualDrop,
  resizeArtboardToPreset,
  resizeObjectToDimensions,
  resizeObjectFromHandle,
  resizeObjectsFromHandle,
  resizeTextFrameToDimension,
  restoreViewCapture,
  restoreObjectSize,
  rotateObjectsAroundPoint,
  safeFilename,
  scaleObjectsAroundPoint,
  shapeClipPath,
  shapePolygonPoints,
  selectionActionAnchorInViewport,
  selectionIdsForObject,
  selectionWorldBounds,
  snapRotationDelta,
  sourceAssetsFromObjects,
  upsertMarkerBySymbol,
  viewObjectInViewport,
} from "./model.js";
import { createPortableHtml } from "./portable.js";
import {
  buildImagePdf,
  compositionOutputFormat,
  planCompositionSize,
} from "./output.js";
import {
  BUILT_IN_THEMES,
  DEFAULT_INTERFACE_THEME_ID,
  contrastRatio,
  interfaceThemeCssVariables,
  interfaceThemeMode,
  normalizeInterfaceTheme,
  parseInterfaceThemeFile,
  serializeInterfaceTheme,
} from "./theme.js";
import {
  DEFAULT_CANVAS_BACKGROUND,
  DEFAULT_INTERFACE_TYPOGRAPHY,
  changeCanvasBackgroundMode,
  interfaceTypographyCssVariables,
  normalizeCanvasBackground,
  normalizeInterfaceTypography,
  resolveInterfaceTypography,
  toggleCanvasBackgroundVisibility,
} from "./ui-preferences.js";
import {
  APP_RELEASE_DATE,
  APP_VERSION,
  APP_VERSION_LABEL,
  compareSemanticVersions,
  normalizeUpdateManifest,
} from "./version.js";
import {
  detectInterfaceLocale,
  localizedDefaultBoardName,
  normalizeInterfaceLocale,
  translateInterfaceText,
} from "./i18n.js";

test("application version remains explicit and independent from board revisions", () => {
  assert.match(APP_VERSION, /^\d+\.\d+\.\d+$/);
  assert.equal(APP_VERSION_LABEL, `App v${APP_VERSION}`);
  assert.equal(APP_RELEASE_DATE, "2026-10-20");
});

test("application update manifests compare stable semantic versions", () => {
  assert.equal(compareSemanticVersions("0.2.0", "0.2.0"), 0);
  assert.equal(compareSemanticVersions("0.1.9", "0.2.0"), -1);
  assert.equal(compareSemanticVersions("1.0.0", "0.9.9"), 1);
  assert.deepEqual(normalizeUpdateManifest({ version: "0.2.0", summary: "最新版本" }), {
    product: "Infinite Moodboard",
    channel: "stable",
    version: "0.2.0",
    releasedAt: "",
    summary: "最新版本",
    url: "",
  });
  assert.throws(() => normalizeUpdateManifest({ version: "next" }), /版本編號格式不正確/);
});

test("interface locale detection and language packs cover Traditional Chinese, Simplified Chinese, and English", () => {
  assert.equal(normalizeInterfaceLocale("zh-TW"), "zh-Hant");
  assert.equal(normalizeInterfaceLocale("zh-CN"), "zh-Hans");
  assert.equal(detectInterfaceLocale(["fr-FR", "en-US"]), "en");
  assert.equal(detectInterfaceLocale(["en-US", "zh-TW"]), "en");
  assert.equal(detectInterfaceLocale(["zh-CN", "en-US"]), "zh-Hans");
  assert.equal(translateInterfaceText("設定", "en"), "Settings");
  assert.equal(translateInterfaceText("一般設定", "en"), "General");
  assert.equal(translateInterfaceText("一般", "en"), "Regular");
  assert.equal(translateInterfaceText("選取工具 V", "zh-Hans"), "选择工具 V");
  assert.equal(translateInterfaceText("已複製 3 個物件", "en"), "Duplicated 3 objects");
  assert.equal(translateInterfaceText("已複製 3 個物件", "zh-Hans"), "已复制 3 个对象");
  assert.equal(
    translateInterfaceText("常用偏好集中在這裡，後續設定可沿用相同分區擴充。", "zh-Hans"),
    "常用偏好集中在这里，后续设置可沿用相同分区扩充。",
  );
  assert.equal(
    translateInterfaceText("語言會保存在這台裝置；登入同步啟用後可再跟隨帳號。", "zh-Hans"),
    "语言会保存在这台设备；登录同步启用后可再跟随账号。",
  );
  assert.equal(translateInterfaceText("本機已儲存 下午05:45", "en"), "Saved locally 17:45");
  assert.equal(translateInterfaceText("協作，1 個分頁在線", "en"), "Collaboration, 1 tab online");
  assert.equal(translateInterfaceText("目前 1 個分頁在線，變更會即時同步。", "en"), "1 tab is online. Changes sync in real time.");
  assert.equal(translateInterfaceText("原始素材 · 2 個畫布實例", "en"), "Original asset · 2 canvas instances");
  assert.equal(translateInterfaceText("構圖 03", "en"), "Composition 03");
  assert.equal(translateInterfaceText("已加入 3 個素材", "en"), "Added 3 assets");
  assert.equal(translateInterfaceText("已切換為深色模式。", "en"), "Switched to dark mode.");
  assert.equal(translateInterfaceText("已重新顯示畫布格線。", "en"), "Canvas grid shown again.");
  assert.equal(translateInterfaceText("登入後使用協作與同步", "en"), "Sign in for collaboration and sync");
  assert.equal(translateInterfaceText("訪客模式", "en"), "Guest mode");
  assert.equal(translateInterfaceText("登入後使用進階 3D", "zh-Hans"), "登录后使用进阶 3D");
  assert.equal(localizedDefaultBoardName("en"), "Untitled Infinite Moodboard");
});

test("interface typography presets and custom values stay safe and bounded", () => {
  const defaults = resolveInterfaceTypography(DEFAULT_INTERFACE_TYPOGRAPHY);
  assert.equal(defaults.offset, 0);
  assert.match(defaults.family, /Noto Sans TC/);

  const custom = normalizeInterfaceTypography({
    sizeMode: "custom",
    customOffset: 8,
    familyMode: "custom",
    customFamily: 'Avenir Next; color: red { test }',
  });
  assert.equal(custom.customOffset, 4);
  assert.equal(custom.customFamily, "Avenir Next color: red  test");
  assert.equal(interfaceTypographyCssVariables(custom)["--ui-font-offset"], "4px");
  assert.equal(interfaceTypographyCssVariables(custom)["--ui-font-family"], "Avenir Next color: red  test");
});

test("canvas background visibility restores the last visible grid style", () => {
  assert.deepEqual(normalizeCanvasBackground(), DEFAULT_CANVAS_BACKGROUND);

  const lines = changeCanvasBackgroundMode(DEFAULT_CANVAS_BACKGROUND, "lines");
  assert.deepEqual(lines, { mode: "lines", lastVisibleMode: "lines" });

  const hidden = toggleCanvasBackgroundVisibility(lines);
  assert.deepEqual(hidden, { mode: "hidden", lastVisibleMode: "lines" });
  assert.deepEqual(toggleCanvasBackgroundVisibility(hidden), lines);
  assert.deepEqual(normalizeCanvasBackground({ mode: "hidden", lastVisibleMode: "unknown" }), {
    mode: "hidden",
    lastVisibleMode: "dots",
  });
});

test("interface themes include the product and organization brand palettes", () => {
  const fashionMonochrome = BUILT_IN_THEMES.find((theme) => theme.id === DEFAULT_INTERFACE_THEME_ID);
  const petfashion = BUILT_IN_THEMES.find((theme) => theme.id === "petfashion-editorial");
  const trueTree = BUILT_IN_THEMES.find((theme) => theme.id === "true-tree-editorial");
  const netflix = BUILT_IN_THEMES.find((theme) => theme.id === "brand-netflix");
  const starbucks = BUILT_IN_THEMES.find((theme) => theme.id === "brand-starbucks");

  assert.equal(BUILT_IN_THEMES[0].id, DEFAULT_INTERFACE_THEME_ID);
  assert.equal(fashionMonochrome.name, "時尚黑白");
  assert.equal(fashionMonochrome.monochrome, true);
  assert.equal(BUILT_IN_THEMES.length, 12);
  assert.deepEqual(petfashion.colors, {
    background: "#F7F5EF",
    panel: "#FFFEFA",
    canvas: "#F7F5EF",
    text: "#141412",
    muted: "#6F6D65",
    accent: "#D8A20B",
  });
  assert.equal(trueTree.colors.accent, "#31502E");
  assert.equal(interfaceThemeCssVariables(petfashion)["--accent-rgb"], "216 162 11");
  assert.equal(interfaceThemeCssVariables(petfashion).colorScheme, "light");
  assert.equal(interfaceThemeMode(petfashion), "light");
  assert.equal(interfaceThemeMode(netflix), "dark");
  assert.equal(netflix.colors.accent, "#E50914");
  assert.equal(starbucks.colors.accent, "#00754A");
  assert.equal(starbucks.category, "brand");
});

test("the default fashion monochrome theme keeps all interface color channels grayscale", () => {
  const theme = BUILT_IN_THEMES.find((item) => item.id === DEFAULT_INTERFACE_THEME_ID);
  const variables = interfaceThemeCssVariables(theme);
  const assertGrayscaleHex = (value, label) => {
    const match = String(value).match(/^#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i);
    assert.ok(match, `${label} should be a six-digit hex color`);
    assert.equal(match[1].toUpperCase(), match[2].toUpperCase(), `${label} red and green channels`);
    assert.equal(match[2].toUpperCase(), match[3].toUpperCase(), `${label} green and blue channels`);
  };
  const assertGrayscaleRgbChannels = (value, label) => {
    const channels = String(value).trim().split(/\s+/);
    assert.equal(channels.length, 3, `${label} should have three channels`);
    assert.equal(channels[0], channels[1], `${label} red and green channels`);
    assert.equal(channels[1], channels[2], `${label} green and blue channels`);
  };

  Object.entries(theme.colors).forEach(([key, value]) => assertGrayscaleHex(value, `theme ${key}`));
  ["--text", "--text-muted", "--text-soft", "--accent-base", "--accent", "--accent-fill", "--accent-ui", "--accent-on", "--accent-hover", "--accent-strong", "--success", "--signal", "--danger", "--axis-x", "--axis-y", "--axis-z"]
    .forEach((key) => assertGrayscaleHex(variables[key], key));
  ["--accent-rgb", "--muted-rgb", "--success-rgb", "--signal-rgb", "--danger-rgb"]
    .forEach((key) => assertGrayscaleRgbChannels(variables[key], key));

  ["--rotation-cursor", "--text-flow-cursor", "--micro-3d-cursor"].forEach((key) => {
    const decodedCursor = decodeURIComponent(variables[key]);
    const cursorColors = decodedCursor.match(/#[0-9A-F]{6}/gi) || [];
    assert.ok(cursorColors.length >= 3, `${key} should embed theme colors`);
    cursorColors.forEach((color) => assertGrayscaleHex(color, `${key} ${color}`));
  });
});

test("every built-in theme derives readable text, controls, semantic colors, and its own cursor", () => {
  for (const theme of BUILT_IN_THEMES) {
    const variables = interfaceThemeCssVariables(theme);
    const surfaces = [theme.colors.background, theme.colors.panel, theme.colors.canvas];
    for (const surface of surfaces) {
      assert.ok(contrastRatio(variables["--text"], surface) >= 4.5, `${theme.id} primary text`);
      assert.ok(contrastRatio(variables["--text-muted"], surface) >= 4.5, `${theme.id} muted text`);
      assert.ok(contrastRatio(variables["--accent"], surface) >= 4.5, `${theme.id} accent text`);
      assert.ok(contrastRatio(variables["--accent-ui"], surface) >= 3, `${theme.id} active controls`);
      assert.ok(contrastRatio(variables["--success"], surface) >= 4.5, `${theme.id} success text`);
      assert.ok(contrastRatio(variables["--signal"], surface) >= 4.5, `${theme.id} signal text`);
      assert.ok(contrastRatio(variables["--danger"], surface) >= 4.5, `${theme.id} danger text`);
    }
    assert.ok(contrastRatio(variables["--accent-on"], variables["--accent-fill"]) >= 4.5, `${theme.id} accent button label`);
    assert.match(variables["--rotation-cursor"], /^url\("data:image\/svg\+xml,/);
    assert.match(variables["--text-flow-cursor"], /^url\("data:image\/svg\+xml,/);
    assert.match(variables["--micro-3d-cursor"], /^url\("data:image\/svg\+xml,/);
  }
  const petfashionCursor = interfaceThemeCssVariables(BUILT_IN_THEMES.find((theme) => theme.id === "petfashion-editorial"))["--rotation-cursor"];
  assert.doesNotMatch(petfashionCursor, /58E6FF/i);
});

test("custom interface themes round-trip through moodtheme files", () => {
  const custom = normalizeInterfaceTheme({
    id: "custom",
    name: "我的配色",
    colors: {
      background: "#101010",
      panel: "#202020",
      canvas: "#303030",
      text: "#FAFAFA",
      muted: "#AAAAAA",
      accent: "#ABCDEF",
    },
  });
  const parsed = parseInterfaceThemeFile(serializeInterfaceTheme(custom));

  assert.equal(parsed.name, "我的配色");
  assert.deepEqual(parsed.colors, custom.colors);
  assert.throws(() => parseInterfaceThemeFile('{"type":"unknown"}'), /不是 Infinite Moodboard/);
  assert.throws(() => parseInterfaceThemeFile(JSON.stringify({
    type: "infinite-moodboard-interface-theme",
    version: 1,
    theme: { name: "壞掉的配色", colors: { ...custom.colors, accent: "not-a-color" } },
  })), /完整的六組色彩/);
});

test("changing a nine-point pivot preserves every visible corner", () => {
  const object = {
    anchor: "mc",
    pivotX: 320,
    pivotY: 180,
    width: 240,
    height: 120,
    rotation: 37,
  };
  const before = objectWorldCorners(object);
  const after = objectWorldCorners(movePivotPreservingPlacement(object, "br"));

  before.forEach((corner, index) => {
    assert.ok(Math.abs(corner.x - after[index].x) < 0.00001);
    assert.ok(Math.abs(corner.y - after[index].y) < 0.00001);
  });
});

test("marker filtering supports union and intersection", () => {
  const object = {
    markers: [
      { symbol: "heart", color: "pink" },
      { symbol: "star", color: "cyan" },
    ],
  };

  assert.equal(matchesFilters(object, { symbols: ["heart", "flag"], colors: [], mode: "any" }), true);
  assert.equal(matchesFilters(object, { symbols: ["heart", "flag"], colors: [], mode: "all" }), false);
  assert.equal(matchesFilters(object, { symbols: ["heart"], colors: ["cyan"], mode: "all" }), true);
});

test("applying a new color updates the existing symbol instead of duplicating it", () => {
  const markers = [
    { symbol: "heart", color: "pink" },
    { symbol: "star", color: "cyan" },
  ];

  const recolored = upsertMarkerBySymbol(markers, { symbol: "heart", color: "amber" });
  assert.deepEqual(recolored, [
    { symbol: "heart", color: "amber" },
    { symbol: "star", color: "cyan" },
  ]);
  assert.equal(recolored.filter((marker) => marker.symbol === "heart").length, 1);

  assert.deepEqual(upsertMarkerBySymbol([
    { symbol: "star", color: "cyan" },
    { symbol: "star", color: "amber" },
  ], { symbol: "star", color: "green" }), [
    { symbol: "star", color: "green" },
  ]);

  assert.deepEqual(upsertMarkerBySymbol(recolored, { symbol: "diamond", color: "white" }), [
    ...recolored,
    { symbol: "diamond", color: "white" },
  ]);
});

test("duplicated objects keep their source and marker values without sharing marker references", () => {
  const original = {
    id: "object-original",
    sourceId: "source-one",
    type: "image",
    name: "參考圖",
    layerName: "參考圖",
    pivotX: 100,
    pivotY: 80,
    markers: [{ symbol: "heart", color: "pink" }],
  };
  const duplicate = createObjectDuplicate(original, {
    id: "object-copy",
    offset: 28,
    timestamp: "2026-10-17T00:00:00.000Z",
  });

  assert.equal(duplicate.id, "object-copy");
  assert.equal(duplicate.sourceId, original.sourceId);
  assert.deepEqual(duplicate.markers, original.markers);
  assert.notEqual(duplicate.markers, original.markers);
  assert.notEqual(duplicate.markers[0], original.markers[0]);
  duplicate.markers[0].color = "cyan";
  assert.equal(original.markers[0].color, "pink");
  assert.deepEqual([duplicate.pivotX, duplicate.pivotY], [128, 108]);
});

test("artboards wrap the selected visual bounds with predictable padding and paper presets", () => {
  const objects = [
    { id: "a", type: "shape", pivotX: 50, pivotY: 50, width: 100, height: 80, rotation: 0, anchor: "mc" },
    { id: "b", type: "shape", pivotX: 210, pivotY: 80, width: 80, height: 120, rotation: 0, anchor: "mc" },
  ];
  const artboard = createArtboardFromObjects(objects, { padding: 40, id: "paper" });
  assert.equal(artboard.type, "artboard");
  assert.equal(artboard.width, 330);
  assert.equal(artboard.height, 210);
  assert.equal(artboard.pivotX, 125);
  assert.equal(artboard.pivotY, 75);
  assert.equal(artboard.paperPadding, 40);
  assert.equal(artboard.aspectLocked, false);

  const a4Landscape = resizeArtboardToPreset(artboard, "a4", "landscape");
  assert.deepEqual([a4Landscape.width, a4Landscape.height], [1123, 794]);
  assert.equal(a4Landscape.paperPreset, "a4");
});

test("shape parameters normalize safely and generate editable polygon and star geometry", () => {
  const board = ensureBoard({
    schemaVersion: 11,
    objects: [
      { id: "polygon", type: "shape", shapeKind: "polygon", shapeSides: 99, width: 160, height: 160 },
      { id: "star", type: "shape", shapeKind: "star", starPoints: 2, starInnerRatio: 2, width: 160, height: 160 },
      { id: "legacy-star", type: "shape", shapeKind: "star", width: 160, height: 160 },
    ],
  });

  assert.equal(board.schemaVersion, 12);
  assert.equal(board.objects[0].shapeSides, 24);
  assert.equal(board.objects[1].starPoints, 3);
  assert.equal(board.objects[1].starInnerRatio, 0.85);
  assert.equal(board.objects[2].starPoints, 5);
  assert.equal(board.objects[2].starInnerRatio, 0.42);
  assert.equal(shapePolygonPoints({ shapeKind: "polygon", shapeSides: 8 }).length, 8);
  assert.equal(shapePolygonPoints({ shapeKind: "star", starPoints: 7, starInnerRatio: 0.3 }).length, 14);
  assert.match(shapeClipPath({ shapeKind: "star", starPoints: 7, starInnerRatio: 0.3 }), /^polygon\(/);
});

test("shape quick sizes preserve the visible center and original-size recovery values", () => {
  const object = {
    id: "shape",
    type: "shape",
    anchor: "tl",
    pivotX: 140,
    pivotY: 90,
    width: 180,
    height: 120,
    originalWidth: 180,
    originalHeight: 120,
    rotation: 28,
  };
  const before = selectionWorldBounds([object]);
  const resized = resizeObjectToDimensions(object, 794, 1123);
  const after = selectionWorldBounds([resized]);

  assert.deepEqual([resized.width, resized.height], [794, 1123]);
  assert.deepEqual([resized.originalWidth, resized.originalHeight], [180, 120]);
  assert.equal(resized.anchor, "tl");
  assert.ok(Math.abs(before.centerX - after.centerX) < 0.00001);
  assert.ok(Math.abs(before.centerY - after.centerY) < 0.00001);
});

test("grid arrangement keeps every object and creates equal row and column spacing", () => {
  const source = Array.from({ length: 5 }, (_, index) => ({
    id: `object-${index}`,
    type: "shape",
    pivotX: index * 7,
    pivotY: index * 11,
    width: 100,
    height: 60,
    rotation: 0,
    anchor: "mc",
  }));
  const grid = arrangeObjectsInGrid(source, { columns: 3, gapX: 20, gapY: 30, startX: 10, startY: 20 });
  assert.deepEqual(grid.map(({ pivotX, pivotY }) => [pivotX, pivotY]), [
    [60, 50], [180, 50], [300, 50], [60, 140], [180, 140],
  ]);
});

test("semantic groups select together while command-style penetration keeps one object", () => {
  const group = createGroup(["a", "b"], { id: "group-1", name: "Pair" });
  const board = {
    objects: [
      { id: "paper", type: "artboard" },
      { id: "a", type: "shape", groupId: group.id, artboardId: "paper" },
      { id: "b", type: "shape", groupId: group.id, artboardId: "paper" },
    ],
    groups: [group],
  };
  assert.deepEqual(selectionIdsForObject(board, "a"), ["a", "b"]);
  assert.deepEqual(selectionIdsForObject(board, "a", { penetrate: true }), ["a"]);
  assert.deepEqual(selectionIdsForObject(board, "paper"), ["paper", "a", "b"]);

  const compacted = compactBoardStructure({ ...board, objects: board.objects.filter((object) => object.id !== "b") });
  assert.equal(compacted.groups.length, 0);
  assert.equal(compacted.objects.find((object) => object.id === "a").groupId, null);
});

test("source materials collapse duplicate instances into one inspectable source", () => {
  const source = {
    sourceId: "source-one",
    type: "image",
    src: "data:image/png;base64,AA==",
    mime: "image/png",
  };
  const assets = sourceAssetsFromObjects([
    { ...source, id: "first" },
    { ...source, id: "second" },
    { id: "video", sourceId: "source-two", type: "video", src: "data:video/mp4;base64,AA==", mime: "video/mp4" },
    { id: "text", type: "text", src: "" },
  ]);

  assert.equal(assets.length, 2);
  assert.deepEqual(assets[0].instanceIds, ["first", "second"]);
  assert.equal(assets[0].representative.id, "first");
  assert.deepEqual(assets[1].instanceIds, ["video"]);
});

test("export scopes divide selected and unselected objects", () => {
  const objects = [{ id: "a" }, { id: "b" }, { id: "c" }];
  assert.deepEqual(objectsForExport(objects, ["b"], "selected").map((item) => item.id), ["b"]);
  assert.deepEqual(objectsForExport(objects, ["b"], "unselected").map((item) => item.id), ["a", "c"]);
  assert.equal(objectsForExport(objects, ["b"], "all").length, 3);
});

test("file names are safe for local export", () => {
  assert.equal(safeFilename('  Hero / cover: 01?  '), "Hero - cover- 01-");
  assert.equal(safeFilename(""), "moodboard-object");
});

test("composition output formats keep explicit file and MIME mappings", () => {
  assert.deepEqual(compositionOutputFormat("webp"), { extension: "webp", label: "WebP", mime: "image/webp" });
  assert.deepEqual(compositionOutputFormat("avif"), { extension: "avif", label: "AVIF", mime: "image/avif" });
  assert.equal(compositionOutputFormat("unknown").extension, "png");
});

test("composition size preserves proportions and caps unsafe canvas dimensions", () => {
  const regular = planCompositionSize(640, 360, 2);
  assert.deepEqual([regular.pixelWidth, regular.pixelHeight, regular.reduced], [1280, 720, false]);

  const capped = planCompositionSize(20000, 10000, 2);
  assert.equal(capped.reduced, true);
  assert.ok(capped.pixelWidth <= 8192);
  assert.ok(capped.pixelHeight <= 8192);
  assert.ok(capped.pixelWidth * capped.pixelHeight <= 32 * 1024 * 1024);
  assert.ok(Math.abs(capped.pixelWidth / capped.pixelHeight - 2) < 0.001);
});

test("PDF output embeds one JPEG composition with the requested page ratio", () => {
  const pdf = buildImagePdf(new Uint8Array([0xff, 0xd8, 0xff, 0xd9]), 800, 400);
  const text = new TextDecoder("latin1").decode(pdf);
  assert.ok(text.startsWith("%PDF-1.4"));
  assert.match(text, /\/Subtype \/Image \/Width 800 \/Height 400/);
  assert.match(text, /\/MediaBox \[0 0 600 300\]/);
  assert.match(text, /xref\n0 6/);
  assert.ok(text.endsWith("%%EOF\n"));
});

test("import validation rejects unrelated JSON and normalizes valid boards", () => {
  assert.throws(() => ensureBoard({ hello: "world" }), /不是有效/);
  const board = ensureBoard({ schemaVersion: 1, name: "測試", objects: [] });
  assert.equal(board.name, "測試");
  assert.equal(board.objects.length, 0);
});

test("workspace guides persist in moodboard files and legacy boards receive an empty set", () => {
  const legacy = ensureBoard({ schemaVersion: 10, name: "舊檔", objects: [] });
  assert.deepEqual(legacy.guides, []);

  const board = ensureBoard({
    schemaVersion: 11,
    name: "導引線測試",
    objects: [],
    guides: [
      { id: "guide-x", axis: "x", position: 128.5 },
      { id: "guide-y", axis: "y", position: 240 },
      { id: "guide-invalid", axis: "diagonal", position: "bad" },
    ],
  });

  assert.deepEqual(board.guides, [
    { id: "guide-x", axis: "x", position: 128.5 },
    { id: "guide-y", axis: "y", position: 240 },
    { id: "guide-invalid", axis: "y", position: 0 },
  ]);
});

test("legacy objects gain a stable original size and can restore it", () => {
  const board = ensureBoard({
    schemaVersion: 1,
    name: "舊檔",
    objects: [{ src: "data:image/png;base64,AA==", width: 320, height: 180 }],
  });
  const resized = { ...board.objects[0], width: 640, height: 360 };
  const restored = restoreObjectSize(resized);
  assert.equal(board.schemaVersion, 12);
  assert.deepEqual(
    [board.objects[0].tiltX, board.objects[0].tiltY, board.objects[0].depth, board.objects[0].perspective],
    [0, 0, 0, 1000],
  );
  assert.equal(board.objects[0].videoControlsVisible, true);
  assert.deepEqual([restored.width, restored.height], [320, 180]);
});

test("linked text frames preserve their story, visible segment, and overflow state", () => {
  const board = ensureBoard({
    schemaVersion: 6,
    objects: [{
      id: "linked-text",
      type: "text",
      text: "這是一段完整文字",
      textFlowId: "story-one",
      textFlowOrder: 2,
      flowText: "這是一段",
      textFlowOverflow: true,
      width: 180,
      height: 80,
    }],
  });
  const object = board.objects[0];

  assert.equal(board.schemaVersion, 12);
  assert.equal(object.text, "這是一段完整文字");
  assert.equal(object.textFlowId, "story-one");
  assert.equal(object.textFlowOrder, 2);
  assert.equal(object.flowText, "這是一段");
  assert.equal(object.textFlowOverflow, true);
});

test("text alignment defaults are stable and supported values survive normalization", () => {
  const board = ensureBoard({
    schemaVersion: 7,
    objects: [
      { id: "default-text", type: "text", text: "預設", width: 180, height: 80 },
      {
        id: "aligned-text",
        type: "text",
        text: "完整設定",
        textAlign: "justify",
        textAlignLast: "right",
        textVerticalAlign: "middle",
        width: 180,
        height: 80,
      },
      {
        id: "invalid-text",
        type: "text",
        text: "無效設定",
        textAlign: "diagonal",
        textAlignLast: "stretch",
        textVerticalAlign: "floating",
        width: 180,
        height: 80,
      },
    ],
  });

  assert.deepEqual(
    [board.objects[0].textAlign, board.objects[0].textAlignLast, board.objects[0].textVerticalAlign],
    ["left", "left", "top"],
  );
  assert.deepEqual(
    [board.objects[1].textAlign, board.objects[1].textAlignLast, board.objects[1].textVerticalAlign],
    ["justify", "right", "middle"],
  );
  assert.deepEqual(
    [board.objects[2].textAlign, board.objects[2].textAlignLast, board.objects[2].textVerticalAlign],
    ["left", "left", "top"],
  );
});

test("view captures restore composition and order without removing newer objects", () => {
  const first = {
    id: "first",
    src: "data:image/png;base64,AA==",
    pivotX: 100,
    pivotY: 80,
    width: 200,
    height: 120,
    rotation: 15,
    anchor: "mc",
    visible: true,
  };
  const second = { ...first, id: "second", pivotX: 360, rotation: -8 };
  const board = ensureBoard({ schemaVersion: 2, objects: [first, second] });
  const capture = createViewCapture(board, { x: 24, y: -18, zoom: 1.25 }, { width: 900, height: 600 });
  const changed = {
    ...board,
    objects: [
      { ...board.objects[1], pivotX: 900, rotation: 90 },
      { ...board.objects[0], width: 40, height: 40 },
      { ...board.objects[0], id: "newer", pivotX: 700 },
    ],
  };
  const restored = restoreViewCapture(changed, capture);

  assert.deepEqual(restored.objects.map((object) => object.id), ["first", "second", "newer"]);
  assert.deepEqual(
    restored.objects.slice(0, 2).map(({ pivotX, width, rotation }) => ({ pivotX, width, rotation })),
    [
      { pivotX: 100, width: 200, rotation: 15 },
      { pivotX: 360, width: 200, rotation: -8 },
    ],
  );
  assert.equal(restored.objects[2].pivotX, 700);
  assert.deepEqual(capture.view, { x: 24, y: -18, zoom: 1.25 });
  assert.deepEqual(capture.viewport, { width: 900, height: 600 });
});

test("object deletion impact conservatively finds legacy compositions that reference the targets", () => {
  const board = {
    captures: [
      { id: "one", name: "構圖 01", objects: [{ id: "first" }, { id: "second" }] },
      { id: "two", name: "構圖 02", objects: [{ id: "third" }] },
      { id: "legacy", name: "舊構圖" },
    ],
    lastComposition: { id: "return", name: "切換前的構圖", objects: [{ id: "second" }] },
  };

  assert.deepEqual(
    findCompositionsAffectedByObjectDeletion(board, ["second", "missing"]).map((composition) => composition.id),
    ["one", "return"],
  );
  assert.deepEqual(findCompositionsAffectedByObjectDeletion(board, []), []);
});

test("object deletion warns only when a captured object is visibly inside the composition viewport", () => {
  const objectState = (overrides = {}) => ({
    id: "target",
    pivotX: 100,
    pivotY: 100,
    width: 120,
    height: 80,
    rotation: 0,
    anchor: "tl",
    visible: true,
    ...overrides,
  });
  const capture = (id, object, overrides = {}) => ({
    id,
    name: id,
    view: { x: 0, y: 0, zoom: 1 },
    viewport: { width: 500, height: 400 },
    objects: [object],
    ...overrides,
  });
  const board = {
    captures: [
      capture("visible", objectState()),
      capture("hidden", objectState({ visible: false })),
      capture("outside", objectState({ pivotX: 700 })),
      capture("edge-only", objectState({ pivotX: 500 })),
      capture("unrelated", { ...objectState(), id: "other" }),
    ],
    lastComposition: capture("partial", objectState({ pivotX: 480 })),
  };

  assert.deepEqual(
    findCompositionsAffectedByObjectDeletion(board, ["target"]).map((composition) => composition.id),
    ["visible", "partial"],
  );
});

test("object deletion impact respects a composition's saved pan and zoom", () => {
  const board = {
    captures: [{
      id: "panned",
      name: "平移後構圖",
      view: { x: -1000, y: -500, zoom: 2 },
      viewport: { width: 800, height: 600 },
      objects: [
        { id: "inside", pivotX: 600, pivotY: 300, width: 100, height: 100, anchor: "tl", visible: true },
        { id: "outside", pivotX: 100, pivotY: 100, width: 100, height: 100, anchor: "tl", visible: true },
      ],
    }],
  };

  assert.deepEqual(
    findCompositionsAffectedByObjectDeletion(board, ["inside"]).map((composition) => composition.id),
    ["panned"],
  );
  assert.deepEqual(findCompositionsAffectedByObjectDeletion(board, ["outside"]), []);
});

test("object deletion impact uses the rotated object shape instead of only its outer bounds", () => {
  const capturedObject = (id, pivotX, pivotY) => ({
    id,
    pivotX,
    pivotY,
    width: 40,
    height: 40,
    rotation: 45,
    anchor: "mc",
    visible: true,
  });
  const board = {
    captures: [{
      id: "rotated",
      name: "旋轉物件構圖",
      view: { x: 0, y: 0, zoom: 1 },
      viewport: { width: 100, height: 100 },
      objects: [
        capturedObject("bounds-only", 120, 120),
        capturedObject("visible-corner", 112, 112),
      ],
    }],
  };

  assert.deepEqual(findCompositionsAffectedByObjectDeletion(board, ["bounds-only"]), []);
  assert.deepEqual(
    findCompositionsAffectedByObjectDeletion(board, ["visible-corner"]).map((composition) => composition.id),
    ["rotated"],
  );
});

test("view captures preserve and restore micro 3D values", () => {
  const board = ensureBoard({
    schemaVersion: 5,
    objects: [{
      id: "tilted",
      src: "data:image/png;base64,AA==",
      pivotX: 100,
      pivotY: 80,
      width: 200,
      height: 120,
      rotation: 0,
      tiltX: 8,
      tiltY: -16,
      depth: 24,
      perspective: 900,
      videoControlsVisible: false,
      anchor: "mc",
    }],
  });
  const capture = createViewCapture(board, { x: 0, y: 0, zoom: 1 }, { width: 800, height: 600 });
  const changed = { ...board, objects: [{ ...board.objects[0], tiltX: 0, tiltY: 0, depth: 0, perspective: 1400, videoControlsVisible: true }] };
  const restored = restoreViewCapture(changed, capture);

  assert.deepEqual(
    [restored.objects[0].tiltX, restored.objects[0].tiltY, restored.objects[0].depth, restored.objects[0].perspective],
    [8, -16, 24, 900],
  );
  assert.equal(restored.objects[0].videoControlsVisible, false);
});

test("micro 3D projection changes visible bounds while keeping the pivot stable", () => {
  const flat = { anchor: "mc", pivotX: 200, pivotY: 160, width: 240, height: 120, rotation: 0 };
  const projected = { ...flat, tiltY: 20, depth: 36, perspective: 900 };
  const flatBounds = selectionWorldBounds([flat]);
  const projectedBounds = selectionWorldBounds([projected]);

  assert.ok(projectedBounds.width !== flatBounds.width);
  assert.ok(Math.abs(projectedBounds.centerX - flat.pivotX) < 8);
  assert.ok(Math.abs(projectedBounds.centerY - flat.pivotY) < 8);
});

test("replacing a view capture keeps its identity and creation date", () => {
  const board = ensureBoard({ schemaVersion: 3, objects: [] });
  const first = createViewCapture(board, { x: 0, y: 0, zoom: 1 }, { width: 800, height: 600 });
  const replacement = createViewCapture(board, { x: 50, y: 20, zoom: 2 }, { width: 400, height: 300 }, first);
  assert.equal(replacement.id, first.id);
  assert.equal(replacement.name, first.name);
  assert.equal(replacement.createdAt, first.createdAt);
  assert.deepEqual(replacement.view, { x: 50, y: 20, zoom: 2 });
});

test("the last composition survives file normalization as a dedicated recovery slot", () => {
  const board = ensureBoard({
    schemaVersion: 5,
    objects: [],
    lastComposition: {
      id: "previous-composition",
      name: "任意舊名稱",
      view: { x: 80, y: -45, zoom: 1.4 },
      viewport: { width: 900, height: 600 },
      objects: [],
    },
  });

  assert.equal(board.schemaVersion, 12);
  assert.equal(board.lastComposition.id, "previous-composition");
  assert.equal(board.lastComposition.name, "切換前的構圖");
  assert.deepEqual(board.lastComposition.view, { x: 80, y: -45, zoom: 1.4 });
});

test("compositions use the new name and reorder by their visible list", () => {
  const board = ensureBoard({
    schemaVersion: 4,
    objects: [],
    captures: [
      { id: "oldest", name: "畫面 01" },
      { id: "middle", name: "構圖 02" },
      { id: "newest", name: "構圖 03" },
    ],
  });
  const next = createViewCapture(board, { x: 0, y: 0, zoom: 1 }, { width: 800, height: 600 });

  assert.equal(board.captures[0].name, "構圖 01");
  assert.equal(next.name, "構圖 04");
  assert.deepEqual(
    reorderCapturesByVisualDrop(board.captures, "oldest", "newest", "before").map((capture) => capture.id),
    ["middle", "newest", "oldest"],
  );
});

test("shift rotation snaps to the requested fixed deltas", () => {
  assert.equal(snapRotationDelta(28), 30);
  assert.equal(snapRotationDelta(52), 45);
  assert.equal(snapRotationDelta(83), 90);
  assert.equal(snapRotationDelta(171), 180);
  assert.equal(snapRotationDelta(-113), -120);
});

test("marquee intersection includes rotated object bounds", () => {
  const object = { anchor: "mc", pivotX: 100, pivotY: 100, width: 80, height: 40, rotation: 45 };
  assert.equal(objectIntersectsWorldRect(object, { left: 90, top: 90, right: 110, bottom: 110 }), true);
  assert.equal(objectIntersectsWorldRect(object, { left: 200, top: 200, right: 240, bottom: 240 }), false);
});

test("locating an object centers its rotated bounds and fits it inside the viewport", () => {
  const object = { anchor: "br", pivotX: 900, pivotY: -320, width: 640, height: 360, rotation: 30 };
  const viewport = { width: 900, height: 600 };
  const view = viewObjectInViewport(object, viewport);
  const screenCorners = objectWorldCorners(object).map((point) => ({
    x: view.x + point.x * view.zoom,
    y: view.y + point.y * view.zoom,
  }));
  const centerX = (Math.min(...screenCorners.map((point) => point.x)) + Math.max(...screenCorners.map((point) => point.x))) / 2;
  const centerY = (Math.min(...screenCorners.map((point) => point.y)) + Math.max(...screenCorners.map((point) => point.y))) / 2;

  assert.ok(Math.abs(centerX - viewport.width / 2) < 0.00001);
  assert.ok(Math.abs(centerY - viewport.height / 2) < 0.00001);
  assert.ok(Math.min(...screenCorners.map((point) => point.x)) >= 72 - 0.00001);
  assert.ok(Math.max(...screenCorners.map((point) => point.x)) <= viewport.width - 72 + 0.00001);
  assert.ok(Math.min(...screenCorners.map((point) => point.y)) >= 72 - 0.00001);
  assert.ok(Math.max(...screenCorners.map((point) => point.y)) <= viewport.height - 72 + 0.00001);
});

test("selection actions follow the visible selection edge and disappear when selection is offscreen", () => {
  const bounds = { left: 100, top: 80, width: 200, height: 120 };
  const viewport = { width: 500, height: 400 };

  assert.deepEqual(
    selectionActionAnchorInViewport(bounds, { x: 0, y: 0, zoom: 1 }, viewport),
    { x: 310, y: 80 },
  );
  assert.deepEqual(
    selectionActionAnchorInViewport(bounds, { x: -250, y: 0, zoom: 1 }, viewport),
    { x: 60, y: 80 },
  );
  assert.deepEqual(
    selectionActionAnchorInViewport(bounds, { x: 250, y: 0, zoom: 1 }, viewport),
    { x: 510, y: 80 },
  );
  assert.equal(selectionActionAnchorInViewport(bounds, { x: -500, y: 0, zoom: 1 }, viewport), null);
  assert.equal(selectionActionAnchorInViewport(bounds, { x: 0, y: -300, zoom: 1 }, viewport), null);
  assert.equal(selectionActionAnchorInViewport(bounds, { x: 0, y: 0, zoom: 1 }, { width: 0, height: 0 }), null);
});

test("layer drag ordering follows the visible top-to-bottom list", () => {
  const objects = [{ id: "bottom" }, { id: "middle" }, { id: "top" }];
  assert.deepEqual(
    reorderObjectsByVisualDrop(objects, "bottom", "top", "before").map((object) => object.id),
    ["middle", "top", "bottom"],
  );
  assert.deepEqual(
    reorderObjectsByVisualDrop(objects, "top", "bottom", "after").map((object) => object.id),
    ["top", "bottom", "middle"],
  );
});

test("multi-selection scales every object around the chosen group anchor", () => {
  const objects = [
    { id: "a", anchor: "mc", pivotX: 100, pivotY: 100, width: 80, height: 40, rotation: 0 },
    { id: "b", anchor: "mc", pivotX: 300, pivotY: 180, width: 120, height: 60, rotation: 20 },
  ];
  const bounds = selectionWorldBounds(objects);
  const pivot = boundsAnchorPoint(bounds, "tl");
  const scaled = scaleObjectsAroundPoint(objects, ["a", "b"], pivot, 1.5);

  assert.equal(scaled[0].width, 120);
  assert.equal(scaled[1].height, 90);
  assert.ok(Math.abs(scaled[0].pivotX - (pivot.x + (100 - pivot.x) * 1.5)) < 0.00001);
  assert.ok(Math.abs(scaled[1].pivotY - (pivot.y + (180 - pivot.y) * 1.5)) < 0.00001);
});

test("text and shape objects survive normalization without media sources", () => {
  const board = ensureBoard({
    schemaVersion: 4,
    objects: [
      { id: "text", type: "text", text: "標題", width: 240, height: 80, fontSize: 36 },
      { id: "shape", type: "shape", shapeKind: "star", width: 120, height: 120, fill: "#ff0000" },
    ],
  });

  assert.deepEqual(board.objects.map((object) => object.type), ["text", "shape"]);
  assert.equal(board.objects[0].aspectLocked, true);
  assert.equal(board.objects[0].text, "標題");
  assert.equal(board.objects[1].shapeKind, "star");
});

test("eight-point resize keeps the opposite edge fixed and locks aspect by default", () => {
  const object = {
    id: "object",
    type: "image",
    anchor: "mc",
    pivotX: 100,
    pivotY: 100,
    width: 100,
    height: 80,
    rotation: 0,
  };
  const resized = resizeObjectFromHandle(object, "e", { x: 150, y: 100 }, { x: 200, y: 100 });

  assert.deepEqual([resized.width, resized.height], [150, 120]);
  assert.deepEqual([resized.pivotX, resized.pivotY], [125, 100]);
  assert.equal(objectWorldCorners(resized)[0].x, 50);
});

test("shift-style free resize changes only the dragged edge axis", () => {
  const object = {
    id: "object",
    type: "image",
    anchor: "mc",
    pivotX: 100,
    pivotY: 100,
    width: 100,
    height: 80,
    rotation: 0,
  };
  const resized = resizeObjectFromHandle(
    object,
    "e",
    { x: 150, y: 100 },
    { x: 200, y: 100 },
    { preserveAspect: false },
  );

  assert.deepEqual([resized.width, resized.height], [150, 80]);
  assert.deepEqual([resized.pivotX, resized.pivotY], [125, 100]);
});

test("option-style resize mirrors around the object center", () => {
  const object = {
    id: "object",
    type: "text",
    anchor: "mc",
    pivotX: 100,
    pivotY: 100,
    width: 100,
    height: 80,
    fontSize: 20,
    rotation: 0,
  };
  const resized = resizeObjectFromHandle(
    object,
    "e",
    { x: 150, y: 100 },
    { x: 200, y: 100 },
    { fromCenter: true },
  );

  assert.deepEqual([resized.width, resized.height], [200, 160]);
  assert.deepEqual([resized.pivotX, resized.pivotY], [100, 100]);
  assert.equal(resized.fontSize, 40);
});

test("text-frame resize changes reflow bounds without scaling the font", () => {
  const object = {
    id: "text",
    type: "text",
    anchor: "mc",
    pivotX: 100,
    pivotY: 100,
    width: 100,
    height: 80,
    fontSize: 20,
    rotation: 0,
  };
  const resized = resizeObjectFromHandle(
    object,
    "e",
    { x: 150, y: 100 },
    { x: 200, y: 100 },
    { preserveAspect: false, scaleText: false },
  );

  assert.deepEqual([resized.width, resized.height], [150, 80]);
  assert.equal(resized.fontSize, 20);
});

test("text content dimensions keep the opposite edge and font size stable", () => {
  const object = {
    id: "text",
    type: "text",
    anchor: "mc",
    pivotX: 180,
    pivotY: 140,
    width: 160,
    height: 96,
    fontSize: 24,
    rotation: 28,
  };
  const before = objectWorldCorners(object);
  const wider = resizeTextFrameToDimension(object, "width", 260);
  const taller = resizeTextFrameToDimension(wider, "height", 180);
  const widerCorners = objectWorldCorners(wider);
  const tallerCorners = objectWorldCorners(taller);

  assert.equal(wider.width, 260);
  assert.equal(wider.height, 96);
  assert.equal(wider.fontSize, 24);
  assert.ok(Math.abs(widerCorners[0].x - before[0].x) < 0.00001);
  assert.ok(Math.abs(widerCorners[0].y - before[0].y) < 0.00001);
  assert.ok(Math.abs(widerCorners[3].x - before[3].x) < 0.00001);
  assert.ok(Math.abs(widerCorners[3].y - before[3].y) < 0.00001);
  assert.equal(taller.width, 260);
  assert.equal(taller.height, 180);
  assert.equal(taller.fontSize, 24);
  assert.ok(Math.abs(tallerCorners[0].x - widerCorners[0].x) < 0.00001);
  assert.ok(Math.abs(tallerCorners[0].y - widerCorners[0].y) < 0.00001);
  assert.ok(Math.abs(tallerCorners[1].x - widerCorners[1].x) < 0.00001);
  assert.ok(Math.abs(tallerCorners[1].y - widerCorners[1].y) < 0.00001);
});

test("group resize supports unlocked independent axes around the opposite corner", () => {
  const objects = [
    { id: "a", type: "image", anchor: "mc", pivotX: 50, pivotY: 50, width: 40, height: 40, rotation: 0 },
    { id: "b", type: "image", anchor: "mc", pivotX: 150, pivotY: 100, width: 40, height: 40, rotation: 0 },
  ];
  const bounds = selectionWorldBounds(objects);
  const resized = resizeObjectsFromHandle(
    objects,
    ["a", "b"],
    bounds,
    "se",
    { x: bounds.right, y: bounds.bottom },
    { x: bounds.right + bounds.width, y: bounds.bottom + bounds.height / 2 },
    { preserveAspect: false },
  );

  assert.equal(resized[0].width, 80);
  assert.equal(resized[0].height, 60);
  assert.equal(objectWorldCorners(resized[0])[0].x, bounds.left);
  assert.equal(objectWorldCorners(resized[0])[0].y, bounds.top);
});

test("multi-selection rotates positions and object angles around one pivot", () => {
  const objects = [
    { id: "a", anchor: "mc", pivotX: 100, pivotY: 0, width: 80, height: 40, rotation: 10 },
    { id: "b", anchor: "mc", pivotX: 0, pivotY: 100, width: 60, height: 60, rotation: -20 },
  ];
  const rotated = rotateObjectsAroundPoint(objects, ["a", "b"], { x: 0, y: 0 }, 90);

  assert.ok(Math.abs(rotated[0].pivotX) < 0.00001);
  assert.ok(Math.abs(rotated[0].pivotY - 100) < 0.00001);
  assert.ok(Math.abs(rotated[1].pivotX + 100) < 0.00001);
  assert.ok(Math.abs(rotated[1].pivotY) < 0.00001);
  assert.deepEqual(rotated.map((object) => object.rotation), [100, 70]);
});

test("alignment keeps the key object fixed and aligns rotated visual bounds", () => {
  const objects = [
    { id: "key", anchor: "mc", pivotX: 100, pivotY: 100, width: 100, height: 60, rotation: 0 },
    { id: "other", anchor: "mc", pivotX: 320, pivotY: 180, width: 80, height: 80, rotation: 45 },
  ];
  const aligned = alignObjectsToKey(objects, ["key", "other"], "key", "left");
  const keyBounds = selectionWorldBounds([aligned[0]]);
  const otherBounds = selectionWorldBounds([aligned[1]]);

  assert.equal(aligned[0].pivotX, 100);
  assert.ok(Math.abs(keyBounds.left - otherBounds.left) < 0.00001);
});

test("distribution creates equal visual gaps while the key object stays fixed", () => {
  const objects = [
    { id: "a", anchor: "mc", pivotX: 50, pivotY: 50, width: 40, height: 40, rotation: 0 },
    { id: "key", anchor: "mc", pivotX: 180, pivotY: 50, width: 60, height: 40, rotation: 0 },
    { id: "c", anchor: "mc", pivotX: 420, pivotY: 50, width: 80, height: 40, rotation: 0 },
  ];
  const distributed = distributeObjectsByGap(objects, ["a", "key", "c"], "key", "horizontal");
  const bounds = distributed.map((object) => selectionWorldBounds([object]));
  const firstGap = bounds[1].left - bounds[0].right;
  const secondGap = bounds[2].left - bounds[1].right;

  assert.equal(distributed[1].pivotX, 180);
  assert.ok(Math.abs(firstGap - secondGap) < 0.00001);
});

test("portable HTML is a self-contained, script-safe, read-only browser view", () => {
  const html = createPortableHtml({
    name: '測試 </title><script>alert("x")</script>',
    view: { x: 24, y: -12, zoom: 0.8 },
    objects: [
      {
        id: "image",
        name: "圖片",
        mime: "image/png",
        src: "data:image/png;base64,AA==",
        pivotX: 100,
        pivotY: 80,
        width: 200,
        height: 120,
        rotation: 12,
        tiltX: 6,
        tiltY: -14,
        depth: 18,
        perspective: 900,
        anchor: "mc",
        visible: true,
        markers: [{ symbol: "heart", color: "pink" }],
      },
      {
        id: "video",
        name: "影片",
        mime: "video/mp4",
        src: "data:video/mp4;base64,AA==",
        pivotX: 360,
        pivotY: 80,
        width: 240,
        height: 135,
        rotation: 0,
        anchor: "mc",
        visible: true,
        markers: [],
      },
      {
        id: "hidden",
        name: "不可外流的隱藏素材",
        mime: "image/png",
        src: "data:image/png;base64,SECRET==",
        visible: false,
        markers: [],
      },
      {
        id: "text",
        type: "text",
        name: "標題",
        text: "Mood board 文字－未配置到此框的尾段",
        textFlowId: "portable-story",
        textFlowOrder: 0,
        flowText: "Mood board 文字",
        textFlowOverflow: true,
        fontFamily: "sans-serif",
        fontWeight: "700",
        fontSize: 42,
        color: "#ffffff",
        textAlign: "justify",
        textAlignLast: "center",
        textVerticalAlign: "bottom",
        pivotX: 120,
        pivotY: 260,
        width: 320,
        height: 100,
        rotation: 0,
        anchor: "mc",
        visible: true,
        markers: [],
      },
      {
        id: "shape",
        type: "shape",
        name: "星形",
        shapeKind: "star",
        starPoints: 9,
        starInnerRatio: 0.28,
        fill: "#58e6ff",
        pivotX: 420,
        pivotY: 260,
        width: 160,
        height: 160,
        rotation: 0,
        anchor: "mc",
        visible: true,
        markers: [],
      },
    ],
    captures: [{ id: "private-capture", name: "內部版本" }],
    lastSourceId: "private-session-id",
  });

  assert.match(html, /^<!doctype html>/);
  assert.match(html, /單檔離線瀏覽版（唯讀）/);
  assert.match(html, /data:image\/png;base64,AA==/);
  assert.match(html, /data:video\/mp4;base64,AA==/);
  assert.match(html, /rotateX\(/);
  assert.match(html, /media\.controls = true/);
  assert.match(html, /Mood board 文字/);
  assert.doesNotMatch(html, /未配置到此框的尾段/);
  assert.match(html, /"textAlign":"justify"/);
  assert.match(html, /"textAlignLast":"center"/);
  assert.match(html, /"textVerticalAlign":"bottom"/);
  assert.match(html, /text\.style\.justifyContent/);
  assert.match(html, /"type":"shape"/);
  assert.match(html, /"starPoints":9/);
  assert.match(html, /"starInnerRatio":0\.28/);
  assert.match(html, /"shapeClipPath":"polygon\(/);
  assert.match(html, /\\u003c\/script>/);
  assert.doesNotMatch(html, /<script>alert/);
  assert.doesNotMatch(html, /https?:\/\//);
  assert.doesNotMatch(html, /不可外流|SECRET|private-capture|private-session-id/);
});

test("portable browser views use the selected interface locale without translating board content", () => {
  const board = {
    name: "我的靈感",
    view: { x: 0, y: 0, zoom: 1 },
    objects: [{
      id: "text",
      type: "text",
      name: "使用者標題",
      text: "不可翻譯的文字",
      pivotX: 0,
      pivotY: 0,
      width: 200,
      height: 80,
      rotation: 0,
      anchor: "mc",
      visible: true,
      markers: [],
    }],
  };
  const english = createPortableHtml(board, { locale: "en" });
  const simplified = createPortableHtml(board, { locale: "zh-Hans" });

  assert.match(english, /<html lang="en">/);
  assert.match(english, /Single-file offline browser copy \(read only\)/);
  assert.match(english, /不可翻譯的文字/);
  assert.match(simplified, /<html lang="zh-Hans">/);
  assert.match(simplified, /单文件离线浏览版/);
  assert.match(simplified, /不可翻譯的文字/);
});
