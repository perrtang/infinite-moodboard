import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AlignCenter,
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignHorizontalSpaceBetween,
  AlignJustify,
  AlignLeft,
  AlignRight,
  AlignStartHorizontal,
  AlignStartVertical,
  AlignVerticalSpaceBetween,
  AlertTriangle,
  ArrowLeft,
  Box,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Cloud,
  CloudOff,
  CloudUpload,
  Copy,
  Diamond,
  Download,
  Ellipsis,
  Eye,
  EyeOff,
  ExternalLink,
  FileArchive,
  FileCode2,
  FileUp,
  Flag,
  FolderOpen,
  GripVertical,
  Hand,
  HardDrive,
  Heart,
  History,
  Hexagon,
  Image as ImageIcon,
  ImageDown,
  ImagePlus,
  Images,
  Info,
  Languages,
  LayoutGrid,
  Layers3,
  Keyboard,
  ListFilter,
  LocateFixed,
  Lock,
  LogOut,
  Mail,
  Maximize2,
  Minimize2,
  Moon,
  MousePointer2,
  Palette,
  PanelLeft,
  PanelRight,
  Pause,
  Play,
  Plus,
  RectangleHorizontal,
  Redo2,
  RefreshCw,
  Ruler,
  RotateCcw,
  RotateCcwSquare,
  RotateCw,
  Save,
  Scaling,
  Search,
  Settings as SettingsIcon,
  Share2,
  ShieldCheck,
  Shapes,
  SlidersHorizontal,
  Sparkles,
  Square,
  Star,
  Sun,
  Tags,
  Triangle,
  Trash2,
  Type,
  Undo2,
  Unlock,
  UserRound,
  Users,
  Video,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  ANCHORS,
  ANNOTATION_POSITIONS,
  DEFAULT_TEXT_FONT,
  MARKER_COLORS,
  MARKER_SYMBOLS,
  PAPER_PRESETS,
  RESIZE_HANDLES,
  TEXT_ALIGNMENTS,
  TEXT_LAST_ALIGNMENTS,
  TEXT_VERTICAL_ALIGNMENTS,
  alignObjectsToKey,
  arrangeObjectsInGrid,
  boundsAnchorPoint,
  compactBoardStructure,
  createArtboardFromObjects,
  createBoard,
  createGroup,
  createId,
  createObjectDuplicate,
  createViewCapture,
  distributeObjectsByGap,
  ensureBoard,
  findCompositionsAffectedByObjectDeletion,
  markerKey,
  matchesFilters,
  movePivotPreservingPlacement,
  objectIntersectsWorldRect,
  objectLocalPointToWorld,
  objectWorldCorners,
  objectsForExport,
  reorderCapturesByVisualDrop,
  reorderObjectsByVisualDrop,
  resizeArtboardToPreset,
  resizeObjectToDimensions,
  restoreObjectSize,
  restoreViewCapture,
  resizeObjectFromHandle,
  resizeObjectsFromHandle,
  resizePivotAnchor,
  resizeTextFrameToDimension,
  resizeTransformFromHandle,
  rotateObjectsAroundPoint,
  safeFilename,
  shapeClipPath,
  shapePolygonPoints,
  selectionActionAnchorInViewport,
  selectionIdsForObject,
  selectionWorldBounds,
  snapRotationDelta,
  sourceAssetsFromObjects,
  stampBoard,
  upsertMarkerBySymbol,
  viewObjectInViewport,
} from "./model.js";
import { createPortableHtml } from "./portable.js";
import {
  buildImagePdf,
  compositionOutputFormat,
  planCompositionSize,
} from "./output.js";
import { mergeMoodboardLibrary } from "./library.js";
import { createRecoveredMoodboard, describeDriveConflict } from "./versioning.js";
import {
  clearLocalMoodboardData,
  enqueueSync,
  getLocalLibrarySummary,
  getSyncJob,
  listLocalBoards,
  listSyncJobs,
  loadCurrentBoard,
  listVersions,
  removeSyncJob,
  saveCurrentBoard,
  saveVersion,
  updateSyncJob,
} from "./storage.js";
import {
  DriveApiError,
  DriveConflictError,
  contentByteLength,
  downloadGoogleDriveMoodboard,
  driveErrorMessage,
  ensureGoogleDriveFolder,
  evaluateDriveQuota,
  getGoogleDriveAbout,
  getGoogleDriveFile,
  isGoogleDriveAuthorizationError,
  isGoogleDriveConfigured,
  isGoogleDriveTokenUsable,
  linkDriveFile,
  listGoogleDriveRevisions,
  listGoogleDriveMoodboards,
  loadDriveState,
  requestGoogleDriveToken,
  saveDriveState,
  serializeMoodboardSnapshot,
  uploadGoogleDriveMoodboard,
} from "./drive-storage.js";
import {
  completeMoodboardEmailSignInLink,
  isMoodboardEmailSignInLink,
  linkMoodboardFacebook,
  linkMoodboardGoogle,
  moodboardAuthPreviewUser,
  observeMoodboardSession,
  pendingMoodboardEmailSignIn,
  sendMoodboardEmailSignInLink,
  signInMoodboardWithGoogle,
  signOutMoodboardSession,
} from "./auth.js";
import {
  clearCollaborationResume,
  collaborationRoleLabel,
  loadCollaborationResume,
  normalizeCollaborationInvite,
  saveCollaborationResume,
} from "./collaboration.js";
import { clearCollaborationQueue } from "./collaboration-queue.js";
import {
  collaborationErrorMessage,
  createMoodboardCollaborationRoom,
  joinMoodboardCollaborationInvite,
  resumeMoodboardCollaborationRoom,
} from "./collaboration-firestore.js";
import {
  PETFASHION_ACCOUNT_URL,
  PETFASHION_PRIVACY_URL,
  PETFASHION_TERMS_URL,
  accountDisplayName,
  accountInitials,
  accountProviderLabel,
  getMoodboardAccessReceipt,
  hasMoodboardAccessConsent,
  isMoodboardIdentityEligible,
  moodboardAuthErrorMessage,
  saveMoodboardAccessConsent,
  saveMoodboardMarketingPreference,
} from "./auth-policy.js";
import {
  cleanMoodboardEmailActionUrl,
  emailActionContextFromUrl,
  moodboardProviderStates,
} from "./email-auth-state.js";
import {
  ACTIVE_THEME_STORAGE_KEY,
  BUILT_IN_THEMES,
  DEFAULT_INTERFACE_THEME_ID,
  THEME_STORAGE_KEY,
  interfaceThemeCssVariables,
  interfaceThemeMode,
  normalizeInterfaceTheme,
  parseInterfaceThemeFile,
  serializeInterfaceTheme,
} from "./theme.js";
import {
  CANVAS_BACKGROUND_STORAGE_KEY,
  DEFAULT_CANVAS_BACKGROUND,
  DEFAULT_INTERFACE_TYPOGRAPHY,
  UI_FONT_FAMILY_PRESETS,
  UI_FONT_SIZE_PRESETS,
  UI_TYPOGRAPHY_STORAGE_KEY,
  changeCanvasBackgroundMode,
  interfaceTypographyCssVariables,
  normalizeCanvasBackground,
  normalizeInterfaceTypography,
  resolveInterfaceTypography,
  toggleCanvasBackgroundVisibility,
} from "./ui-preferences.js";
import {
  APP_RELEASE_DATE,
  APP_UPDATE_ATTEMPT_STORAGE_KEY,
  APP_UPDATE_MANIFEST_URL,
  APP_VERSION,
  APP_VERSION_LABEL,
  buildUpdateReloadUrl,
  compareSemanticVersions,
  isAppUpdateSnoozed,
  loadUpdatePreference,
  normalizeUpdateManifest,
  saveUpdatePreference,
  snoozeAppUpdate,
} from "./version.js";
import {
  INTERFACE_LOCALES,
  INTERFACE_LOCALE_STORAGE_KEY,
  applyLocalizedDocumentMetadata,
  interfaceLocaleToIntl,
  loadInterfaceLocale,
  localizedDefaultBoardName,
  localizeInterfaceDom,
  normalizeInterfaceLocale,
  setActiveInterfaceLocale,
  translateInterfaceText,
} from "./i18n.js";
import {
  RULER_UNITS,
  buildRulerTicks,
  clampCanvasToolbarPosition,
  formatGuideValue,
  matchesListQuery,
  normalizeCanvasToolbarPosition,
  normalizeRulerUnit,
  shouldConfirmEscapeCancellation,
  snapGuidePosition,
} from "./workspace-tools.js";
import "./styles.css";

const MARKER_ICONS = {
  heart: Heart,
  star: Star,
  sparkle: Sparkles,
  diamond: Diamond,
  circle: Circle,
  flag: Flag,
};

const MARKER_LABELS = {
  heart: "愛心",
  star: "星星",
  sparkle: "亮點",
  diamond: "菱形",
  circle: "圓點",
  flag: "旗標",
};

const MARKER_COLOR_VALUES = {
  white: "#ffffff",
  cyan: "#58e6ff",
  pink: "#ff8fc7",
  amber: "#f3b75f",
  green: "#7df0b1",
  violet: "#b99cff",
  red: "#ff776f",
};

const MARKER_COLOR_LABELS = {
  white: "白色",
  cyan: "青色",
  pink: "粉色",
  amber: "琥珀",
  green: "綠色",
  violet: "紫色",
  red: "紅色",
};

const DEFAULT_FILTERS = { symbols: [], colors: [], mode: "any" };
const EMPTY_CLOUD_COLLABORATION = Object.freeze({
  status: "idle",
  message: "",
  roomId: "",
  inviteId: "",
  inviteUrl: "",
  role: "",
  canEdit: false,
  peers: [],
  pendingCount: 0,
});
const MIN_ZOOM = 0.08;
const MAX_ZOOM = 4;
const SESSION_ADJECTIVES = ["青色", "安靜", "敏捷", "明亮", "琥珀", "深夜"];
const SESSION_NOUNS = ["編輯者", "觀察者", "整理者", "策展人", "設計者", "夥伴"];

const FONT_OPTIONS = [
  { label: "介面黑體", value: DEFAULT_TEXT_FONT },
  { label: "思源黑體", value: '"Noto Sans TC", "Source Han Sans TC", "PingFang TC", sans-serif' },
  { label: "思源宋體", value: '"Noto Serif TC", "Source Han Serif TC", "Songti TC", serif' },
  { label: "蘋方／微軟正黑", value: '"PingFang TC", "Microsoft JhengHei", sans-serif' },
  { label: "系統宋體", value: '"Songti TC", "PMingLiU", serif' },
  { label: "等寬字體", value: '"JetBrains Mono", "SFMono-Regular", monospace' },
];

function localFontCssValue(family) {
  return `"${String(family).replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

const FONT_WEIGHTS = [
  ["300", "細體"],
  ["400", "一般"],
  ["500", "中等"],
  ["600", "半粗"],
  ["700", "粗體"],
  ["800", "特粗"],
  ["900", "黑體"],
];

const TEXT_ALIGN_CONTROLS = [
  { value: "left", label: "向左", accessibleLabel: "文字向左對齊", Icon: AlignLeft },
  { value: "center", label: "置中", accessibleLabel: "文字置中對齊", Icon: AlignCenter },
  { value: "right", label: "向右", accessibleLabel: "文字向右對齊", Icon: AlignRight },
  { value: "justify", label: "齊行", accessibleLabel: "文字左右齊行", Icon: AlignJustify },
];

const TEXT_LAST_ALIGN_CONTROLS = TEXT_ALIGN_CONTROLS.filter(({ value }) => value !== "justify");

const TEXT_VERTICAL_ALIGN_CONTROLS = [
  { value: "top", label: "向上", accessibleLabel: "文字在文字框內向上對齊", Icon: AlignStartHorizontal },
  { value: "middle", label: "置中", accessibleLabel: "文字在文字框內上下置中", Icon: AlignCenterHorizontal },
  { value: "bottom", label: "向下", accessibleLabel: "文字在文字框內向下對齊", Icon: AlignEndHorizontal },
];

const TEXT_FRAME_HANDLES = [
  { key: "width", handle: "e", dimension: "width", x: 1, y: 0.72, label: "文字內容寬度" },
  { key: "height", handle: "s", dimension: "height", x: 0.72, y: 1, label: "文字內容高度" },
];

const SHAPE_LABELS = {
  rectangle: "矩形",
  triangle: "三角形",
  polygon: "多邊形",
  star: "星形",
};

const SHAPE_PRINT_SIZE_PRESETS = Object.entries(PAPER_PRESETS)
  .filter(([, preset]) => preset.width && preset.height)
  .flatMap(([key, preset]) => [
    { id: `${key}-portrait`, label: `${preset.label} · ${preset.width} × ${preset.height}`, width: preset.width, height: preset.height },
    { id: `${key}-landscape`, label: `${preset.label} · ${preset.height} × ${preset.width}`, width: preset.height, height: preset.width },
  ]);

const SHAPE_SOCIAL_SIZE_PRESETS = [
  { id: "social-square", label: "正方形貼文", width: 1080, height: 1080 },
  { id: "social-portrait", label: "直式貼文", width: 1080, height: 1350 },
  { id: "social-story", label: "限時動態／短影音", width: 1080, height: 1920 },
  { id: "social-share", label: "橫式分享圖", width: 1200, height: 630 },
  { id: "social-video", label: "16:9 影片封面", width: 1920, height: 1080 },
];

const STAR_STYLE_PRESETS = [
  { id: "classic", label: "經典", starPoints: 5, starInnerRatio: 0.42 },
  { id: "sharp", label: "銳利", starPoints: 5, starInnerRatio: 0.24 },
  { id: "full", label: "飽滿", starPoints: 5, starInnerRatio: 0.64 },
  { id: "burst", label: "放射", starPoints: 12, starInnerRatio: 0.32 },
];

const LAYER_TYPE_FILTERS = [
  ["all", "全部"],
  ["artboard", "紙張"],
  ["group", "群組"],
  ["text", "文字"],
  ["media", "素材"],
  ["shape", "形狀"],
];

const ANNOTATION_POSITION_LABELS = {
  tl: "左上外側",
  tc: "上方置中",
  tr: "右上外側",
  ml: "左側置中",
  mr: "右側置中",
  bl: "左下外側",
  bc: "下方置中",
  br: "右下外側",
};

const LEFT_PANEL_MIN_WIDTH = 300;
const LEFT_PANEL_MAX_WIDTH = 560;
const THEME_COLOR_FIELDS = [
  ["background", "整體背景"],
  ["panel", "面板"],
  ["canvas", "畫布"],
  ["text", "主要文字"],
  ["muted", "次要文字"],
  ["accent", "強調色"],
];
const LAST_LIGHT_THEME_STORAGE_KEY = "infinite-moodboard-last-light-theme-v1";
const LAST_DARK_THEME_STORAGE_KEY = "infinite-moodboard-last-dark-theme-v1";
const RULERS_VISIBLE_STORAGE_KEY = "infinite-moodboard-rulers-visible-v1";
const GUIDES_VISIBLE_STORAGE_KEY = "infinite-moodboard-guides-visible-v1";
const RULER_UNIT_STORAGE_KEY = "infinite-moodboard-ruler-unit-v1";
const CANVAS_TOOLBAR_POSITION_STORAGE_KEY = "infinite-moodboard-canvas-toolbar-position-v1";
const RULER_SIZE = 22;

function readSessionValue(key) {
  try {
    return sessionStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

function writeSessionValue(key, value) {
  try {
    sessionStorage.setItem(key, String(value || ""));
  } catch {
    // Session storage can be unavailable without preventing safe local editing.
  }
}

const SHORTCUT_SECTIONS = [
  {
    title: "檔案與編輯",
    items: [
      ["mod+S", "儲存 Moodboard"],
      ["mod+O", "開啟 Moodboard"],
      ["mod+Z", "復原"],
      ["mod+shift+Z", "重做"],
      ["mod+A", "選取全部可見物件"],
      ["mod+C", "複製選取物件"],
      ["mod+X", "剪下選取物件"],
      ["mod+V", "貼上物件或媒體"],
      ["mod+F", "搜尋目前列表"],
    ],
  },
  {
    title: "工具與物件",
    items: [
      ["shift+V", "選取工具"],
      ["shift+H", "平移工具"],
      ["shift+3", "切換進階 3D"],
      ["shift+D", "複製選取物件"],
      ["shift+G", "建立或解散群組"],
      ["Space", "暫時平移畫布"],
      ["Shift", "平移工具中暫時選取"],
      ["Delete", "刪除選取物件"],
    ],
  },
  {
    title: "工作區顯示",
    items: [
      ["shift+R", "顯示或隱藏尺規"],
      ["shift+;", "顯示或隱藏輔助導引線"],
      ["shift+'", "顯示或隱藏格點／格線"],
      ["shift+[", "顯示或隱藏左側欄"],
      ["shift+]", "顯示或隱藏右側欄"],
      ["shift+\\", "顯示或隱藏兩側欄"],
      ["shift+F", "切換專注模式"],
      ["?", "顯示或隱藏快速鍵"],
      ["Escape", "取消目前操作或關閉最上層介面"],
    ],
  },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getLeftPanelMaxWidth() {
  const viewportWidth = typeof window === "undefined" ? 1440 : window.innerWidth;
  if (viewportWidth <= 900) return LEFT_PANEL_MAX_WIDTH;
  return Math.max(LEFT_PANEL_MIN_WIDTH, Math.min(LEFT_PANEL_MAX_WIDTH, viewportWidth - 664));
}

function normalizeLeftPanelWidth(value) {
  return Math.round(clamp(Number(value) || LEFT_PANEL_MIN_WIDTH, LEFT_PANEL_MIN_WIDTH, getLeftPanelMaxWidth()));
}

function loadStoredInterfaceThemes() {
  try {
    const parsed = JSON.parse(localStorage.getItem(THEME_STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((theme) => theme && typeof theme === "object")
      .map((theme) => normalizeInterfaceTheme({ ...theme, builtin: false }));
  } catch {
    return [];
  }
}

function loadStoredInterfaceTypography() {
  try {
    return normalizeInterfaceTypography(JSON.parse(localStorage.getItem(UI_TYPOGRAPHY_STORAGE_KEY) || "{}"));
  } catch {
    return { ...DEFAULT_INTERFACE_TYPOGRAPHY };
  }
}

function loadStoredCanvasBackground() {
  try {
    return normalizeCanvasBackground(JSON.parse(localStorage.getItem(CANVAS_BACKGROUND_STORAGE_KEY) || "{}"));
  } catch {
    return { ...DEFAULT_CANVAS_BACKGROUND };
  }
}

function loadStoredCanvasToolbarPosition() {
  try {
    return normalizeCanvasToolbarPosition(JSON.parse(localStorage.getItem(CANVAS_TOOLBAR_POSITION_STORAGE_KEY) || "null"));
  } catch {
    return null;
  }
}

function formatTime(value) {
  return new Intl.DateTimeFormat(interfaceLocaleToIntl(), {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatStorageSize(value) {
  const bytes = Math.max(0, Number(value) || 0);
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let amount = bytes;
  let unit = -1;
  do {
    amount /= 1024;
    unit += 1;
  } while (amount >= 1024 && unit < units.length - 1);
  return `${amount >= 10 ? amount.toFixed(0) : amount.toFixed(1)} ${units[unit]}`;
}

function createSessionName() {
  const adjective = SESSION_ADJECTIVES[Math.floor(Math.random() * SESSION_ADJECTIVES.length)];
  const noun = SESSION_NOUNS[Math.floor(Math.random() * SESSION_NOUNS.length)];
  const separator = interfaceLocaleToIntl().startsWith("en") ? " " : "";
  return `${translateInterfaceText(adjective)}${separator}${translateInterfaceText(noun)}`;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`無法讀取 ${file.name}`));
    reader.readAsDataURL(file);
  });
}

function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const timer = window.setTimeout(() => reject(new Error("圖片解碼逾時，請重新匯入這張圖片。")), 8000);
    image.onload = () => {
      window.clearTimeout(timer);
      resolve(image);
    };
    image.onerror = () => {
      window.clearTimeout(timer);
      reject(new Error("圖片格式無法讀取。"));
    };
    image.src = src;
  });
}

function loadVideoElement(src) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const timer = window.setTimeout(() => reject(new Error("影片解碼逾時，請重新匯入這段影片。")), 12000);
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      window.clearTimeout(timer);
      resolve(video);
    };
    video.onerror = () => {
      window.clearTimeout(timer);
      reject(new Error("影片格式無法讀取。"));
    };
    video.src = src;
  });
}

function isVideoObject(object) {
  return object?.type === "video" || object?.mime?.startsWith("video/");
}

function isTextObject(object) {
  return object?.type === "text";
}

function textLayoutStyle(object) {
  const textAlign = TEXT_ALIGNMENTS.includes(object?.textAlign) ? object.textAlign : "left";
  const textAlignLast = TEXT_LAST_ALIGNMENTS.includes(object?.textAlignLast) ? object.textAlignLast : "left";
  const textVerticalAlign = TEXT_VERTICAL_ALIGNMENTS.includes(object?.textVerticalAlign) ? object.textVerticalAlign : "top";
  return {
    display: "flex",
    flexDirection: "column",
    justifyContent: { top: "flex-start", middle: "safe center", bottom: "safe flex-end" }[textVerticalAlign],
    textAlign,
    textAlignLast: textAlign === "justify" ? textAlignLast : "auto",
  };
}

function objectDisplayText(object) {
  if (!isTextObject(object)) return "";
  if (object.textFlowId && typeof object.flowText === "string") return object.flowText;
  return typeof object.text === "string" ? object.text : "";
}

function isShapeObject(object) {
  return object?.type === "shape";
}

function isArtboardObject(object) {
  return object?.type === "artboard";
}

function isSvgFile(file) {
  return file?.type === "image/svg+xml" || /\.svg$/i.test(file?.name || "");
}

function createTextMeasurementNode(object, overrides = {}) {
  const measuringNode = document.createElement("div");
  Object.assign(measuringNode.style, {
    boxSizing: "border-box",
    contain: "layout style",
    fontFamily: object.fontFamily || DEFAULT_TEXT_FONT,
    fontSize: `${Math.max(6, Number(object.fontSize) || 32)}px`,
    fontWeight: String(object.fontWeight || "600"),
    height: `${Math.max(24, Number(object.height) || 24)}px`,
    left: "-100000px",
    lineHeight: "1.2",
    margin: "0",
    maxWidth: "none",
    overflow: "hidden",
    overflowWrap: "anywhere",
    padding: "0",
    pointerEvents: "none",
    position: "fixed",
    top: "0",
    visibility: "hidden",
    whiteSpace: "pre-wrap",
    width: `${Math.max(24, Number(object.width) || 24)}px`,
    textAlign: textLayoutStyle(object).textAlign,
    textAlignLast: textLayoutStyle(object).textAlignLast,
    ...overrides,
  });
  document.body.appendChild(measuringNode);
  return measuringNode;
}

function setMeasuredText(node, text) {
  const value = String(text || "");
  node.textContent = value ? `${value}${value.endsWith("\n") ? "\u200b" : ""}` : "\u200b";
}

function textGraphemes(value) {
  if (typeof Intl !== "undefined" && typeof Intl.Segmenter === "function") {
    const segmenter = new Intl.Segmenter("zh-Hant", { granularity: "grapheme" });
    return [...segmenter.segment(value)].map((segment) => segment.segment);
  }
  return Array.from(value);
}

function splitTextForFrame(object, text) {
  const source = String(text || "");
  if (!source || typeof document === "undefined") return { fitted: source, overflow: "" };
  const measuringNode = createTextMeasurementNode(object);
  const fits = (candidate) => {
    setMeasuredText(measuringNode, candidate);
    return measuringNode.scrollHeight <= measuringNode.clientHeight + 1
      && measuringNode.scrollWidth <= measuringNode.clientWidth + 1;
  };
  if (fits(source)) {
    measuringNode.remove();
    return { fitted: source, overflow: "" };
  }

  const characters = textGraphemes(source);
  let low = 0;
  let high = characters.length;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (fits(characters.slice(0, middle).join(""))) low = middle;
    else high = middle - 1;
  }
  measuringNode.remove();
  return {
    fitted: characters.slice(0, low).join(""),
    overflow: characters.slice(low).join(""),
  };
}

function reflowTextThreads(objects) {
  if (typeof document === "undefined") return objects;
  const groups = new Map();
  objects.forEach((object, index) => {
    if (!isTextObject(object) || !object.textFlowId) return;
    const group = groups.get(object.textFlowId) || [];
    group.push({ object, index });
    groups.set(object.textFlowId, group);
  });
  if (!groups.size) return objects;

  const updates = new Map();
  groups.forEach((frames) => {
    frames.sort((left, right) => (left.object.textFlowOrder - right.object.textFlowOrder) || (left.index - right.index));
    const story = String(frames[0]?.object.text || "");
    let remainder = story;
    frames.forEach(({ object }, index) => {
      const result = splitTextForFrame(object, remainder);
      remainder = result.overflow;
      const textFlowOverflow = index === frames.length - 1 && Boolean(remainder);
      if (object.text !== story || object.flowText !== result.fitted || object.textFlowOverflow !== textFlowOverflow || object.textFlowOrder !== index) {
        updates.set(object.id, {
          ...object,
          text: story,
          flowText: result.fitted,
          textFlowOverflow,
          textFlowOrder: index,
        });
      }
    });
  });
  return updates.size ? objects.map((object) => updates.get(object.id) || object) : objects;
}

function measureTextFrameContent(object, dimension) {
  if (typeof document === "undefined") return Math.max(24, Number(object?.[dimension]) || 24);
  const measuringNode = createTextMeasurementNode(object, { height: "auto", overflow: "visible" });
  setMeasuredText(measuringNode, objectDisplayText(object));
  if (dimension === "width") {
    measuringNode.style.width = "max-content";
    measuringNode.style.whiteSpace = "pre";
    measuringNode.style.overflowWrap = "normal";
  } else {
    measuringNode.style.width = `${Math.max(24, Number(object.width) || 24)}px`;
    measuringNode.style.whiteSpace = "pre-wrap";
    measuringNode.style.overflowWrap = "anywhere";
  }
  const rect = measuringNode.getBoundingClientRect();
  const measured = dimension === "width"
    ? Math.max(rect.width, measuringNode.scrollWidth)
    : Math.max(rect.height, measuringNode.scrollHeight);
  measuringNode.remove();
  return Math.max(24, Math.ceil(measured) + 1);
}

async function mediaFileToObject(file, point, index) {
  const svgFile = isSvgFile(file);
  const readableFile = svgFile && !file.type ? new Blob([file], { type: "image/svg+xml" }) : file;
  const src = await readFileAsDataUrl(readableFile);
  const isVideo = file.type.startsWith("video/");
  const media = isVideo ? await loadVideoElement(src) : await loadImageElement(src);
  const naturalWidth = (isVideo ? media.videoWidth : media.naturalWidth) || 320;
  const naturalHeight = (isVideo ? media.videoHeight : media.naturalHeight) || 240;
  const scale = Math.min(1, 420 / Math.max(naturalWidth, naturalHeight));
  const width = Math.max(48, Math.round(naturalWidth * scale));
  const height = Math.max(48, Math.round(naturalHeight * scale));
  const baseName = file.name.replace(/\.[^.]+$/, "") || `${translateInterfaceText("素材")} ${index + 1}`;
  const now = new Date().toISOString();

  return {
    id: createId("object"),
    sourceId: createId("source"),
    type: isVideo ? "video" : "image",
    name: baseName,
    layerName: baseName,
    src,
    mime: file.type || (isVideo ? "video/mp4" : svgFile ? "image/svg+xml" : "image/png"),
    originalFilename: file.name || `${baseName}.png`,
    pivotX: point.x + index * 36,
    pivotY: point.y + index * 36,
    width,
    height,
    originalWidth: width,
    originalHeight: height,
    aspectLocked: true,
    rotation: 0,
    tiltX: 0,
    tiltY: 0,
    depth: 0,
    perspective: 1000,
    videoControlsVisible: true,
    anchor: "mc",
    markers: [],
    visible: true,
    locked: false,
    createdAt: now,
    updatedAt: now,
  };
}

function createTextObject(point) {
  const now = new Date().toISOString();
  const textName = translateInterfaceText("文字");
  const textValue = translateInterfaceText("輸入文字");
  return {
    id: createId("object"),
    type: "text",
    name: textName,
    layerName: textName,
    src: "",
    mime: "text/plain",
    originalFilename: `${textName}.txt`,
    pivotX: point.x,
    pivotY: point.y,
    width: 320,
    height: 120,
    originalWidth: 320,
    originalHeight: 120,
    aspectLocked: true,
    rotation: 0,
    tiltX: 0,
    tiltY: 0,
    depth: 0,
    perspective: 1000,
    anchor: "mc",
    text: textValue,
    fontFamily: DEFAULT_TEXT_FONT,
    fontWeight: "600",
    fontSize: 36,
    originalFontSize: 36,
    color: "#edf7fb",
    textAlign: "left",
    textAlignLast: "left",
    textVerticalAlign: "top",
    markers: [],
    visible: true,
    locked: false,
    createdAt: now,
    updatedAt: now,
  };
}

function createAnnotationObject(targetObjects, options = {}) {
  const bounds = selectionWorldBounds(targetObjects);
  if (!bounds) return null;
  const kind = options.kind === "description" ? "description" : "title";
  const position = ANNOTATION_POSITIONS.includes(options.position) ? options.position : "tl";
  const gap = Math.max(0, Number(options.gap) || 16);
  const width = Math.max(180, Math.min(460, kind === "title" ? bounds.width : Math.max(280, bounds.width * 0.72)));
  const height = kind === "title" ? 58 : 96;
  const horizontal = position[1];
  const vertical = position[0];
  let centerX = bounds.centerX;
  let centerY = bounds.centerY;
  if (horizontal === "l") centerX = bounds.left + width / 2;
  if (horizontal === "r") centerX = bounds.right - width / 2;
  if (vertical === "t") centerY = bounds.top - gap - height / 2;
  if (vertical === "b") centerY = bounds.bottom + gap + height / 2;
  if (position === "ml") centerX = bounds.left - gap - width / 2;
  if (position === "mr") centerX = bounds.right + gap + width / 2;
  const object = createTextObject({ x: centerX, y: centerY });
  const artboardIds = [...new Set(targetObjects.map((target) => isArtboardObject(target) ? target.id : target.artboardId).filter(Boolean))];
  const text = String(options.text || "").trim() || translateInterfaceText(kind === "title" ? "標題" : "說明文字");
  return {
    ...object,
    name: text,
    layerName: text,
    text,
    width,
    height,
    originalWidth: width,
    originalHeight: height,
    fontSize: kind === "title" ? 28 : 18,
    originalFontSize: kind === "title" ? 28 : 18,
    fontWeight: kind === "title" ? "700" : "400",
    annotationKind: kind,
    annotationPosition: position,
    annotationTargetIds: targetObjects.map((target) => target.id),
    artboardId: artboardIds.length === 1 ? artboardIds[0] : null,
  };
}

function createShapeObject(kind, point) {
  const now = new Date().toISOString();
  const preset = {
    square: { shapeKind: "rectangle", name: "正方形", width: 180, height: 180 },
    rectangle: { shapeKind: "rectangle", name: "矩形", width: 260, height: 160 },
    triangle: { shapeKind: "triangle", name: "三角形", width: 190, height: 170 },
    polygon: { shapeKind: "polygon", name: "六邊形", width: 190, height: 170 },
    star: { shapeKind: "star", name: "星形", width: 190, height: 190 },
  }[kind] || { shapeKind: "rectangle", name: "矩形", width: 260, height: 160 };
  const localizedName = translateInterfaceText(preset.name);
  return {
    id: createId("object"),
    type: "shape",
    name: localizedName,
    layerName: localizedName,
    src: "",
    mime: "image/svg+xml",
    originalFilename: `${localizedName}.svg`,
    pivotX: point.x,
    pivotY: point.y,
    width: preset.width,
    height: preset.height,
    originalWidth: preset.width,
    originalHeight: preset.height,
    aspectLocked: true,
    rotation: 0,
    tiltX: 0,
    tiltY: 0,
    depth: 0,
    perspective: 1000,
    anchor: "mc",
    shapeKind: preset.shapeKind,
    shapeSides: 6,
    starPoints: 5,
    starInnerRatio: 0.42,
    fill: "#58e6ff",
    markers: [],
    visible: true,
    locked: false,
    createdAt: now,
    updatedAt: now,
  };
}

function escapeXmlAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function shapeSvgPoints(object) {
  const points = shapePolygonPoints(object);
  if (!points) return "";
  return points.map(([x, y]) => `${Number((x * 100).toFixed(3))},${Number((y * 100).toFixed(3))}`).join(" ");
}

function shapeSvgMarkup(object, x, y, width, height) {
  const fill = escapeXmlAttribute(object.fill || "#58e6ff");
  const points = shapeSvgPoints(object);
  const content = points
    ? `<polygon points="${points}" fill="${fill}"/>`
    : `<rect x="1" y="1" width="98" height="98" rx="2" fill="${fill}"/>`;
  return `<g transform="translate(${x} ${y}) scale(${width / 100} ${height / 100})">${content}</g>`;
}

function objectHtmlVisualMarkup(object, sourceOverride = "") {
  if (isArtboardObject(object)) {
    return `<div style="box-sizing:border-box;width:100%;height:100%;background:${escapeXmlAttribute(object.fill || "#fffdf7")};"></div>`;
  }
  if (isTextObject(object)) {
    const layout = textLayoutStyle(object);
    return `<div style="box-sizing:border-box;display:flex;flex-direction:column;justify-content:${layout.justifyContent};text-align:${layout.textAlign};text-align-last:${layout.textAlignLast};width:100%;height:100%;overflow:hidden;white-space:pre-wrap;overflow-wrap:anywhere;color:${escapeXmlAttribute(object.color || "#edf7fb")};font-family:${escapeXmlAttribute(object.fontFamily || DEFAULT_TEXT_FONT)};font-size:${Math.max(6, Number(object.fontSize) || 32)}px;font-weight:${escapeXmlAttribute(object.fontWeight || "600")};line-height:1.2;">${escapeXmlAttribute(objectDisplayText(object))}</div>`;
  }
  if (isShapeObject(object)) {
    const clipPath = shapeClipPath(object);
    return `<div style="width:100%;height:100%;background:${escapeXmlAttribute(object.fill || "#58e6ff")};clip-path:${clipPath};"></div>`;
  }
  return `<img src="${escapeXmlAttribute(sourceOverride || object.src)}" alt="" style="display:block;width:100%;height:100%;object-fit:fill;"/>`;
}

function objectToSvgBlob(object) {
  const radians = (object.rotation * Math.PI) / 180;
  const width = Math.max(1, Math.round(object.width));
  const height = Math.max(1, Math.round(object.height));
  const tiltX = Number(object.tiltX) || 0;
  const tiltY = Number(object.tiltY) || 0;
  const depth = Number(object.depth) || 0;
  const perspective = Number(object.perspective) || 1000;
  const hasMicro3D = Math.abs(tiltX) > 0.01 || Math.abs(tiltY) > 0.01 || Math.abs(depth) > 0.01 || Math.abs(perspective - 1000) > 0.01;

  if (hasMicro3D) {
    const anchor = ANCHORS[object.anchor] || ANCHORS.mc;
    const corners = objectWorldCorners({ ...object, pivotX: 0, pivotY: 0, width, height });
    const left = Math.min(...corners.map((point) => point.x));
    const right = Math.max(...corners.map((point) => point.x));
    const top = Math.min(...corners.map((point) => point.y));
    const bottom = Math.max(...corners.map((point) => point.y));
    const outputWidth = Math.max(1, Math.ceil(right - left) + 2);
    const outputHeight = Math.max(1, Math.ceil(bottom - top) + 2);
    const markup = `<svg xmlns="http://www.w3.org/2000/svg" width="${outputWidth}" height="${outputHeight}" viewBox="0 0 ${outputWidth} ${outputHeight}"><foreignObject x="0" y="0" width="${outputWidth}" height="${outputHeight}"><div xmlns="http://www.w3.org/1999/xhtml" style="position:relative;width:100%;height:100%;overflow:hidden;"><div style="position:absolute;left:${1 - left}px;top:${1 - top}px;width:0;height:0;transform-origin:0 0;transform:rotate(${Number(object.rotation) || 0}deg);"><div style="position:absolute;left:${-anchor.x * width}px;top:${-anchor.y * height}px;width:${width}px;height:${height}px;transform-origin:50% 50%;transform-style:preserve-3d;transform:perspective(${perspective}px) translateZ(${depth}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg);backface-visibility:hidden;">${objectHtmlVisualMarkup(object)}</div></div></div></foreignObject></svg>`;
    return new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
  }

  const outputWidth = Math.max(1, Math.ceil(Math.abs(width * Math.cos(radians)) + Math.abs(height * Math.sin(radians))));
  const outputHeight = Math.max(1, Math.ceil(Math.abs(width * Math.sin(radians)) + Math.abs(height * Math.cos(radians))));
  const x = (outputWidth - width) / 2;
  const y = (outputHeight - height) / 2;
  let content;
  if (isTextObject(object)) {
    const layout = textLayoutStyle(object);
    content = `<foreignObject x="${x}" y="${y}" width="${width}" height="${height}"><div xmlns="http://www.w3.org/1999/xhtml" style="box-sizing:border-box;display:flex;flex-direction:column;justify-content:${layout.justifyContent};text-align:${layout.textAlign};text-align-last:${layout.textAlignLast};width:100%;height:100%;overflow:hidden;white-space:pre-wrap;overflow-wrap:anywhere;color:${escapeXmlAttribute(object.color || "#edf7fb")};font-family:${escapeXmlAttribute(object.fontFamily || DEFAULT_TEXT_FONT)};font-size:${Math.max(6, Number(object.fontSize) || 32)}px;font-weight:${escapeXmlAttribute(object.fontWeight || "600")};line-height:1.2;">${escapeXmlAttribute(objectDisplayText(object))}</div></foreignObject>`;
  } else if (isShapeObject(object)) {
    content = shapeSvgMarkup(object, x, y, width, height);
  } else if (isArtboardObject(object)) {
    content = `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${escapeXmlAttribute(object.fill || "#fffdf7")}"/>`;
  } else {
    content = `<image href="${escapeXmlAttribute(object.src)}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="none"/>`;
  }
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" width="${outputWidth}" height="${outputHeight}" viewBox="0 0 ${outputWidth} ${outputHeight}"><g transform="rotate(${object.rotation} ${outputWidth / 2} ${outputHeight / 2})">${content}</g></svg>`;
  return new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
}

function objectExportArtifact(object) {
  if (isVideoObject(object)) {
    const [, payload = ""] = object.src.split(",", 2);
    const bytes = atob(payload);
    const data = new Uint8Array(bytes.length);
    for (let index = 0; index < bytes.length; index += 1) data[index] = bytes.charCodeAt(index);
    const extension = object.originalFilename.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase()
      || ({ "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov" }[object.mime])
      || "video";
    return { blob: new Blob([data], { type: object.mime || "video/mp4" }), extension };
  }
  return { blob: objectToSvgBlob(object), extension: "svg" };
}

function waitForVideoFrame(video, timeout = 7000) {
  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth && video.videoHeight) {
    return Promise.resolve(video);
  }
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => finish(new Error("影片影格載入逾時。")), timeout);
    const cleanup = () => {
      window.clearTimeout(timer);
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("canplay", onReady);
      video.removeEventListener("error", onError);
    };
    const finish = (error) => {
      cleanup();
      if (error) reject(error);
      else resolve(video);
    };
    const onReady = () => {
      if (video.videoWidth && video.videoHeight) finish();
    };
    const onError = () => finish(new Error("影片影格無法讀取。"));
    video.addEventListener("loadeddata", onReady);
    video.addEventListener("canplay", onReady);
    video.addEventListener("error", onError);
  });
}

async function captureVideoFrame(object) {
  const liveObject = [...document.querySelectorAll(".board-object[data-object-id]")]
    .find((element) => element.dataset.objectId === object.id);
  let video = liveObject?.querySelector("video") || null;
  let temporaryVideo = null;

  if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth) {
    temporaryVideo = document.createElement("video");
    temporaryVideo.muted = true;
    temporaryVideo.playsInline = true;
    temporaryVideo.preload = "auto";
    temporaryVideo.src = object.src;
    temporaryVideo.load();
    video = temporaryVideo;
  }

  try {
    await waitForVideoFrame(video);
    const sourceWidth = Math.max(1, video.videoWidth);
    const sourceHeight = Math.max(1, video.videoHeight);
    const sizeScale = Math.min(1, 2048 / sourceWidth, 2048 / sourceHeight);
    const frameCanvas = document.createElement("canvas");
    frameCanvas.width = Math.max(1, Math.round(sourceWidth * sizeScale));
    frameCanvas.height = Math.max(1, Math.round(sourceHeight * sizeScale));
    const frameContext = frameCanvas.getContext("2d", { alpha: false });
    if (!frameContext) throw new Error("瀏覽器無法建立影片影格畫布。");
    frameContext.drawImage(video, 0, 0, frameCanvas.width, frameCanvas.height);
    return frameCanvas.toDataURL("image/png");
  } catch (error) {
    throw new Error(`影片「${object.name}」的目前影格無法擷取；請先播放到想輸出的畫面再重試。`, { cause: error });
  } finally {
    if (temporaryVideo) {
      temporaryVideo.removeAttribute("src");
      temporaryVideo.load();
    }
  }
}

function wrapCanvasText(context, value, maxWidth) {
  const paragraphs = String(value || "").replaceAll("\r\n", "\n").split("\n");
  const lines = [];
  paragraphs.forEach((paragraph) => {
    const characters = Array.from(paragraph);
    if (!characters.length) {
      lines.push({ text: "", paragraphEnd: true });
      return;
    }
    let current = "";
    characters.forEach((character) => {
      const candidate = `${current}${character}`;
      if (current && context.measureText(candidate).width > maxWidth) {
        lines.push({ text: current, paragraphEnd: false });
        current = character;
      } else {
        current = candidate;
      }
    });
    lines.push({ text: current, paragraphEnd: true });
  });
  return lines;
}

function drawJustifiedCanvasText(context, text, width, y) {
  const characters = Array.from(text);
  if (characters.length < 2) {
    context.textAlign = "left";
    context.fillText(text, 0, y);
    return;
  }
  const glyphWidths = characters.map((character) => context.measureText(character).width);
  const gap = Math.max(0, (width - glyphWidths.reduce((sum, value) => sum + value, 0)) / (characters.length - 1));
  let x = 0;
  context.textAlign = "left";
  characters.forEach((character, index) => {
    context.fillText(character, x, y);
    x += glyphWidths[index] + gap;
  });
}

function drawTextObjectSource(context, object, width, height) {
  const fontSize = Math.max(6, Number(object.fontSize) || 32);
  const lineHeight = fontSize * 1.2;
  const alignment = TEXT_ALIGNMENTS.includes(object.textAlign) ? object.textAlign : "left";
  const lastAlignment = TEXT_LAST_ALIGNMENTS.includes(object.textAlignLast) ? object.textAlignLast : "left";
  const verticalAlignment = TEXT_VERTICAL_ALIGNMENTS.includes(object.textVerticalAlign) ? object.textVerticalAlign : "top";
  context.save();
  context.beginPath();
  context.rect(0, 0, width, height);
  context.clip();
  context.fillStyle = object.color || "#edf7fb";
  context.font = `${object.fontWeight || "600"} ${fontSize}px ${object.fontFamily || DEFAULT_TEXT_FONT}`;
  context.textBaseline = "top";
  const lines = wrapCanvasText(context, objectDisplayText(object), width);
  const maxLines = Math.max(1, Math.floor(height / lineHeight));
  const visibleLines = lines.slice(0, maxLines);
  const contentHeight = visibleLines.length * lineHeight;
  const startY = verticalAlignment === "bottom"
    ? Math.max(0, height - contentHeight)
    : verticalAlignment === "middle"
    ? Math.max(0, (height - contentHeight) / 2)
    : 0;

  visibleLines.forEach((line, index) => {
    const y = startY + index * lineHeight + (lineHeight - fontSize) / 2;
    if (alignment === "justify" && !line.paragraphEnd) {
      drawJustifiedCanvasText(context, line.text, width, y);
      return;
    }
    const lineAlignment = alignment === "justify" ? lastAlignment : alignment;
    context.textAlign = lineAlignment;
    const x = lineAlignment === "center" ? width / 2 : lineAlignment === "right" ? width : 0;
    context.fillText(line.text, x, y);
  });
  context.restore();
}

function drawShapeObjectSource(context, object, width, height) {
  const normalizedPoints = shapePolygonPoints(object);
  context.fillStyle = object.fill || "#58e6ff";
  context.beginPath();
  if (normalizedPoints) {
    normalizedPoints.forEach(([x, y], index) => {
      if (index === 0) context.moveTo(x * width, y * height);
      else context.lineTo(x * width, y * height);
    });
    context.closePath();
  } else if (typeof context.roundRect === "function") {
    context.roundRect(width * 0.01, height * 0.01, width * 0.98, height * 0.98, Math.min(width, height) * 0.02);
  } else {
    context.rect(width * 0.01, height * 0.01, width * 0.98, height * 0.98);
  }
  context.fill();
}

async function createObjectSourceCanvas(object, sourceOverride, renderScale) {
  const width = Math.max(1, Number(object.width) || 1);
  const height = Math.max(1, Number(object.height) || 1);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.ceil(width * renderScale));
  canvas.height = Math.max(1, Math.ceil(height * renderScale));
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) throw new Error(`無法建立「${object.name}」的輸出畫布。`);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.scale(canvas.width / width, canvas.height / height);

  if (isArtboardObject(object)) {
    context.fillStyle = object.fill || "#fffdf7";
    context.fillRect(0, 0, width, height);
  } else if (isTextObject(object)) {
    drawTextObjectSource(context, object, width, height);
  } else if (isShapeObject(object)) {
    drawShapeObjectSource(context, object, width, height);
  } else {
    const image = await loadImageElement(sourceOverride || object.src);
    context.drawImage(image, 0, 0, width, height);
  }
  return canvas;
}

function objectHasMicro3D(object) {
  return Math.abs(Number(object.tiltX) || 0) > 0.01
    || Math.abs(Number(object.tiltY) || 0) > 0.01
    || Math.abs(Number(object.depth) || 0) > 0.01
    || Math.abs((Number(object.perspective) || 1000) - 1000) > 0.01;
}

function drawFlatCompositionObject(context, source, object, bounds, padding, renderScale) {
  const anchor = ANCHORS[object.anchor] || ANCHORS.mc;
  const width = Math.max(1, Number(object.width) || 1);
  const height = Math.max(1, Number(object.height) || 1);
  context.save();
  context.translate(
    (Number(object.pivotX) - bounds.left + padding) * renderScale,
    (Number(object.pivotY) - bounds.top + padding) * renderScale,
  );
  context.rotate(((Number(object.rotation) || 0) * Math.PI) / 180);
  context.drawImage(
    source,
    -anchor.x * width * renderScale,
    -anchor.y * height * renderScale,
    width * renderScale,
    height * renderScale,
  );
  context.restore();
}

function expandTriangle(points, amount = 0.45) {
  const center = {
    x: (points[0].x + points[1].x + points[2].x) / 3,
    y: (points[0].y + points[1].y + points[2].y) / 3,
  };
  return points.map((point) => {
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    const length = Math.hypot(dx, dy) || 1;
    return { x: point.x + (dx / length) * amount, y: point.y + (dy / length) * amount };
  });
}

function drawImageTriangle(context, image, sourcePoints, destinationPoints) {
  const [s0, s1, s2] = sourcePoints;
  const [d0, d1, d2] = destinationPoints;
  const denominator = s0.x * (s1.y - s2.y) + s1.x * (s2.y - s0.y) + s2.x * (s0.y - s1.y);
  if (Math.abs(denominator) < 0.000001) return;
  const a = (d0.x * (s1.y - s2.y) + d1.x * (s2.y - s0.y) + d2.x * (s0.y - s1.y)) / denominator;
  const c = (d0.x * (s2.x - s1.x) + d1.x * (s0.x - s2.x) + d2.x * (s1.x - s0.x)) / denominator;
  const e = (d0.x * (s1.x * s2.y - s2.x * s1.y) + d1.x * (s2.x * s0.y - s0.x * s2.y) + d2.x * (s0.x * s1.y - s1.x * s0.y)) / denominator;
  const b = (d0.y * (s1.y - s2.y) + d1.y * (s2.y - s0.y) + d2.y * (s0.y - s1.y)) / denominator;
  const d = (d0.y * (s2.x - s1.x) + d1.y * (s0.x - s2.x) + d2.y * (s1.x - s0.x)) / denominator;
  const f = (d0.y * (s1.x * s2.y - s2.x * s1.y) + d1.y * (s2.x * s0.y - s0.x * s2.y) + d2.y * (s0.x * s1.y - s1.x * s0.y)) / denominator;
  const clipPoints = expandTriangle(destinationPoints);

  context.save();
  context.beginPath();
  context.moveTo(clipPoints[0].x, clipPoints[0].y);
  context.lineTo(clipPoints[1].x, clipPoints[1].y);
  context.lineTo(clipPoints[2].x, clipPoints[2].y);
  context.closePath();
  context.clip();
  context.transform(a, b, c, d, e, f);
  context.drawImage(image, 0, 0);
  context.restore();
}

function drawProjectedCompositionObject(context, source, object, bounds, padding, renderScale) {
  const width = Math.max(1, Number(object.width) || 1);
  const height = Math.max(1, Number(object.height) || 1);
  const divisions = Math.min(24, Math.max(8, Math.ceil(Math.max(width, height) / 48)));
  const destinationPoint = (x, y) => {
    const worldPoint = objectLocalPointToWorld(object, { x, y });
    return {
      x: (worldPoint.x - bounds.left + padding) * renderScale,
      y: (worldPoint.y - bounds.top + padding) * renderScale,
    };
  };

  for (let row = 0; row < divisions; row += 1) {
    const top = (row / divisions) * height;
    const bottom = ((row + 1) / divisions) * height;
    const sourceTop = (row / divisions) * source.height;
    const sourceBottom = ((row + 1) / divisions) * source.height;
    for (let column = 0; column < divisions; column += 1) {
      const left = (column / divisions) * width;
      const right = ((column + 1) / divisions) * width;
      const sourceLeft = (column / divisions) * source.width;
      const sourceRight = ((column + 1) / divisions) * source.width;
      const d00 = destinationPoint(left, top);
      const d10 = destinationPoint(right, top);
      const d11 = destinationPoint(right, bottom);
      const d01 = destinationPoint(left, bottom);
      const s00 = { x: sourceLeft, y: sourceTop };
      const s10 = { x: sourceRight, y: sourceTop };
      const s11 = { x: sourceRight, y: sourceBottom };
      const s01 = { x: sourceLeft, y: sourceBottom };
      drawImageTriangle(context, source, [s00, s10, s11], [d00, d10, d11]);
      drawImageTriangle(context, source, [s00, s11, s01], [d00, d11, d01]);
    }
  }
}

function canvasToBlob(canvas, mime, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error(`${mime} 編碼失敗。`));
      else resolve(blob);
    }, mime, quality);
  });
}

let avifEncoderModulePromise = null;

async function encodeAvifImageData(imageData) {
  if (!avifEncoderModulePromise) {
    avifEncoderModulePromise = Promise.all([
      import("@jsquash/avif/codec/enc/avif_enc.js"),
      import("@jsquash/avif/meta.js"),
    ]).then(async ([codec, meta]) => ({
      module: await codec.default({ noInitialRun: true }),
      options: meta.defaultOptions,
    }));
  }
  const encoder = await avifEncoderModulePromise;
  const rgba = new Uint8Array(imageData.data.buffer, imageData.data.byteOffset, imageData.data.byteLength);
  const output = encoder.module.encode(rgba, imageData.width, imageData.height, {
    ...encoder.options,
    quality: 62,
    speed: 6,
  });
  if (!output) throw new Error("AVIF 編碼失敗。");
  return output.buffer.slice(output.byteOffset, output.byteOffset + output.byteLength);
}

async function encodeCompositionCanvas(canvas, format) {
  const config = compositionOutputFormat(format);
  if (format === "pdf") {
    const pdfCanvas = document.createElement("canvas");
    pdfCanvas.width = canvas.width;
    pdfCanvas.height = canvas.height;
    const context = pdfCanvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("瀏覽器無法建立 PDF 畫布。");
    context.fillStyle = "#090e13";
    context.fillRect(0, 0, pdfCanvas.width, pdfCanvas.height);
    context.drawImage(canvas, 0, 0);
    const jpeg = await canvasToBlob(pdfCanvas, "image/jpeg", 0.94);
    const pdfBytes = buildImagePdf(await jpeg.arrayBuffer(), pdfCanvas.width, pdfCanvas.height);
    return new Blob([pdfBytes], { type: config.mime });
  }

  if (format === "avif") {
    const nativeBlob = await canvasToBlob(canvas, config.mime, 0.9);
    if (nativeBlob.type === config.mime) return nativeBlob;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("瀏覽器無法讀取 AVIF 畫布。");
    const encoded = await encodeAvifImageData(context.getImageData(0, 0, canvas.width, canvas.height));
    return new Blob([encoded], { type: config.mime });
  }

  const blob = await canvasToBlob(canvas, config.mime, format === "webp" ? 0.94 : undefined);
  if (blob.type !== config.mime) {
    throw new Error(`此瀏覽器無法輸出 ${config.label}；請改用 PNG。`);
  }
  return blob;
}

async function renderSelectionComposition(objects, requestedScale) {
  const bounds = selectionWorldBounds(objects);
  if (!bounds) throw new Error("請先選取要輸出的物件。");
  await document.fonts?.ready;
  const videoFrames = await Promise.all(objects.filter(isVideoObject).map(async (object) => [object.id, await captureVideoFrame(object)]));
  const sourceOverrides = new Map(videoFrames);
  const padding = 2;
  const logicalWidth = Math.max(1, Math.ceil(bounds.width + padding * 2));
  const logicalHeight = Math.max(1, Math.ceil(bounds.height + padding * 2));
  const outputPlan = planCompositionSize(logicalWidth, logicalHeight, requestedScale);
  const canvas = document.createElement("canvas");
  canvas.width = outputPlan.pixelWidth;
  canvas.height = outputPlan.pixelHeight;
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) throw new Error("瀏覽器無法建立合成圖畫布。");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.clearRect(0, 0, canvas.width, canvas.height);
  const sources = await Promise.all(objects.map((object) => createObjectSourceCanvas(
    object,
    sourceOverrides.get(object.id),
    outputPlan.renderScale,
  )));
  objects.forEach((object, index) => {
    if (objectHasMicro3D(object)) {
      drawProjectedCompositionObject(context, sources[index], object, bounds, padding, outputPlan.renderScale);
    } else {
      drawFlatCompositionObject(context, sources[index], object, bounds, padding, outputPlan.renderScale);
    }
  });
  return { canvas, ...outputPlan };
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function IconButton({ label, children, active = false, className = "", ...props }) {
  return (
    <button
      className={`icon-button ${active ? "is-active" : ""} ${className}`}
      type="button"
      aria-label={label}
      title={label}
      {...props}
    >
      {children}
    </button>
  );
}

function platformShortcutLabel(shortcut) {
  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  return shortcut
    .replaceAll("mod", isMac ? "⌘" : "Ctrl")
    .replaceAll("shift", "⇧")
    .split("+")
    .join(" + ");
}

function useListSearch(listId) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  const focusSearch = useCallback(() => {
    setOpen(true);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  useEffect(() => {
    const openRequestedSearch = (event) => {
      if (event.detail?.listId === listId) focusSearch();
    };
    window.addEventListener("infinite-moodboard:list-search", openRequestedSearch);
    return () => window.removeEventListener("infinite-moodboard:list-search", openRequestedSearch);
  }, [focusSearch, listId]);

  return { open, setOpen, query, setQuery, inputRef, focusSearch };
}

function ListSearchToggle({ search, resultCount, totalCount, label = "搜尋／篩選列表", forceActive = false }) {
  const active = forceActive || Boolean(search.query.trim());
  return (
    <button
      className={`list-search-toggle ${search.open ? "is-open" : ""} ${active ? "is-active" : ""}`}
      type="button"
      aria-label={search.open ? "收合搜尋／篩選" : label}
      aria-expanded={search.open}
      aria-pressed={active}
      onClick={() => search.open ? search.setOpen(false) : search.focusSearch()}
      title={label}
    >
      <ListFilter size={16} aria-hidden="true" />
      {active ? <span>{resultCount}/{totalCount}</span> : null}
    </button>
  );
}

function ListSearchField({ search, placeholder, children = null }) {
  if (!search.open) return null;
  return (
    <div className="list-search-controls">
      <label className="list-search-field">
        <Search size={15} aria-hidden="true" />
        <span className="sr-only">{placeholder}</span>
        <input
          ref={search.inputRef}
          value={search.query}
          onChange={(event) => search.setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Escape") return;
            event.preventDefault();
            event.stopPropagation();
            search.setOpen(false);
          }}
          placeholder={placeholder}
        />
        {search.query ? (
          <button type="button" aria-label="清除搜尋" onClick={() => { search.setQuery(""); search.inputRef.current?.focus(); }}>
            <X size={14} />
          </button>
        ) : null}
      </label>
      {children}
    </div>
  );
}

function WorkspaceRulers({
  rulersVisible,
  guidesVisible,
  guides,
  draggingGuide,
  view,
  viewportSize,
  unit,
  onUnitChange,
  onStartGuide,
  onDeleteGuide,
}) {
  const [unitMenu, setUnitMenu] = useState(null);
  const horizontalTicks = useMemo(
    () => buildRulerTicks(viewportSize.width, view.x, view.zoom, unit),
    [unit, view.x, view.zoom, viewportSize.width],
  );
  const verticalTicks = useMemo(
    () => buildRulerTicks(viewportSize.height, view.y, view.zoom, unit),
    [unit, view.y, view.zoom, viewportSize.height],
  );

  useEffect(() => {
    if (!unitMenu) return undefined;
    const close = () => setUnitMenu(null);
    const closeOnEscape = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      setUnitMenu(null);
    };
    window.addEventListener("pointerdown", close);
    window.addEventListener("blur", close);
    window.addEventListener("keydown", closeOnEscape, true);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("blur", close);
      window.removeEventListener("keydown", closeOnEscape, true);
    };
  }, [unitMenu]);

  if (!rulersVisible && !guidesVisible && !draggingGuide) return null;

  const openUnitMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setUnitMenu({ x: event.clientX, y: event.clientY });
  };
  const shownGuides = draggingGuide
    ? [...guides.filter((guide) => guide.id !== draggingGuide.id), draggingGuide]
    : guides;

  return (
    <div className="workspace-measurement-layer" aria-label="尺規與輔助導引線">
      {rulersVisible ? (
        <>
          <button className="ruler-corner" type="button" onContextMenu={openUnitMenu} onClick={(event) => openUnitMenu(event)} aria-label={`尺規單位 ${RULER_UNITS[unit].label}；點擊切換`}>
            {RULER_UNITS[unit].label}
          </button>
          <div
            className="workspace-ruler is-horizontal"
            role="button"
            tabIndex={0}
            aria-label="頂部尺規；拖曳可建立水平導引線"
            onPointerDown={(event) => onStartGuide(event, "y")}
            onContextMenu={openUnitMenu}
          >
            {horizontalTicks.map((tick) => (
              <span className={tick.major ? "is-major" : ""} style={{ left: tick.position }} key={`${tick.position}-${tick.value}`}>
                {tick.major ? <b>{tick.label}</b> : null}
              </span>
            ))}
          </div>
          <div
            className="workspace-ruler is-vertical"
            role="button"
            tabIndex={0}
            aria-label="左側尺規；拖曳可建立垂直導引線"
            onPointerDown={(event) => onStartGuide(event, "x")}
            onContextMenu={openUnitMenu}
          >
            {verticalTicks.map((tick) => (
              <span className={tick.major ? "is-major" : ""} style={{ top: tick.position }} key={`${tick.position}-${tick.value}`}>
                {tick.major ? <b>{tick.label}</b> : null}
              </span>
            ))}
          </div>
        </>
      ) : null}
      {(guidesVisible || draggingGuide) ? (
        <div className="workspace-guides">
          {shownGuides.map((guide) => {
            const screenPosition = (guide.axis === "x" ? view.x : view.y) + guide.position * view.zoom;
            return (
              <button
                className={`workspace-guide is-${guide.axis === "x" ? "vertical" : "horizontal"} ${draggingGuide?.id === guide.id ? "is-dragging" : ""}`}
                style={guide.axis === "x" ? { left: screenPosition } : { top: screenPosition }}
                type="button"
                aria-label={`${guide.axis === "x" ? "垂直" : "水平"}導引線 ${formatGuideValue(guide.position, unit)}；拖曳移動，連按兩下刪除`}
                title="拖曳移動；連按兩下刪除"
                onPointerDown={(event) => onStartGuide(event, guide.axis, guide.id)}
                onDoubleClick={(event) => { event.stopPropagation(); onDeleteGuide(guide.id); }}
                key={guide.id}
              >
                {draggingGuide?.id === guide.id ? <span>{formatGuideValue(guide.position, unit)}</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}
      {unitMenu ? (
        <div className="ruler-unit-menu" style={{ left: unitMenu.x, top: unitMenu.y }} role="menu" aria-label="尺規單位" onPointerDown={(event) => event.stopPropagation()}>
          {Object.entries(RULER_UNITS).map(([id, option]) => (
            <button type="button" role="menuitemradio" aria-checked={unit === id} className={unit === id ? "is-active" : ""} onClick={() => { onUnitChange(id); setUnitMenu(null); }} key={id}>
              <span>{option.label}</span>{unit === id ? <Check size={14} /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function AccountAvatar({ user, size = 28 }) {
  return (
    <span className="account-avatar" style={{ "--account-avatar-size": `${size}px` }} aria-hidden="true">
      <span>{accountInitials(user)}</span>
      {user?.photoURL ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" onError={(event) => { event.currentTarget.hidden = true; }} /> : null}
    </span>
  );
}

function MobileTopbarMoreMenu({
  open,
  onOpenChange,
  onOpenCollaboration,
  onOpenAccount,
  onOpenSettings,
  collaborationCount = 0,
}) {
  const wrapperRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const focusFrame = window.requestAnimationFrame(() => {
      menuRef.current?.querySelector('[role="menuitem"]')?.focus();
    });
    const closeFromOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) onOpenChange(false);
    };
    const closeWithEscape = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      onOpenChange(false);
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    };
    const closeOnDesktop = () => {
      if (window.innerWidth > 900) onOpenChange(false);
    };
    window.addEventListener("pointerdown", closeFromOutside);
    window.addEventListener("keydown", closeWithEscape, true);
    window.addEventListener("resize", closeOnDesktop);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("pointerdown", closeFromOutside);
      window.removeEventListener("keydown", closeWithEscape, true);
      window.removeEventListener("resize", closeOnDesktop);
    };
  }, [onOpenChange, open]);

  const activate = (callback) => {
    onOpenChange(false);
    callback();
  };

  const navigateMenu = (event) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const items = [...(menuRef.current?.querySelectorAll('[role="menuitem"]') || [])];
    if (!items.length) return;
    event.preventDefault();
    const currentIndex = items.indexOf(document.activeElement);
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? items.length - 1
        : event.key === "ArrowDown"
          ? (currentIndex + 1 + items.length) % items.length
          : (currentIndex - 1 + items.length) % items.length;
    items[nextIndex].focus();
  };

  return (
    <div className="mobile-topbar-more" ref={wrapperRef}>
      <button
        className={`icon-button mobile-topbar-more-button ${open ? "is-active" : ""}`}
        type="button"
        aria-label="更多功能"
        title="更多功能"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="mobile-topbar-more-menu"
        ref={triggerRef}
        onClick={() => onOpenChange(!open)}
      >
        <Ellipsis size={20} />
      </button>
      {open ? (
        <div
          className="mobile-topbar-menu"
          id="mobile-topbar-more-menu"
          role="menu"
          aria-label="更多功能"
          ref={menuRef}
          onKeyDown={navigateMenu}
        >
          <button type="button" role="menuitem" onClick={() => activate(onOpenCollaboration)}>
            <Users size={18} />
            <span>協作</span>
            {collaborationCount > 0 ? <b>{collaborationCount}</b> : null}
          </button>
          <button type="button" role="menuitem" onClick={() => activate(onOpenAccount)}>
            <UserRound size={18} />
            <span>帳號與隱私</span>
          </button>
          <button type="button" role="menuitem" onClick={() => activate(onOpenSettings)}>
            <SettingsIcon size={18} />
            <span>設定</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

function SelectionActionBar({ count, hasArtboard, grouped, onAddArtboard, onAddAnnotation, onGrid, onToggleGroup, onDuplicate, onDelete, style }) {
  const selectionLabel = count > 1 ? `${count} 個選取物件` : "選取物件";
  const stopCanvasGesture = (event) => event.stopPropagation();

  return (
    <div
      className="selection-action-bar"
      role="toolbar"
      aria-label={`${selectionLabel}操作`}
      style={style}
      onPointerDown={stopCanvasGesture}
      onClick={stopCanvasGesture}
      onDoubleClick={stopCanvasGesture}
      onKeyDown={stopCanvasGesture}
    >
      <IconButton label={hasArtboard ? "選取範圍已包含紙張" : "在選取物件後方加入紙張"} onClick={onAddArtboard} disabled={hasArtboard}>
        <Square size={16} />
      </IconButton>
      <IconButton label="在選取範圍四周加入標題或說明" onClick={onAddAnnotation}>
        <Type size={16} />
      </IconButton>
      <IconButton label="建立或重新排列 Grid" onClick={onGrid}>
        <LayoutGrid size={16} />
      </IconButton>
      <IconButton label={grouped ? "解散群組 Shift+G" : "建立群組 Shift+G"} onClick={onToggleGroup} disabled={!grouped && count < 2} active={grouped}>
        <Layers3 size={16} />
      </IconButton>
      <span className="selection-action-divider" aria-hidden="true" />
      <IconButton label={`複製${selectionLabel} Shift+D`} onClick={onDuplicate}>
        <Copy size={16} />
      </IconButton>
      <IconButton className="danger-icon-button" label={`刪除${selectionLabel}；可按 ⌘Z 復原`} onClick={onDelete}>
        <Trash2 size={16} />
      </IconButton>
    </div>
  );
}

function MediaElement({ object, className = "", controls = false, decorative = false, style }) {
  if (isArtboardObject(object)) {
    return (
      <div
        className={`object-artboard-visual ${className}`}
        role={decorative ? undefined : "img"}
        aria-label={decorative ? undefined : `${object.name}，紙張`}
        aria-hidden={decorative || undefined}
        style={{ backgroundColor: object.fill || "#fffdf7", ...style }}
      >
        <span data-l10n-ignore>{object.name}</span>
      </div>
    );
  }
  if (isTextObject(object)) {
    const displayText = objectDisplayText(object);
    return (
      <div
        className={`object-text-visual ${className}`}
        data-l10n-ignore
        role={decorative ? undefined : "img"}
        aria-label={decorative ? undefined : `${object.name}：${displayText}`}
        aria-hidden={decorative || undefined}
        style={{
          color: object.color,
          fontFamily: object.fontFamily,
          fontSize: object.fontSize,
          fontWeight: object.fontWeight,
          ...textLayoutStyle(object),
          ...style,
        }}
      >
        {displayText}
      </div>
    );
  }
  if (isShapeObject(object)) {
    const points = shapeSvgPoints(object);
    return (
      <svg
        className={`object-shape-visual ${className}`}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        role={decorative ? undefined : "img"}
        aria-label={decorative ? undefined : `${object.name}，${SHAPE_LABELS[object.shapeKind] || "形狀"}`}
        aria-hidden={decorative || undefined}
        style={style}
      >
        {points ? <polygon points={points} fill={object.fill} /> : <rect x="1" y="1" width="98" height="98" rx="2" fill={object.fill} />}
      </svg>
    );
  }
  if (isVideoObject(object)) {
    return (
      <video
        className={className}
        src={object.src}
        aria-label={decorative ? undefined : object.name}
        aria-hidden={decorative || undefined}
        controls={controls}
        muted={!controls}
        playsInline
        preload="metadata"
        draggable="false"
        style={style}
      />
    );
  }
  return <img className={className} src={object.src} alt={decorative ? "" : object.name} draggable="false" style={style} />;
}

function CanvasTextEditor({ object, editSession, onChange, onFinish }) {
  const editorRef = useRef(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.textContent = objectDisplayText(object);
    editor.focus({ preventScroll: true });
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    if (editSession?.selectAll) range.selectNodeContents(editor);
    else {
      range.selectNodeContents(editor);
      range.collapse(false);
    }
    selection.removeAllRanges();
    selection.addRange(range);
  }, [editSession?.selectAll, object.id]);

  return (
    <div
      ref={editorRef}
      className="object-text-visual canvas-text-editor"
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label={`直接編輯「${object.name}」`}
      aria-multiline="true"
      data-placeholder="輸入文字"
      spellCheck="true"
      style={{
        color: object.color,
        fontFamily: object.fontFamily,
        fontSize: object.fontSize,
        fontWeight: object.fontWeight,
        ...textLayoutStyle(object),
      }}
      onInput={(event) => onChange(object.id, event.currentTarget.innerText.replace(/\r\n/g, "\n"))}
      onBlur={onFinish}
      onPointerDown={(event) => event.stopPropagation()}
      onPointerUp={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === "Escape" || ((event.metaKey || event.ctrlKey) && event.key === "Enter")) {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
    />
  );
}

function formatMediaTime(value) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  const minutes = Math.floor(value / 60);
  return `${minutes}:${seconds}`;
}

function CanvasVideoPlayer({ object, onControlsVisibilityChange }) {
  const playerRef = useRef(null);
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [failed, setFailed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const controlsVisible = object.videoControlsVisible !== false;

  useEffect(() => {
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setFailed(false);
  }, [object.src]);

  useEffect(() => {
    const syncFullscreen = () => setFullscreen(document.fullscreenElement === playerRef.current);
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  const stopObjectGesture = (event) => event.stopPropagation();
  const togglePlayback = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const video = videoRef.current;
    if (!video || failed) return;
    if (video.paused || video.ended) {
      if (video.ended) video.currentTime = 0;
      try {
        await video.play();
      } catch {
        setPlaying(false);
      }
    } else {
      video.pause();
    }
  };
  const seek = (event) => {
    event.stopPropagation();
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    const nextTime = Number(event.target.value) || 0;
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
  };
  const toggleFullscreen = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const player = playerRef.current;
    const video = videoRef.current;
    try {
      if (document.fullscreenElement === player) {
        await document.exitFullscreen?.();
      } else if (player?.requestFullscreen) {
        await player.requestFullscreen();
      } else if (video?.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
      }
    } catch {
      setFullscreen(false);
    }
  };
  const setControlsVisible = (event, visible) => {
    event.preventDefault();
    event.stopPropagation();
    onControlsVisibilityChange?.(visible);
  };

  return (
    <div
      ref={playerRef}
      className="canvas-video-player"
      onPointerDown={(event) => { if (fullscreen) event.stopPropagation(); }}
      onClick={(event) => { if (fullscreen) togglePlayback(event); }}
      onDoubleClick={(event) => { if (fullscreen) event.stopPropagation(); }}
    >
      <video
        ref={videoRef}
        src={object.src}
        aria-label={object.name}
        playsInline
        preload="metadata"
        draggable="false"
        onLoadedMetadata={(event) => {
          setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0);
          setFailed(false);
        }}
        onDurationChange={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime || 0)}
        onPlay={() => { setPlaying(true); setFailed(false); }}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onError={() => { setPlaying(false); setFailed(true); }}
      />
      {controlsVisible ? (
        <div
          className="canvas-video-controls"
          role="group"
          aria-label={`${object.name} 影片控制`}
          onPointerDown={stopObjectGesture}
          onClick={stopObjectGesture}
          onDoubleClick={stopObjectGesture}
          onKeyDown={stopObjectGesture}
        >
          <button
            className="canvas-video-control-button"
            type="button"
            aria-label={playing ? "暫停影片" : "播放影片"}
            title={playing ? "暫停" : "播放"}
            onClick={togglePlayback}
            disabled={failed}
          >
            {playing ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
          </button>
          <input
            type="range"
            min="0"
            max={Math.max(duration, 0)}
            step="0.01"
            value={Math.min(currentTime, Math.max(duration, 0))}
            aria-label="影片播放位置"
            onChange={seek}
            disabled={!duration || failed}
          />
          <output aria-live="off">{failed ? "無法播放" : `${formatMediaTime(currentTime)} / ${formatMediaTime(duration)}`}</output>
          <button
            className="canvas-video-control-button"
            type="button"
            aria-label={fullscreen ? "離開全螢幕" : "以全螢幕播放"}
            title={fullscreen ? "離開全螢幕" : "全螢幕"}
            onClick={toggleFullscreen}
          >
            {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button
            className="canvas-video-control-button"
            type="button"
            aria-label="隱藏影片控制器"
            title="隱藏控制器"
            onClick={(event) => setControlsVisible(event, false)}
          >
            <EyeOff size={14} />
          </button>
        </div>
      ) : (
        <button
          className="canvas-video-reveal"
          type="button"
          aria-label="顯示影片控制器"
          title="顯示影片控制器"
          onPointerDown={stopObjectGesture}
          onDoubleClick={stopObjectGesture}
          onKeyDown={stopObjectGesture}
          onClick={(event) => setControlsVisible(event, true)}
        >
          <Eye size={14} />
        </button>
      )}
    </div>
  );
}

function InsertToolbar({ open, onToggle, onAddText, onAddShape, onChooseImage, onChooseVideo, onChooseSvg }) {
  const shapeActions = [
    ["square", "正方形", Square],
    ["rectangle", "矩形", RectangleHorizontal],
    ["triangle", "三角形", Triangle],
    ["polygon", "六邊形", Hexagon],
    ["star", "星形", Star],
  ];
  return (
    <div className="insert-tools" role="group" aria-label="加入物件">
      <button className="toolbar-action insert-tool" type="button" aria-label="加入文字" title="加入文字" onClick={onAddText}>
        <Type size={17} /><span className="insert-tool-label">文字</span>
      </button>
      <button className="toolbar-action insert-tool" type="button" aria-label="加入圖片" title="從本機加入圖片" onClick={onChooseImage}>
        <ImagePlus size={17} /><span className="insert-tool-label">圖片</span>
      </button>
      <button className="toolbar-action insert-tool" type="button" aria-label="加入影片" title="從本機加入影片" onClick={onChooseVideo}>
        <Video size={17} /><span className="insert-tool-label">影片</span>
      </button>
      <div className="insert-menu-wrap">
        <button
          className={`toolbar-action insert-tool ${open ? "is-active" : ""}`}
          type="button"
          aria-label="加入形狀"
          title="加入形狀或匯入 SVG"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={onToggle}
        >
          <Shapes size={17} /><span className="insert-tool-label">形狀</span><ChevronDown className="insert-tool-chevron" size={13} />
        </button>
        {open ? (
          <div className="insert-menu shape-menu" role="menu" aria-label="選擇形狀">
            <button type="button" role="menuitem" onClick={onChooseSvg}><FileUp size={17} /><span><strong>匯入 SVG</strong><small>從本機選擇，拖入畫布也可以</small></span></button>
            <span className="insert-menu-heading">基本形狀</span>
            <div className="insert-shape-grid">
              {shapeActions.map(([kind, label, Icon]) => (
                <button key={kind} type="button" role="menuitem" aria-label={`加入${label}`} title={`加入${label}`} onClick={() => onAddShape(kind)}>
                  <Icon size={18} /><span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MarkerIcon({ symbol, color, size = 15 }) {
  const Icon = MARKER_ICONS[symbol] || Circle;
  return <Icon size={size} fill="currentColor" strokeWidth={1.75} style={{ color: MARKER_COLOR_VALUES[color] }} aria-hidden="true" />;
}

function MarkerPill({ marker, onRemove }) {
  return (
    <span className="marker-pill">
      <MarkerIcon symbol={marker.symbol} color={marker.color} />
      <span>{MARKER_LABELS[marker.symbol]} · {MARKER_COLOR_LABELS[marker.color]}</span>
      {onRemove ? (
        <button type="button" onClick={onRemove} aria-label={`移除${MARKER_LABELS[marker.symbol]}標記`} title="移除標記">
          <X size={13} />
          <span>移除</span>
        </button>
      ) : null}
    </span>
  );
}

function AxisPicker({ value, onChange }) {
  return (
    <div className="axis-picker" role="radiogroup" aria-label="九點軸心">
      {Object.entries(ANCHORS).map(([key, anchor]) => (
        <button
          key={key}
          type="button"
          role="radio"
          aria-checked={value === key}
          aria-label={anchor.label}
          title={anchor.label}
          className={value === key ? "is-active" : ""}
          onClick={() => onChange(key)}
        >
          <span />
        </button>
      ))}
    </div>
  );
}

function TextAlignmentControl({ label, accessibleLabel, value, options, onChange, columns = 3 }) {
  return (
    <div className="text-alignment-control">
      <strong>{label}</strong>
      <div
        className="text-alignment-buttons"
        style={{ "--alignment-columns": columns }}
        role="group"
        aria-label={accessibleLabel}
      >
        {options.map(({ value: optionValue, label: optionLabel, accessibleLabel: optionAccessibleLabel, Icon }) => (
          <button
            key={optionValue}
            type="button"
            className={value === optionValue ? "is-active" : ""}
            aria-label={optionAccessibleLabel}
            aria-pressed={value === optionValue}
            title={optionAccessibleLabel}
            onClick={() => onChange(optionValue)}
          >
            <Icon size={16} aria-hidden="true" />
            <span>{optionLabel}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function MarkerComposer({ markerDraft, setMarkerDraft, onAdd, disabled = false }) {
  return (
    <div className="marker-composer">
      <div className="marker-preview" aria-live="polite">
        <span className="marker-preview-icon"><MarkerIcon symbol={markerDraft.symbol} color={markerDraft.color} size={19} /></span>
        <span><small>標記預覽</small><strong>{MARKER_LABELS[markerDraft.symbol]} · {MARKER_COLOR_LABELS[markerDraft.color]}</strong></span>
      </div>
      <fieldset className="marker-option-group">
        <legend>符號</legend>
        <div className="marker-choice-grid">
          {MARKER_SYMBOLS.map((symbol) => (
            <button
              key={symbol}
              type="button"
              className={markerDraft.symbol === symbol ? "is-active" : ""}
              onClick={() => setMarkerDraft((current) => ({ ...current, symbol }))}
              aria-label={`符號：${MARKER_LABELS[symbol]}`}
              aria-pressed={markerDraft.symbol === symbol}
              title={MARKER_LABELS[symbol]}
            >
              <MarkerIcon symbol={symbol} color="white" size={17} />
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="marker-option-group marker-color-group">
        <legend>顏色</legend>
        <div className="color-choice-grid">
          {MARKER_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={markerDraft.color === color ? "is-active" : ""}
              onClick={() => setMarkerDraft((current) => ({ ...current, color }))}
              aria-label={`顏色：${MARKER_COLOR_LABELS[color]}`}
              aria-pressed={markerDraft.color === color}
              title={MARKER_COLOR_LABELS[color]}
            >
              <span className="marker-color-swatch" style={{ backgroundColor: MARKER_COLOR_VALUES[color] }} />
              {markerDraft.color === color ? <Check className="marker-color-check" size={12} aria-hidden="true" /> : null}
            </button>
          ))}
        </div>
      </fieldset>
      <button
        className="quiet-button marker-add-button"
        type="button"
        onClick={onAdd}
        disabled={disabled}
        aria-label={`套用「${MARKER_LABELS[markerDraft.symbol]} · ${MARKER_COLOR_LABELS[markerDraft.color]}」到選取項目`}
      >
        {disabled ? "套用到物件" : "套用到選取項目"}
      </button>
    </div>
  );
}

function LayersPanel({
  board,
  selectedIds,
  onSelect,
  onSelectGroup,
  onToggleVisible,
  onSetSelectedVisibility,
  onExportSelected,
  onOutputSelected,
  onDeleteSelected,
  onUngroup,
  onDuplicateLayer,
  onDeleteLayer,
  onMoveLayer,
  onReorderLayer,
  onLocate,
  layerTypeFilter,
  setLayerTypeFilter,
}) {
  const [layerDrag, setLayerDrag] = useState(null);
  const search = useListSearch("layers");
  const query = search.query.trim().toLocaleLowerCase("zh-Hant");
  const objects = [...board.objects]
    .reverse()
    .filter((object) =>
      query
        ? `${object.layerName} ${object.name}`.toLocaleLowerCase("zh-Hant").includes(query)
        : true,
    )
    .filter((object) => {
      if (layerTypeFilter === "all") return true;
      if (layerTypeFilter === "group") return Boolean(object.groupId);
      if (layerTypeFilter === "media") return ["image", "video"].includes(object.type);
      return object.type === layerTypeFilter;
    });
  const visibleSelected = board.objects.filter((object) => selectedIds.includes(object.id) && object.visible).length;
  const filteredGroups = (board.groups || []).filter((group) => {
    if (!["all", "group"].includes(layerTypeFilter)) return false;
    const members = board.objects.filter((object) => group.memberIds.includes(object.id));
    if (!members.length) return false;
    if (!query) return true;
    return `${group.name} ${members.map((object) => `${object.name} ${object.layerName}`).join(" ")}`.toLocaleLowerCase("zh-Hant").includes(query);
  });

  const startLayerDrag = (event, movingId) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.focus();
    const movingObject = objects.find((object) => object.id === movingId);
    let dropTarget = null;
    setLayerDrag({ id: movingId, name: movingObject?.layerName || "圖層", targetId: null, placement: "before" });

    const resolveTarget = (clientX, clientY) => {
      const row = document.elementFromPoint(clientX, clientY)?.closest("[data-layer-id]");
      const targetId = row?.dataset.layerId;
      if (!row || !targetId || targetId === movingId) return null;
      const rect = row.getBoundingClientRect();
      return {
        targetId,
        placement: row.dataset.dropPlacement || (clientY < rect.top + rect.height / 2 ? "before" : "after"),
      };
    };

    const move = (moveEvent) => {
      dropTarget = resolveTarget(moveEvent.clientX, moveEvent.clientY);
      setLayerDrag({
        id: movingId,
        name: movingObject?.layerName || "圖層",
        targetId: dropTarget?.targetId || null,
        placement: dropTarget?.placement || "before",
      });
    };
    const cleanup = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      window.removeEventListener("keydown", cancelOnEscape, true);
    };
    const up = (upEvent) => {
      dropTarget = resolveTarget(upEvent.clientX, upEvent.clientY) || dropTarget;
      cleanup();
      if (dropTarget) onReorderLayer(movingId, dropTarget.targetId, dropTarget.placement);
      setLayerDrag(null);
    };
    const cancel = () => {
      cleanup();
      setLayerDrag(null);
    };
    const cancelOnEscape = (keyEvent) => {
      if (keyEvent.key !== "Escape") return;
      keyEvent.preventDefault();
      keyEvent.stopImmediatePropagation();
      cancel();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
    window.addEventListener("pointercancel", cancel, { once: true });
    window.addEventListener("keydown", cancelOnEscape, true);
  };

  return (
    <div className="panel-scroll layers-panel">
      <div className="panel-list-toolbar">
        <span>{`${objects.length + filteredGroups.length} / ${board.objects.length + (board.groups || []).length}`}</span>
        <ListSearchToggle
          search={search}
          resultCount={objects.length + filteredGroups.length}
          totalCount={board.objects.length + (board.groups || []).length}
          forceActive={layerTypeFilter !== "all"}
          label="搜尋或篩選圖層"
        />
      </div>
      <ListSearchField search={search} placeholder="搜尋圖層或物件">
        <div className="layer-type-filters" role="radiogroup" aria-label="依物件類型篩選圖層">
          {LAYER_TYPE_FILTERS.map(([value, label]) => (
            <button key={value} type="button" role="radio" aria-checked={layerTypeFilter === value} className={layerTypeFilter === value ? "is-active" : ""} onClick={() => setLayerTypeFilter(value)}>
              {label}
            </button>
          ))}
        </div>
      </ListSearchField>
      {selectedIds.length ? (
        <div className="layer-bulk-actions" role="toolbar" aria-label={`${selectedIds.length} 個選取物件批次操作`}>
          <span><strong>{selectedIds.length}</strong> 個選取</span>
          <IconButton label="顯示選取物件" onClick={() => onSetSelectedVisibility(true)} disabled={visibleSelected === selectedIds.length}><Eye size={15} /></IconButton>
          <IconButton label="隱藏選取物件" onClick={() => onSetSelectedVisibility(false)} disabled={!visibleSelected}><EyeOff size={15} /></IconButton>
          <IconButton label="批次匯出每個選取物件" onClick={onExportSelected}><Download size={15} /></IconButton>
          <IconButton label="將選取物件輸出為一張合成圖" onClick={onOutputSelected}><ImageDown size={15} /></IconButton>
          <IconButton className="danger-icon-button" label="批次刪除選取物件" onClick={onDeleteSelected}><Trash2 size={15} /></IconButton>
        </div>
      ) : null}
      {filteredGroups.length ? (
        <div className="layer-group-list" aria-label="群組">
          {filteredGroups.map((group) => {
            const selected = group.memberIds.length > 0 && group.memberIds.every((id) => selectedIds.includes(id));
            return (
              <div className={`layer-group-row ${selected ? "is-selected" : ""}`} key={group.id}>
                <button type="button" onClick={(event) => onSelectGroup(group.id, event.shiftKey)} aria-pressed={selected}>
                  <Layers3 size={16} /><span data-l10n-ignore>{group.name}</span><small>{group.memberIds.length}</small>
                </button>
                <IconButton label={`解散「${group.name}」`} onClick={() => onUngroup(group.id)}><X size={14} /></IconButton>
              </div>
            );
          })}
        </div>
      ) : null}
      {objects.length ? (
        <div className="layer-list">
          {objects.map((object) => {
            const selected = selectedIds.includes(object.id);
            const dropBefore = layerDrag?.targetId === object.id && layerDrag.placement === "before";
            const dropAfter = layerDrag?.targetId === object.id && layerDrag.placement === "after";
            const renderPlaceholder = (placement) => (
              <div
                className="layer-drop-indicator"
                data-layer-id={object.id}
                data-drop-placement={placement}
                aria-hidden="true"
              />
            );
            return (
              <React.Fragment key={object.id}>
                {dropBefore ? renderPlaceholder("before") : null}
                <div
                  className={`layer-row ${selected ? "is-selected" : ""} ${layerDrag?.id === object.id ? "is-dragging" : ""} ${object.groupId ? "is-group-member" : ""} ${object.artboardId ? "is-artboard-child" : ""} ${isArtboardObject(object) ? "is-artboard" : ""}`}
                  data-layer-id={object.id}
                >
                  <button
                    className="layer-drag-handle"
                    type="button"
                    aria-label={`拖曳「${object.layerName}」調整圖層順序`}
                    aria-pressed={layerDrag?.id === object.id}
                    title="按住拖曳排序；鍵盤可用上下方向鍵"
                    onClick={(event) => event.preventDefault()}
                    onPointerDown={(event) => startLayerDrag(event, object.id)}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowUp") { event.preventDefault(); onMoveLayer(object.id, 1); }
                      if (event.key === "ArrowDown") { event.preventDefault(); onMoveLayer(object.id, -1); }
                    }}
                  >
                    <GripVertical size={15} />
                  </button>
                  <button
                    className="layer-main"
                    type="button"
                    onClick={(event) => onSelect(object.id, event.shiftKey, event.metaKey || event.ctrlKey)}
                    onDoubleClick={() => onLocate(object.id)}
                    aria-pressed={selected}
                    title="選取圖層；連按兩下可置中顯示"
                  >
                    <MediaElement object={object} decorative />
                    <span>
                      <strong data-l10n-ignore>{object.layerName}</strong>
                      <small data-l10n-ignore>{isArtboardObject(object) ? `${object.name} · ${PAPER_PRESETS[object.paperPreset]?.label || "紙張"}` : object.annotationKind ? `${object.name} · ${object.annotationKind === "title" ? "標題" : "說明"}` : object.name}</small>
                    </span>
                    {object.markers.length ? (
                      <span className="layer-markers" aria-label={`${object.markers.length} 個標記`}>
                        {object.markers.slice(0, 3).map((marker) => (
                          <MarkerIcon key={markerKey(marker)} symbol={marker.symbol} color={marker.color} size={12} />
                        ))}
                      </span>
                    ) : null}
                  </button>
                  <div className="layer-actions">
                    <IconButton label={`將「${object.layerName}」置中顯示`} onClick={() => onLocate(object.id)}>
                      <LocateFixed size={15} />
                    </IconButton>
                    <IconButton label={`複製圖層「${object.layerName}」`} onClick={() => onDuplicateLayer(object.id)}>
                      <Copy size={15} />
                    </IconButton>
                    <IconButton label={object.visible ? "隱藏圖層" : "顯示圖層"} onClick={() => onToggleVisible(object.id)}>
                      {object.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                    </IconButton>
                    <IconButton className="danger-icon-button" label={`刪除圖層「${object.layerName}」；可按 ⌘Z 復原`} onClick={() => onDeleteLayer(object.id)}>
                      <Trash2 size={15} />
                    </IconButton>
                  </div>
                </div>
                {dropAfter ? renderPlaceholder("after") : null}
              </React.Fragment>
            );
          })}
          <span className="sr-only" aria-live="polite">
            {layerDrag?.targetId
              ? `將「${layerDrag.name}」放在「${objects.find((object) => object.id === layerDrag.targetId)?.layerName || "目標圖層"}」${layerDrag.placement === "before" ? "上方" : "下方"}`
              : ""}
          </span>
        </div>
      ) : (
        <div className="panel-empty">
          <Layers3 size={24} />
          <strong>{board.objects.length ? "找不到符合的圖層" : "還沒有圖層"}</strong>
          <p>{board.objects.length ? "保留搜尋內容，調整關鍵字或清除搜尋。" : "加入文字、形狀或素材後，每個物件會自動建立自己的圖層。"}</p>
          {query ? <button type="button" className="text-button" onClick={() => search.setQuery("")}>清除搜尋</button> : null}
        </div>
      )}
    </div>
  );
}

function FiltersPanel({ board, filters, setFilters, matchCount }) {
  const active = filters.symbols.length + filters.colors.length > 0;
  const toggle = (kind, value) => {
    setFilters((current) => ({
      ...current,
      [kind]: current[kind].includes(value)
        ? current[kind].filter((item) => item !== value)
        : [...current[kind], value],
    }));
  };

  return (
    <div className="panel-scroll filters-panel">
      <div className="filter-heading">
        <div>
          <strong>把物件叫來排隊</strong>
          <p>篩選只改變暫時視圖；清除後會回到原本位置。</p>
        </div>
        {active ? <span>{matchCount} / {board.objects.length}</span> : null}
      </div>

      <fieldset>
        <legend>符號</legend>
        <div className="filter-symbol-grid">
          {MARKER_SYMBOLS.map((symbol) => {
            const Icon = MARKER_ICONS[symbol];
            const selected = filters.symbols.includes(symbol);
            const count = board.objects.filter((object) => object.markers.some((marker) => marker.symbol === symbol)).length;
            return (
              <button
                key={symbol}
                type="button"
                className={selected ? "is-active" : ""}
                onClick={() => toggle("symbols", symbol)}
                aria-pressed={selected}
              >
                <Icon size={18} />
                <span>{MARKER_LABELS[symbol]}</span>
                <small>{count}</small>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend>色彩</legend>
        <div className="filter-color-grid">
          {MARKER_COLORS.map((color) => {
            const selected = filters.colors.includes(color);
            const count = board.objects.filter((object) => object.markers.some((marker) => marker.color === color)).length;
            return (
              <button
                key={color}
                type="button"
                className={selected ? "is-active" : ""}
                onClick={() => toggle("colors", color)}
                aria-pressed={selected}
              >
                <span style={{ background: MARKER_COLOR_VALUES[color] }} />
                <strong>{MARKER_COLOR_LABELS[color]}</strong>
                <small>{count}</small>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend>符合方式</legend>
        <div className="segmented-control">
          <button type="button" className={filters.mode === "any" ? "is-active" : ""} onClick={() => setFilters((current) => ({ ...current, mode: "any" }))}>
            任一標記
          </button>
          <button type="button" className={filters.mode === "all" ? "is-active" : ""} onClick={() => setFilters((current) => ({ ...current, mode: "all" }))}>
            全部符合
          </button>
        </div>
      </fieldset>

      {active ? (
        <button className="secondary-button full-width" type="button" onClick={() => setFilters(DEFAULT_FILTERS)}>
          <X size={16} /> 清除篩選，回到原位
        </button>
      ) : (
        <div className="filter-tip">
          <Sparkles size={18} />
          <p>先為物件加上符號和色彩，再從這裡組合篩選。</p>
        </div>
      )}
    </div>
  );
}

function CaptureThumbnail({ capture, board }) {
  const mediaById = new Map(board.objects.map((object) => [object.id, object]));
  const width = Math.max(1, capture.viewport.width);
  const height = Math.max(1, capture.viewport.height);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${capture.name} 預覽`} preserveAspectRatio="xMidYMid slice">
      <rect width={width} height={height} fill="var(--canvas-bg)" />
      <g opacity="0.32">
        {Array.from({ length: Math.ceil(width / 36) + 1 }, (_, index) => <line key={`x-${index}`} x1={index * 36} y1="0" x2={index * 36} y2={height} stroke="var(--text-muted)" strokeWidth="1" />)}
        {Array.from({ length: Math.ceil(height / 36) + 1 }, (_, index) => <line key={`y-${index}`} x1="0" y1={index * 36} x2={width} y2={index * 36} stroke="var(--text-muted)" strokeWidth="1" />)}
      </g>
      {capture.objects.filter((state) => state.visible).map((state) => {
        const object = mediaById.get(state.id);
        if (!object) return null;
        const anchor = ANCHORS[state.anchor] || ANCHORS.mc;
        const scaledWidth = state.width * capture.view.zoom;
        const scaledHeight = state.height * capture.view.zoom;
        const pivotX = capture.view.x + state.pivotX * capture.view.zoom;
        const pivotY = capture.view.y + state.pivotY * capture.view.zoom;
        return (
          <g key={state.id} transform={`translate(${pivotX} ${pivotY}) rotate(${state.rotation})`}>
            {isVideoObject(object) ? (
              <g>
                <rect x={-anchor.x * scaledWidth} y={-anchor.y * scaledHeight} width={scaledWidth} height={scaledHeight} rx="5" fill="var(--surface-strong)" stroke="var(--accent-ui)" strokeOpacity="0.55" />
                <circle cx={(0.5 - anchor.x) * scaledWidth} cy={(0.5 - anchor.y) * scaledHeight} r={Math.max(8, Math.min(scaledWidth, scaledHeight) * 0.11)} fill="var(--accent-fill)" fillOpacity="0.86" />
                <path d="M -3 -5 L 6 0 L -3 5 Z" transform={`translate(${(0.5 - anchor.x) * scaledWidth} ${(0.5 - anchor.y) * scaledHeight})`} fill="var(--accent-on)" />
              </g>
            ) : isTextObject(object) ? (
              <foreignObject x={-anchor.x * scaledWidth} y={-anchor.y * scaledHeight} width={scaledWidth} height={scaledHeight}>
                <div
                  xmlns="http://www.w3.org/1999/xhtml"
                  style={{
                    boxSizing: "border-box",
                    color: object.color,
                    height: "100%",
                    fontFamily: object.fontFamily,
                    fontSize: Math.max(3, (state.fontSize || object.fontSize) * capture.view.zoom),
                    fontWeight: object.fontWeight,
                    lineHeight: 1.2,
                    overflow: "hidden",
                    overflowWrap: "anywhere",
                    whiteSpace: "pre-wrap",
                    width: "100%",
                    ...textLayoutStyle(object),
                  }}
                >
                  {objectDisplayText(object)}
                </div>
              </foreignObject>
            ) : isShapeObject(object) ? (
              <g transform={`translate(${-anchor.x * scaledWidth} ${-anchor.y * scaledHeight}) scale(${scaledWidth / 100} ${scaledHeight / 100})`}>
                {shapeSvgPoints(object) ? <polygon points={shapeSvgPoints(object)} fill={object.fill} /> : <rect x="1" y="1" width="98" height="98" rx="2" fill={object.fill} />}
              </g>
            ) : (
              <image href={object.src} x={-anchor.x * scaledWidth} y={-anchor.y * scaledHeight} width={scaledWidth} height={scaledHeight} preserveAspectRatio="none" />
            )}
          </g>
        );
      })}
    </svg>
  );
}

function CapturesPanel({
  board,
  selectedCaptureId,
  onCapture,
  onRestoreCapture,
  onRestoreLastComposition,
  onReplaceCapture,
  onMoveCapture,
  onReorderCapture,
  onDeleteCapture,
}) {
  const [captureDrag, setCaptureDrag] = useState(null);
  const search = useListSearch("captures");
  const selectedCapture = board.captures.find((capture) => capture.id === selectedCaptureId);
  const captures = [...board.captures]
    .reverse()
    .filter((capture) => matchesListQuery([capture.name, formatTime(capture.updatedAt), `${Math.round(capture.view.zoom * 100)}%`], search.query));

  const startCaptureDrag = (event, movingId) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.focus();
    const movingCapture = captures.find((capture) => capture.id === movingId);
    let dropTarget = null;
    setCaptureDrag({ id: movingId, name: movingCapture?.name || "構圖", targetId: null, placement: "before" });

    const resolveTarget = (clientX, clientY) => {
      const row = document.elementFromPoint(clientX, clientY)?.closest("[data-capture-id]");
      const targetId = row?.dataset.captureId;
      if (!row || !targetId || targetId === movingId) return null;
      const rect = row.getBoundingClientRect();
      return {
        targetId,
        placement: row.dataset.dropPlacement || (clientY < rect.top + rect.height / 2 ? "before" : "after"),
      };
    };

    const move = (moveEvent) => {
      dropTarget = resolveTarget(moveEvent.clientX, moveEvent.clientY);
      setCaptureDrag({
        id: movingId,
        name: movingCapture?.name || "構圖",
        targetId: dropTarget?.targetId || null,
        placement: dropTarget?.placement || "before",
      });
    };
    const cleanup = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      window.removeEventListener("keydown", cancelOnEscape, true);
    };
    const up = (upEvent) => {
      dropTarget = resolveTarget(upEvent.clientX, upEvent.clientY) || dropTarget;
      cleanup();
      if (dropTarget) onReorderCapture(movingId, dropTarget.targetId, dropTarget.placement);
      setCaptureDrag(null);
    };
    const cancel = () => {
      cleanup();
      setCaptureDrag(null);
    };
    const cancelOnEscape = (keyEvent) => {
      if (keyEvent.key !== "Escape") return;
      keyEvent.preventDefault();
      keyEvent.stopImmediatePropagation();
      cancel();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
    window.addEventListener("pointercancel", cancel, { once: true });
    window.addEventListener("keydown", cancelOnEscape, true);
  };

  return (
    <div className="panel-scroll captures-panel">
      <div className="capture-heading">
        <div>
          <strong>構圖</strong>
          <p>保存目前物件與視窗；切換前會自動保留當下構圖。</p>
        </div>
        <ListSearchToggle search={search} resultCount={captures.length} totalCount={board.captures.length} label="搜尋構圖" />
      </div>
      <ListSearchField search={search} placeholder="搜尋構圖名稱" />
      <button className="primary-button full-width capture-button" type="button" onClick={onCapture}>
        <Camera size={17} /> 記錄目前構圖
      </button>
      {board.lastComposition ? (
        <button className="last-composition-card" type="button" onClick={onRestoreLastComposition}>
          <span className="last-composition-preview"><CaptureThumbnail capture={board.lastComposition} board={board} /></span>
          <span>
            <strong>回到切換前構圖</strong>
            <small>{`${Math.round(board.lastComposition.view.zoom * 100)}% · ${board.lastComposition.objects.length} 個物件`}</small>
            <time dateTime={board.lastComposition.updatedAt}>{formatTime(board.lastComposition.updatedAt)}</time>
          </span>
          <RotateCcw size={16} aria-hidden="true" />
        </button>
      ) : null}
      {captures.length ? (
        <div className="capture-list">
          {captures.map((capture) => {
            const dropBefore = captureDrag?.targetId === capture.id && captureDrag.placement === "before";
            const dropAfter = captureDrag?.targetId === capture.id && captureDrag.placement === "after";
            const renderPlaceholder = (placement) => (
              <div
                className="capture-drop-indicator"
                data-capture-id={capture.id}
                data-drop-placement={placement}
                aria-hidden="true"
              />
            );
            return (
              <React.Fragment key={capture.id}>
                {dropBefore ? renderPlaceholder("before") : null}
                <div
                  className={`capture-row ${selectedCaptureId === capture.id ? "is-selected" : ""} ${captureDrag?.id === capture.id ? "is-dragging" : ""}`}
                  data-capture-id={capture.id}
                >
                  <button
                    className="capture-drag-handle"
                    type="button"
                    aria-label={`拖曳「${capture.name}」調整構圖順序`}
                    aria-pressed={captureDrag?.id === capture.id}
                    title="按住拖曳排序；鍵盤可用上下方向鍵"
                    onClick={(event) => event.preventDefault()}
                    onPointerDown={(event) => startCaptureDrag(event, capture.id)}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowUp") { event.preventDefault(); onMoveCapture(capture.id, 1); }
                      if (event.key === "ArrowDown") { event.preventDefault(); onMoveCapture(capture.id, -1); }
                    }}
                  >
                    <GripVertical size={16} />
                  </button>
                  <button
                    className="capture-card"
                    type="button"
                    aria-pressed={selectedCaptureId === capture.id}
                    onClick={() => onRestoreCapture(capture)}
                  >
                    <span className="capture-preview"><CaptureThumbnail capture={capture} board={board} /></span>
                    <span className="capture-copy">
                      <strong data-l10n-ignore>{capture.name}</strong>
                      <small>{`${Math.round(capture.view.zoom * 100)}% · ${capture.objects.length} 個物件`}</small>
                      <time dateTime={capture.updatedAt}>{formatTime(capture.updatedAt)}</time>
                    </span>
                  </button>
                  <IconButton className="capture-delete-button" label={`刪除「${capture.name}」`} onClick={() => onDeleteCapture(capture.id)}>
                    <Trash2 size={16} />
                  </IconButton>
                </div>
                {dropAfter ? renderPlaceholder("after") : null}
              </React.Fragment>
            );
          })}
          <span className="sr-only" aria-live="polite">
            {captureDrag?.targetId
              ? `將「${captureDrag.name}」放在「${captures.find((capture) => capture.id === captureDrag.targetId)?.name || "目標構圖"}」${captureDrag.placement === "before" ? "上方" : "下方"}`
              : ""}
          </span>
        </div>
      ) : board.captures.length ? (
        <div className="panel-empty capture-empty">
          <Search size={25} />
          <strong>找不到符合的構圖</strong>
          <p>搜尋條件會保留，可以調整或清除。</p>
          <button type="button" className="text-button" onClick={() => search.setQuery("")}>清除搜尋</button>
        </div>
      ) : (
        <div className="panel-empty capture-empty">
          <Images size={25} />
          <strong>還沒有構圖</strong>
          <p>把常用構圖存成縮圖，之後可一鍵回復位置、大小、角度與視窗。</p>
        </div>
      )}
      {selectedCapture ? (
        <button className="secondary-button full-width replace-capture-button" type="button" onClick={() => onReplaceCapture(selectedCapture)}>
          <RotateCcw size={16} /> 以目前構圖取代選取項目
        </button>
      ) : null}
    </div>
  );
}

function SourcesPanel({ sourceAssets, board }) {
  const imageCount = sourceAssets.filter(({ representative }) => !isVideoObject(representative)).length;
  const videoCount = sourceAssets.length - imageCount;
  const instanceCount = sourceAssets.reduce((total, source) => total + source.instanceIds.length, 0);
  return (
    <div className="panel-scroll sources-panel">
      <div className="source-heading">
        <div>
          <strong>來源素材</strong>
          <p>每個匯入來源只列一次；主工作區可切換縮圖與原圖。</p>
        </div>
        <span>{sourceAssets.length}</span>
      </div>
      <div className="source-model-note">
        <Copy size={18} />
        <div>
          <strong>複製品是獨立實例</strong>
          <p>每份複製品都有自己的物件、圖層、位置與標記，但沿用同一份來源素材。</p>
        </div>
      </div>
      {sourceAssets.length ? (
        <dl className="source-stats">
          <div><dt>圖片 / SVG</dt><dd>{imageCount}</dd></div>
          <div><dt>影片</dt><dd>{videoCount}</dd></div>
          <div><dt>畫布實例</dt><dd>{instanceCount} / {board.objects.length}</dd></div>
        </dl>
      ) : (
        <div className="panel-empty source-empty">
          <ImageIcon size={25} />
          <strong>還沒有來源素材</strong>
          <p>加入圖片、影片或 SVG 後，每個來源會在這裡只列一次。</p>
        </div>
      )}
      {sourceAssets.length ? <p className="source-panel-tip">提示：連按主工作區中的縮圖兩下，可直接開啟原圖檢視。</p> : null}
    </div>
  );
}

function LeftSidebar(props) {
  const {
    leftTab,
    setLeftTab,
    mobilePanel,
    setMobilePanel,
    panelWidth,
    panelMaxWidth,
    onPanelResizeStart,
    onPanelResizeKeyDown,
  } = props;
  return (
    <aside className={`left-sidebar ${mobilePanel === "left" ? "is-mobile-open" : ""}`} aria-label="圖層、分群、素材與構圖">
      <div className="sidebar-heading">
        <div className="sidebar-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={leftTab === "layers"} className={leftTab === "layers" ? "is-active" : ""} onClick={() => setLeftTab("layers")}>
            <Layers3 size={17} /> 圖層
          </button>
          <button type="button" role="tab" aria-selected={leftTab === "filters"} className={leftTab === "filters" ? "is-active" : ""} onClick={() => setLeftTab("filters")}>
            <Tags size={17} /> 分群
          </button>
          <button type="button" role="tab" aria-selected={leftTab === "sources"} className={leftTab === "sources" ? "is-active" : ""} onClick={() => setLeftTab("sources")}>
            <ImageIcon size={17} /> 素材
          </button>
          <button type="button" role="tab" aria-selected={leftTab === "captures"} className={leftTab === "captures" ? "is-active" : ""} onClick={() => setLeftTab("captures")}>
            <Camera size={17} /> 構圖
          </button>
        </div>
        <IconButton className="mobile-close" label="關閉側欄" onClick={() => setMobilePanel(null)}><X size={18} /></IconButton>
      </div>
      {leftTab === "layers" ? <LayersPanel {...props} /> : null}
      {leftTab === "filters" ? <FiltersPanel {...props} /> : null}
      {leftTab === "sources" ? <SourcesPanel {...props} /> : null}
      {leftTab === "captures" ? <CapturesPanel {...props} /> : null}
      <button
        className="left-sidebar-resizer"
        type="button"
        role="separator"
        aria-label="調整左側欄寬度"
        aria-orientation="vertical"
        aria-valuemin={LEFT_PANEL_MIN_WIDTH}
        aria-valuemax={panelMaxWidth}
        aria-valuenow={panelWidth}
        title="拖曳調整左側欄寬度；方向鍵可微調"
        onPointerDown={onPanelResizeStart}
        onKeyDown={onPanelResizeKeyDown}
      />
    </aside>
  );
}

const MICRO_3D_CONTROLS = [
  { key: "tiltX", label: "X 軸傾斜", min: -30, max: 30, step: 1, unit: "°" },
  { key: "tiltY", label: "Y 軸傾斜", min: -30, max: 30, step: 1, unit: "°" },
  { key: "depth", label: "前後景深", min: -120, max: 120, step: 2, unit: "px" },
  { key: "perspective", label: "透視距離", min: 500, max: 2000, step: 50, unit: "px" },
];

const MICRO_3D_PRESETS = [
  { label: "左傾", values: { tiltX: 4, tiltY: -16, depth: 12, perspective: 1000 } },
  { label: "正面", values: { tiltX: 0, tiltY: 0, depth: 0, perspective: 1000 } },
  { label: "右傾", values: { tiltX: 4, tiltY: 16, depth: 12, perspective: 1000 } },
];

function Micro3DControls({ objects, onChange, active, onActiveChange }) {
  const first = objects[0];
  if (!first) return null;
  const hasMixedValues = MICRO_3D_CONTROLS.some(({ key }) =>
    objects.some((object) => Number(object[key]) !== Number(first[key])),
  );
  const resetDisabled = objects.every((object) =>
    Math.abs(Number(object.tiltX) || 0) < 0.01
      && Math.abs(Number(object.tiltY) || 0) < 0.01
      && Math.abs(Number(object.depth) || 0) < 0.01
      && Math.abs((Number(object.perspective) || 1000) - 1000) < 0.01,
  );

  return (
    <section className={`inspector-section micro-3d-section ${active ? "is-active" : ""}`}>
      <div className="section-heading-row">
        <h3>進階 3D</h3>
        <button
          className={`micro-3d-mode-toggle ${active ? "is-active" : ""}`}
          type="button"
          role="switch"
          aria-checked={active}
          onClick={() => onActiveChange(!active)}
        >
          <Box size={15} /> {active ? "3D 操作中" : "切換到 3D"}
        </button>
      </div>
      {active ? (
        <>
          <div className="micro-3d-status">
            <span>物件軌道已啟用</span>
            {objects.length > 1 ? <strong>{hasMixedValues ? "混合值" : `${objects.length} 個同步`}</strong> : <strong>單一物件</strong>}
          </div>
          <div className="micro-3d-presets" role="group" aria-label="微 3D 預設">
            {MICRO_3D_PRESETS.map((preset) => (
              <button key={preset.label} type="button" onClick={() => onChange(preset.values)}>{preset.label}</button>
            ))}
          </div>
          <div className="micro-3d-controls">
            {MICRO_3D_CONTROLS.map((control) => {
              const fallback = control.key === "perspective" ? 1000 : 0;
              const value = Number.isFinite(Number(first[control.key])) ? Number(first[control.key]) : fallback;
              const mixed = objects.some((object) => (Number(object[control.key]) || fallback) !== value);
              const displayValue = Math.round(value * 10) / 10;
              return (
                <label key={control.key}>
                  <span className="micro-3d-label">
                    <span>{control.label}</span>
                    <output>{mixed ? "混合" : `${displayValue}${control.unit}`}</output>
                  </span>
                  <input
                    type="range"
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    value={Math.min(control.max, Math.max(control.min, value))}
                    aria-label={control.label}
                    onChange={(event) => onChange({ [control.key]: Number(event.target.value) })}
                  />
                </label>
              );
            })}
          </div>
          <button
            className="quiet-button micro-3d-reset"
            type="button"
            onClick={() => onChange({ tiltX: 0, tiltY: 0, depth: 0, perspective: 1000 })}
            disabled={resetDisabled}
          >
            <RotateCcw size={15} /> 3D 歸零
          </button>
          <p className="transform-helper">直接拖曳選取物件或軌道可像軌跡球一樣旋轉；X、Y、Z 可限制軸向，Shift 鎖定自由旋轉的主軸。</p>
        </>
      ) : (
        <p className="micro-3d-inactive-copy">一般選取維持 2D 操作；切換後選取物件會改用 3D 軌道游標與旋轉操作。</p>
      )}
    </section>
  );
}

function Inspector({
  board,
  selectedIds,
  onUpdateObject,
  onPivotChange,
  onRestoreSize,
  onResetRotation,
  onSetAspectLock,
  onMicro3DChange,
  micro3DMode,
  onMicro3DModeChange,
  markerDraft,
  setMarkerDraft,
  onAddMarker,
  onRemoveMarker,
  batchPrefix,
  setBatchPrefix,
  onBatchRename,
  selectionAnchor,
  onSelectionAnchorChange,
  keyObjectId,
  onAlign,
  onDistribute,
  resizeGesture,
  groupGesture,
  localFontOptions,
  localFontState,
  onLoadLocalFonts,
  onStartTextEdit,
  onResizeTextFrame,
  onFitArtboard,
  onResizeArtboardPreset,
  selectionGrouped,
  onToggleGroup,
  mobilePanel,
  setMobilePanel,
}) {
  const selected = board.objects.filter((object) => selectedIds.includes(object.id));
  const object = selected.length === 1 ? selected[0] : null;
  const keyObject = selected.find((item) => item.id === keyObjectId) || selected[0];
  const allAspectLocked = selected.length > 0 && selected.every((item) => item.aspectLocked !== false);
  const activeResize = object && resizeGesture?.objectId === object.id ? resizeGesture : selected.length > 1 && groupGesture?.type === "scale" ? groupGesture : null;
  const temporaryUnlocked = Boolean(activeResize?.shift && allAspectLocked);
  const effectiveAspectLocked = allAspectLocked && !temporaryUnlocked;
  const knownFont = object && [...FONT_OPTIONS, ...localFontOptions].some((font) => font.value === object.fontFamily);
  const printSizePreset = object && SHAPE_PRINT_SIZE_PRESETS.find((preset) => preset.width === Math.round(object.width) && preset.height === Math.round(object.height));
  const socialSizePreset = object && SHAPE_SOCIAL_SIZE_PRESETS.find((preset) => preset.width === Math.round(object.width) && preset.height === Math.round(object.height));
  const activeStarStyle = object?.shapeKind === "star"
    ? STAR_STYLE_PRESETS.find((preset) => preset.starPoints === object.starPoints && Math.abs(preset.starInnerRatio - object.starInnerRatio) < 0.001)
    : null;

  const updateDimension = (dimension, rawValue) => {
    if (!object) return;
    const value = Math.max(24, Number(rawValue) || 24);
    const ratio = object.width / object.height || 1;
    const patch = object.aspectLocked === false
      ? { [dimension]: value }
      : dimension === "width"
        ? { width: value, height: Math.max(24, value / ratio) }
        : { height: value, width: Math.max(24, value * ratio) };
    if (isTextObject(object) && patch.height) {
      patch.fontSize = Math.max(6, object.fontSize * (patch.height / object.height));
    }
    if (isArtboardObject(object)) patch.paperPreset = "custom";
    onUpdateObject(object.id, patch);
  };

  const applyShapeSizePreset = (preset) => {
    if (!object || !preset) return;
    onUpdateObject(object.id, resizeObjectToDimensions(object, preset.width, preset.height));
  };

  return (
    <aside className={`inspector ${mobilePanel === "right" ? "is-mobile-open" : ""}`} aria-label="物件屬性">
      <div className="inspector-heading">
        <div>
          <span>Inspector</span>
          <strong>{selected.length ? `${selected.length} 個已選取` : "尚未選取"}</strong>
        </div>
        <IconButton className="mobile-close" label="關閉屬性" onClick={() => setMobilePanel(null)}><X size={18} /></IconButton>
      </div>

      <div className="panel-scroll inspector-content">
        {!selected.length ? (
          <div className="inspector-empty">
            <SlidersHorizontal size={27} />
            <strong>選取一個物件開始編輯</strong>
            <p>選取工具可操作物件；空白處拖曳可框選，雙擊第二下按住拖曳可平移畫布。平移工具中按住 Shift 可暫時選取。</p>
            <dl>
              <div><dt>物件</dt><dd>{board.objects.length}</dd></div>
              <div><dt>標記</dt><dd>{board.objects.reduce((total, item) => total + item.markers.length, 0)}</dd></div>
              <div><dt>版本</dt><dd>r{board.revision}</dd></div>
            </dl>
          </div>
        ) : null}

        {object ? (
          <>
            <section className="inspector-section">
              <h3>命名</h3>
              <label>
                <span>物件名稱</span>
                <input value={object.name} onChange={(event) => onUpdateObject(object.id, { name: event.target.value })} />
              </label>
              <label>
                <span>圖層名稱</span>
                <input value={object.layerName} onChange={(event) => onUpdateObject(object.id, { layerName: event.target.value })} />
              </label>
            </section>

            {isTextObject(object) ? (
              <section className="inspector-section text-properties">
                <div className="section-heading-row">
                  <h3>文字</h3>
                  <button className="inline-text-edit-button" type="button" onClick={(event) => onStartTextEdit(event, object.id, true)}>
                    <Type size={14} /> 在畫布編輯
                  </button>
                </div>
                <label>
                  <span>內容</span>
                  <textarea rows="4" value={object.text} onChange={(event) => onUpdateObject(object.id, { text: event.target.value })} />
                </label>
                <label>
                  <span>字體</span>
                  <select value={object.fontFamily} onChange={(event) => onUpdateObject(object.id, { fontFamily: event.target.value })}>
                    {!knownFont ? <option value={object.fontFamily}>目前檔案字體</option> : null}
                    <optgroup label="內建字體">
                      {FONT_OPTIONS.map((font) => <option key={font.label} value={font.value}>{font.label}</option>)}
                    </optgroup>
                    {localFontOptions.length ? (
                      <optgroup label="這台裝置的字體">
                        {localFontOptions.map((font) => <option key={font.label} value={font.value}>{font.label}</option>)}
                      </optgroup>
                    ) : null}
                  </select>
                </label>
                <button className="local-font-button" type="button" onClick={onLoadLocalFonts} disabled={["loading", "unsupported"].includes(localFontState.status)}>
                  <HardDrive size={14} />
                  {localFontState.status === "loading" ? "正在讀取字體…" : localFontState.status === "loaded" ? `重新讀取本機字體（${localFontOptions.length}）` : "載入本機字體"}
                </button>
                <p className={`font-access-status is-${localFontState.status}`} aria-live="polite">{localFontState.message}</p>
                <div className="property-grid">
                  <label>
                    <span>粗細</span>
                    <select value={String(object.fontWeight)} onChange={(event) => onUpdateObject(object.id, { fontWeight: event.target.value })}>
                      {FONT_WEIGHTS.map(([value, label]) => <option key={value} value={value}>{value} · {label}</option>)}
                    </select>
                  </label>
                  <label><span>大小</span><div className="input-with-suffix"><input type="number" min="6" max="512" value={Math.round(object.fontSize * 10) / 10} onChange={(event) => onUpdateObject(object.id, { fontSize: Math.max(6, Number(event.target.value) || 6) })} /><b>px</b></div></label>
                </div>
                <label>
                  <span>文字色彩</span>
                  <span className="color-input-row"><input type="color" value={object.color} onChange={(event) => onUpdateObject(object.id, { color: event.target.value })} /><code>{object.color.toUpperCase()}</code></span>
                </label>
                <div className="text-alignment-fields">
                  <TextAlignmentControl
                    label="段落對齊"
                    accessibleLabel="文字段落對齊"
                    value={object.textAlign}
                    options={TEXT_ALIGN_CONTROLS}
                    columns={4}
                    onChange={(textAlign) => onUpdateObject(object.id, { textAlign })}
                  />
                  {object.textAlign === "justify" ? (
                    <TextAlignmentControl
                      label="齊行最後一行"
                      accessibleLabel="左右齊行的最後一行對齊"
                      value={object.textAlignLast}
                      options={TEXT_LAST_ALIGN_CONTROLS}
                      onChange={(textAlignLast) => onUpdateObject(object.id, { textAlignLast })}
                    />
                  ) : null}
                  <TextAlignmentControl
                    label="文字框內上下對齊"
                    accessibleLabel="文字框內上下對齊"
                    value={object.textVerticalAlign}
                    options={TEXT_VERTICAL_ALIGN_CONTROLS}
                    onChange={(textVerticalAlign) => onUpdateObject(object.id, { textVerticalAlign })}
                  />
                </div>
                <div className="text-frame-fields">
                  <strong>文字框範圍</strong>
                  <div className="property-grid">
                    <label><span>寬 W</span><input type="number" min="24" value={Math.round(object.width)} onChange={(event) => onResizeTextFrame(object.id, { width: Math.max(24, Number(event.target.value) || 24) })} /></label>
                    <label><span>高 H</span><input type="number" min="24" value={Math.round(object.height)} onChange={(event) => onResizeTextFrame(object.id, { height: Math.max(24, Number(event.target.value) || 24) })} /></label>
                  </div>
                  <p>只調整換行與排版範圍，不改變字級。右側與底部圓點分別調整寬、高；連按兩下可自動符合內容。右下角方框＋可把溢出文字續接到新的連結文字框。</p>
                </div>
              </section>
            ) : null}

            {isShapeObject(object) ? (
              <section className="inspector-section shape-properties">
                <h3>形狀</h3>
                <label>
                  <span>種類</span>
                  <select value={object.shapeKind} onChange={(event) => onUpdateObject(object.id, { shapeKind: event.target.value })}>
                    <option value="rectangle">正方形／矩形</option>
                    <option value="triangle">三角形</option>
                    <option value="polygon">多邊形</option>
                    <option value="star">星形</option>
                  </select>
                </label>
                {object.shapeKind === "polygon" ? (
                  <label>
                    <span>多邊形邊數</span>
                    <input
                      type="number"
                      min="3"
                      max="24"
                      step="1"
                      value={object.shapeSides}
                      onChange={(event) => onUpdateObject(object.id, { shapeSides: Math.max(3, Math.min(24, Math.round(Number(event.target.value) || 3))) })}
                    />
                  </label>
                ) : null}
                {object.shapeKind === "star" ? (
                  <div className="star-shape-controls">
                    <div className="shape-style-heading">
                      <strong>星形樣式</strong>
                      <span>{object.starPoints} 芒 · {Math.round(object.starInnerRatio * 100)}%</span>
                    </div>
                    <div className="shape-style-presets" role="group" aria-label="星形樣式">
                      {STAR_STYLE_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          className={activeStarStyle?.id === preset.id ? "is-active" : ""}
                          aria-pressed={activeStarStyle?.id === preset.id}
                          onClick={() => onUpdateObject(object.id, { starPoints: preset.starPoints, starInnerRatio: preset.starInnerRatio })}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                    <div className="property-grid">
                      <label>
                        <span>星芒數</span>
                        <input
                          type="number"
                          min="3"
                          max="24"
                          step="1"
                          value={object.starPoints}
                          onChange={(event) => onUpdateObject(object.id, { starPoints: Math.max(3, Math.min(24, Math.round(Number(event.target.value) || 3))) })}
                        />
                      </label>
                      <label>
                        <span>內縮比例</span>
                        <div className="input-with-suffix">
                          <input
                            type="number"
                            min="15"
                            max="85"
                            step="1"
                            value={Math.round(object.starInnerRatio * 100)}
                            onChange={(event) => onUpdateObject(object.id, { starInnerRatio: Math.max(0.15, Math.min(0.85, (Number(event.target.value) || 15) / 100)) })}
                          />
                          <b>%</b>
                        </div>
                      </label>
                    </div>
                  </div>
                ) : null}
                <label>
                  <span>填滿色彩</span>
                  <span className="color-input-row"><input type="color" value={object.fill} onChange={(event) => onUpdateObject(object.id, { fill: event.target.value })} /><code>{object.fill.toUpperCase()}</code></span>
                </label>
                <div className="shape-quick-sizes">
                  <strong>快速尺寸</strong>
                  <label>
                    <span>紙張尺寸</span>
                    <select
                      value={printSizePreset?.id || ""}
                      onChange={(event) => applyShapeSizePreset(SHAPE_PRINT_SIZE_PRESETS.find((preset) => preset.id === event.target.value))}
                    >
                      <option value="">選擇快速尺寸</option>
                      {SHAPE_PRINT_SIZE_PRESETS.map((preset) => <option key={preset.id} value={preset.id}>{preset.label}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>社群圖片尺寸</span>
                    <select
                      value={socialSizePreset?.id || ""}
                      onChange={(event) => applyShapeSizePreset(SHAPE_SOCIAL_SIZE_PRESETS.find((preset) => preset.id === event.target.value))}
                    >
                      <option value="">選擇快速尺寸</option>
                      {SHAPE_SOCIAL_SIZE_PRESETS.map((preset) => (
                        <option key={preset.id} value={preset.id}>
                          {translateInterfaceText(preset.label)} · {preset.width} × {preset.height}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p>紙張尺寸依 96ppi 換算；套用後仍可在變形欄調整。</p>
                </div>
              </section>
            ) : null}

            {isArtboardObject(object) ? (
              <section className="inspector-section artboard-properties">
                <div className="section-heading-row">
                  <h3>紙張</h3>
                  <span className="semantic-object-badge">背景畫板</span>
                </div>
                <label>
                  <span>常用尺寸</span>
                  <select value={object.paperPreset || "custom"} onChange={(event) => onResizeArtboardPreset(object.id, event.target.value, object.paperOrientation)}>
                    {Object.entries(PAPER_PRESETS).map(([key, preset]) => <option key={key} value={key}>{preset.label}</option>)}
                  </select>
                </label>
                <div className="segmented-control" role="radiogroup" aria-label="紙張方向">
                  <button type="button" role="radio" aria-checked={object.paperOrientation !== "landscape"} className={object.paperOrientation !== "landscape" ? "is-active" : ""} onClick={() => onResizeArtboardPreset(object.id, object.paperPreset, "portrait")}>直式</button>
                  <button type="button" role="radio" aria-checked={object.paperOrientation === "landscape"} className={object.paperOrientation === "landscape" ? "is-active" : ""} onClick={() => onResizeArtboardPreset(object.id, object.paperPreset, "landscape")}>橫式</button>
                </div>
                <label>
                  <span>紙張色彩</span>
                  <span className="color-input-row"><input type="color" value={object.fill} onChange={(event) => onUpdateObject(object.id, { fill: event.target.value })} /><code>{object.fill.toUpperCase()}</code></span>
                </label>
                <label><span>內容邊距</span><div className="input-with-suffix"><input type="number" min="0" max="400" value={Math.round(object.paperPadding || 0)} onChange={(event) => onUpdateObject(object.id, { paperPadding: Math.max(0, Math.min(400, Number(event.target.value) || 0)) })} /><b>px</b></div></label>
                <button className="secondary-button full-width" type="button" onClick={() => onFitArtboard(object.id)}>
                  <Maximize2 size={15} /> 依內容與邊距重新符合
                </button>
                <p className="section-helper">紙張維持在內容後方；選取紙張時，合成輸出會連同紙上的可見物件一起輸出。</p>
              </section>
            ) : null}

            <section className="inspector-section">
              <h3>變形</h3>
              <div className="dimension-grid">
                <label><span>寬 W</span><input type="number" min="24" value={Math.round(object.width)} onChange={(event) => updateDimension("width", event.target.value)} /></label>
                <button
                  className={`aspect-lock-button ${effectiveAspectLocked ? "is-locked" : "is-unlocked"}`}
                  type="button"
                  aria-pressed={effectiveAspectLocked}
                  aria-label={effectiveAspectLocked ? "等比例已鎖定" : temporaryUnlocked ? "Shift 暫時解除等比例" : "等比例未鎖定"}
                  title={temporaryUnlocked ? "Shift 暫時解除；放開後恢復鎖定" : allAspectLocked ? "點一下解除等比例" : "點一下鎖定等比例"}
                  onClick={() => onSetAspectLock(!allAspectLocked)}
                >
                  {effectiveAspectLocked ? <Lock size={15} /> : <Unlock size={15} />}
                </button>
                <label><span>高 H</span><input type="number" min="24" value={Math.round(object.height)} onChange={(event) => updateDimension("height", event.target.value)} /></label>
              </div>
              <div className="property-grid">
                <label className="property-wide"><span>旋轉角度</span><div className="input-with-suffix"><input type="number" value={Math.round(object.rotation * 10) / 10} onChange={(event) => onUpdateObject(object.id, { rotation: Number(event.target.value) || 0 })} /><b>°</b></div></label>
              </div>
              <div className="transform-reset-actions">
                <button
                  className="quiet-button"
                  type="button"
                  onClick={() => onRestoreSize(object.id)}
                  disabled={Math.abs(object.width - object.originalWidth) < 0.01 && Math.abs(object.height - object.originalHeight) < 0.01}
                >
                  <Scaling size={15} /> 還原原始尺寸
                </button>
                <button className="quiet-button" type="button" onClick={() => onResetRotation(object.id)} disabled={Math.abs(object.rotation) < 0.01}>
                  <RotateCcwSquare size={15} /> 旋轉歸零
                </button>
              </div>
              <p className="transform-helper">八個控制點預設維持比例；縮放時按住 Shift 暫時解除，按住 Option／Alt 改為中心對稱縮放。連按兩下控制點可還原尺寸。{isTextObject(object) ? " 這裡會連同字級一起縮放。" : ""}</p>
              {activeResize ? <p className="shortcut-status" aria-live="polite">{activeResize.alt ? "中心對稱縮放" : `${RESIZE_HANDLES[activeResize.handle]?.label || "控制點"}縮放`} · {effectiveAspectLocked ? "比例鎖定" : temporaryUnlocked ? "Shift 暫時解鎖" : "自由比例"}</p> : null}
              <p className="transform-helper">旋轉時按住 Shift，會吸附 30°、45°、60°、90°、120°、180°。</p>
              <div className="axis-setting">
                <div>
                  <strong>旋轉軸心</strong>
                  <small>{ANCHORS[object.anchor].label}；縮放軸心由控制點決定</small>
                </div>
                <AxisPicker value={object.anchor} onChange={(anchor) => onPivotChange(object.id, anchor)} />
              </div>
            </section>

            <Micro3DControls objects={selected} onChange={onMicro3DChange} active={micro3DMode} onActiveChange={onMicro3DModeChange} />

            <section className="inspector-section">
              <h3>分群標記</h3>
              {object.markers.length ? (
                <div className="marker-pills">
                  {object.markers.map((marker) => (
                    <MarkerPill key={markerKey(marker)} marker={marker} onRemove={() => onRemoveMarker(marker)} />
                  ))}
                </div>
              ) : <p className="section-empty-copy">尚未加上標記。</p>}
              <MarkerComposer markerDraft={markerDraft} setMarkerDraft={setMarkerDraft} onAdd={onAddMarker} />
            </section>
          </>
        ) : null}

        {selected.length > 1 ? (
          <>
            <section className="inspector-section selection-structure-section">
              <div className="section-heading-row">
                <h3>選取結構</h3>
                <span className="semantic-object-badge">{selectionGrouped ? "群組" : "多選"}</span>
              </div>
              <p className="section-helper">外框就是目前操作邊界；{selectionGrouped ? "一般點選會選取整組，按住 ⌘／Ctrl 可穿透選取成員。" : "建立群組後可維持共同選取，成員仍保留各自圖層。"}</p>
              <button className="secondary-button full-width" type="button" onClick={onToggleGroup}>
                <Layers3 size={15} /> {selectionGrouped ? "解散群組" : "建立群組"}
              </button>
            </section>
            <section className="inspector-section group-transform-section">
              <h3>共同變形</h3>
              <div className="key-object-summary">
                <span>對齊／排列基準</span>
                <strong>{keyObject?.layerName || "第一個選取物件"}</strong>
              </div>
              <p className="transform-helper">再次點選任一已選物件，可改設為基準。拖曳畫布上的共同控制框，可同時縮放或旋轉。</p>
              <button
                className={`aspect-lock-row ${effectiveAspectLocked ? "is-locked" : "is-unlocked"}`}
                type="button"
                aria-pressed={effectiveAspectLocked}
                onClick={() => onSetAspectLock(!allAspectLocked)}
              >
                {effectiveAspectLocked ? <Lock size={16} /> : <Unlock size={16} />}
                <span><strong>{effectiveAspectLocked ? "等比例已鎖定" : temporaryUnlocked ? "Shift 暫時解鎖" : "自由比例"}</strong><small>Shift 暫時解除；Option／Alt 由中心對稱縮放</small></span>
              </button>
              {activeResize ? <p className="shortcut-status" aria-live="polite">{activeResize.alt ? "中心對稱縮放" : `${RESIZE_HANDLES[activeResize.handle]?.label || "控制點"}縮放`} · {effectiveAspectLocked ? "比例鎖定" : temporaryUnlocked ? "Shift 暫時解鎖" : "自由比例"}</p> : null}
              <div className="axis-setting">
                <div>
                  <strong>共同旋轉軸心</strong>
                  <small>{ANCHORS[selectionAnchor].label}；縮放軸心由控制點決定</small>
                </div>
                <AxisPicker value={selectionAnchor} onChange={onSelectionAnchorChange} />
              </div>
            </section>
            <Micro3DControls objects={selected} onChange={onMicro3DChange} active={micro3DMode} onActiveChange={onMicro3DModeChange} />
            <section className="inspector-section alignment-section">
              <h3>對齊與排列</h3>
              <p className="section-helper">基準物件保持不動，其餘物件依可視邊界調整。</p>
              <div className="alignment-control-group">
                <strong>對齊</strong>
                <div className="alignment-button-grid">
                  <IconButton label="靠左對齊基準物件" onClick={() => onAlign("left")}><AlignStartVertical size={17} /></IconButton>
                  <IconButton label="水平置中對齊基準物件" onClick={() => onAlign("hcenter")}><AlignCenterVertical size={17} /></IconButton>
                  <IconButton label="靠右對齊基準物件" onClick={() => onAlign("right")}><AlignEndVertical size={17} /></IconButton>
                  <IconButton label="靠上對齊基準物件" onClick={() => onAlign("top")}><AlignStartHorizontal size={17} /></IconButton>
                  <IconButton label="垂直置中對齊基準物件" onClick={() => onAlign("vcenter")}><AlignCenterHorizontal size={17} /></IconButton>
                  <IconButton label="靠下對齊基準物件" onClick={() => onAlign("bottom")}><AlignEndHorizontal size={17} /></IconButton>
                </div>
              </div>
              <div className="alignment-control-group">
                <strong>平均分布間距</strong>
                <div className="distribution-button-grid">
                  <button className="quiet-button" type="button" onClick={() => onDistribute("horizontal")} disabled={selected.length < 3} title={selected.length < 3 ? "至少選取 3 個物件" : "水平平均分布；基準物件保持不動"}>
                    <AlignHorizontalSpaceBetween size={17} /> 水平
                  </button>
                  <button className="quiet-button" type="button" onClick={() => onDistribute("vertical")} disabled={selected.length < 3} title={selected.length < 3 ? "至少選取 3 個物件" : "垂直平均分布；基準物件保持不動"}>
                    <AlignVerticalSpaceBetween size={17} /> 垂直
                  </button>
                </div>
                {selected.length < 3 ? <small className="control-note">平均分布至少需要 3 個物件。</small> : null}
              </div>
            </section>
            <section className="inspector-section multi-summary">
              <h3>批次圖層命名</h3>
              <p>依目前圖層順序加上流水號，物件名稱不會被覆蓋。</p>
              <label>
                <span>名稱前綴</span>
                <input value={batchPrefix} onChange={(event) => setBatchPrefix(event.target.value)} placeholder="例如：巴黎靈感" />
              </label>
              <button className="secondary-button full-width" type="button" onClick={onBatchRename} disabled={!batchPrefix.trim()}>
                套用為 {batchPrefix.trim() || "圖層"} 01…
              </button>
            </section>
            <section className="inspector-section">
              <h3>批次加入標記</h3>
              <MarkerComposer markerDraft={markerDraft} setMarkerDraft={setMarkerDraft} onAdd={onAddMarker} />
            </section>
          </>
        ) : null}
      </div>

    </aside>
  );
}

function ResizeHandles({ onStart, onRestore, activeHandle = null, group = false }) {
  return Object.entries(RESIZE_HANDLES).map(([key, handle]) => (
    <button
      key={key}
      type="button"
      className={`resize-handle resize-handle-${key} ${activeHandle === key ? "is-active" : ""}`}
      aria-label={`${handle.label}縮放控制點${group ? "，同時縮放選取物件" : ""}`}
      title="拖曳縮放；Shift 暫時解除比例；Option／Alt 中心對稱縮放"
      style={{ left: `${handle.x * 100}%`, top: `${handle.y * 100}%` }}
      onPointerDown={(event) => onStart(event, key)}
      onDoubleClick={onRestore ? (event) => {
        event.preventDefault();
        event.stopPropagation();
        onRestore();
      } : undefined}
    />
  ));
}

function TextFrameHandles({ onStart, onAutoFit, activeHandle = null }) {
  return TEXT_FRAME_HANDLES.map((handle) => (
    <button
      key={handle.key}
      type="button"
      className={`text-frame-handle text-frame-handle-${handle.key} ${activeHandle === handle.handle ? "is-active" : ""}`}
      aria-label={`${handle.label}控制點`}
      title={`拖曳調整${handle.label}；連按兩下自動符合內容`}
      style={{ left: `${handle.x * 100}%`, top: `${handle.y * 100}%` }}
      onPointerDown={(event) => onStart(event, handle.handle)}
      onClick={(event) => {
        event.stopPropagation();
        if (event.detail === 0) onAutoFit(handle.dimension);
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onAutoFit(handle.dimension);
        }
      }}
      onDoubleClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onAutoFit(handle.dimension);
      }}
    />
  ));
}

function Rotation3DGizmo({
  inverseZoom,
  left = "50%",
  top = "50%",
  counterRotation = 0,
  activeAxis = null,
  onStart,
  onReset,
  group = false,
}) {
  const startAxis = (event, axis) => onStart(event, axis);
  const reset = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onReset();
  };
  return (
    <div
      className={`rotation-3d-gizmo ${group ? "is-group" : ""}`}
      role="group"
      aria-label={group ? "多選 3D 旋轉軌道" : "3D 旋轉軌道"}
      style={{
        left,
        top,
        "--gizmo-inverse-zoom": inverseZoom,
        "--gizmo-counter-rotation": `${counterRotation}deg`,
      }}
    >
      <button
        className={`gizmo-orbit ${activeAxis === "free" ? "is-active" : ""}`}
        type="button"
        aria-label="自由 3D 旋轉"
        title="拖曳自由旋轉；Shift 鎖定主軸；連按兩下 3D 歸零"
        onPointerDown={(event) => startAxis(event, "free")}
        onDoubleClick={reset}
      >
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <ellipse className="gizmo-ring gizmo-ring-x" cx="50" cy="50" rx="38" ry="13" />
          <ellipse className="gizmo-ring gizmo-ring-y" cx="50" cy="50" rx="13" ry="38" />
          <circle className="gizmo-ring gizmo-ring-z" cx="50" cy="50" r="31" />
          <circle className="gizmo-core" cx="50" cy="50" r="5" />
        </svg>
      </button>
      {[
        ["x", "X", "只沿 X 軸旋轉"],
        ["y", "Y", "只沿 Y 軸旋轉"],
        ["z", "Z", "只沿 Z 軸旋轉"],
      ].map(([axis, label, description]) => (
        <button
          key={axis}
          className={`gizmo-axis gizmo-axis-${axis} ${activeAxis === axis ? "is-active" : ""}`}
          type="button"
          aria-label={description}
          title={description}
          onPointerDown={(event) => startAxis(event, axis)}
        >
          {label}
        </button>
      ))}
      <span className="gizmo-caption" aria-hidden="true">3D 旋轉</span>
    </div>
  );
}

function CanvasObject({
  object,
  selected,
  soleSelected,
  multiSelected,
  keyObject,
  selectionEnabled,
  inverseZoom,
  onPointerDown,
  onPointerUp,
  onDoubleClick,
  onRotateStart,
  onResizeStart,
  onRestoreSize,
  onResetRotation,
  micro3DMode,
  micro3DGesture,
  onMicro3DRotateStart,
  onResetMicro3D,
  onVideoControlsChange,
  onSelect,
  resizeGesture,
  editingText,
  textFrameGesture,
  onStartTextEdit,
  onTextChange,
  onFinishTextEdit,
  onTextFrameResizeStart,
  onAutoFitTextFrame,
  onLoadTextOverflow,
  textFlowLoaded,
}) {
  const anchor = ANCHORS[object.anchor] || ANCHORS.mc;
  const activeResize = resizeGesture?.objectId === object.id ? resizeGesture : null;
  const activePivot = ANCHORS[activeResize?.pivotAnchor] || anchor;
  const tiltX = Number(object.tiltX) || 0;
  const tiltY = Number(object.tiltY) || 0;
  const depth = Number(object.depth) || 0;
  const perspective = Number(object.perspective) || 1000;
  const hasMicro3D = Math.abs(tiltX) > 0.01 || Math.abs(tiltY) > 0.01 || Math.abs(depth) > 0.01 || Math.abs(perspective - 1000) > 0.01;
  const isEditingText = isTextObject(object) && editingText?.id === object.id;
  const activeTextFrame = textFrameGesture?.objectId === object.id ? textFrameGesture : null;
  const objectFrameRef = useRef(null);
  const [textOverflow, setTextOverflow] = useState(false);
  const hasTextOverflow = object.textFlowId ? Boolean(object.textFlowOverflow) : textOverflow;

  useLayoutEffect(() => {
    if (!isTextObject(object)) {
      setTextOverflow(false);
      return undefined;
    }
    const frame = objectFrameRef.current;
    if (!frame) return undefined;
    let cancelled = false;
    let animationFrame = 0;
    const measureOverflow = () => {
      animationFrame = 0;
      if (cancelled) return;
      const textElement = frame.querySelector(".object-text-visual");
      if (!textElement) return;
      const overflowing = textElement.scrollHeight > textElement.clientHeight + 1
        || textElement.scrollWidth > textElement.clientWidth + 1;
      setTextOverflow((current) => current === overflowing ? current : overflowing);
    };
    const scheduleMeasure = () => {
      if (cancelled) return;
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(measureOverflow);
    };
    scheduleMeasure();
    const resizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(scheduleMeasure) : null;
    resizeObserver?.observe(frame);
    document.fonts?.ready?.then(scheduleMeasure);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
    };
  }, [isEditingText, object.color, object.flowText, object.fontFamily, object.fontSize, object.fontWeight, object.id, object.text, object.textAlign, object.textAlignLast, object.textVerticalAlign]);

  return (
    <div
      className={`board-object ${selected ? "is-selected" : ""} ${multiSelected && keyObject ? "is-key-object" : ""} ${object.locked ? "is-locked" : ""} ${hasMicro3D ? "has-micro-3d" : ""} ${isEditingText ? "is-text-editing" : ""} ${isArtboardObject(object) ? "is-artboard" : ""} ${object.annotationKind ? "is-annotation" : ""} ${object.groupId ? "is-group-member" : ""}`}
      data-object-id={object.id}
      style={{
        left: object.pivotX,
        top: object.pivotY,
        transform: `rotate(${object.rotation}deg)`,
        "--inverse-zoom": inverseZoom,
      }}
      role="button"
      tabIndex={object.visible ? 0 : -1}
      aria-label={`${object.name}，${selected ? "已選取" : "未選取"}${multiSelected && keyObject ? "，對齊與排列基準物件" : ""}`}
      onPointerDown={(event) => {
        if (micro3DMode && selected && !object.locked) {
          onMicro3DRotateStart(event, "free", () => onSelect(object.id, event.shiftKey));
          return;
        }
        onPointerDown(event, object.id);
      }}
      onPointerUp={(event) => onPointerUp(event, object.id)}
      onDoubleClick={(event) => {
        if (isTextObject(object) && selectionEnabled && !micro3DMode && !object.locked) {
          onStartTextEdit(event, object.id);
          return;
        }
        onDoubleClick(event, object.id);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" && isTextObject(object) && selectionEnabled && !micro3DMode && !object.locked) {
          event.preventDefault();
          onStartTextEdit(event, object.id);
        } else if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          if (selectionEnabled || event.metaKey || event.ctrlKey) onSelect(object.id, event.shiftKey);
        }
      }}
    >
      <div
        ref={objectFrameRef}
        className="object-frame"
        style={{
          left: -anchor.x * object.width,
          top: -anchor.y * object.height,
          width: object.width,
          height: object.height,
          transform: `perspective(${perspective}px) translateZ(${depth}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
          "--paper-padding": `${Math.max(0, Number(object.paperPadding) || 0)}px`,
        }}
      >
        {isEditingText
          ? <CanvasTextEditor object={object} editSession={editingText} onChange={onTextChange} onFinish={onFinishTextEdit} />
          : isVideoObject(object)
          ? <CanvasVideoPlayer object={object} onControlsVisibilityChange={(visible) => onVideoControlsChange(object.id, visible)} />
          : <MediaElement object={object} />}
        {object.markers.length ? (
          <div className="object-markers" aria-label={`${object.markers.length} 個標記`}>
            {object.markers.slice(0, 5).map((marker) => (
              <span key={markerKey(marker)}><MarkerIcon symbol={marker.symbol} color={marker.color} size={14} /></span>
            ))}
          </div>
        ) : null}
        {multiSelected && keyObject ? <span className="key-object-badge">基準</span> : null}
        {soleSelected && hasTextOverflow && !isEditingText ? (
          <button
            type="button"
            className={`text-overflow-port ${textFlowLoaded ? "is-loaded" : ""}`}
            aria-label={textFlowLoaded ? "溢出文字已載入，請在空白畫布點一下建立連結文字框" : "文字內容超出文字框，點一下載入溢出文字"}
            title={textFlowLoaded ? "已載入溢出文字；在空白畫布點一下建立連結文字框" : "溢出文字；點一下載入並建立下一個文字框"}
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onClick={(event) => {
              event.stopPropagation();
              onLoadTextOverflow(object.id);
            }}
            onKeyDown={(event) => {
              event.stopPropagation();
            }}
          >
            <Plus size={13} strokeWidth={2.8} aria-hidden="true" />
          </button>
        ) : null}
        {soleSelected && !micro3DMode && !isEditingText ? (
          <>
            <button
              type="button"
              className="rotation-handle"
              aria-label="拖曳旋轉；連按兩下旋轉歸零"
              title="拖曳旋轉；按住 Shift 吸附固定角度；連按兩下歸零"
              onPointerDown={(event) => onRotateStart(event, object.id)}
              onDoubleClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onResetRotation(object.id);
              }}
            >
              <RotateCw size={14} />
            </button>
            <span
              className="pivot-indicator"
              style={{ left: `${activePivot.x * 100}%`, top: `${activePivot.y * 100}%` }}
              aria-hidden="true"
            />
            <ResizeHandles
              activeHandle={activeResize?.handle}
              onStart={(event, handle) => onResizeStart(event, object.id, handle)}
              onRestore={() => onRestoreSize(object.id)}
            />
            {isTextObject(object) ? (
              <TextFrameHandles
                activeHandle={activeTextFrame?.handle}
                onStart={(event, handle) => onTextFrameResizeStart(event, object.id, handle)}
                onAutoFit={(dimension) => onAutoFitTextFrame(object.id, dimension)}
              />
            ) : null}
          </>
        ) : null}
        {soleSelected && isEditingText ? (
          <>
            <span className="text-frame-label" aria-hidden="true">文字框</span>
            <TextFrameHandles
              activeHandle={activeTextFrame?.handle}
              onStart={(event, handle) => onTextFrameResizeStart(event, object.id, handle)}
              onAutoFit={(dimension) => onAutoFitTextFrame(object.id, dimension)}
            />
          </>
        ) : null}
      </div>
      {soleSelected && micro3DMode ? (
        <Rotation3DGizmo
          inverseZoom={inverseZoom}
          left={(0.5 - anchor.x) * object.width}
          top={(0.5 - anchor.y) * object.height}
          counterRotation={-object.rotation}
          activeAxis={micro3DGesture?.axis || null}
          onStart={onMicro3DRotateStart}
          onReset={onResetMicro3D}
        />
      ) : null}
    </div>
  );
}

function SelectionGroupOverlay({
  bounds,
  anchorKey,
  inverseZoom,
  gesture,
  onRotateStart,
  onResizeStart,
  micro3DMode,
  micro3DGesture,
  onMicro3DRotateStart,
  onResetMicro3D,
  semanticLabel,
}) {
  if (!bounds) return null;
  const anchor = ANCHORS[anchorKey] || ANCHORS.mc;
  const sourceBounds = gesture?.bounds || bounds;
  const pivot = gesture?.pivot || boundsAnchorPoint(sourceBounds, anchorKey);
  let displayBounds = sourceBounds;
  let transform = undefined;
  let transformOrigin = undefined;

  if (gesture?.type === "scale") {
    const scaleX = gesture.scaleX || 1;
    const scaleY = gesture.scaleY || 1;
    displayBounds = {
      ...sourceBounds,
      left: pivot.x + (sourceBounds.left - pivot.x) * scaleX,
      top: pivot.y + (sourceBounds.top - pivot.y) * scaleY,
      width: sourceBounds.width * scaleX,
      height: sourceBounds.height * scaleY,
    };
  } else if (gesture?.type === "rotate") {
    transform = `rotate(${gesture.degrees || 0}deg)`;
    transformOrigin = `${pivot.x - sourceBounds.left}px ${pivot.y - sourceBounds.top}px`;
  }

  return (
    <div
      className={`selection-group-frame ${micro3DMode ? "is-3d-mode" : ""} ${semanticLabel ? "is-semantic-group" : ""}`}
      role="group"
      aria-label={micro3DMode ? "多選 3D 旋轉控制框" : "多選共同變形控制框"}
      style={{
        left: displayBounds.left,
        top: displayBounds.top,
        width: displayBounds.width,
        height: displayBounds.height,
        transform,
        transformOrigin,
        "--inverse-zoom": inverseZoom,
      }}
    >
      {semanticLabel ? <span className="selection-group-label">{semanticLabel}</span> : null}
      {micro3DMode ? (
        <Rotation3DGizmo
          inverseZoom={inverseZoom}
          activeAxis={micro3DGesture?.axis || null}
          onStart={onMicro3DRotateStart}
          onReset={onResetMicro3D}
          group
        />
      ) : (
        <>
          <button
            type="button"
            className="rotation-handle"
            aria-label="同時旋轉選取物件"
            title="拖曳以同時旋轉；按住 Shift 吸附固定角度"
            onPointerDown={onRotateStart}
          >
            <RotateCw size={14} />
          </button>
          <span
            className="pivot-indicator"
            style={{
              left: gesture ? pivot.x - displayBounds.left : `${anchor.x * 100}%`,
              top: gesture ? pivot.y - displayBounds.top : `${anchor.y * 100}%`,
            }}
            aria-hidden="true"
          />
          <ResizeHandles
            group
            activeHandle={gesture?.type === "scale" ? gesture.handle : null}
            onStart={onResizeStart}
          />
        </>
      )}
    </div>
  );
}

function FilterStage({ objects, selectedIds, onSelect, onClear, filters }) {
  const [viewMode, setViewMode] = useState("grid");
  const [slideIndex, setSlideIndex] = useState(0);
  const search = useListSearch("filter-results");
  const swipeStartRef = useRef(null);
  const thumbnailTapRef = useRef({ id: null, time: 0 });
  const listedObjects = objects.filter((object) => matchesListQuery([object.name, object.layerName, object.type], search.query));
  const activeIndex = listedObjects.length ? Math.min(slideIndex, listedObjects.length - 1) : 0;
  const activeObject = listedObjects[activeIndex];
  const goToSlide = useCallback((nextIndex) => {
    if (!listedObjects.length) return;
    setSlideIndex((nextIndex + listedObjects.length) % listedObjects.length);
  }, [listedObjects.length]);

  useEffect(() => {
    setSlideIndex((current) => listedObjects.length ? Math.min(current, listedObjects.length - 1) : 0);
  }, [listedObjects.length]);

  useEffect(() => {
    if (viewMode !== "original") return undefined;
    const onKeyDown = (event) => {
      if (event.target?.closest?.("video[controls], input, textarea, select")) return;
      if (event.key === "Escape" && !document.fullscreenElement) {
        event.preventDefault();
        event.stopImmediatePropagation();
        setViewMode("grid");
        return;
      }
      if (event.key === "ArrowLeft") { event.preventDefault(); goToSlide(activeIndex - 1); }
      if (event.key === "ArrowRight") { event.preventDefault(); goToSlide(activeIndex + 1); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, goToSlide, viewMode]);

  return (
    <div className={`filter-stage ${search.open ? "has-list-search" : ""}`} aria-label="篩選排隊結果">
      <header>
        <div>
          <Tags size={18} />
          <span>排隊檢視</span>
          <strong>{search.query ? `${listedObjects.length} / ${objects.length}` : `${objects.length} 個符合`}</strong>
        </div>
        <div className="filter-stage-actions">
          <ListSearchToggle search={search} resultCount={listedObjects.length} totalCount={objects.length} label="搜尋排隊結果" />
          <div className="view-mode-control" role="group" aria-label="檢視方式">
            <button type="button" className={viewMode === "grid" ? "is-active" : ""} aria-pressed={viewMode === "grid"} onClick={() => setViewMode("grid")}><LayoutGrid size={15} /> 縮圖</button>
            <button type="button" className={viewMode === "original" ? "is-active" : ""} aria-pressed={viewMode === "original"} onClick={() => setViewMode("original")}><Square size={15} /> 原圖</button>
          </div>
          <button className="secondary-button" type="button" onClick={onClear}><ArrowLeft size={16} /> 回到 Moodboard</button>
        </div>
      </header>
      <ListSearchField search={search} placeholder="搜尋物件或圖層" />
      {listedObjects.length && viewMode === "grid" ? (
        <div className="filter-stage-grid">
          {listedObjects.map((object, index) => (
            <button
              type="button"
              className={selectedIds.includes(object.id) ? "is-selected" : ""}
              key={object.id}
              onClick={(event) => { setSlideIndex(index); onSelect(object.id, event.shiftKey); }}
              onDoubleClick={() => { setSlideIndex(index); setViewMode("original"); }}
              onPointerUp={(event) => {
                if (event.pointerType === "mouse") return;
                const now = Date.now();
                const previous = thumbnailTapRef.current;
                thumbnailTapRef.current = { id: object.id, time: now };
                if (previous.id === object.id && now - previous.time < 360) {
                  setSlideIndex(index);
                  setViewMode("original");
                  thumbnailTapRef.current = { id: null, time: 0 };
                }
              }}
              title="點一下選取；連按兩下開啟原圖檢視"
            >
              <span className="stage-image">
                <MediaElement object={object} decorative style={{ transform: `rotate(${object.rotation}deg)`, ...(isTextObject(object) ? { fontSize: Math.min(object.fontSize, 22) } : {}) }} />
                {isVideoObject(object) ? <span className="video-badge"><Play size={14} fill="currentColor" /> 影片</span> : null}
              </span>
              <span className="stage-copy"><strong data-l10n-ignore>{object.name}</strong><small data-l10n-ignore>{object.layerName}</small></span>
              <span className="stage-markers">
                {object.markers.map((marker) => <MarkerIcon key={markerKey(marker)} symbol={marker.symbol} color={marker.color} size={14} />)}
              </span>
            </button>
          ))}
        </div>
      ) : null}
      {listedObjects.length && viewMode === "original" && activeObject ? (
        <div
          className="filter-slideshow"
          onPointerDown={(event) => {
            if (event.target.closest("button, video[controls]")) return;
            swipeStartRef.current = event.clientX;
          }}
          onPointerUp={(event) => {
            if (swipeStartRef.current === null) return;
            const delta = event.clientX - swipeStartRef.current;
            swipeStartRef.current = null;
            if (Math.abs(delta) < 48) return;
            goToSlide(activeIndex + (delta < 0 ? 1 : -1));
          }}
        >
          <button className="slide-arrow is-previous" type="button" onClick={() => goToSlide(activeIndex - 1)} aria-label="上一個素材"><ChevronLeft size={26} /></button>
          <figure>
            <div className="slide-media">
              <MediaElement object={activeObject} controls={isVideoObject(activeObject)} />
            </div>
            <figcaption>
              <div>
                <strong data-l10n-ignore>{activeObject.name}</strong>
                <small data-l10n-ignore>{activeObject.layerName}</small>
              </div>
              <span className="slide-markers">
                {activeObject.markers.map((marker) => <MarkerIcon key={markerKey(marker)} symbol={marker.symbol} color={marker.color} size={15} />)}
              </span>
              <span className="slide-count">{activeIndex + 1} / {listedObjects.length}</span>
              <button type="button" className="quiet-button" onClick={() => onSelect(activeObject.id, false)}>選取此物件</button>
            </figcaption>
          </figure>
          <button className="slide-arrow is-next" type="button" onClick={() => goToSlide(activeIndex + 1)} aria-label="下一個素材"><ChevronRight size={26} /></button>
        </div>
      ) : (
        !listedObjects.length ? <div className="stage-empty">
          <AlertTriangle size={26} />
          <strong>{objects.length ? "找不到符合搜尋的物件" : "目前組合沒有符合的物件"}</strong>
          <p>{objects.length ? "搜尋條件會保留，可以調整或清除。" : filters.mode === "all" ? "改用「任一標記」，或減少條件。" : "調整符號、色彩，或清除篩選。"}</p>
          <button type="button" className="secondary-button" onClick={objects.length ? () => search.setQuery("") : onClear}>{objects.length ? "清除搜尋" : "清除篩選"}</button>
        </div> : null
      )}
    </div>
  );
}

function SourceStage({ sourceAssets }) {
  const [viewMode, setViewMode] = useState("grid");
  const [slideIndex, setSlideIndex] = useState(0);
  const search = useListSearch("sources");
  const swipeStartRef = useRef(null);
  const thumbnailTapRef = useRef({ id: null, time: 0 });
  const listedSources = sourceAssets.filter((source) => matchesListQuery([
    source.representative.originalFilename,
    source.representative.name,
    source.representative.mime,
  ], search.query));
  const activeIndex = listedSources.length ? Math.min(slideIndex, listedSources.length - 1) : 0;
  const activeSource = listedSources[activeIndex];
  const goToSlide = useCallback((nextIndex) => {
    if (!listedSources.length) return;
    setSlideIndex((nextIndex + listedSources.length) % listedSources.length);
  }, [listedSources.length]);

  useEffect(() => {
    setSlideIndex((current) => listedSources.length ? Math.min(current, listedSources.length - 1) : 0);
  }, [listedSources.length]);

  useEffect(() => {
    if (viewMode !== "original") return undefined;
    const onKeyDown = (event) => {
      if (event.target?.closest?.("video[controls], input, textarea, select")) return;
      if (event.key === "Escape" && !document.fullscreenElement) {
        event.preventDefault();
        event.stopImmediatePropagation();
        setViewMode("grid");
        return;
      }
      if (event.key === "ArrowLeft") { event.preventDefault(); goToSlide(activeIndex - 1); }
      if (event.key === "ArrowRight") { event.preventDefault(); goToSlide(activeIndex + 1); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, goToSlide, viewMode]);

  const openOriginal = useCallback((index) => {
    setSlideIndex(index);
    setViewMode("original");
  }, []);

  return (
    <div className={`filter-stage source-stage ${search.open ? "has-list-search" : ""}`} aria-label="來源素材檢視">
      <header>
        <div>
          <ImageIcon size={18} />
          <span>來源素材</span>
          <strong>{search.query ? `${listedSources.length} / ${sourceAssets.length}` : `${sourceAssets.length} 個來源`}</strong>
        </div>
        <div className="filter-stage-actions">
          <ListSearchToggle search={search} resultCount={listedSources.length} totalCount={sourceAssets.length} label="搜尋來源素材" />
          <div className="view-mode-control" role="group" aria-label="來源素材檢視方式">
            <button type="button" className={viewMode === "grid" ? "is-active" : ""} aria-pressed={viewMode === "grid"} onClick={() => setViewMode("grid")}><LayoutGrid size={15} /> 縮圖</button>
            <button type="button" className={viewMode === "original" ? "is-active" : ""} aria-pressed={viewMode === "original"} onClick={() => setViewMode("original")} disabled={!listedSources.length}><Square size={15} /> 原圖</button>
          </div>
        </div>
      </header>
      <ListSearchField search={search} placeholder="搜尋檔名或素材類型" />
      {listedSources.length && viewMode === "grid" ? (
        <div className="filter-stage-grid source-stage-grid">
          {listedSources.map((source, index) => {
            const object = source.representative;
            const typeLabel = isVideoObject(object) ? "影片" : object.mime === "image/svg+xml" ? "SVG" : "圖片";
            return (
              <button
                type="button"
                className={activeIndex === index ? "is-active" : ""}
                key={source.sourceId}
                onClick={() => setSlideIndex(index)}
                onDoubleClick={() => openOriginal(index)}
                onPointerUp={(event) => {
                  if (event.pointerType === "mouse") return;
                  const now = Date.now();
                  const previous = thumbnailTapRef.current;
                  thumbnailTapRef.current = { id: source.sourceId, time: now };
                  if (previous.id === source.sourceId && now - previous.time < 360) {
                    openOriginal(index);
                    thumbnailTapRef.current = { id: null, time: 0 };
                  }
                }}
                title="連按兩下開啟原圖檢視"
              >
                <span className="stage-image">
                  <MediaElement object={object} decorative />
                  {isVideoObject(object) ? <span className="video-badge"><Play size={14} fill="currentColor" /> 影片</span> : null}
                </span>
                <span className="stage-copy"><strong data-l10n-ignore>{object.originalFilename || object.name}</strong><small>{typeLabel}</small></span>
                <span className="stage-source-meta">{`${source.instanceIds.length} 個畫布實例`}</span>
              </button>
            );
          })}
        </div>
      ) : null}
      {listedSources.length && viewMode === "original" && activeSource ? (
        <div
          className="filter-slideshow source-slideshow"
          onPointerDown={(event) => {
            if (event.target.closest("button, video[controls]")) return;
            swipeStartRef.current = event.clientX;
          }}
          onPointerUp={(event) => {
            if (swipeStartRef.current === null) return;
            const delta = event.clientX - swipeStartRef.current;
            swipeStartRef.current = null;
            if (Math.abs(delta) < 48) return;
            goToSlide(activeIndex + (delta < 0 ? 1 : -1));
          }}
        >
          <button className="slide-arrow is-previous" type="button" onClick={() => goToSlide(activeIndex - 1)} aria-label="上一個來源素材"><ChevronLeft size={26} /></button>
          <figure>
            <div className="slide-media">
              <MediaElement object={activeSource.representative} controls={isVideoObject(activeSource.representative)} />
            </div>
            <figcaption>
              <div>
                <strong data-l10n-ignore>{activeSource.representative.originalFilename || activeSource.representative.name}</strong>
                <small>{`原始素材 · ${activeSource.instanceIds.length} 個畫布實例`}</small>
              </div>
              <span className="slide-count">{activeIndex + 1} / {listedSources.length}</span>
            </figcaption>
          </figure>
          <button className="slide-arrow is-next" type="button" onClick={() => goToSlide(activeIndex + 1)} aria-label="下一個來源素材"><ChevronRight size={26} /></button>
        </div>
      ) : (
        !listedSources.length ? <div className="stage-empty">
          {sourceAssets.length ? <Search size={26} /> : <ImageIcon size={26} />}
          <strong>{sourceAssets.length ? "找不到符合的來源素材" : "還沒有來源素材"}</strong>
          <p>{sourceAssets.length ? "搜尋條件會保留，可以調整或清除。" : "加入圖片、影片或 SVG 後，這裡會依來源各列一份。"}</p>
          {sourceAssets.length ? <button type="button" className="secondary-button" onClick={() => search.setQuery("")}>清除搜尋</button> : null}
        </div> : null
      )}
    </div>
  );
}

function Modal({ title, description, onClose, children, wide = false, dialogRole = "dialog" }) {
  return (
    <div className="modal-backdrop" role="presentation" onPointerDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`modal ${wide ? "is-wide" : ""}`} role={dialogRole} aria-modal="true" aria-label={title}>
        <header>
          <div><h2>{title}</h2>{description ? <p>{description}</p> : null}</div>
          <IconButton label="關閉" onClick={onClose}><X size={19} /></IconButton>
        </header>
        <div className="modal-body">{children}</div>
      </section>
    </div>
  );
}

function ShortcutReferenceModal({ onClose }) {
  const search = useListSearch("shortcuts");
  const totalCount = SHORTCUT_SECTIONS.reduce((count, section) => count + section.items.length, 0);
  const sections = SHORTCUT_SECTIONS
    .map((section) => ({
      ...section,
      items: section.items.filter(([shortcut, label]) => matchesListQuery([
        shortcut,
        platformShortcutLabel(shortcut),
        label,
        section.title,
      ], search.query)),
    }))
    .filter((section) => section.items.length);
  const resultCount = sections.reduce((count, section) => count + section.items.length, 0);

  return (
    <Modal title="快速鍵" description="自訂工作區指令統一使用 Shift；檔案與編輯保留熟悉的瀏覽器快速鍵語意。" onClose={onClose} wide>
      <div className="modal-list-toolbar"><strong>{`${resultCount} / ${totalCount} 個指令`}</strong><ListSearchToggle search={search} resultCount={resultCount} totalCount={totalCount} label="搜尋快速鍵" /></div>
      <ListSearchField search={search} placeholder="搜尋指令或按鍵" />
      {sections.length ? (
        <div className="shortcut-sections">
          {sections.map((section) => (
            <section className="shortcut-section" key={section.title}>
              <h3>{section.title}</h3>
              <div className="shortcut-list">
                {section.items.map(([shortcut, label]) => (
                  <div key={`${section.title}-${shortcut}`}>
                    <span>{label}</span>
                    <kbd>{platformShortcutLabel(shortcut)}</kbd>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="modal-empty"><Search size={24} /><strong>找不到符合的快速鍵</strong><p>搜尋條件會保留，可以調整或清除。</p><button className="text-button" type="button" onClick={() => search.setQuery("")}>清除搜尋</button></div>
      )}
    </Modal>
  );
}

function GridModal({ selectedCount, onApply, onClose }) {
  const minimum = Math.max(1, selectedCount);
  const [count, setCount] = useState(Math.max(minimum, selectedCount ? 6 : 9));
  const [columns, setColumns] = useState(3);
  const [gapX, setGapX] = useState(24);
  const [gapY, setGapY] = useState(24);
  const rows = Math.ceil(count / columns);
  return (
    <Modal
      title="建立 Grid"
      description={selectedCount
        ? `會保留目前 ${selectedCount} 個選取物件，並複製到指定總數後重新排列。`
        : "沒有選取物件時，會建立矩形預留位置並排列。"}
      onClose={onClose}
    >
      <div className="grid-dialog-layout">
        <div className="grid-dialog-fields">
          <label><span>物件總數</span><input type="number" min={minimum} max="100" value={count} onChange={(event) => setCount(Math.max(minimum, Math.min(100, Number(event.target.value) || minimum)))} /></label>
          <label><span>每列欄數</span><input type="number" min="1" max={count} value={columns} onChange={(event) => setColumns(Math.max(1, Math.min(count, Number(event.target.value) || 1)))} /></label>
          <div className="property-grid">
            <label><span>水平間距</span><input type="number" min="0" max="500" value={gapX} onChange={(event) => setGapX(Math.max(0, Number(event.target.value) || 0))} /></label>
            <label><span>垂直間距</span><input type="number" min="0" max="500" value={gapY} onChange={(event) => setGapY(Math.max(0, Number(event.target.value) || 0))} /></label>
          </div>
        </div>
        <div className="grid-dialog-preview" aria-label={`${columns} 欄、${rows} 列、共 ${count} 個物件`}>
          <div style={{ gridTemplateColumns: `repeat(${columns}, minmax(8px, 1fr))` }}>
            {Array.from({ length: count }, (_, index) => <i key={index} className={index < selectedCount ? "is-source" : ""} />)}
          </div>
          <span>{columns} 欄 × {rows} 列</span>
        </div>
      </div>
      <p className="feature-dialog-note">建立後會一次選取完整 Grid，清楚顯示這次操作會影響的範圍；每個物件仍可個別編輯。</p>
      <div className="feature-dialog-actions">
        <button className="quiet-button" type="button" onClick={onClose}>取消</button>
        <button className="primary-button" type="button" onClick={() => onApply({ count, columns, gapX, gapY })}>
          <LayoutGrid size={16} /> {selectedCount ? "建立並排列" : "建立預留位置"}
        </button>
      </div>
    </Modal>
  );
}

function AnnotationModal({ targetCount, onApply, onClose }) {
  const [kind, setKind] = useState("title");
  const [text, setText] = useState("");
  const [position, setPosition] = useState("tl");
  return (
    <Modal
      title="加入標題或說明"
      description={`文字會依 ${targetCount} 個選取物件的整體邊界定位，建立後仍可獨立移動與編輯。`}
      onClose={onClose}
    >
      <div className="annotation-dialog-layout">
        <div className="segmented-control" role="radiogroup" aria-label="文字類型">
          <button type="button" role="radio" aria-checked={kind === "title"} className={kind === "title" ? "is-active" : ""} onClick={() => setKind("title")}>標題</button>
          <button type="button" role="radio" aria-checked={kind === "description"} className={kind === "description" ? "is-active" : ""} onClick={() => setKind("description")}>說明</button>
        </div>
        <label><span>文字內容</span><textarea rows="3" autoFocus value={text} onChange={(event) => setText(event.target.value)} placeholder={kind === "title" ? "輸入標題" : "輸入說明文字"} /></label>
        <fieldset className="annotation-position-field">
          <legend>放置位置</legend>
          <div className="annotation-position-picker">
            {["tl", "tc", "tr", "ml", "mc", "mr", "bl", "bc", "br"].map((key) => key === "mc" ? <span key={key} aria-hidden="true" /> : (
              <button
                key={key}
                type="button"
                className={position === key ? "is-active" : ""}
                aria-pressed={position === key}
                aria-label={ANNOTATION_POSITION_LABELS[key]}
                title={ANNOTATION_POSITION_LABELS[key]}
                onClick={() => setPosition(key)}
              />
            ))}
          </div>
          <small>{ANNOTATION_POSITION_LABELS[position]}</small>
        </fieldset>
      </div>
      <div className="feature-dialog-actions">
        <button className="quiet-button" type="button" onClick={onClose}>取消</button>
        <button className="primary-button" type="button" onClick={() => onApply({ kind, text, position })}>
          <Type size={16} /> 加入{kind === "title" ? "標題" : "說明"}
        </button>
      </div>
    </Modal>
  );
}

function AuthGate({
  feature,
  session,
  locale,
  online,
  busy,
  errorMessage,
  emailLinkFlow,
  onSetLocale,
  onGoogleSignIn,
  onSendEmailLink,
  onCompleteEmailLink,
  onAccept,
  onSignOut,
  onRetry,
  onClose,
}) {
  const [accepted, setAccepted] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [rememberSession, setRememberSession] = useState(false);
  const [email, setEmail] = useState("");
  const [emailNotice, setEmailNotice] = useState("");
  const signedInAccount = session.status === "signed-in" && session.user;
  const signedIn = signedInAccount && isMoodboardIdentityEligible(session.user);
  const loading = session.status === "loading";
  const unavailable = session.status === "error";
  const actionDisabled = !accepted || busy || loading || (!online && !signedIn);
  const needsEmailAddress = emailLinkFlow?.status === "needs-email";
  const featureCopy = needsEmailAddress
    ? {
      title: "完成 Email 驗證登入",
      description: "請輸入收到這封驗證信的 Email；地址只用來完成登入，不會寫進網址。",
    }
    : feature === "collaboration"
    ? {
      title: "登入後使用協作與同步",
      description: "登入後才能啟用跨分頁協作與未來雲端同步；本機工作仍可繼續使用。",
    }
    : feature === "drive"
      ? {
        title: "登入後連結 Google Drive",
        description: "PETFASHION 登入只確認身份；下一步仍會另外詢問 Google Drive 檔案權限。",
      }
    : feature === "3d"
      ? {
        title: "登入後使用進階 3D",
        description: "進階 3D 操作需要登入；你目前的選取與本機 Moodboard 不會被改動。",
      }
      : {
        title: "登入以使用進階功能",
        description: "協作、同步與進階 3D 需要登入；本機編輯、儲存與匯出不需登入。",
      };
  const statusFeedback = errorMessage
    ? { kind: "error", icon: AlertTriangle, message: errorMessage }
    : signedInAccount && !signedIn
      ? { kind: "error", icon: AlertTriangle, message: "這個帳號必須先完成 Email 驗證，並使用允許的登入方式。" }
      : !online && !signedIn
        ? { kind: "notice", icon: CloudOff, message: "首次登入需要網路連線；完成一次登入後，這台裝置可繼續離線工作。" }
        : emailNotice
          ? { kind: "success", icon: Check, message: emailNotice }
          : null;

  useEffect(() => {
    setAccepted(false);
    setMarketingOptIn(false);
    setRememberSession(false);
    setEmail("");
    setEmailNotice("");
  }, [session.status, session.user?.uid]);

  const submitEmail = async (event) => {
    event.preventDefault();
    setEmailNotice("");
    const result = needsEmailAddress
      ? await onCompleteEmailLink({ email, marketingOptIn, rememberSession, accepted })
      : await onSendEmailLink({ email, marketingOptIn, rememberSession, accepted });
    if (result?.maskedEmail) setEmailNotice(`驗證連結已寄到 ${result.maskedEmail}。請在一小時內完成。`);
  };

  return (
    <div className="auth-gate" role="presentation" onPointerDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="auth-gate-panel" role="dialog" aria-modal="true" aria-labelledby="auth-gate-title" aria-describedby="auth-gate-description">
        <IconButton className="auth-gate-close" label="先繼續訪客模式" onClick={onClose}><X size={18} /></IconButton>
        <div className="auth-gate-locale" role="group" aria-label="介面語言">
          {INTERFACE_LOCALES.map((option) => (
            <button
              type="button"
              className={locale === option.id ? "is-active" : ""}
              aria-pressed={locale === option.id}
              onClick={() => onSetLocale(option.id)}
              data-l10n-ignore
              key={option.id}
            >
              {option.shortLabel}
            </button>
          ))}
        </div>
        <div className="auth-gate-brand" aria-hidden="true"><span>∞</span><strong>Infinite Moodboard</strong></div>
        <div className="auth-gate-heading">
          <span className="auth-gate-kicker">PETFASHION FREE CREATIVE TOOL</span>
          <h1 id="auth-gate-title">{featureCopy.title}</h1>
          <p id="auth-gate-description">{featureCopy.description}</p>
        </div>

        {signedIn && !needsEmailAddress ? (
          <div className="auth-gate-account">
            <AccountAvatar user={session.user} size={42} />
            <span><small>目前登入帳號</small><strong data-l10n-ignore>{accountDisplayName(session.user)}</strong><em data-l10n-ignore>{session.user.email}</em></span>
            <button className="quiet-button" type="button" onClick={onSignOut} disabled={busy}>換其他帳號</button>
          </div>
        ) : null}

        <label className="auth-consent-check">
          <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
          <span>
            <strong>同意使用 PETFASHION 帳號登入 <em>必填</em></strong>
            <small>只使用名稱、頭像與 Email；Moodboard 不會因登入自動上傳。</small>
          </span>
        </label>

        <div className="auth-quick-preferences" aria-label="登入偏好">
          <label className="auth-quick-check">
            <input type="checkbox" checked={marketingOptIn} onChange={(event) => setMarketingOptIn(event.target.checked)} />
            <span>預先設定產品 Email 偏好 <small>選填，只保存在此裝置</small></span>
          </label>
          {!signedIn && !needsEmailAddress ? (
            <label className="auth-quick-check">
              <input type="checkbox" checked={rememberSession} onChange={(event) => setRememberSession(event.target.checked)} />
              <span>在這台裝置保持登入 <small>僅限個人裝置</small></span>
            </label>
          ) : null}
        </div>

        {statusFeedback ? (
          <p
            className={`auth-gate-message${statusFeedback.kind === "error" ? " is-error" : statusFeedback.kind === "success" ? " is-success" : ""}`}
            role={statusFeedback.kind === "error" ? "alert" : "status"}
          >
            <statusFeedback.icon size={16} />
            {statusFeedback.message}
          </p>
        ) : null}
        {unavailable ? (
          <button className="primary-button auth-primary-action" type="button" onClick={onRetry}><RefreshCw size={17} />重新連線</button>
        ) : signedIn && !needsEmailAddress ? (
          <button
            className="primary-button auth-primary-action"
            type="button"
            disabled={actionDisabled}
            onClick={() => onAccept({ marketingOptIn })}
          >
            {busy || loading ? <RefreshCw size={17} className="is-spinning" /> : <UserRound size={17} />}
            {loading ? "正在確認登入狀態…" : busy ? "登入處理中…" : "同意並繼續"}
          </button>
        ) : (
          <div className="auth-methods">
            {!needsEmailAddress ? (
              <>
                <button
                  className="primary-button auth-primary-action auth-google-action"
                  type="button"
                  disabled={actionDisabled}
                  onClick={() => onGoogleSignIn({ marketingOptIn, rememberSession })}
                >
                  {busy || loading ? <RefreshCw size={17} className="is-spinning" /> : <span className="auth-google-mark" aria-hidden="true">G</span>}
                  {loading ? "正在確認登入狀態…" : busy ? "登入處理中…" : "使用 Google 帳號登入"}
                </button>
                <div className="auth-method-divider"><span>或使用 Email 驗證連結</span></div>
              </>
            ) : null}
            <form className="auth-email-method" onSubmit={submitEmail}>
              <label htmlFor="moodboard-auth-email">Email</label>
              <div className="auth-email-row">
                <input
                  id="moodboard-auth-email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  data-l10n-ignore
                />
                <button className="secondary-button" type="submit" disabled={actionDisabled || !email.trim()}>
                  {busy ? <RefreshCw size={16} className="is-spinning" /> : <Mail size={16} />}
                  {needsEmailAddress ? "完成驗證" : emailNotice ? "重新寄送" : "寄送連結"}
                </button>
              </div>
              <small>{needsEmailAddress ? "為防止他人冒用連結，必須再次確認收件地址。" : "免設密碼；驗證連結一小時內有效，請勿轉寄給他人。"}</small>
            </form>
          </div>
        )}

        <details className="auth-data-details">
          <summary><Info size={16} /><span>登入與資料說明</span><ChevronDown size={16} /></summary>
          <div>
            <ul>
              <li>PETFASHION 只使用名稱、頭像與 Email 登入及辨識帳號。</li>
              <li>會員由 PETFASHION 統一管理，並記錄 Infinite Moodboard 啟用來源。</li>
              <li>作品、素材與版本預設保存在這台裝置，不會自動上傳。</li>
            </ul>
            <p><Info size={14} />共用電腦用畢請登出，並在設定清除本機 Moodboard。</p>
          </div>
        </details>

        <button className="quiet-button auth-guest-action" type="button" onClick={onClose}>先繼續訪客模式</button>

        <p className="auth-legal-links">
          繼續即表示你已閱讀
          <a href={PETFASHION_TERMS_URL} target="_blank" rel="noreferrer">服務條款 <ExternalLink size={12} /></a>
          與
          <a href={PETFASHION_PRIVACY_URL} target="_blank" rel="noreferrer">隱私權政策 <ExternalLink size={12} /></a>。
        </p>
      </section>
    </div>
  );
}

function DeleteCompositionWarningModal({ request, onCancel, onConfirm }) {
  const search = useListSearch("delete-impact");
  const matchingCompositions = request.affectedCompositions.filter((composition) => matchesListQuery([
    composition.name,
    composition.kind,
  ], search.query));
  const visibleCompositions = matchingCompositions.slice(0, search.query ? 20 : 5);
  const hiddenCount = matchingCompositions.length - visibleCompositions.length;
  const objectLabel = request.objectIds.length === 1 ? "這個物件" : `這 ${request.objectIds.length} 個物件`;
  const compositionLabel = request.affectedCompositions.length === 1
    ? "1 個構圖"
    : `${request.affectedCompositions.length} 個構圖`;

  return (
    <Modal
      title="刪除會影響已儲存的構圖"
      description="構圖只記錄物件狀態，不會另外複製素材。"
      onClose={onCancel}
      dialogRole="alertdialog"
    >
      <div className="delete-composition-warning">
        <div className="delete-impact-summary">
          <span className="delete-impact-icon" aria-hidden="true"><AlertTriangle size={22} /></span>
          <div>
            <strong>{objectLabel}被 {compositionLabel} 使用</strong>
            <p>刪除後，構圖仍會保留，但無法完整還原被刪除的物件。</p>
          </div>
        </div>
        <div className="modal-list-toolbar"><strong>受影響的構圖</strong><ListSearchToggle search={search} resultCount={matchingCompositions.length} totalCount={request.affectedCompositions.length} label="搜尋受影響的構圖" /></div>
        <ListSearchField search={search} placeholder="搜尋構圖名稱" />
        <ul className="delete-impact-list" aria-label="受影響的構圖">
          {visibleCompositions.map((composition) => <li key={composition.id || composition.name}>{composition.name || "未命名構圖"}</li>)}
          {hiddenCount > 0 ? <li className="delete-impact-more">{`另有 ${hiddenCount} 個構圖`}</li> : null}
        </ul>
        {!matchingCompositions.length ? <div className="modal-empty compact"><Search size={22} /><strong>找不到符合的構圖</strong><button className="text-button" type="button" onClick={() => search.setQuery("")}>清除搜尋</button></div> : null}
        <p className="delete-recovery-note"><Undo2 size={15} aria-hidden="true" /> 若仍要刪除，可立即按 ⌘Z 復原。</p>
        <div className="delete-warning-actions">
          <button className="secondary-button" type="button" onClick={onCancel} autoFocus>取消</button>
          <button className="danger-button" type="button" onClick={onConfirm}><Trash2 size={16} />仍要刪除</button>
        </div>
      </div>
    </Modal>
  );
}

function EscapeCancellationModal({ request, onKeep, onCancel }) {
  return (
    <Modal
      title="取消目前調整？"
      description="這會放棄尚未完成的調整並回到操作前；其他已完成的編輯不受影響。"
      onClose={onKeep}
      dialogRole="alertdialog"
    >
      <div className="delete-composition-warning">
        <div className="delete-impact-summary">
          <span className="delete-impact-icon" aria-hidden="true"><AlertTriangle size={22} /></span>
          <div>
            <strong>{request.label}</strong>
            <p>選擇保留會套用目前畫面中的結果；取消則精確回到這次操作開始前。</p>
          </div>
        </div>
        <div className="delete-warning-actions">
          <button className="secondary-button" type="button" onClick={onKeep} autoFocus>保留目前調整</button>
          <button className="danger-button" type="button" onClick={onCancel}><X size={16} />取消這次調整</button>
        </div>
      </div>
    </Modal>
  );
}

function DeleteLocalDataModal({ onCancel, onConfirm, isBusy }) {
  const [confirmed, setConfirmed] = useState(false);
  return (
    <Modal
      title="清除這台裝置的 Moodboard 資料"
      description="這是永久刪除，無法用復原功能取回。"
      onClose={onCancel}
      dialogRole="alertdialog"
    >
      <div className="delete-composition-warning">
        <div className="delete-impact-summary">
          <span className="delete-impact-icon" aria-hidden="true"><AlertTriangle size={22} /></span>
          <div>
            <strong>將刪除目前自動儲存與所有本機版本</strong>
            <p>你主動下載的 `.moodboard`、HTML 與輸出圖片不受影響；登入帳號也不會被刪除。</p>
          </div>
        </div>
        <label className="delete-local-confirmation">
          <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
          <span>我已確認需要永久清除這台裝置上的 Moodboard 資料。</span>
        </label>
        <div className="delete-warning-actions">
          <button className="secondary-button" type="button" onClick={onCancel} autoFocus>取消</button>
          <button className="danger-button" type="button" onClick={onConfirm} disabled={!confirmed || isBusy}><Trash2 size={16} />{isBusy ? "清除中…" : "永久清除"}</button>
        </div>
      </div>
    </Modal>
  );
}

function VersionModal({
  versions,
  board,
  versionLabel,
  setVersionLabel,
  driveVersions,
  driveLinked,
  onCreate,
  onRestore,
  onRefreshDrive,
  onRecoverDrive,
  onClose,
  isBusy,
}) {
  const search = useListSearch("versions");
  const listedVersions = versions.filter((version) => matchesListQuery([
    version.label,
    version.kind === "manual" ? "手動" : "自動",
    formatTime(version.createdAt),
    `${version.objectCount} 個物件`,
  ], search.query));
  const listedDriveVersions = (driveVersions.items || []).filter((revision) => matchesListQuery([
    revision.id,
    revision.keepForever ? "已保留" : "Drive 暫存",
    revision.lastModifyingUser?.displayName,
    revision.lastModifyingUser?.emailAddress,
    formatTime(revision.modifiedTime),
    formatStorageSize(revision.size),
  ], search.query));
  const totalVersions = versions.length + (driveVersions.items?.length || 0);
  const totalListedVersions = listedVersions.length + listedDriveVersions.length;
  return (
    <Modal title="版本紀錄" description="本機最多保留 24 份；同步前也會保留可復原的 Drive 版本。" onClose={onClose} wide>
      <form className="version-create" onSubmit={(event) => { event.preventDefault(); onCreate(); }}>
        <label><span>版本備註</span><input value={versionLabel} onChange={(event) => setVersionLabel(event.target.value)} placeholder="例如：完成第一輪素材篩選" /></label>
        <button className="primary-button" type="submit" disabled={isBusy}><History size={16} /> 建立版本</button>
      </form>
      <div className="version-current"><span>目前</span><strong>r{board.revision}</strong><small>{`${board.objects.length} 個物件 · ${formatTime(board.updatedAt)}`}</small></div>
      {totalVersions ? <div className="modal-list-toolbar"><strong>版本清單</strong><ListSearchToggle search={search} resultCount={totalListedVersions} totalCount={totalVersions} label="搜尋版本紀錄" /></div> : null}
      <ListSearchField search={search} placeholder="搜尋版本備註或日期" />
      <div className="version-section-heading"><strong>本機版本</strong><small>可直接還原到目前 Moodboard，還原前會先自動備份。</small></div>
      {listedVersions.length ? (
        <div className="version-list">
          {listedVersions.map((version) => (
            <article key={version.id}>
              <div><strong data-l10n-ignore>{version.label}</strong><small>{`${version.objectCount} 個物件 · ${formatTime(version.createdAt)}`}</small></div>
              <span className={`version-kind kind-${version.kind}`}>{version.kind === "manual" ? "手動" : "自動"}</span>
              <button className="quiet-button" type="button" onClick={() => onRestore(version)} disabled={isBusy}>還原</button>
            </article>
          ))}
        </div>
      ) : versions.length ? (
        <div className="modal-empty"><Search size={24} /><strong>找不到符合的版本</strong><p>搜尋條件會保留，可以調整或清除。</p><button className="text-button" type="button" onClick={() => search.setQuery("")}>清除搜尋</button></div>
      ) : (
        <div className="modal-empty"><History size={24} /><strong>尚未建立版本</strong><p>目前畫布仍會自動存到這台裝置；手動版本適合重要節點。</p></div>
      )}
      <div className="version-section-heading is-drive">
        <div><strong>Google Drive 版本</strong><small>復原時會開成新的本機 Moodboard，不會覆蓋目前工作。</small></div>
        {driveLinked ? <button className="quiet-button" type="button" onClick={onRefreshDrive} disabled={driveVersions.status === "loading" || isBusy}><RefreshCw size={15} className={driveVersions.status === "loading" ? "is-spinning" : ""} />重新整理</button> : null}
      </div>
      {!driveLinked ? (
        <div className="version-cloud-state"><CloudOff size={19} /><span><strong>尚未連結 Drive 檔案</strong><small>先把目前 Moodboard 儲存到 Drive，之後同步會自動保留舊版本。</small></span></div>
      ) : driveVersions.status === "loading" ? (
        <div className="version-cloud-state"><RefreshCw size={19} className="is-spinning" /><span><strong>正在讀取 Drive 版本…</strong><small>目前 Moodboard 不會受影響。</small></span></div>
      ) : driveVersions.status === "error" || driveVersions.status === "authorization-required" ? (
        <div className="version-cloud-state is-error"><AlertTriangle size={19} /><span><strong>無法讀取 Drive 版本</strong><small>{driveVersions.message}</small></span></div>
      ) : listedDriveVersions.length ? (
        <div className="version-list is-drive-list">
          {listedDriveVersions.map((revision) => {
            const isHead = revision.id === driveVersions.headRevisionId;
            const recoverable = isHead || revision.keepForever;
            return (
              <article key={revision.id}>
                <div><strong>{isHead ? "目前 Drive 版本" : `Drive 版本 ${revision.id}`}</strong><small>{`${formatStorageSize(revision.size)} · ${formatTime(revision.modifiedTime)}${revision.lastModifyingUser?.displayName ? ` · ${revision.lastModifyingUser.displayName}` : ""}`}</small></div>
                <span className={`version-kind ${recoverable ? "kind-manual" : ""}`}>{isHead ? "目前" : revision.keepForever ? "已保留" : "暫存"}</span>
                <button className="quiet-button" type="button" onClick={() => onRecoverDrive(revision)} disabled={isBusy || !recoverable} title={recoverable ? "開成新的本機 Moodboard" : "這個 Drive 暫存版本無法下載"}>開成新副本</button>
              </article>
            );
          })}
        </div>
      ) : driveVersions.status === "ready" ? (
        <div className="version-cloud-state"><Cloud size={19} /><span><strong>Drive 尚無可列出的歷史版本</strong><small>下次同步前會先保留目前 Drive 內容。</small></span></div>
      ) : null}
    </Modal>
  );
}

function driveStatusPresentation(driveSession) {
  if (driveSession.status === "connecting") return { icon: RefreshCw, label: "正在連結 Google Drive…", tone: "working" };
  if (driveSession.status === "syncing" || driveSession.status === "checking") return { icon: RefreshCw, label: "正在同步到 Google Drive…", tone: "working" };
  if (driveSession.status === "synced") return { icon: Check, label: "Google Drive 已同步", tone: "success" };
  if (driveSession.status === "pending") return { icon: CloudUpload, label: "等待同步到 Google Drive", tone: "warning" };
  if (driveSession.status === "offline") return { icon: CloudOff, label: "目前離線；變更已留在本機", tone: "warning" };
  if (driveSession.status === "quota") return { icon: AlertTriangle, label: "Google Drive 空間不足", tone: "error" };
  if (driveSession.status === "conflict") return { icon: AlertTriangle, label: "Drive 上有較新的版本", tone: "error" };
  if (driveSession.status === "authorization-required") return { icon: CloudOff, label: "需要重新連結 Google Drive", tone: "warning" };
  if (driveSession.status === "error") return { icon: AlertTriangle, label: "Google Drive 同步失敗", tone: "error" };
  if (driveSession.connected) return { icon: Cloud, label: "Google Drive 已連結", tone: "success" };
  return { icon: CloudOff, label: "Google Drive 尚未連結", tone: "muted" };
}

function libraryItemPresentation(item) {
  const presentations = {
    synced: { label: "本機與 Drive 已同步", tone: "success" },
    linked: { label: "已連結 Drive", tone: "success" },
    "local-only": { label: "僅保存在本機", tone: "local" },
    "remote-only": { label: "僅保存在 Drive", tone: "remote" },
    pending: { label: "等待同步", tone: "warning" },
    syncing: { label: "正在同步", tone: "working" },
    offline: { label: "離線等待同步", tone: "warning" },
    quota: { label: "Drive 空間不足", tone: "error" },
    "authorization-required": { label: "需要重新連結 Drive", tone: "warning" },
    conflict: { label: "需要處理版本衝突", tone: "error" },
    error: { label: "同步失敗", tone: "error" },
  };
  return presentations[item.status] || presentations["local-only"];
}

function DriveLibraryModal({
  board,
  currentContentBytes,
  currentLink,
  driveSession,
  driveSettings,
  localBoards,
  syncJobs,
  onConnect,
  onCreateLocal,
  onDisconnect,
  onOpenLocal,
  onOpenFile,
  onRecoverRemote,
  onRefresh,
  onSave,
  onSaveCopy,
  onSetAutoSync,
  onClose,
}) {
  const search = useListSearch("drive-files");
  const status = driveStatusPresentation(driveSession);
  const StatusIcon = status.icon;
  const files = driveSession.files || [];
  const libraryItems = mergeMoodboardLibrary({ localBoards, remoteFiles: files, syncJobs, links: driveSettings.links });
  const listedItems = libraryItems.filter((item) => matchesListQuery([
    item.name,
    libraryItemPresentation(item).label,
    formatTime(item.updatedAt || Date.now()),
    item.local ? "本機" : "",
    item.remote ? "Drive" : "",
  ], search.query));
  const quota = driveSession.quota;
  const quotaAssessment = quota ? evaluateDriveQuota(quota, currentContentBytes) : null;
  const busy = ["connecting", "syncing", "checking"].includes(driveSession.status);
  const conflictSummary = driveSession.conflict ? describeDriveConflict(board, driveSession.conflict) : null;
  const configured = isGoogleDriveConfigured();
  const quotaLabel = quota?.limit === null
    ? "Google Drive 未提供固定個人上限；儲存時仍會確認結果。"
    : quota
      ? `${formatStorageSize(quota.remaining)} 可用，共 ${formatStorageSize(quota.limit)}`
      : "連結後會在儲存前檢查可用空間。";

  return (
    <Modal title="我的 Moodboards" description="Google Drive 是主要保存位置；每次編輯仍會先安全保存在這台裝置。" onClose={onClose} wide>
      <div className="drive-library">
        <section className={`drive-status-panel is-${status.tone}`} aria-live="polite">
          <span className="drive-status-icon" aria-hidden="true"><StatusIcon size={22} className={busy ? "is-spinning" : ""} /></span>
          <div>
            <strong>{status.label}</strong>
            <small>{driveSession.message || quotaLabel}</small>
          </div>
          {driveSession.connected ? (
            <button className="quiet-button" type="button" onClick={onRefresh} disabled={busy}><RefreshCw size={15} />重新整理</button>
          ) : null}
        </section>

        {!driveSession.connected ? (
          <section className="drive-permission-intro">
            <div><ShieldCheck size={23} aria-hidden="true" /><span><strong>只存取你在 Infinite Moodboard 建立的檔案</strong><small>Drive 授權和 PETFASHION 登入分開；不會讀取整個雲端硬碟，也不會因登入而自動上傳。</small></span></div>
            <div><HardDrive size={23} aria-hidden="true" /><span><strong>本機安全副本永遠先寫入</strong><small>離線、額滿或授權失效時可以繼續工作，之後再重試同步或下載 `.moodboard`。</small></span></div>
            <button className="primary-button" type="button" onClick={onConnect} disabled={!configured || busy}>
              {busy ? <RefreshCw size={17} className="is-spinning" /> : <Cloud size={17} />}
              {configured ? "連結 Google Drive" : "Google Drive 尚未設定"}
            </button>
          </section>
        ) : (
          <>
            <div className="drive-toolbar">
              <label className="drive-auto-sync-choice">
                <input type="checkbox" checked={driveSettings.autoSync} onChange={(event) => onSetAutoSync(event.target.checked)} />
                <span><strong>自動同步</strong><small>停止操作後同步最新本機版本</small></span>
              </label>
              <div className="drive-toolbar-actions">
                <button className="secondary-button" type="button" onClick={onSaveCopy} disabled={busy}><Copy size={15} />另存雲端複本</button>
                <button className="primary-button" type="button" onClick={onSave} disabled={busy || quotaAssessment?.allowed === false}><CloudUpload size={16} />{currentLink ? "立即同步" : "儲存到 Drive"}</button>
              </div>
            </div>

            {quotaAssessment?.level === "insufficient" ? (
              <p className="drive-inline-message is-error" role="alert"><AlertTriangle size={16} />空間不足以安全儲存目前約 {formatStorageSize(currentContentBytes)} 的檔案；畫布仍保存在這台裝置。</p>
            ) : quotaAssessment?.level === "low" ? (
              <p className="drive-inline-message is-warning" role="status"><AlertTriangle size={16} />Drive 剩餘空間偏低；建議先清理空間或下載離線備份。</p>
            ) : null}

            {driveSession.conflict ? (
              <section className="drive-conflict" role="alert">
                <AlertTriangle size={20} aria-hidden="true" />
                <div><strong>Drive 上已有較新的版本</strong><p>為避免覆蓋別台裝置的變更，已停止自動同步。兩邊都會保留，你可以分別開成副本後再決定。</p></div>
                <dl className="drive-conflict-comparison">
                  <div><dt>本機</dt><dd>{`內容 r${conflictSummary.local.revision} · ${conflictSummary.local.objectCount} 個物件 · ${formatTime(conflictSummary.local.updatedAt)}`}</dd></div>
                  <div><dt>Drive</dt><dd>{`檔案版本 ${conflictSummary.remote.version || "—"} · ${formatStorageSize(conflictSummary.remote.size)} · ${formatTime(conflictSummary.remote.modifiedTime)}`}</dd></div>
                </dl>
                <div><button className="secondary-button" type="button" onClick={() => onRecoverRemote(driveSession.conflict)}>Drive 版本開成新副本</button><button className="primary-button" type="button" onClick={onSaveCopy}>本機內容另存 Drive</button></div>
              </section>
            ) : null}

            <div className="drive-footer-actions">
              <span><ShieldCheck size={15} />只使用 drive.file 最小權限</span>
              <button className="quiet-button" type="button" onClick={onDisconnect} title="只中斷目前分頁，不影響 PETFASHION 登入"><CloudOff size={15} />中斷此分頁</button>
            </div>
          </>
        )}

        <div className="modal-list-toolbar moodboard-library-toolbar">
          <strong>{`${listedItems.length} / ${libraryItems.length} 份 Moodboard`}</strong>
          <div className="drive-library-list-actions">
            <ListSearchToggle search={search} resultCount={listedItems.length} totalCount={libraryItems.length} label="搜尋我的 Moodboards" />
            <button className="quiet-button" type="button" onClick={onCreateLocal}><Plus size={15} />新增 Moodboard</button>
          </div>
        </div>
        <ListSearchField search={search} placeholder="搜尋 Moodboard 名稱、位置或同步狀態" />
        {listedItems.length ? (
          <div className="drive-file-list">
            {listedItems.map((item) => {
              const itemStatus = libraryItemPresentation(item);
              const isCurrent = item.boardId === board.id;
              const detail = [
                item.local ? `本機內容 r${item.local.revision}` : null,
                item.remote ? `Drive ${formatStorageSize(item.remote.size)}` : null,
                item.updatedAt ? formatTime(item.updatedAt) : null,
              ].filter(Boolean).join(" · ");
              return (
                <article className={isCurrent ? "is-current" : ""} key={item.key}>
                  <span className="drive-file-icon" aria-hidden="true">{item.local ? <HardDrive size={19} /> : <FileArchive size={19} />}</span>
                  <div><strong data-l10n-ignore>{item.name}</strong><small>{detail}</small></div>
                  <span className={`drive-file-badge is-${itemStatus.tone}`}>{itemStatus.tone === "success" ? <Check size={13} /> : itemStatus.tone === "error" ? <AlertTriangle size={13} /> : item.remote ? <Cloud size={13} /> : <HardDrive size={13} />}{isCurrent ? "目前檔案" : itemStatus.label}</span>
                  {!isCurrent ? <button className="quiet-button" type="button" onClick={() => item.local ? onOpenLocal(item.local) : onOpenFile(item.remote)} disabled={busy}>開啟</button> : null}
                  {item.remote?.webViewLink ? <a className="icon-button" href={item.remote.webViewLink} target="_blank" rel="noreferrer" aria-label="在 Google Drive 查看" title="在 Google Drive 查看"><ExternalLink size={15} /></a> : null}
                </article>
              );
            })}
          </div>
        ) : libraryItems.length ? (
          <div className="modal-empty"><Search size={24} /><strong>找不到符合的 Moodboard</strong><p>搜尋條件會保留，可以調整或清除。</p><button className="text-button" type="button" onClick={() => search.setQuery("")}>清除搜尋</button></div>
        ) : (
          <div className="modal-empty"><HardDrive size={25} /><strong>還沒有 Moodboard</strong><p>建立第一份本機 Moodboard；需要跨裝置時再連結 Google Drive。</p><button className="primary-button" type="button" onClick={onCreateLocal}><Plus size={15} />新增 Moodboard</button></div>
        )}
      </div>
    </Modal>
  );
}

function CollaborationModal({
  sessionName,
  setSessionName,
  peerCount,
  driveConnected,
  driveLinked,
  cloud,
  initialInvite,
  resumeAvailable,
  onCreateRoom,
  onJoinRoom,
  onResumeRoom,
  onCopyInvite,
  onLeaveRoom,
  onOpenDrive,
  onClose,
}) {
  const [inviteDraft, setInviteDraft] = useState(initialInvite || "");
  const cloudConnected = ["connected", "syncing", "offline", "degraded"].includes(cloud.status) && Boolean(cloud.roomId);
  const cloudBusy = ["creating", "joining", "connecting"].includes(cloud.status);
  const cloudReady = cloud.status === "connected" || cloud.status === "syncing";

  useEffect(() => {
    if (initialInvite) setInviteDraft(initialInvite);
  }, [initialInvite]);

  return (
    <Modal title="協作與 Google Drive" description="即時共編會在你明確建立或加入空間後，才把這份 Moodboard 傳到共編服務。" onClose={onClose} wide>
      <div className="collaboration-status">
        <section className="capability is-ready">
          <div><Users size={21} /><span><strong>同裝置多分頁共編</strong><small>{`目前 ${peerCount + 1} 個分頁在線，變更會即時同步。`}</small></span></div>
          <span className="status-label"><Check size={14} /> 已啟用</span>
        </section>
        <section className="capability is-ready">
          <div><History size={21} /><span><strong>本機版本與離線檔案</strong><small>可建立、還原版本，也可隨時下載完整 Infinite Moodboard。</small></span></div>
          <span className="status-label"><Check size={14} /> 已啟用</span>
        </section>
        <section className={`capability ${driveConnected ? "is-ready" : "is-pending"}`}>
          <div><HardDrive size={21} /><span><strong>Google Drive 檔案與跨裝置保存</strong><small>{driveConnected ? (driveLinked ? "目前 Moodboard 已連結雲端檔案，本機變更可安全同步。" : "Drive 已連結；儲存目前 Moodboard 後即可跨裝置開啟。") : "需另外取得 drive.file 最小權限；登入本身不會上傳 Moodboard。"}</small></span></div>
          <button className="status-label" type="button" onClick={onOpenDrive}>{driveConnected ? <Check size={14} /> : <CloudOff size={14} />} {driveConnected ? "管理 Drive" : "連結 Drive"}</button>
        </section>
        <section className={`capability ${cloudReady ? "is-ready" : cloud.status === "error" ? "is-error" : "is-pending"}`}>
          <div><Share2 size={21} /><span><strong>跨裝置即時共編</strong><small>以已驗證的 PETFASHION 帳號控管成員；不同物件的同時修改會自動合併。</small></span></div>
          <span className="status-label">{cloudReady ? <Check size={14} /> : <CloudOff size={14} />} {cloudReady ? "已連線" : cloudBusy ? "連線中" : "尚未加入"}</span>
        </section>
      </div>

      <section className={`cloud-collaboration-panel is-${cloud.status}`} aria-live="polite">
        {cloudConnected ? (
          <>
            <div className="cloud-collaboration-heading">
              <div><strong>共編空間</strong><small data-l10n-ignore>{cloud.roomId}</small></div>
              <span className="cloud-role-badge">{collaborationRoleLabel(cloud.role)}</span>
            </div>
            <p className="cloud-collaboration-message">{cloud.message || "即時共編已連線。"}</p>
            <div className="collaboration-peer-list" aria-label="目前共編成員">
              {(cloud.peers || []).map((peer) => (
                <span key={peer.id} className={peer.self ? "is-self" : ""} title={peer.self ? "這個分頁" : peer.name}>
                  <UserRound size={14} /><b data-l10n-ignore>{peer.name}</b>{peer.self ? <small>你</small> : null}
                </span>
              ))}
              {!cloud.peers?.length ? <span><Users size={14} /><b>等待其他協作者</b></span> : null}
            </div>
            {cloud.pendingCount ? <p className="cloud-pending-note"><RefreshCw size={14} className={cloud.status === "syncing" ? "is-spinning" : ""} />{`${cloud.pendingCount} 個變更等待同步`}</p> : null}
            <div className="cloud-collaboration-actions">
              <button className="primary-button" type="button" onClick={onCopyInvite} disabled={!cloud.inviteUrl}><Copy size={16} />複製邀請連結</button>
              <button className="quiet-button" type="button" onClick={onLeaveRoom}><X size={15} />離開共編</button>
            </div>
          </>
        ) : (
          <>
            <div className="cloud-collaboration-choice">
              <div><strong>用目前 Moodboard 開始共編</strong><small>會先建立本機版本，再上傳可合併的共編資料。</small></div>
              <button className="primary-button" type="button" onClick={onCreateRoom} disabled={cloudBusy}><Users size={16} />{cloud.status === "creating" ? "建立中…" : "建立共編空間"}</button>
            </div>
            <div className="cloud-collaboration-divider"><span>或加入別人的空間</span></div>
            <label className="collaboration-invite-field">
              <span>邀請連結或代碼</span>
              <div><input value={inviteDraft} onChange={(event) => setInviteDraft(event.target.value)} placeholder="貼上 ?collab=… 連結" /><button className="secondary-button" type="button" onClick={() => onJoinRoom(inviteDraft)} disabled={cloudBusy || !inviteDraft.trim()}><Share2 size={15} />加入</button></div>
            </label>
            {resumeAvailable ? <button className="text-button collaboration-resume-button" type="button" onClick={onResumeRoom} disabled={cloudBusy}><RefreshCw size={14} />繼續上次的共編空間</button> : null}
            {cloud.message ? <p className={`cloud-collaboration-message${cloud.status === "error" ? " is-error" : ""}`}>{cloud.message}</p> : null}
          </>
        )}
      </section>
      <label className="session-name-field">
        <span>這個分頁顯示名稱</span>
        <input value={sessionName} onChange={(event) => setSessionName(event.target.value.slice(0, 24))} />
      </label>
      <div className="architecture-note">
        <strong>離線與隱私</strong>
        <p>網路中斷時，變更會先留在這台裝置；恢復連線後再合併。共編不會自動開啟，也不會把其它本機 Moodboard 上傳。</p>
      </div>
      <div className="architecture-note">
        <strong>兩種離線檔案</strong>
        <p>`.moodboard` 是本應用的可編輯工作檔，不代表其他 Mood board 軟體相容；「瀏覽器版」會另外匯出任何現代瀏覽器都能開啟的單檔 HTML，內容完整但唯讀。</p>
      </div>
    </Modal>
  );
}

function AppUpdateNotice({
  updateCheck,
  updateAction,
  autoUpdateEnabled,
  onEnableAutoUpdate,
  onUpdateNow,
  onSnooze,
}) {
  if (updateCheck.status !== "available" || !updateCheck.manifest) return null;
  const busy = updateAction.status === "saving" || updateAction.status === "reloading";
  const version = updateCheck.manifest.version;

  return (
    <aside className={`app-update-notice${updateAction.status === "error" ? " is-error" : ""}`} aria-labelledby="app-update-notice-title" aria-live="polite">
      <div className="app-update-notice-heading">
        <span className="app-update-notice-icon" aria-hidden="true"><Download size={19} /></span>
        <div>
          <strong id="app-update-notice-title">{`Infinite Moodboard v${version} 可以更新`}</strong>
          <small>{updateCheck.manifest.summary || "新的穩定版本已可使用。"}</small>
        </div>
      </div>
      <p>立即更新會先儲存目前工作並建立「更新前自動備份」；任何一步失敗都不會重新載入。</p>
      {updateAction.message ? (
        <div className={`app-update-action-status is-${updateAction.status}`} role="status">
          {updateAction.status === "error" ? <AlertTriangle size={15} /> : <RefreshCw size={15} className={busy ? "is-spinning" : ""} />}
          <span>{updateAction.message}</span>
        </div>
      ) : null}
      <div className="app-update-notice-actions">
        <button className="primary-button" type="button" onClick={onUpdateNow} disabled={busy}>
          <RefreshCw size={15} className={busy ? "is-spinning" : ""} />
          {busy ? "正在安全更新…" : "立即更新"}
        </button>
        <button className="secondary-button" type="button" onClick={onEnableAutoUpdate} disabled={busy || autoUpdateEnabled} aria-pressed={autoUpdateEnabled}>
          <Check size={15} />{autoUpdateEnabled ? "自動更新已開啟" : "自動更新"}
        </button>
        <button className="text-button" type="button" onClick={onSnooze} disabled={busy}>稍後更新</button>
      </div>
      <small className="app-update-auto-note">自動更新只會在下一次安全開啟時套用，不會在編輯途中突然重整。</small>
    </aside>
  );
}

function SettingsModal({
  activeTheme,
  accountLinkBusy,
  accountLinkMessage,
  accountReceipt,
  accountSignedIn,
  accountUser,
  canvasBackground,
  currentDriveLink,
  driveCurrentContentBytes,
  driveSession,
  driveSettings,
  localLibrarySummary,
  enableProviderTesting = false,
  initialSection = "general",
  locale,
  mode,
  typography,
  updateCheck,
  updateAction,
  autoUpdateEnabled,
  leftPanelVisible,
  rightPanelVisible,
  rulersVisible,
  guidesVisible,
  rulerUnit,
  onSetMode,
  onSetCanvasBackground,
  onSetLocale,
  onSetTypography,
  onResetTypography,
  onCheckForUpdates,
  onSetAutoUpdate,
  onUpdateNow,
  onSnoozeUpdate,
  onConnectDrive,
  onDisconnectDrive,
  onManageThemes,
  onMarketingPreferenceChange,
  onLinkEmail,
  onLinkFacebook,
  onLinkGoogle,
  onSignInRequest,
  onSignOut,
  onClearLocalData,
  onToggleLeftPanel,
  onToggleRightPanel,
  onToggleRulers,
  onToggleGuides,
  onSetRulerUnit,
  onOpenShortcuts,
  onOpenDriveLibrary,
  onSaveDrive,
  onSetDriveAutoSync,
  onClose,
}) {
  const [section, setSection] = useState(initialSection);
  const resolvedTypography = resolveInterfaceTypography(typography);
  const [customFontDraft, setCustomFontDraft] = useState(typography.customFamily || "");
  const providerStates = moodboardProviderStates(accountUser)
    .filter((provider) => provider.public || (enableProviderTesting && provider.testable));

  useEffect(() => {
    setCustomFontDraft(typography.customFamily || "");
  }, [typography.customFamily]);

  const applyCustomFont = () => {
    if (!customFontDraft.trim()) return;
    onSetTypography({ ...typography, familyMode: "custom", customFamily: customFontDraft });
  };

  const updateStatus = (() => {
    if (updateCheck.status === "checking") {
      return { icon: <RefreshCw size={18} className="is-spinning" />, title: "正在檢查更新…", detail: "正在取得穩定版資訊。" };
    }
    if (updateCheck.status === "current") {
      return { icon: <Check size={18} />, title: "目前已是最新版本", detail: `已於 ${formatTime(updateCheck.checkedAt)} 檢查穩定版 v${updateCheck.manifest.version}。` };
    }
    if (updateCheck.status === "available") {
      return { icon: <Download size={18} />, title: `有新版 v${updateCheck.manifest.version}`, detail: updateCheck.manifest.summary || "已有新的穩定版本可用。" };
    }
    if (updateCheck.status === "preview") {
      return { icon: <Sparkles size={18} />, title: "目前版本比穩定版更新", detail: `發布中的穩定版是 v${updateCheck.manifest.version}；這可能是開發中的版本。` };
    }
    if (updateCheck.status === "error") {
      return { icon: <AlertTriangle size={18} />, title: "目前無法檢查更新", detail: updateCheck.message };
    }
    return { icon: <Info size={18} />, title: "尚未檢查", detail: "檢查時需要連線；離線工作不受影響。" };
  })();

  return (
    <Modal title="設定" description="常用偏好集中在這裡，後續設定可沿用相同分區擴充。" onClose={onClose} wide>
      <div className="settings-layout">
        <nav className="settings-nav" aria-label="設定分類">
          <button className={section === "account" ? "is-active" : ""} type="button" onClick={() => setSection("account")}>
            <UserRound size={17} /><span>帳號與隱私</span>
          </button>
          <button className={section === "storage" ? "is-active" : ""} type="button" onClick={() => setSection("storage")}>
            <Cloud size={17} /><span>儲存與同步</span>
          </button>
          <button className={section === "general" ? "is-active" : ""} type="button" onClick={() => setSection("general")}>
            <Languages size={17} /><span>一般設定</span>
          </button>
          <button className={section === "appearance" ? "is-active" : ""} type="button" onClick={() => setSection("appearance")}>
            <Palette size={17} /><span>外觀</span>
          </button>
          <button className={section === "workspace" ? "is-active" : ""} type="button" onClick={() => setSection("workspace")}>
            <LayoutGrid size={17} /><span>工作區</span>
          </button>
          <button className={section === "about" ? "is-active" : ""} type="button" onClick={() => setSection("about")}>
            <Info size={17} /><span>關於</span>
          </button>
        </nav>
        <div className="settings-content">
          {section === "account" ? (
            <section className="settings-section" aria-labelledby="settings-account-title">
              <div className="settings-section-heading">
                <div><h3 id="settings-account-title">帳號與隱私</h3><p>訪客可直接使用本機功能；登入後解鎖協作、同步與進階 3D。</p></div>
              </div>
              <div className="settings-account-profile">
                {accountSignedIn ? <AccountAvatar user={accountUser} size={52} /> : <span className="account-avatar" style={{ "--account-avatar-size": "52px" }} aria-hidden="true"><UserRound size={22} /></span>}
                {accountSignedIn ? (
                  <div><strong data-l10n-ignore>{accountDisplayName(accountUser)}</strong><small data-l10n-ignore>{accountUser?.email}</small><span><Check size={13} />{accountProviderLabel(accountUser)}</span></div>
                ) : (
                  <div><strong>訪客模式</strong><small>本機編輯、儲存與匯出可直接使用</small><span className="is-guest"><HardDrive size={13} />僅保存在這台裝置</span></div>
                )}
              </div>
              <div className="settings-account-boundary">
                <ShieldCheck size={20} />
                <div><strong>Drive 授權由你另外決定</strong><p>登入、登出或切換帳號都不會刪除目前瀏覽器中的 Moodboard。只有另外連結 Google Drive 並啟用同步後，作品才會上傳。</p></div>
              </div>
              {accountSignedIn ? (
                <div className="settings-login-methods">
                  <div className="settings-login-methods-heading">
                    <div><strong>登入方式</strong><small>把不同登入方式連到同一個 PETFASHION UID；不會自動合併其它帳號。</small></div>
                  </div>
                  {providerStates.map((provider) => (
                    <div className="settings-login-method" key={provider.id}>
                      <span className="settings-login-method-icon" aria-hidden="true">{provider.id === "google.com" ? "G" : provider.id === "facebook.com" ? "f" : <Mail size={16} />}</span>
                      <span><strong>{provider.label}{!provider.public ? "（僅限本機測試）" : ""}</strong><small>{provider.linked ? "已連結目前帳號" : provider.id === "password" ? `寄送到 ${accountUser?.email || "目前 Email"}` : "尚未連結"}</small></span>
                      {provider.linked ? <span className="settings-login-method-status"><Check size={14} />已連結</span> : (
                        <button
                          className="quiet-button"
                          type="button"
                          disabled={accountLinkBusy}
                          onClick={provider.id === "google.com" ? onLinkGoogle : provider.id === "facebook.com" ? onLinkFacebook : onLinkEmail}
                        >
                          {accountLinkBusy ? <RefreshCw size={14} className="is-spinning" /> : null}
                          {provider.id === "password" ? "寄送連結" : "連結"}
                        </button>
                      )}
                    </div>
                  ))}
                  {accountLinkMessage ? <p className={`settings-login-method-message ${accountLinkMessage.tone === "error" ? "is-error" : ""}`} role="status">{accountLinkMessage.tone === "error" ? <AlertTriangle size={14} /> : <Check size={14} />}{accountLinkMessage.text}</p> : null}
                </div>
              ) : null}
              {accountSignedIn && accountReceipt ? (
                <div className="settings-membership-record">
                  <div className="settings-membership-summary">
                    <ShieldCheck size={18} />
                    <div>
                      <strong>Infinite Moodboard 已啟用</strong>
                      <small>{accountReceipt.productActivation?.accountRelationship === "created-through-product"
                        ? "加入來源：Infinite Moodboard"
                        : "保留原始加入來源，另記 Infinite Moodboard 啟用"}</small>
                      <small>{accountReceipt.authPersistence === "local" ? "此裝置會保持登入" : "關閉瀏覽工作階段後會登出"}</small>
                    </div>
                  </div>
                  <label className="settings-marketing-choice">
                    <input
                      type="checkbox"
                      checked={accountReceipt.marketing?.enabled === true}
                      onChange={(event) => onMarketingPreferenceChange(event.target.checked)}
                    />
                    <span><strong>產品 Email 偏好（尚未啟用）</strong><small>公開 Beta 只保存在此裝置，不會加入寄送名單；正式啟用前會再次確認。</small></span>
                  </label>
                  <p className="settings-development-note">目前不會寄送 Email；PETFASHION 後台同步與刪除流程完成後，才會另行啟用。</p>
                </div>
              ) : null}
              <div className="settings-account-links">
                {accountSignedIn ? <a className="secondary-button" href={PETFASHION_ACCOUNT_URL} target="_blank" rel="noreferrer">管理或刪除 PETFASHION 帳號 <ExternalLink size={15} /></a> : <button className="primary-button" type="button" onClick={onSignInRequest}><UserRound size={15} />登入解鎖進階功能</button>}
                <a className="quiet-button" href={PETFASHION_PRIVACY_URL} target="_blank" rel="noreferrer">隱私權政策 <ExternalLink size={14} /></a>
                {accountSignedIn ? <button className="quiet-button" type="button" onClick={onSignOut}><LogOut size={15} />登出</button> : null}
              </div>
              <div className="settings-danger-zone">
                <div><strong>這台裝置的 Moodboard 資料</strong><small>永久清除目前自動儲存與所有本機版本；已下載的檔案不受影響。</small></div>
                <button className="danger-button" type="button" onClick={onClearLocalData}><Trash2 size={15} />清除本機資料</button>
              </div>
            </section>
          ) : section === "storage" ? (
            <section className="settings-section" aria-labelledby="settings-storage-title">
              <div className="settings-section-heading">
                <div><h3 id="settings-storage-title">儲存與同步</h3><p>優先把工作檔保存到 Google Drive，同時保留本機安全暫存。</p></div>
              </div>
              <div className="settings-drive-quota">
                <HardDrive size={18} />
                <div>
                  <strong>本機安全暫存</strong>
                  <small><span>本機 Moodboards</span>{`: ${localLibrarySummary.boardCount} · `}<span>等待同步</span>{`: ${localLibrarySummary.pendingSyncCount}`}{localLibrarySummary.storage.persisted === false ? <><span aria-hidden="true"> · </span><span>瀏覽器可能自動清理</span></> : null}</small>
                </div>
                <span>{localLibrarySummary.storage.usage !== null ? formatStorageSize(localLibrarySummary.storage.usage) : formatStorageSize(localLibrarySummary.estimatedBoardBytes)}</span>
              </div>
              {(() => {
                const status = driveStatusPresentation(driveSession);
                const StatusIcon = status.icon;
                return (
                  <div className={`settings-drive-status is-${status.tone}`}>
                    <span aria-hidden="true"><StatusIcon size={20} className={["connecting", "syncing", "checking"].includes(driveSession.status) ? "is-spinning" : ""} /></span>
                    <div><strong>{status.label}</strong><small>{driveSession.message || (driveSession.user?.emailAddress ? `目前 Drive 帳號：${driveSession.user.emailAddress}` : "Drive 授權和 PETFASHION 登入分開管理。")}</small></div>
                  </div>
                );
              })()}
              <div className="settings-account-boundary settings-drive-boundary">
                <ShieldCheck size={20} />
                <div><strong>只要求 drive.file 最小權限</strong><p>Infinite Moodboard 只能存取本服務建立的檔案；不會掃描整個 Google Drive，也不會保存 Google 存取權杖。</p></div>
              </div>
              {driveSession.connected ? (
                <>
                  <button className="settings-toggle-row" type="button" aria-pressed={driveSettings.autoSync} onClick={() => onSetDriveAutoSync(!driveSettings.autoSync)}>
                    <span><CloudUpload size={18} /><span><strong>自動同步</strong><small>編輯先寫入本機，停止操作後再同步到 Drive。</small></span></span>
                    <b>{driveSettings.autoSync ? "啟用" : "停用"}</b>
                  </button>
                  <div className="settings-drive-quota">
                    <HardDrive size={18} />
                    <div><strong>Drive 可用空間</strong><small>{driveSession.quota?.limit === null ? "此帳號未提供固定個人上限，儲存時仍會確認結果。" : driveSession.quota ? `${formatStorageSize(driveSession.quota.remaining)} 可用，共 ${formatStorageSize(driveSession.quota.limit)}` : "重新整理後顯示容量資訊。"}</small></div>
                    <span>{formatStorageSize(driveCurrentContentBytes)}</span>
                  </div>
                  <div className="settings-account-links settings-drive-actions">
                    <button className="primary-button" type="button" onClick={onSaveDrive} disabled={["syncing", "checking"].includes(driveSession.status)}><CloudUpload size={16} />{currentDriveLink ? "立即同步" : "儲存目前 Moodboard"}</button>
                    <button className="secondary-button" type="button" onClick={onOpenDriveLibrary}><FolderOpen size={15} />我的 Moodboards</button>
                    <button className="quiet-button" type="button" onClick={onDisconnectDrive} title="只中斷目前分頁，不影響 PETFASHION 登入"><CloudOff size={15} />中斷此分頁</button>
                  </div>
                </>
              ) : (
                <div className="settings-drive-connect">
                  <div><Cloud size={22} /><span><strong>連結後才會開始雲端保存</strong><small>目前畫布仍持續自動儲存在這台裝置。</small></span></div>
                  <button className="primary-button" type="button" onClick={onConnectDrive} disabled={driveSession.status === "connecting"}><Cloud size={16} />連結 Google Drive</button>
                </div>
              )}
              <p className="settings-update-note">若離線、容量不足或授權失效，編輯不會中斷；畫布會標示等待同步，並可隨時下載 `.moodboard` 備份。</p>
            </section>
          ) : section === "general" ? (
            <section className="settings-section" aria-labelledby="settings-general-title">
              <div className="settings-section-heading">
                <div><h3 id="settings-general-title">一般設定</h3><p>選擇操作介面使用的語言；不會翻譯 Moodboard 內的文字內容。</p></div>
              </div>
              <div className="settings-subsection-heading">
                <Languages size={17} />
                <div><strong>介面語言</strong><small>語言會保存在這台裝置；登入同步啟用後可再跟隨帳號。</small></div>
              </div>
              <div className="settings-language-options" role="radiogroup" aria-label="介面語言">
                {INTERFACE_LOCALES.map((option) => (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={locale === option.id}
                    className={locale === option.id ? "is-active" : ""}
                    onClick={() => onSetLocale(option.id)}
                    data-l10n-ignore
                    key={option.id}
                  >
                    <span lang={option.id}>{option.label}</span>
                    {locale === option.id ? <Check size={16} aria-hidden="true" /> : null}
                  </button>
                ))}
              </div>
            </section>
          ) : section === "appearance" ? (
            <section className="settings-section" aria-labelledby="settings-appearance-title">
              <div className="settings-section-heading">
                <div><h3 id="settings-appearance-title">外觀</h3><p>快速調整明暗配色與介面文字；偏好只保存在這台裝置。</p></div>
              </div>
              <div className="settings-row settings-mode-row">
                <div><strong>介面模式</strong><small>會記住各模式最近使用的配色。</small></div>
                <div className="settings-segmented" aria-label="介面明暗模式">
                  <button type="button" className={mode === "light" ? "is-active" : ""} aria-pressed={mode === "light"} onClick={() => onSetMode("light")}><Sun size={16} />淺色</button>
                  <button type="button" className={mode === "dark" ? "is-active" : ""} aria-pressed={mode === "dark"} onClick={() => onSetMode("dark")}><Moon size={16} />深色</button>
                </div>
              </div>
              <div className="settings-row settings-theme-row">
                <div className="settings-current-theme">
                  <span className="theme-swatches" aria-hidden="true">
                    <i style={{ background: activeTheme.colors.background }} />
                    <i style={{ background: activeTheme.colors.panel }} />
                    <i style={{ background: activeTheme.colors.canvas }} />
                    <i style={{ background: activeTheme.colors.accent }} />
                  </span>
                  <span><strong>目前配色</strong><small data-l10n-ignore={activeTheme.builtin ? undefined : true}>{activeTheme.name}</small></span>
                </div>
                <button className="secondary-button" type="button" onClick={onManageThemes}><Palette size={16} />管理介面配色</button>
              </div>
              <div className="settings-subsection-heading">
                <Type size={17} />
                <div><strong>介面文字</strong><small>只調整操作介面，不會改變 Moodboard 裡的文字物件。</small></div>
              </div>
              <div className="settings-row settings-type-size-row">
                <div><strong>字體大小</strong><small>選擇預設，或用滑桿精細調整。</small></div>
                <div className="settings-segmented settings-type-presets" aria-label="介面字體大小">
                  {UI_FONT_SIZE_PRESETS.map((preset) => (
                    <button
                      type="button"
                      className={typography.sizeMode === preset.id ? "is-active" : ""}
                      aria-pressed={typography.sizeMode === preset.id}
                      onClick={() => onSetTypography({ ...typography, sizeMode: preset.id })}
                      key={preset.id}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
              <label className="settings-custom-size">
                <span><strong>自訂大小</strong><small>{`目前 ${resolvedTypography.offset > 0 ? "+" : ""}${resolvedTypography.offset}px`}</small></span>
                <input
                  type="range"
                  min="-1"
                  max="4"
                  step="0.5"
                  value={resolvedTypography.offset}
                  onChange={(event) => onSetTypography({ ...typography, sizeMode: "custom", customOffset: Number(event.target.value) })}
                />
              </label>
              <div className="settings-font-family">
                <div><strong>字體樣式</strong><small>快速選擇會立即套用；自訂名稱需主機已安裝，找不到時會使用後備字體。</small></div>
                <div className="settings-font-options" role="group" aria-label="介面字體樣式">
                  {UI_FONT_FAMILY_PRESETS.map((preset) => (
                    <button
                      type="button"
                      className={typography.familyMode === preset.id ? "is-active" : ""}
                      aria-pressed={typography.familyMode === preset.id}
                      onClick={() => onSetTypography({ ...typography, familyMode: preset.id })}
                      style={{ fontFamily: preset.family }}
                      key={preset.id}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="settings-custom-font">
                <label>
                  <span>自訂字體名稱</span>
                  <input
                    value={customFontDraft}
                    onChange={(event) => setCustomFontDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        applyCustomFont();
                      }
                    }}
                    placeholder="例如：Avenir Next, Noto Sans TC"
                  />
                </label>
                <button className="secondary-button" type="button" disabled={!customFontDraft.trim()} onClick={applyCustomFont}>套用自訂字體</button>
              </div>
              <div className="settings-type-preview" style={{ fontFamily: resolvedTypography.family }}>
                <span>Aa</span><strong>Infinite Moodboard 無限靈感 123</strong>
                <button className="quiet-button" type="button" onClick={onResetTypography}><RotateCcw size={15} />恢復預設</button>
              </div>
            </section>
          ) : section === "workspace" ? (
            <section className="settings-section" aria-labelledby="settings-workspace-title">
              <div className="settings-section-heading">
                <div><h3 id="settings-workspace-title">工作區</h3><p>調整畫布輔助背景，以及桌面工作區預設顯示的面板。</p></div>
              </div>
              <div className="settings-subsection-heading settings-canvas-heading">
                <LayoutGrid size={17} />
                <div><strong>畫布背景</strong><small>只影響這台裝置的工作區，不會寫入 Moodboard 或輸出成品。</small></div>
              </div>
              <div className="settings-canvas-background-options" role="radiogroup" aria-label="畫布背景樣式">
                {[
                  { id: "dots", label: "格點", detail: "離散定位點" },
                  { id: "lines", label: "格線", detail: "連續方格線" },
                  { id: "hidden", label: "隱藏", detail: "純色畫布" },
                ].map((option) => (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={canvasBackground.mode === option.id}
                    className={canvasBackground.mode === option.id ? "is-active" : ""}
                    onClick={() => onSetCanvasBackground(option.id)}
                    key={option.id}
                  >
                    <span className={`canvas-background-preview is-${option.id}`} aria-hidden="true" />
                    <span><strong>{option.label}</strong><small>{option.detail}</small></span>
                    {canvasBackground.mode === option.id ? <Check size={15} aria-hidden="true" /> : null}
                  </button>
                ))}
              </div>
              <p className="settings-shortcut-note">Shift + ' ：隱藏或顯示，重新顯示會回到上次的格點或格線。</p>
              <div className="settings-subsection-heading">
                <Ruler size={17} />
                <div><strong>尺規與輔助導引線</strong><small>尺規是本機偏好；導引線位置會寫入 .moodboard，但不會輸出到成品。</small></div>
              </div>
              <div className="settings-ruler-controls">
                <button className="settings-toggle-row" type="button" aria-pressed={rulersVisible} onClick={onToggleRulers}>
                  <span><Ruler size={18} /><span><strong>顯示尺規</strong><small>Shift + R</small></span></span>
                  <b>{rulersVisible ? "顯示" : "隱藏"}</b>
                </button>
                <button className="settings-toggle-row" type="button" aria-pressed={guidesVisible} onClick={onToggleGuides}>
                  <span><LayoutGrid size={18} /><span><strong>顯示輔助導引線</strong><small>Shift + ;</small></span></span>
                  <b>{guidesVisible ? "顯示" : "隱藏"}</b>
                </button>
              </div>
              <div className="settings-row settings-ruler-unit-row">
                <div><strong>尺規單位</strong><small>也可在尺規上按右鍵切換。</small></div>
                <div className="settings-segmented" role="radiogroup" aria-label="尺規單位">
                  {Object.entries(RULER_UNITS).map(([id, option]) => (
                    <button key={id} type="button" role="radio" aria-checked={rulerUnit === id} className={rulerUnit === id ? "is-active" : ""} onClick={() => onSetRulerUnit(id)}>{option.label}</button>
                  ))}
                </div>
              </div>
              <button className="settings-toggle-row" type="button" aria-pressed={leftPanelVisible} onClick={onToggleLeftPanel}>
                <span><PanelLeft size={18} /><span><strong>左側工作面板</strong><small>圖層、分群、素材與構圖</small></span></span>
                <b>{leftPanelVisible ? "顯示" : "隱藏"}</b>
              </button>
              <button className="settings-toggle-row" type="button" aria-pressed={rightPanelVisible} onClick={onToggleRightPanel}>
                <span><SlidersHorizontal size={18} /><span><strong>右側屬性面板</strong><small>選取物件的內容與變形設定</small></span></span>
                <b>{rightPanelVisible ? "顯示" : "隱藏"}</b>
              </button>
              <button className="settings-toggle-row" type="button" onClick={onOpenShortcuts}>
                <span><Keyboard size={18} /><span><strong>快速鍵清單</strong><small>開啟可搜尋的指令參考，也可直接按 ?。</small></span></span>
                <b>查看</b>
              </button>
            </section>
          ) : (
            <section className="settings-section" aria-labelledby="settings-about-title">
              <div className="settings-section-heading">
                <div><h3 id="settings-about-title">關於 Infinite Moodboard</h3><p>查看目前安裝版本，並向穩定版資訊來源檢查更新。</p></div>
              </div>
              <div className="settings-version-row">
                <div className="settings-version-identity">
                  <span aria-hidden="true">∞</span>
                  <div><strong>{APP_VERSION_LABEL}</strong><small>發布日期 {APP_RELEASE_DATE} · 穩定版頻道</small></div>
                </div>
                <button className="primary-button" type="button" disabled={updateCheck.status === "checking"} onClick={onCheckForUpdates}>
                  <RefreshCw size={16} className={updateCheck.status === "checking" ? "is-spinning" : ""} />
                  {updateCheck.status === "checking" ? "檢查中…" : updateCheck.status === "idle" ? "檢查更新" : "重新檢查"}
                </button>
              </div>
              <div className={`settings-update-status is-${updateCheck.status}`} role="status" aria-live="polite">
                <span aria-hidden="true">{updateStatus.icon}</span>
                <div><strong>{updateStatus.title}</strong><small>{updateStatus.detail}</small></div>
              </div>
              <button className="settings-toggle-row" type="button" aria-pressed={autoUpdateEnabled} onClick={() => onSetAutoUpdate(!autoUpdateEnabled)}>
                <span><RefreshCw size={18} /><span><strong>安全自動更新</strong><small>只在下一次安全開啟時套用；編輯途中不會突然重新載入。</small></span></span>
                <b>{autoUpdateEnabled ? "已開啟" : "關閉"}</b>
              </button>
              {updateCheck.status === "available" ? (
                <div className="settings-update-actions" role="group" aria-label="更新方式">
                  <button className="primary-button" type="button" onClick={onUpdateNow} disabled={updateAction.status === "saving" || updateAction.status === "reloading"}>
                    <RefreshCw size={16} className={updateAction.status === "saving" || updateAction.status === "reloading" ? "is-spinning" : ""} />
                    {updateAction.status === "saving" || updateAction.status === "reloading" ? "正在安全更新…" : "立即更新"}
                  </button>
                  <button className="quiet-button" type="button" onClick={onSnoozeUpdate} disabled={updateAction.status === "saving" || updateAction.status === "reloading"}>稍後更新</button>
                </div>
              ) : null}
              {updateAction.message ? <p className={`settings-update-action-message is-${updateAction.status}`} role="status">{updateAction.message}</p> : null}
              <p className="settings-update-note">版本檢查不會上傳 Moodboard、素材或使用紀錄；若目前離線，可以繼續編輯並稍後重試。</p>
            </section>
          )}
        </div>
      </div>
    </Modal>
  );
}

function InterfaceThemeModal({
  themes,
  activeTheme,
  previewTheme,
  locale,
  onPreview,
  onConfirm,
  onSave,
  onDelete,
  onImport,
  onExport,
  onClose,
}) {
  const displayedTheme = previewTheme || activeTheme;
  const search = useListSearch("themes");
  const editableTheme = useCallback((theme) => {
    const next = normalizeInterfaceTheme({ ...theme, builtin: false });
    return { ...next, name: theme.builtin ? translateInterfaceText(theme.name, locale) : theme.name };
  }, [locale]);
  const [draft, setDraft] = useState(() => editableTheme(activeTheme));
  const sameColors = (first, second) => THEME_COLOR_FIELDS.every(([key]) => first.colors[key].toUpperCase() === second.colors[key].toUpperCase());
  const matchingTheme = themes.find((theme) => sameColors(theme, displayedTheme));
  const listedThemes = themes.filter((theme) => matchesListQuery([
    theme.name,
    theme.category,
    interfaceThemeMode(theme) === "light" ? "淺色" : "深色",
  ], search.query));
  const themeGroups = [
    ["product", "Infinite 與專案"],
    ["brand", "品牌識別靈感"],
    ["mood", "氣氛主題"],
    ["custom", "我的配色"],
  ].map(([id, label]) => ({ id, label, themes: listedThemes.filter((theme) => (theme.category || (theme.builtin ? "mood" : "custom")) === id) }))
    .filter((group) => group.themes.length);

  useEffect(() => {
    setDraft(editableTheme(activeTheme));
  }, [activeTheme, editableTheme]);

  const previewPreset = (theme) => {
    setDraft(editableTheme(theme));
    onPreview(theme);
  };

  const updateDraftColor = (key, value) => {
    setDraft((current) => {
      const next = normalizeInterfaceTheme({
        ...current,
        builtin: false,
        colors: { ...current.colors, [key]: value },
      });
      onPreview(next);
      return next;
    });
  };

  const resetDraft = () => {
    const next = editableTheme(activeTheme);
    setDraft(next);
    onPreview(null);
  };

  return (
    <Modal
      title="介面配色"
      description="點選會先在整個介面預覽；只有按下套用才會儲存。配色屬於這台裝置，不會改變 Moodboard 內容。"
      onClose={onClose}
      wide
    >
      <div className="theme-confirm-bar" aria-live="polite">
        <span><small>正在檢視</small><strong data-l10n-ignore={displayedTheme.builtin ? undefined : true}>{displayedTheme.name}</strong></span>
        <span className="theme-confirm-actions">
          <button className="quiet-button" type="button" onClick={onClose}>取消</button>
          <button className="primary-button" type="button" disabled={!matchingTheme || matchingTheme.id === activeTheme.id} onClick={() => onConfirm(matchingTheme?.id)}><Check size={16} />套用配色</button>
        </span>
      </div>
      <div className="modal-list-toolbar"><strong>可用介面配色</strong><ListSearchToggle search={search} resultCount={listedThemes.length} totalCount={themes.length} label="搜尋介面配色" /></div>
      <ListSearchField search={search} placeholder="搜尋配色名稱或類型" />
      <section className="theme-library" aria-label="可用介面配色">
        {themeGroups.map((group) => (
          <div className="theme-group" key={group.id}>
            <div className="theme-group-heading">
              <strong>{group.label}</strong>
              {group.id === "brand" ? <small>色彩靈感 · 非官方主題</small> : null}
            </div>
            <div className="theme-group-grid">
              {group.themes.map((theme) => {
                const isPreview = matchingTheme?.id === theme.id;
                const isActive = activeTheme.id === theme.id;
                return (
                  <article className={`theme-option ${isPreview ? "is-preview" : ""} ${isActive ? "is-active" : ""}`} key={theme.id}>
                    <button
                      className="theme-option-select"
                      type="button"
                      aria-pressed={isPreview}
                      onClick={() => previewPreset(theme)}
                    >
                      <span className="theme-swatches" aria-hidden="true">
                        <i style={{ background: theme.colors.background }} />
                        <i style={{ background: theme.colors.panel }} />
                        <i style={{ background: theme.colors.canvas }} />
                        <i style={{ background: theme.colors.accent }} />
                      </span>
                      <span><strong data-l10n-ignore={theme.builtin ? undefined : true}>{theme.name}</strong><small>{isActive ? "目前使用" : theme.builtin ? interfaceThemeMode(theme) === "light" ? "淺色" : "深色" : "我的配色"}</small></span>
                      {isPreview ? <Check size={16} aria-hidden="true" /> : null}
                    </button>
                    {!theme.builtin ? (
                      <IconButton label={`刪除配色「${theme.name}」`} onClick={() => onDelete(theme.id)}><Trash2 size={15} /></IconButton>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>
        ))}
        {!themeGroups.length ? (
          <div className="modal-empty"><Search size={24} /><strong>找不到符合的配色</strong><p>搜尋條件會保留，可以調整或清除。</p><button className="text-button" type="button" onClick={() => search.setQuery("")}>清除搜尋</button></div>
        ) : null}
      </section>

      <section className="theme-editor" aria-labelledby="theme-editor-title">
        <div className="theme-editor-heading">
          <div><strong id="theme-editor-title">建立自己的配色</strong><small>調整時會即時預覽；「儲存並套用」會新增一組，不覆蓋原配色。</small></div>
          <button className="quiet-button" type="button" onClick={resetDraft}>回到目前配色</button>
        </div>
        <label className="theme-name-field">
          <span>配色名稱</span>
          <input value={draft.name} maxLength={40} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} />
        </label>
        <div className="theme-color-grid">
          {THEME_COLOR_FIELDS.map(([key, label]) => (
            <label key={key}>
              <span>{label}</span>
              <span className="theme-color-input">
                <input type="color" value={draft.colors[key]} aria-label={`${label}色彩`} onChange={(event) => updateDraftColor(key, event.target.value)} />
                <output>{draft.colors[key]}</output>
              </span>
            </label>
          ))}
        </div>
        <div className="theme-actions">
          <button className="secondary-button" type="button" onClick={onImport}><FileUp size={16} /> 匯入配色</button>
          <button className="secondary-button" type="button" onClick={() => onExport(displayedTheme)}><Download size={16} /> 匯出預覽配色</button>
          <button className="primary-button" type="button" disabled={!draft.name.trim()} onClick={() => onSave(draft)}><Save size={16} /> 儲存並套用</button>
        </div>
      </section>
    </Modal>
  );
}

function ExportDownloadModal({ downloads, canPickDirectory, isExporting, onExportDirectory, onClose }) {
  const search = useListSearch("downloads");
  const listedDownloads = downloads.filter((item) => matchesListQuery([item.filename], search.query));
  return (
    <Modal
      title="匯出檔案已準備"
      description={canPickDirectory
        ? "可直接選擇資料夾批次匯出，也可以逐一下載。圖片、文字與形狀會保留尺寸與旋轉，影片則匯出原檔。"
        : "這個內嵌瀏覽器請逐一下載；在桌面 Chrome 開啟同一網址即可直接選擇匯出資料夾。"}
      onClose={onClose}
    >
      {canPickDirectory ? (
        <button className="primary-button export-folder-button" type="button" onClick={onExportDirectory} disabled={isExporting}>
          <FolderOpen size={17} /> {isExporting ? "匯出中…" : `選擇資料夾並匯出 ${downloads.length} 個檔案`}
        </button>
      ) : null}
      <div className="modal-list-toolbar"><strong>已準備檔案</strong><ListSearchToggle search={search} resultCount={listedDownloads.length} totalCount={downloads.length} label="搜尋已準備檔案" /></div>
      <ListSearchField search={search} placeholder="搜尋檔名" />
      <div className="export-download-list">
        {listedDownloads.map((item) => (
          <a className="export-download-link" href={item.url} download={item.filename} key={item.url}>
            <span><ImageIcon size={18} /><strong>{item.filename}</strong></span>
            <span><Download size={16} /> 下載檔案</span>
          </a>
        ))}
      </div>
      {!listedDownloads.length ? <div className="modal-empty compact"><Search size={22} /><strong>找不到符合的檔案</strong><button className="text-button" type="button" onClick={() => search.setQuery("")}>清除搜尋</button></div> : null}
      <p className="export-download-note">圖片、文字與形狀會輸出為自含 SVG；影片保留原始檔案格式。下載後皆可離線開啟。</p>
    </Modal>
  );
}

function StartupSequence({ onComplete }) {
  const skipButtonRef = useRef(null);

  useEffect(() => {
    skipButtonRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <section
      className="startup-sequence"
      role="dialog"
      aria-modal="true"
      aria-labelledby="startup-title"
      aria-describedby="startup-status"
      onKeyDown={(event) => {
        if (event.key === "Tab") event.preventDefault();
      }}
    >
      <div className="startup-grid" aria-hidden="true" />
      <div className="startup-scan" aria-hidden="true" />
      <div className="startup-frame startup-frame-top" aria-hidden="true" />
      <div className="startup-frame startup-frame-right" aria-hidden="true" />
      <div className="startup-frame startup-frame-bottom" aria-hidden="true" />
      <div className="startup-frame startup-frame-left" aria-hidden="true" />
      <div className="startup-rail startup-rail-top" aria-hidden="true" />
      <div className="startup-rail startup-rail-right" aria-hidden="true" />
      <div className="startup-rail startup-rail-bottom" aria-hidden="true" />
      <div className="startup-rail startup-rail-left" aria-hidden="true" />

      <div className="startup-telemetry startup-telemetry-top" aria-hidden="true">
        <span>LOCAL CORE / READY</span><i /> <span>CANVAS / ∞</span>
      </div>
      <div className="startup-telemetry startup-telemetry-bottom" aria-hidden="true">
        <span>OBJECT GRAPH / LINKED</span><i /> <span>OFFLINE / SECURE</span>
      </div>

      <div className="startup-core">
        <span className="startup-eyebrow">PETFASHION CREATIVE SYSTEM</span>
        <span className="startup-emblem" aria-hidden="true">∞</span>
        <h1 id="startup-title"><span>Infinite</span><span>Moodboard</span></h1>
        <div className="startup-progress" aria-hidden="true">
          {Array.from({ length: 8 }, (_, index) => <i key={index} />)}
        </div>
        <p id="startup-status"><span>WORKSPACE</span><b>ASSEMBLING</b></p>
      </div>

      <button ref={skipButtonRef} className="startup-skip" type="button" onClick={onComplete}>
        略過開場 <ChevronRight size={16} />
      </button>
    </section>
  );
}

function App() {
  const [interfaceLocale, setInterfaceLocale] = useState(loadInterfaceLocale);
  setActiveInterfaceLocale(interfaceLocale);
  const authPreviewUserRef = useRef(moodboardAuthPreviewUser());
  const initialDriveSettingsRef = useRef(loadDriveState());
  const initialBoardRef = useRef(createBoard({ name: localizedDefaultBoardName(interfaceLocale) }));
  const [board, setBoard] = useState(initialBoardRef.current);
  const boardRef = useRef(initialBoardRef.current);
  const [view, setView] = useState(initialBoardRef.current.view);
  const viewRef = useRef(initialBoardRef.current.view);
  const [hydrated, setHydrated] = useState(false);
  const [isBooting, setIsBooting] = useState(() => (
    typeof window !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ));
  const [selectedIds, setSelectedIds] = useState([]);
  const selectedIdsRef = useRef([]);
  const [keyObjectId, setKeyObjectId] = useState(null);
  const [selectionAnchor, setSelectionAnchor] = useState("mc");
  const [groupGesture, setGroupGesture] = useState(null);
  const [rotationGesture, setRotationGesture] = useState(false);
  const [resizeGesture, setResizeGesture] = useState(null);
  const [textFrameGesture, setTextFrameGesture] = useState(null);
  const [micro3DGesture, setMicro3DGesture] = useState(null);
  const [editingText, setEditingText] = useState(null);
  const [loadedTextFlow, setLoadedTextFlow] = useState(null);
  const [localFontOptions, setLocalFontOptions] = useState([]);
  const [localFontState, setLocalFontState] = useState(() => typeof window.queryLocalFonts === "function"
    ? { status: "idle", message: "需點擊後允許瀏覽器權限；字體檔不會存入工作檔。" }
    : { status: "unsupported", message: "此瀏覽器不支援讀取本機字體，仍可使用內建字體。" });
  const [tool, setTool] = useState("select");
  const [spaceDown, setSpaceDown] = useState(false);
  const [modifierDown, setModifierDown] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [marquee, setMarquee] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [shapeMenuOpen, setShapeMenuOpen] = useState(false);
  const [leftTab, setLeftTab] = useState("layers");
  const [selectedCaptureId, setSelectedCaptureId] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [layerTypeFilter, setLayerTypeFilter] = useState("all");
  const [markerDraft, setMarkerDraft] = useState({ symbol: "heart", color: "white" });
  const [batchPrefix, setBatchPrefix] = useState("");
  const [exportScope, setExportScope] = useState("selected");
  const [isExporting, setIsExporting] = useState(false);
  const [compositionFormat, setCompositionFormat] = useState("png");
  const [compositionScale, setCompositionScale] = useState(1);
  const [isRenderingComposition, setIsRenderingComposition] = useState(false);
  const [preparedDownloads, setPreparedDownloads] = useState([]);
  const [saveState, setSaveState] = useState("載入中");
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState(null);
  const [pendingObjectDeletion, setPendingObjectDeletion] = useState(null);
  const [escapeCancellationRequest, setEscapeCancellationRequest] = useState(null);
  const [showGridBuilder, setShowGridBuilder] = useState(false);
  const [showAnnotationBuilder, setShowAnnotationBuilder] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [showDriveLibrary, setShowDriveLibrary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [settingsInitialSection, setSettingsInitialSection] = useState("general");
  const [showInterfaceThemes, setShowInterfaceThemes] = useState(false);
  const [showDeleteLocalData, setShowDeleteLocalData] = useState(false);
  const [isClearingLocalData, setIsClearingLocalData] = useState(false);
  const [authSession, setAuthSession] = useState(() => authPreviewUserRef.current
    ? { status: "signed-in", user: authPreviewUserRef.current, error: null }
    : { status: "loading", user: null, error: null });
  const [authConsentGranted, setAuthConsentGranted] = useState(Boolean(authPreviewUserRef.current));
  const [authReceipt, setAuthReceipt] = useState(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [emailLinkFlow, setEmailLinkFlow] = useState({ status: "idle", href: "", context: null });
  const [accountLinkMessage, setAccountLinkMessage] = useState(null);
  const [authRetryKey, setAuthRetryKey] = useState(0);
  const [pendingAdvancedFeature, setPendingAdvancedFeature] = useState(null);
  const [online, setOnline] = useState(() => navigator.onLine !== false);
  const [driveSettings, setDriveSettings] = useState(initialDriveSettingsRef.current);
  const [driveSession, setDriveSession] = useState(() => ({
    status: initialDriveSettingsRef.current.enabled ? "authorization-required" : "disconnected",
    connected: false,
    busy: false,
    message: initialDriveSettingsRef.current.enabled ? "重新連結後會繼續同步本機變更。" : "",
    user: null,
    quota: null,
    files: [],
    conflict: null,
    lastSyncedAt: "",
  }));
  const [localLibrarySummary, setLocalLibrarySummary] = useState({
    boardCount: 0,
    pendingSyncCount: 0,
    estimatedBoardBytes: 0,
    storage: { usage: null, quota: null, persisted: null },
  });
  const [localBoards, setLocalBoards] = useState([]);
  const [syncJobs, setSyncJobs] = useState([]);
  const [customThemes, setCustomThemes] = useState(loadStoredInterfaceThemes);
  const [activeThemeId, setActiveThemeId] = useState(() => localStorage.getItem(ACTIVE_THEME_STORAGE_KEY) || DEFAULT_INTERFACE_THEME_ID);
  const [previewTheme, setPreviewTheme] = useState(null);
  const [interfaceTypography, setInterfaceTypography] = useState(loadStoredInterfaceTypography);
  const [canvasBackground, setCanvasBackground] = useState(loadStoredCanvasBackground);
  const [updateCheck, setUpdateCheck] = useState({ status: "idle", manifest: null, checkedAt: null, message: "" });
  const [updatePreference, setUpdatePreference] = useState(loadUpdatePreference);
  const [updateAction, setUpdateAction] = useState({ status: "idle", message: "" });
  const [updateNoticeDismissed, setUpdateNoticeDismissed] = useState(false);
  const [versions, setVersions] = useState([]);
  const [versionLabel, setVersionLabel] = useState("");
  const [versionBusy, setVersionBusy] = useState(false);
  const [driveVersions, setDriveVersions] = useState({ status: "idle", items: [], fileId: "", headRevisionId: "", message: "" });
  const [mobilePanel, setMobilePanel] = useState(null);
  const [mobileTopbarMenuOpen, setMobileTopbarMenuOpen] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(() => normalizeLeftPanelWidth(localStorage.getItem("moodboard-left-panel-width")));
  const [leftPanelVisible, setLeftPanelVisible] = useState(() => localStorage.getItem("moodboard-left-panel-visible") !== "false");
  const [rightPanelVisible, setRightPanelVisible] = useState(() => localStorage.getItem("moodboard-right-panel-visible") !== "false");
  const [focusMode, setFocusMode] = useState(false);
  const [rulersVisible, setRulersVisible] = useState(() => localStorage.getItem(RULERS_VISIBLE_STORAGE_KEY) !== "false");
  const [guidesVisible, setGuidesVisible] = useState(() => localStorage.getItem(GUIDES_VISIBLE_STORAGE_KEY) !== "false");
  const [rulerUnit, setRulerUnit] = useState(() => normalizeRulerUnit(localStorage.getItem(RULER_UNIT_STORAGE_KEY)));
  const [guideDrag, setGuideDrag] = useState(null);
  const [leftPanelResizing, setLeftPanelResizing] = useState(false);
  const [canvasViewportSize, setCanvasViewportSize] = useState({ width: 0, height: 0 });
  const [canvasToolbarPosition, setCanvasToolbarPosition] = useState(loadStoredCanvasToolbarPosition);
  const [canvasToolbarDragging, setCanvasToolbarDragging] = useState(false);
  const [sessionName, setSessionNameState] = useState(() => localStorage.getItem("moodboard-session-name") || createSessionName());
  const [peers, setPeers] = useState([]);
  const [cloudCollaboration, setCloudCollaboration] = useState(EMPTY_CLOUD_COLLABORATION);
  const [collaborationResume, setCollaborationResume] = useState(() => loadCollaborationResume());
  const [historySignal, setHistorySignal] = useState(0);
  const canUseDirectoryPicker = typeof window.showDirectoryPicker === "function" && navigator.webdriver !== true;
  const providerTestMode = import.meta.env.DEV
    && new URLSearchParams(window.location.search).get("authProviderTest") === "facebook";
  const identitySignedIn = authSession.status === "signed-in" && isMoodboardIdentityEligible(authSession.user);
  const authReady = identitySignedIn && authConsentGranted;

  const appRootRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasToolbarRef = useRef(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const svgInputRef = useRef(null);
  const boardInputRef = useRef(null);
  const themeInputRef = useRef(null);
  const fileHandleRef = useRef(null);
  const driveTokenRef = useRef(null);
  const driveOperationEpochRef = useRef(0);
  const driveSaveControllerRef = useRef(null);
  const driveSavePromiseRef = useRef(null);
  const undoRef = useRef([]);
  const redoRef = useRef([]);
  const channelRef = useRef(null);
  const peersRef = useRef(new Map());
  const sessionIdRef = useRef(createId("session"));
  const cloudCollaborationSessionRef = useRef(null);
  const initialCollaborationInviteRef = useRef(normalizeCollaborationInvite(window.location.href));
  const saveTimerRef = useRef(null);
  const localSavePromiseRef = useRef(Promise.resolve());
  const localPersistenceGenerationRef = useRef(0);
  const driveSyncTimerRef = useRef(null);
  const toastTimerRef = useRef(null);
  const startupUserInteractedRef = useRef(false);
  const autoUpdateDeferredVersionRef = useRef("");
  const updateApplyPromiseRef = useRef(null);
  const preparedDownloadsRef = useRef([]);
  const emailLinkHandledRef = useRef(false);
  const doubleClickPanMovedRef = useRef(false);
  const zoomValueTapRef = useRef(0);
  const canvasToolTapRef = useRef({ select: 0, hand: 0 });
  const blankClickRef = useRef(null);
  const objectClickRef = useRef(null);
  const objectTapRef = useRef(null);
  const textEditUndoRef = useRef(false);
  const textEditSessionRef = useRef(null);
  const objectClipboardRef = useRef([]);
  const activePointerGestureRef = useRef(null);

  const availableThemes = useMemo(() => [...BUILT_IN_THEMES, ...customThemes], [customThemes]);
  const activeTheme = useMemo(
    () => availableThemes.find((theme) => theme.id === activeThemeId)
      || availableThemes.find((theme) => theme.id === DEFAULT_INTERFACE_THEME_ID)
      || BUILT_IN_THEMES[0],
    [activeThemeId, availableThemes],
  );
  const activeThemeMode = useMemo(() => interfaceThemeMode(activeTheme), [activeTheme]);
  const interfaceThemeStyle = useMemo(
    () => ({
      ...interfaceThemeCssVariables(previewTheme || activeTheme),
      ...interfaceTypographyCssVariables(interfaceTypography),
    }),
    [activeTheme, interfaceTypography, previewTheme],
  );

  const registerPointerGesture = useCallback((gesture) => {
    const entry = { ...gesture };
    activePointerGestureRef.current = entry;
    return () => {
      if (activePointerGestureRef.current === entry) activePointerGestureRef.current = null;
    };
  }, []);

  const requestActivePointerCancellation = useCallback(() => {
    const gesture = activePointerGestureRef.current;
    if (!gesture) return false;
    activePointerGestureRef.current = null;
    gesture.pause?.();
    const hasChanges = Boolean(gesture.hasChanges?.());
    if (shouldConfirmEscapeCancellation({ affectsDocument: gesture.affectsDocument, hasChanges })) {
      setEscapeCancellationRequest({
        label: gesture.label || "目前調整",
        cancel: gesture.cancel,
        keep: gesture.keep,
      });
    } else {
      gesture.cancel?.();
    }
    return true;
  }, []);

  const keepEscapeAdjustment = useCallback(() => {
    const request = escapeCancellationRequest;
    if (!request) return;
    setEscapeCancellationRequest(null);
    request.keep?.();
  }, [escapeCancellationRequest]);

  const cancelEscapeAdjustment = useCallback(() => {
    const request = escapeCancellationRequest;
    if (!request) return;
    setEscapeCancellationRequest(null);
    request.cancel?.();
  }, [escapeCancellationRequest]);

  const finishStartup = useCallback(() => setIsBooting(false), []);
  const changeLeftTab = useCallback((nextTab) => {
    setLeftTab(nextTab);
    if (nextTab !== "filters") setFilters(DEFAULT_FILTERS);
  }, []);

  const updateLeftPanelWidth = useCallback((value) => {
    const nextWidth = normalizeLeftPanelWidth(value);
    setLeftPanelWidth(nextWidth);
    localStorage.setItem("moodboard-left-panel-width", String(nextWidth));
    return nextWidth;
  }, []);

  const toggleLeftPanel = useCallback(() => {
    setFocusMode(false);
    setLeftPanelVisible((current) => {
      const next = !current;
      localStorage.setItem("moodboard-left-panel-visible", String(next));
      return next;
    });
  }, []);

  const toggleRightPanel = useCallback(() => {
    setFocusMode(false);
    setRightPanelVisible((current) => {
      const next = !current;
      localStorage.setItem("moodboard-right-panel-visible", String(next));
      return next;
    });
  }, []);

  const toggleBothPanels = useCallback(() => {
    setFocusMode(false);
    const nextVisible = !(leftPanelVisible && rightPanelVisible);
    setLeftPanelVisible(nextVisible);
    setRightPanelVisible(nextVisible);
    localStorage.setItem("moodboard-left-panel-visible", String(nextVisible));
    localStorage.setItem("moodboard-right-panel-visible", String(nextVisible));
  }, [leftPanelVisible, rightPanelVisible]);

  const showBothPanels = useCallback(() => {
    setFocusMode(false);
    setMobilePanel(null);
    setLeftPanelVisible(true);
    setRightPanelVisible(true);
    localStorage.setItem("moodboard-left-panel-visible", "true");
    localStorage.setItem("moodboard-right-panel-visible", "true");
  }, []);

  const toggleFocusMode = useCallback(() => {
    setFocusMode((current) => !current);
    setMobilePanel(null);
  }, []);

  const restoreWorkspaceChrome = useCallback(() => {
    setFocusMode(false);
    setMobilePanel(null);
  }, []);

  const toggleRulers = useCallback(() => setRulersVisible((current) => !current), []);
  const toggleGuides = useCallback(() => setGuidesVisible((current) => !current), []);
  const changeRulerUnit = useCallback((nextUnit) => setRulerUnit(normalizeRulerUnit(nextUnit)), []);

  const openListSearch = useCallback((listId) => {
    window.dispatchEvent(new CustomEvent("infinite-moodboard:list-search", { detail: { listId } }));
  }, []);

  const onLeftPanelResizeStart = useCallback((event) => {
    if (window.matchMedia("(max-width: 900px)").matches) return;
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startWidth = leftPanelWidth;
    let latestWidth = startWidth;
    let releaseGesture = () => {};
    setLeftPanelResizing(true);
    const move = (moveEvent) => {
      latestWidth = updateLeftPanelWidth(startWidth + moveEvent.clientX - startX);
    };
    const cleanup = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      releaseGesture();
    };
    const up = () => {
      cleanup();
      setLeftPanelResizing(false);
    };
    const cancel = () => {
      cleanup();
      if (latestWidth !== startWidth) updateLeftPanelWidth(startWidth);
      setLeftPanelResizing(false);
    };
    releaseGesture = registerPointerGesture({
      label: "調整側欄寬度",
      affectsDocument: false,
      hasChanges: () => latestWidth !== startWidth,
      pause: cleanup,
      cancel,
      keep: up,
    });
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
    window.addEventListener("pointercancel", cancel, { once: true });
  }, [leftPanelWidth, registerPointerGesture, updateLeftPanelWidth]);

  const onLeftPanelResizeKeyDown = useCallback((event) => {
    const step = event.shiftKey ? 32 : 8;
    let nextWidth = null;
    if (event.key === "ArrowLeft") nextWidth = leftPanelWidth - step;
    if (event.key === "ArrowRight") nextWidth = leftPanelWidth + step;
    if (event.key === "Home") nextWidth = LEFT_PANEL_MIN_WIDTH;
    if (event.key === "End") nextWidth = getLeftPanelMaxWidth();
    if (nextWidth === null) return;
    event.preventDefault();
    updateLeftPanelWidth(nextWidth);
  }, [leftPanelWidth, updateLeftPanelWidth]);

  useEffect(() => {
    if (!isBooting) return undefined;
    const timer = window.setTimeout(finishStartup, 4100);
    const onKeyDown = (event) => {
      if (event.key === "Escape") finishStartup();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [finishStartup, isBooting]);

  useEffect(() => {
    const keepPanelInsideViewport = () => {
      if (window.innerWidth <= 900) return;
      setLeftPanelWidth((current) => {
        const next = normalizeLeftPanelWidth(current);
        if (next !== current) localStorage.setItem("moodboard-left-panel-width", String(next));
        return next;
      });
    };
    window.addEventListener("resize", keepPanelInsideViewport);
    return () => window.removeEventListener("resize", keepPanelInsideViewport);
  }, []);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const measure = () => {
      const rect = canvas.getBoundingClientRect();
      const next = { width: Math.round(rect.width), height: Math.round(rect.height) };
      setCanvasViewportSize((current) => (
        current.width === next.width && current.height === next.height ? current : next
      ));
    };
    measure();
    const resizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(measure) : null;
    resizeObserver?.observe(canvas);
    if (!resizeObserver) window.addEventListener("resize", measure);
    return () => {
      resizeObserver?.disconnect();
      if (!resizeObserver) window.removeEventListener("resize", measure);
    };
  }, []);

  useLayoutEffect(() => {
    const toolbar = canvasToolbarRef.current;
    if (!toolbar || !canvasToolbarPosition || !canvasViewportSize.width || !canvasViewportSize.height) return;
    if (window.matchMedia("(max-width: 900px)").matches) return;
    const rect = toolbar.getBoundingClientRect();
    const next = clampCanvasToolbarPosition(
      canvasToolbarPosition,
      canvasViewportSize,
      { width: rect.width, height: rect.height },
      { margin: 8 },
    );
    if (next.x === canvasToolbarPosition.x && next.y === canvasToolbarPosition.y) return;
    setCanvasToolbarPosition(next);
  }, [canvasToolbarPosition, canvasViewportSize]);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(customThemes));
  }, [customThemes]);

  useEffect(() => {
    localStorage.setItem(ACTIVE_THEME_STORAGE_KEY, activeTheme.id);
    if (activeTheme.id !== activeThemeId) setActiveThemeId(activeTheme.id);
  }, [activeTheme, activeThemeId]);

  useEffect(() => {
    localStorage.setItem(UI_TYPOGRAPHY_STORAGE_KEY, JSON.stringify(interfaceTypography));
  }, [interfaceTypography]);

  useEffect(() => {
    localStorage.setItem(CANVAS_BACKGROUND_STORAGE_KEY, JSON.stringify(canvasBackground));
  }, [canvasBackground]);

  useEffect(() => {
    if (canvasToolbarDragging) return;
    if (canvasToolbarPosition) {
      localStorage.setItem(CANVAS_TOOLBAR_POSITION_STORAGE_KEY, JSON.stringify(canvasToolbarPosition));
    } else {
      localStorage.removeItem(CANVAS_TOOLBAR_POSITION_STORAGE_KEY);
    }
  }, [canvasToolbarDragging, canvasToolbarPosition]);

  useEffect(() => {
    localStorage.setItem(RULERS_VISIBLE_STORAGE_KEY, String(rulersVisible));
  }, [rulersVisible]);

  useEffect(() => {
    localStorage.setItem(GUIDES_VISIBLE_STORAGE_KEY, String(guidesVisible));
  }, [guidesVisible]);

  useEffect(() => {
    localStorage.setItem(RULER_UNIT_STORAGE_KEY, rulerUnit);
  }, [rulerUnit]);

  useLayoutEffect(() => {
    applyLocalizedDocumentMetadata(interfaceLocale);
    return localizeInterfaceDom(appRootRef.current, interfaceLocale);
  }, [interfaceLocale]);

  useEffect(() => {
    localStorage.setItem(INTERFACE_LOCALE_STORAGE_KEY, interfaceLocale);
  }, [interfaceLocale]);

  useEffect(() => {
    const updateOnlineState = () => setOnline(navigator.onLine !== false);
    window.addEventListener("online", updateOnlineState);
    window.addEventListener("offline", updateOnlineState);
    return () => {
      window.removeEventListener("online", updateOnlineState);
      window.removeEventListener("offline", updateOnlineState);
    };
  }, []);

  useEffect(() => {
    if (authPreviewUserRef.current) return undefined;
    let active = true;
    let unsubscribe = () => {};
    setAuthSession({ status: "loading", user: null, error: null });
    setAuthMessage("");
    observeMoodboardSession((nextSession) => {
      if (!active) return;
      setAuthSession(nextSession);
      const receipt = nextSession.user ? getMoodboardAccessReceipt(localStorage, nextSession.user.uid) : null;
      setAuthReceipt(receipt);
      setAuthConsentGranted(Boolean(receipt) && isMoodboardIdentityEligible(nextSession.user));
      if (nextSession.status === "error") {
        setAuthMessage(moodboardAuthErrorMessage(nextSession.error, navigator.onLine !== false));
      } else if (nextSession.user && !isMoodboardIdentityEligible(nextSession.user)) {
        setAuthMessage(nextSession.user.emailVerified === false
          ? moodboardAuthErrorMessage({ code: "auth/unverified-email" })
          : moodboardAuthErrorMessage({ code: "auth/provider-not-allowed" }));
      }
    }).then((stop) => {
      if (active) unsubscribe = stop;
      else stop();
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [authRetryKey]);

  useEffect(() => {
    const storageKey = activeThemeMode === "light" ? LAST_LIGHT_THEME_STORAGE_KEY : LAST_DARK_THEME_STORAGE_KEY;
    localStorage.setItem(storageKey, activeTheme.id);
  }, [activeTheme.id, activeThemeMode]);

  useEffect(() => { boardRef.current = board; }, [board]);
  useEffect(() => { viewRef.current = view; }, [view]);
  useEffect(() => { selectedIdsRef.current = selectedIds; }, [selectedIds]);
  useEffect(() => {
    if (loadedTextFlow && !board.objects.some((object) => object.id === loadedTextFlow.sourceId)) {
      setLoadedTextFlow(null);
    }
  }, [board.objects, loadedTextFlow]);
  useEffect(() => {
    if (!shapeMenuOpen) return undefined;
    const close = (event) => {
      if (!event.target.closest?.(".insert-menu-wrap")) setShapeMenuOpen(false);
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [shapeMenuOpen]);
  useEffect(() => {
    if (!selectedIds.length) {
      setKeyObjectId(null);
      if (tool === "3d") setTool("select");
      return;
    }
    if (!selectedIds.includes(keyObjectId)) setKeyObjectId(selectedIds[0]);
  }, [keyObjectId, selectedIds, tool]);
  useEffect(() => {
    if (!editingText) return;
    const editableObject = board.objects.find((object) => object.id === editingText.id);
    if (!editableObject || editableObject.locked || tool !== "select" || !selectedIds.includes(editingText.id)) {
      setEditingText(null);
      textEditUndoRef.current = false;
      textEditSessionRef.current = null;
    }
  }, [board.objects, editingText, selectedIds, tool]);

  const closePreparedDownloads = useCallback(() => {
    preparedDownloadsRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    preparedDownloadsRef.current = [];
    setPreparedDownloads([]);
  }, []);

  useEffect(() => () => {
    preparedDownloadsRef.current.forEach((item) => URL.revokeObjectURL(item.url));
  }, []);

  const announce = useCallback((message, tone = "info") => {
    window.clearTimeout(toastTimerRef.current);
    setToast({ message, tone });
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3600);
  }, []);

  const resetCanvasToolbarPosition = useCallback(() => {
    setCanvasToolbarPosition(null);
    announce("畫布工具列已回到預設位置。", "success");
  }, [announce]);

  const onCanvasToolbarDragStart = useCallback((event) => {
    if (event.button !== 0 || window.matchMedia("(max-width: 900px)").matches) return;
    const toolbar = canvasToolbarRef.current;
    const container = toolbar?.parentElement;
    if (!toolbar || !container) return;
    event.preventDefault();
    event.stopPropagation();
    const containerRect = container.getBoundingClientRect();
    const toolbarRect = toolbar.getBoundingClientRect();
    const startPointer = { x: event.clientX, y: event.clientY };
    const startPosition = {
      x: toolbarRect.left - containerRect.left,
      y: toolbarRect.top - containerRect.top,
    };
    const previousPosition = canvasToolbarPosition ? { ...canvasToolbarPosition } : null;
    const bounds = { width: containerRect.width, height: containerRect.height };
    const toolbarSize = { width: toolbarRect.width, height: toolbarRect.height };
    let moved = false;
    let releaseGesture = () => {};
    setCanvasToolbarDragging(true);

    const move = (moveEvent) => {
      const dx = moveEvent.clientX - startPointer.x;
      const dy = moveEvent.clientY - startPointer.y;
      if (!moved && Math.hypot(dx, dy) < 3) return;
      moved = true;
      setCanvasToolbarPosition(clampCanvasToolbarPosition(
        { x: startPosition.x + dx, y: startPosition.y + dy },
        bounds,
        toolbarSize,
        { margin: 8 },
      ));
    };
    const cleanup = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", cancel);
      releaseGesture();
    };
    const finish = () => {
      cleanup();
      setCanvasToolbarDragging(false);
    };
    const cancel = () => {
      cleanup();
      setCanvasToolbarPosition(previousPosition);
      setCanvasToolbarDragging(false);
    };
    releaseGesture = registerPointerGesture({
      label: "移動畫布工具列",
      affectsDocument: false,
      hasChanges: () => moved,
      pause: cleanup,
      cancel,
      keep: finish,
    });
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", finish, { once: true });
    window.addEventListener("pointercancel", cancel, { once: true });
  }, [canvasToolbarPosition, registerPointerGesture]);

  const onCanvasToolbarHandleKeyDown = useCallback((event) => {
    if (event.key === "Home") {
      event.preventDefault();
      event.stopPropagation();
      resetCanvasToolbarPosition();
      return;
    }
    const directions = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const direction = directions[event.key];
    if (!direction || window.matchMedia("(max-width: 900px)").matches) return;
    const toolbar = canvasToolbarRef.current;
    const container = toolbar?.parentElement;
    if (!toolbar || !container) return;
    event.preventDefault();
    event.stopPropagation();
    const toolbarRect = toolbar.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const currentPosition = canvasToolbarPosition || {
      x: toolbarRect.left - containerRect.left,
      y: toolbarRect.top - containerRect.top,
    };
    const step = event.shiftKey ? 24 : 8;
    setCanvasToolbarPosition(clampCanvasToolbarPosition(
      {
        x: currentPosition.x + direction[0] * step,
        y: currentPosition.y + direction[1] * step,
      },
      { width: containerRect.width, height: containerRect.height },
      { width: toolbarRect.width, height: toolbarRect.height },
      { margin: 8 },
    ));
  }, [canvasToolbarPosition, resetCanvasToolbarPosition]);

  const updateDriveSettings = useCallback((updater) => {
    setDriveSettings((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;
      return saveDriveState(localStorage, next);
    });
  }, []);

  const currentDriveAccessToken = useCallback(() => {
    const token = driveTokenRef.current;
    if (!isGoogleDriveTokenUsable(token)) return "";
    return token.accessToken;
  }, []);

  const cancelDriveOperations = useCallback(() => {
    driveOperationEpochRef.current += 1;
    driveSaveControllerRef.current?.abort();
    driveSaveControllerRef.current = null;
    driveSavePromiseRef.current = null;
  }, []);

  const persistBoardLocally = useCallback((snapshot) => {
    const generation = localPersistenceGenerationRef.current;
    const previous = localSavePromiseRef.current.catch(() => undefined);
    const write = previous.then(async () => {
      if (generation !== localPersistenceGenerationRef.current) {
        const error = new Error("本機儲存已取消。");
        error.name = "AbortError";
        throw error;
      }
      await saveCurrentBoard(snapshot);
      return snapshot;
    });
    localSavePromiseRef.current = write.catch(() => undefined);
    return write;
  }, []);

  const refreshLocalLibrarySummary = useCallback(async () => {
    try {
      const [summary, boards, jobs] = await Promise.all([
        getLocalLibrarySummary(),
        listLocalBoards(),
        listSyncJobs(),
      ]);
      setLocalLibrarySummary(summary);
      setLocalBoards(boards);
      setSyncJobs(jobs);
      return summary;
    } catch {
      return null;
    }
  }, []);

  const refreshGoogleDrive = useCallback(async (providedToken = "", providedFolderId = "") => {
    const operationEpoch = driveOperationEpochRef.current;
    const accessToken = providedToken || currentDriveAccessToken();
    if (!accessToken) {
      setDriveSession((current) => ({ ...current, status: "authorization-required", connected: false, busy: false, message: "請重新連結 Google Drive；本機變更仍安全保留。" }));
      return null;
    }
    setDriveSession((current) => ({ ...current, status: "checking", connected: true, busy: true, message: "正在確認 Drive 檔案與可用空間…" }));
    try {
      const folderId = await ensureGoogleDriveFolder(accessToken, providedFolderId || driveSettings.folderId, { create: false });
      const [about, files] = await Promise.all([
        getGoogleDriveAbout(accessToken),
        listGoogleDriveMoodboards(accessToken, folderId),
      ]);
      if (operationEpoch !== driveOperationEpochRef.current) return null;
      updateDriveSettings((current) => ({ ...current, enabled: true, folderId }));
      setDriveSession((current) => ({
        ...current,
        status: "ready",
        connected: true,
        busy: false,
        message: "",
        user: about.user,
        quota: about.quota,
        files,
      }));
      return { accessToken, folderId, about, files };
    } catch (error) {
      if (operationEpoch !== driveOperationEpochRef.current || error?.name === "AbortError") return null;
      const authorizationRequired = isGoogleDriveAuthorizationError(error);
      if (authorizationRequired) driveTokenRef.current = null;
      setDriveSession((current) => ({
        ...current,
        status: authorizationRequired ? "authorization-required" : (error?.code === "drive/offline" ? "offline" : "error"),
        connected: !authorizationRequired,
        busy: false,
        message: driveErrorMessage(error),
      }));
      return null;
    }
  }, [currentDriveAccessToken, driveSettings.folderId, updateDriveSettings]);

  const connectGoogleDrive = useCallback(async () => {
    if (!authReady) {
      setShowSettings(false);
      setShowDriveLibrary(false);
      setPendingAdvancedFeature("drive");
      return null;
    }
    const operationEpoch = driveOperationEpochRef.current;
    setDriveSession((current) => ({ ...current, status: "connecting", busy: true, message: "Google 會另外詢問 Drive 檔案權限。" }));
    try {
      const token = await requestGoogleDriveToken({ loginHint: authSession.user?.email || "" });
      if (operationEpoch !== driveOperationEpochRef.current) return null;
      driveTokenRef.current = token;
      const result = await refreshGoogleDrive(token.accessToken, driveSettings.folderId);
      if (result) announce("Google Drive 已連結；尚未主動儲存前不會上傳畫布。", "success");
      return result;
    } catch (error) {
      if (operationEpoch !== driveOperationEpochRef.current || error?.name === "AbortError") return null;
      const authorizationRequired = isGoogleDriveAuthorizationError(error);
      if (authorizationRequired) driveTokenRef.current = null;
      setDriveSession((current) => ({
        ...current,
        status: authorizationRequired ? "authorization-required" : error?.code === "drive/offline" ? "offline" : "error",
        connected: false,
        busy: false,
        message: driveErrorMessage(error),
      }));
      announce(driveErrorMessage(error), "error");
      return null;
    }
  }, [announce, authReady, authSession.user?.email, driveSettings.folderId, refreshGoogleDrive]);

  const disconnectGoogleDrive = useCallback(() => {
    cancelDriveOperations();
    driveTokenRef.current = null;
    window.clearTimeout(driveSyncTimerRef.current);
    updateDriveSettings((current) => ({ ...current, enabled: false }));
    setDriveSession({
      status: "disconnected",
      connected: false,
      busy: false,
      message: "Drive 檔案仍保留在你的帳號中。",
      user: null,
      quota: null,
      files: [],
      conflict: null,
      lastSyncedAt: "",
    });
    announce("已中斷這個分頁的 Google Drive；雲端檔案、本機畫布與 PETFASHION 登入都未受影響。", "success");
  }, [announce, cancelDriveOperations, updateDriveSettings]);

  const setDriveAutoSync = useCallback((enabled) => {
    updateDriveSettings((current) => ({ ...current, autoSync: Boolean(enabled) }));
    announce(enabled ? "已開啟 Google Drive 自動同步。" : "已關閉自動同步；仍可隨時手動同步。", "success");
  }, [announce, updateDriveSettings]);

  const completeAdvancedFeature = useCallback((feature) => {
    if (feature === "collaboration") {
      setShowCollaboration(true);
      return;
    }
    if (feature === "drive") {
      setShowDriveLibrary(true);
      return;
    }
    if (feature === "3d") {
      if (selectedIdsRef.current.length) setTool("3d");
      else announce("請先選取要進行 3D 操作的物件。", "warning");
    }
  }, [announce]);

  const requestAdvancedFeature = useCallback((feature) => {
    if (authReady) {
      completeAdvancedFeature(feature);
      return;
    }
    setAuthMessage("");
    setPendingAdvancedFeature(feature);
  }, [authReady, completeAdvancedFeature]);

  const openGoogleDriveLibrary = useCallback(() => {
    setShowDriveLibrary(true);
    refreshLocalLibrarySummary();
  }, [refreshLocalLibrarySummary]);

  const closeAdvancedFeatureGate = useCallback(() => {
    if (authBusy) return;
    setPendingAdvancedFeature(null);
    setAuthMessage("");
  }, [authBusy]);

  useEffect(() => {
    if (!authReady || !pendingAdvancedFeature) return;
    const feature = pendingAdvancedFeature;
    setPendingAdvancedFeature(null);
    completeAdvancedFeature(feature);
  }, [authReady, completeAdvancedFeature, pendingAdvancedFeature]);

  const acceptMoodboardAccess = useCallback(({ marketingOptIn = false } = {}) => {
    if (!authSession.user) return;
    try {
      const receipt = saveMoodboardAccessConsent(localStorage, authSession.user, {
        feature: pendingAdvancedFeature,
        marketingOptIn,
        rememberSession: false,
      });
      setAuthReceipt(receipt);
      setAuthConsentGranted(true);
      setAuthMessage("");
      announce("帳號授權完成；Moodboard 仍保存在這台裝置。", "success");
    } catch (error) {
      setAuthMessage(error.message || "無法保存帳號授權，請再試一次。");
    }
  }, [announce, authSession.user, pendingAdvancedFeature]);

  const signInToMoodboard = useCallback(async ({ marketingOptIn = false, rememberSession = false } = {}) => {
    setAuthBusy(true);
    setAuthMessage("");
    try {
      const { user, isNewUser } = await signInMoodboardWithGoogle(interfaceLocale, { rememberSession });
      if (!isMoodboardIdentityEligible(user)) {
        const identityError = new Error("登入身份尚未通過驗證。");
        identityError.code = user?.emailVerified === false ? "auth/unverified-email" : "auth/provider-not-allowed";
        throw identityError;
      }
      const receipt = saveMoodboardAccessConsent(localStorage, user, {
        feature: pendingAdvancedFeature,
        isNewUser,
        marketingOptIn,
        rememberSession,
      });
      setAuthSession({ status: "signed-in", user, error: null });
      setAuthReceipt(receipt);
      setAuthConsentGranted(true);
      announce("已使用 PETFASHION 帳號登入；本機作品保持不變。", "success");
    } catch (error) {
      setAuthMessage(moodboardAuthErrorMessage(error, navigator.onLine !== false));
    } finally {
      setAuthBusy(false);
    }
  }, [announce, interfaceLocale, pendingAdvancedFeature]);

  const sendEmailLinkToMoodboard = useCallback(async ({
    email,
    marketingOptIn = false,
    rememberSession = false,
    accepted = false,
  } = {}) => {
    setAuthBusy(true);
    setAuthMessage("");
    try {
      return await sendMoodboardEmailSignInLink(email, interfaceLocale, {
        feature: pendingAdvancedFeature,
        marketingOptIn,
        rememberSession,
        accepted,
      });
    } catch (error) {
      setAuthMessage(moodboardAuthErrorMessage(error, navigator.onLine !== false));
      return null;
    } finally {
      setAuthBusy(false);
    }
  }, [interfaceLocale, pendingAdvancedFeature]);

  const completeEmailLinkToMoodboard = useCallback(async ({
    email,
    href = window.location.href,
    marketingOptIn = false,
    rememberSession = false,
    accepted = false,
  } = {}) => {
    setAuthBusy(true);
    setAuthMessage("");
    try {
      const context = emailActionContextFromUrl(href);
      const result = await completeMoodboardEmailSignInLink(email, href);
      const preferences = result.pending || { marketingOptIn, rememberSession, accepted, feature: context.feature };
      if (!isMoodboardIdentityEligible(result.user)) {
        const identityError = new Error("登入身份尚未通過驗證。");
        identityError.code = result.user?.emailVerified === false ? "auth/unverified-email" : "auth/provider-not-allowed";
        throw identityError;
      }

      let receipt = getMoodboardAccessReceipt(localStorage, result.user.uid);
      if (preferences.accepted === true && result.mode === "sign-in") {
        receipt = saveMoodboardAccessConsent(localStorage, result.user, {
          feature: preferences.feature || context.feature,
          isNewUser: result.isNewUser,
          marketingOptIn: preferences.marketingOptIn,
          rememberSession: preferences.rememberSession,
        });
      }

      setAuthSession({ status: "signed-in", user: result.user, error: null });
      setAuthReceipt(receipt);
      setAuthConsentGranted(Boolean(receipt));
      setEmailLinkFlow({ status: "idle", href: "", context: null });
      window.history.replaceState(window.history.state, "", cleanMoodboardEmailActionUrl(href));

      if (result.mode === "link") {
        setAccountLinkMessage({ tone: "success", text: "Email 驗證登入已連結到同一個 PETFASHION 帳號。" });
        setSettingsInitialSection("account");
        setShowSettings(true);
      } else {
        announce("Email 驗證完成；本機作品保持不變。", "success");
      }
      return result;
    } catch (error) {
      setAuthMessage(moodboardAuthErrorMessage(error, navigator.onLine !== false));
      setEmailLinkFlow((current) => ({ ...current, status: "needs-email", href }));
      return null;
    } finally {
      setAuthBusy(false);
    }
  }, [announce]);

  useEffect(() => {
    if (authPreviewUserRef.current || emailLinkHandledRef.current) return undefined;
    let active = true;
    const inspectEmailLink = async () => {
      const href = window.location.href;
      try {
        if (!(await isMoodboardEmailSignInLink(href)) || !active) return;
        emailLinkHandledRef.current = true;
        const context = emailActionContextFromUrl(href);
        const pending = pendingMoodboardEmailSignIn();
        setPendingAdvancedFeature(pending?.feature || context.feature);
        if (!pending?.email) {
          setEmailLinkFlow({ status: "needs-email", href, context });
          return;
        }
        setEmailLinkFlow({ status: "completing", href, context });
        const result = await completeEmailLinkToMoodboard({ email: pending.email, href });
        if (!result && active) setEmailLinkFlow({ status: "needs-email", href, context });
      } catch (error) {
        if (!active) return;
        setAuthMessage(moodboardAuthErrorMessage(error, navigator.onLine !== false));
      }
    };
    inspectEmailLink();
    return () => { active = false; };
  }, [completeEmailLinkToMoodboard]);

  const linkEmailToMoodboardAccount = useCallback(async () => {
    if (!authSession.user?.email) return;
    setAuthBusy(true);
    setAccountLinkMessage(null);
    try {
      const result = await sendMoodboardEmailSignInLink(authSession.user.email, interfaceLocale, {
        feature: "account",
        mode: "link",
        accepted: true,
        rememberSession: authReceipt?.authPersistence === "local",
      });
      setAccountLinkMessage({ tone: "success", text: `驗證連結已寄到 ${result.maskedEmail}；請在一小時內用同一瀏覽器完成。` });
    } catch (error) {
      setAccountLinkMessage({ tone: "error", text: moodboardAuthErrorMessage(error, navigator.onLine !== false) });
    } finally {
      setAuthBusy(false);
    }
  }, [authReceipt?.authPersistence, authSession.user?.email, interfaceLocale]);

  const linkGoogleToMoodboardAccount = useCallback(async () => {
    setAuthBusy(true);
    setAccountLinkMessage(null);
    try {
      const result = await linkMoodboardGoogle(interfaceLocale);
      setAuthSession({ status: "signed-in", user: result.user, error: null });
      setAccountLinkMessage({ tone: "success", text: result.alreadyLinked ? "Google 已連結目前帳號。" : "Google 已連結到同一個 PETFASHION 帳號。" });
    } catch (error) {
      setAccountLinkMessage({ tone: "error", text: moodboardAuthErrorMessage(error, navigator.onLine !== false) });
    } finally {
      setAuthBusy(false);
    }
  }, [interfaceLocale]);

  const linkFacebookToMoodboardAccount = useCallback(async () => {
    setAuthBusy(true);
    setAccountLinkMessage(null);
    try {
      const result = await linkMoodboardFacebook(interfaceLocale);
      setAuthSession({ status: "signed-in", user: result.user, error: null });
      setAccountLinkMessage({ tone: "success", text: result.alreadyLinked ? "Facebook 已連結目前帳號。" : "Facebook 已連結到同一個 PETFASHION 帳號。" });
    } catch (error) {
      setAccountLinkMessage({ tone: "error", text: moodboardAuthErrorMessage(error, navigator.onLine !== false) });
    } finally {
      setAuthBusy(false);
    }
  }, [interfaceLocale]);

  const updateMoodboardMarketingPreference = useCallback((enabled) => {
    if (!authSession.user) return;
    try {
      const receipt = saveMoodboardMarketingPreference(localStorage, authSession.user, enabled);
      setAuthReceipt(receipt);
      announce(enabled ? "已在這台裝置記錄 Email 偏好；目前不會寄送。" : "已清除這台裝置的 Email 偏好。", "success");
    } catch (error) {
      announce(error.message || "無法更新消息偏好。", "warning");
    }
  }, [announce, authSession.user]);

  const signOutOfMoodboard = useCallback(async () => {
    setAuthBusy(true);
    setAuthMessage("");
    try {
      const collaborationSession = cloudCollaborationSessionRef.current;
      cloudCollaborationSessionRef.current = null;
      if (collaborationSession) await collaborationSession.destroy().catch(() => undefined);
      setCloudCollaboration(EMPTY_CLOUD_COLLABORATION);
      cancelDriveOperations();
      driveTokenRef.current = null;
      window.clearTimeout(driveSyncTimerRef.current);
      if (!authPreviewUserRef.current) await signOutMoodboardSession();
      setAuthSession({ status: "signed-out", user: null, error: null });
      setAuthReceipt(null);
      setAuthConsentGranted(false);
      setPendingAdvancedFeature(null);
      setShowCollaboration(false);
      setShowDriveLibrary(false);
      setDriveSession((current) => ({ ...current, status: driveSettings.enabled ? "authorization-required" : "disconnected", connected: false, busy: false, message: driveSettings.enabled ? "再次登入並連結 Drive 後可繼續同步。" : "", user: null, quota: null, files: [], conflict: null }));
      setTool("select");
      setShowSettings(false);
      setShowInterfaceThemes(false);
      announce("已登出；這台裝置上的 Moodboard 沒有被刪除。", "success");
    } catch (error) {
      setAuthMessage(moodboardAuthErrorMessage(error, navigator.onLine !== false));
    } finally {
      setAuthBusy(false);
    }
  }, [announce, cancelDriveOperations, driveSettings.enabled]);

  const clearMoodboardFromThisDevice = useCallback(async () => {
    setIsClearingLocalData(true);
    cancelDriveOperations();
    localPersistenceGenerationRef.current += 1;
    window.clearTimeout(saveTimerRef.current);
    window.clearTimeout(driveSyncTimerRef.current);
    try {
      await localSavePromiseRef.current.catch(() => undefined);
      const collaborationSession = cloudCollaborationSessionRef.current;
      cloudCollaborationSessionRef.current = null;
      if (collaborationSession) await collaborationSession.destroy().catch(() => undefined);
      await Promise.all([clearLocalMoodboardData(), clearCollaborationQueue()]);
      clearCollaborationResume();
      setCollaborationResume(null);
      setCloudCollaboration(EMPTY_CLOUD_COLLABORATION);
      driveTokenRef.current = null;
      const clearedDriveState = saveDriveState(localStorage, {});
      setDriveSettings(clearedDriveState);
      setDriveSession({ status: "disconnected", connected: false, busy: false, message: "", user: null, quota: null, files: [], conflict: null, lastSyncedAt: "" });
      const freshBoard = createBoard({ name: localizedDefaultBoardName(interfaceLocale) });
      initialBoardRef.current = freshBoard;
      boardRef.current = freshBoard;
      viewRef.current = freshBoard.view;
      selectedIdsRef.current = [];
      fileHandleRef.current = null;
      undoRef.current = [];
      redoRef.current = [];
      setBoard(freshBoard);
      setView(freshBoard.view);
      setSelectedIds([]);
      setKeyObjectId(null);
      setVersions([]);
      setDirty(false);
      setSaveState("已建立空白本機 Moodboard");
      await refreshLocalLibrarySummary();
      setShowDeleteLocalData(false);
      announce("這台裝置上的 Moodboard、版本與 Drive 連結資料已清除；雲端檔案未刪除。", "success");
    } catch {
      announce("本機資料無法清除，請關閉其他 Infinite Moodboard 分頁後再試。", "error");
    } finally {
      setIsClearingLocalData(false);
    }
  }, [announce, cancelDriveOperations, interfaceLocale, refreshLocalLibrarySummary]);

  const setCanvasBackgroundMode = useCallback((mode) => {
    setCanvasBackground((current) => changeCanvasBackgroundMode(current, mode));
    announce({ dots: "畫布背景已切換為格點。", lines: "畫布背景已切換為格線。", hidden: "畫布輔助背景已隱藏。" }[mode]);
  }, [announce]);

  const toggleCanvasBackground = useCallback(() => {
    const next = toggleCanvasBackgroundVisibility(canvasBackground);
    setCanvasBackground(next);
    announce(next.mode === "hidden"
      ? "畫布輔助背景已隱藏。"
      : `已重新顯示畫布${next.mode === "lines" ? "格線" : "格點"}。`);
  }, [announce, canvasBackground]);

  const updateInterfaceTypography = useCallback((nextValue) => {
    setInterfaceTypography((current) => normalizeInterfaceTypography(
      typeof nextValue === "function" ? nextValue(current) : nextValue,
    ));
  }, []);

  const resetInterfaceTypography = useCallback(() => {
    setInterfaceTypography({ ...DEFAULT_INTERFACE_TYPOGRAPHY });
    announce("已恢復預設介面字體。", "success");
  }, [announce]);

  const checkForAppUpdates = useCallback(async () => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 8000);
    setUpdateCheck({ status: "checking", manifest: null, checkedAt: null, message: "" });
    try {
      const testVersion = import.meta.env.DEV ? new URLSearchParams(window.location.search).get("updateVersion") : "";
      let manifest;
      if (testVersion) {
        manifest = normalizeUpdateManifest({
          version: testVersion,
          summary: "測試新版：驗證不中斷工作的更新流程。",
          url: window.location.href,
        });
      } else {
        const manifestUrl = new URL(APP_UPDATE_MANIFEST_URL, window.location.href);
        manifestUrl.searchParams.set("checked", String(Date.now()));
        const response = await fetch(manifestUrl, { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error(`更新服務回應 ${response.status}`);
        manifest = normalizeUpdateManifest(await response.json());
      }
      const comparison = compareSemanticVersions(APP_VERSION, manifest.version);
      const next = {
        status: comparison < 0 ? "available" : comparison > 0 ? "preview" : "current",
        manifest,
        checkedAt: new Date().toISOString(),
        message: "",
      };
      setUpdateCheck(next);
      setUpdateNoticeDismissed(next.status === "available" && isAppUpdateSnoozed(localStorage, manifest.version));
      if (next.status !== "available") setUpdateAction({ status: "idle", message: "" });
      return next;
    } catch (error) {
      const message = error?.name === "AbortError"
        ? "連線逾時，請稍後重試。"
        : navigator.onLine === false
          ? "目前沒有網路連線；連線後即可重新檢查。"
          : "無法取得穩定版資訊，請稍後重試。";
      const next = { status: "error", manifest: null, checkedAt: new Date().toISOString(), message };
      setUpdateCheck(next);
      return next;
    } finally {
      window.clearTimeout(timeoutId);
    }
  }, []);

  const confirmInterfaceTheme = useCallback((themeId) => {
    const theme = [...BUILT_IN_THEMES, ...customThemes].find((item) => item.id === themeId);
    if (!theme) return;
    setPreviewTheme(null);
    setActiveThemeId(theme.id);
    setShowInterfaceThemes(false);
    announce(`已套用介面配色「${theme.name}」。`, "success");
  }, [announce, customThemes]);

  const setInterfaceMode = useCallback((mode) => {
    const storageKey = mode === "light" ? LAST_LIGHT_THEME_STORAGE_KEY : LAST_DARK_THEME_STORAGE_KEY;
    const fallbackId = mode === "light" ? "petfashion-editorial" : DEFAULT_INTERFACE_THEME_ID;
    const rememberedId = localStorage.getItem(storageKey);
    const theme = availableThemes.find((item) => item.id === rememberedId && interfaceThemeMode(item) === mode)
      || availableThemes.find((item) => item.id === fallbackId)
      || availableThemes.find((item) => interfaceThemeMode(item) === mode);
    if (!theme) return;
    setPreviewTheme(null);
    setActiveThemeId(theme.id);
    announce(`已切換為${mode === "light" ? "淺色" : "深色"}模式。`, "success");
  }, [announce, availableThemes]);

  const saveCustomInterfaceTheme = useCallback((draft) => {
    const theme = normalizeInterfaceTheme({
      ...draft,
      id: createId("theme"),
      name: draft.name.trim(),
      builtin: false,
      createdAt: new Date().toISOString(),
    });
    setCustomThemes((current) => [...current, theme]);
    setPreviewTheme(null);
    setActiveThemeId(theme.id);
    setShowInterfaceThemes(false);
    announce(`已儲存介面配色「${theme.name}」。`, "success");
  }, [announce]);

  const deleteCustomInterfaceTheme = useCallback((themeId) => {
    const theme = customThemes.find((item) => item.id === themeId);
    if (!theme) return;
    setCustomThemes((current) => current.filter((item) => item.id !== themeId));
    setPreviewTheme(null);
    if (activeThemeId === themeId) setActiveThemeId(DEFAULT_INTERFACE_THEME_ID);
    announce(`已刪除介面配色「${theme.name}」。`, "success");
  }, [activeThemeId, announce, customThemes]);

  const exportInterfaceTheme = useCallback((theme) => {
    const blob = new Blob([serializeInterfaceTheme(theme)], { type: "application/json;charset=utf-8" });
    downloadBlob(blob, `${safeFilename(theme.name)}.moodtheme`);
    announce(`已匯出介面配色「${theme.name}」。`, "success");
  }, [announce]);

  const importInterfaceThemeFile = useCallback(async (file) => {
    try {
      const imported = parseInterfaceThemeFile(await file.text());
      const theme = normalizeInterfaceTheme({
        ...imported,
        id: createId("theme"),
        builtin: false,
        createdAt: new Date().toISOString(),
      });
      setCustomThemes((current) => [...current, theme]);
      setPreviewTheme(theme);
      setShowInterfaceThemes(true);
      announce(`已匯入並預覽「${theme.name}」；按下套用才會儲存為目前配色。`, "success");
    } catch (error) {
      announce(error.message || "介面配色匯入失敗。", "error");
    }
  }, [announce]);

  const closeInterfaceThemes = useCallback(() => {
    setPreviewTheme(null);
    setShowInterfaceThemes(false);
  }, []);

  const openSettings = useCallback(() => {
    setPreviewTheme(null);
    setShowInterfaceThemes(false);
    setSettingsInitialSection("general");
    setShowSettings(true);
  }, []);

  const openAccountSettings = useCallback(() => {
    setPreviewTheme(null);
    setShowInterfaceThemes(false);
    setSettingsInitialSection("account");
    setShowSettings(true);
  }, []);

  const openInterfaceThemes = useCallback(() => {
    setShowSettings(false);
    setPreviewTheme(null);
    setShowInterfaceThemes(true);
  }, []);

  useEffect(() => {
    if (!loadedTextFlow || tool === "select") return;
    setLoadedTextFlow(null);
    announce("已取消放置溢出文字。", "warning");
  }, [announce, loadedTextFlow, tool]);

  const publishBoard = useCallback((nextBoard) => {
    channelRef.current?.postMessage({
      type: "board-update",
      sourceId: sessionIdRef.current,
      board: { ...nextBoard, view: viewRef.current },
      sentAt: new Date().toISOString(),
    });
    cloudCollaborationSessionRef.current?.updateBoard(nextBoard);
  }, []);

  const pushUndo = useCallback((snapshot = boardRef.current) => {
    undoRef.current = [...undoRef.current.slice(-59), { ...snapshot, view: { ...viewRef.current } }];
    redoRef.current = [];
    setHistorySignal((value) => value + 1);
  }, []);

  const captureGestureHistory = useCallback(() => ({
    undo: undoRef.current,
    redo: redoRef.current,
  }), []);

  const restoreGestureHistory = useCallback((snapshot) => {
    if (!snapshot) return;
    undoRef.current = snapshot.undo;
    redoRef.current = snapshot.redo;
    setHistorySignal((value) => value + 1);
  }, []);

  const applyBoard = useCallback((nextOrUpdater, options = {}) => {
    const current = boardRef.current;
    const {
      record = true,
      transient = false,
      broadcast = !transient,
      markDirty = !transient,
    } = options;
    if (record) pushUndo(current);
    const proposed = typeof nextOrUpdater === "function" ? nextOrUpdater(current) : nextOrUpdater;
    const next = transient ? proposed : stampBoard(proposed, sessionIdRef.current);
    boardRef.current = next;
    setBoard(next);
    if (markDirty) setDirty(true);
    if (broadcast) publishBoard(next);
    return next;
  }, [publishBoard, pushUndo]);

  useLayoutEffect(() => {
    if (textFrameGesture || resizeGesture || groupGesture) return;
    const current = boardRef.current;
    const objects = reflowTextThreads(current.objects);
    if (objects === current.objects) return;
    applyBoard({ ...current, objects }, { record: false });
  }, [applyBoard, board.objects, groupGesture, resizeGesture, textFrameGesture]);

  const previewBoard = useCallback((next) => {
    boardRef.current = next;
    setBoard(next);
  }, []);

  const finalizeGesture = useCallback(() => {
    applyBoard(boardRef.current, { record: false });
  }, [applyBoard]);

  const setSessionName = (value) => {
    setSessionNameState(value);
    localStorage.setItem("moodboard-session-name", value);
    channelRef.current?.postMessage({ type: "presence", sourceId: sessionIdRef.current, name: value, sentAt: Date.now() });
    cloudCollaborationSessionRef.current?.setDisplayName(value);
  };

  useEffect(() => {
    let cancelled = false;
    loadCurrentBoard()
      .then((saved) => {
        if (cancelled) return;
        if (saved) {
          const normalized = ensureBoard(saved);
          boardRef.current = normalized;
          setBoard(normalized);
          setView(normalized.view || { x: 0, y: 0, zoom: 1 });
          setSaveState("已從本機恢復");
        } else {
          setSaveState("本機自動儲存");
        }
      })
      .catch(() => setSaveState("自動儲存不可用"))
      .finally(() => {
        if (cancelled) return;
        setHydrated(true);
        refreshLocalLibrarySummary();
      });
    return () => { cancelled = true; };
  }, [refreshLocalLibrarySummary]);

  useEffect(() => {
    const markInteraction = () => { startupUserInteractedRef.current = true; };
    window.addEventListener("pointerdown", markInteraction, true);
    window.addEventListener("keydown", markInteraction, true);
    return () => {
      window.removeEventListener("pointerdown", markInteraction, true);
      window.removeEventListener("keydown", markInteraction, true);
    };
  }, []);

  useEffect(() => {
    if (!hydrated || !online) return undefined;
    const timer = window.setTimeout(() => { checkForAppUpdates(); }, 900);
    return () => window.clearTimeout(timer);
  }, [checkForAppUpdates, hydrated, online]);

  useEffect(() => {
    if (!hydrated) return undefined;
    window.clearTimeout(saveTimerRef.current);
    setSaveState("儲存中…");
    const snapshot = { ...board, view };
    saveTimerRef.current = window.setTimeout(() => {
      persistBoardLocally(snapshot)
        .then(async () => {
          const link = driveSettings.links[snapshot.id];
          if (driveSettings.enabled && driveSettings.autoSync && link) {
            await enqueueSync(snapshot, { fileId: link.fileId, expectedVersion: link.version });
          }
          await refreshLocalLibrarySummary();
          setSaveState(`本機已儲存 ${new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}`);
        })
        .catch((error) => {
          if (error?.name !== "AbortError") setSaveState("自動儲存失敗");
        });
    }, 550);
    return () => window.clearTimeout(saveTimerRef.current);
  }, [board, driveSettings.autoSync, driveSettings.enabled, driveSettings.links, hydrated, persistBoardLocally, refreshLocalLibrarySummary, view]);

  useEffect(() => {
    if (!authReady || !hydrated || !("BroadcastChannel" in window)) return undefined;
    const channel = new BroadcastChannel(`moodboard-lab:${board.id}`);
    channelRef.current = channel;

    const refreshPeers = () => {
      const cutoff = Date.now() - 30_000;
      for (const [id, peer] of peersRef.current) if (peer.seenAt < cutoff) peersRef.current.delete(id);
      setPeers([...peersRef.current.values()]);
    };
    const sendPresence = (type = "presence") => channel.postMessage({ type, sourceId: sessionIdRef.current, name: sessionName, sentAt: Date.now() });
    channel.onmessage = (event) => {
      const message = event.data;
      if (!message || message.sourceId === sessionIdRef.current) return;
      if (["hello", "presence"].includes(message.type)) {
        peersRef.current.set(message.sourceId, { id: message.sourceId, name: message.name || "協作者", seenAt: Date.now() });
        refreshPeers();
        if (message.type === "hello") sendPresence();
      }
      if (message.type === "bye") {
        peersRef.current.delete(message.sourceId);
        refreshPeers();
      }
      if (message.type === "board-update" && message.board) {
        try {
          const incoming = ensureBoard(message.board);
          const current = boardRef.current;
          const isNewer = incoming.revision > current.revision || (incoming.revision === current.revision && incoming.updatedAt > current.updatedAt);
          if (isNewer) {
            incoming.view = current.view;
            boardRef.current = incoming;
            setBoard(incoming);
            if (message.origin !== "cloud") cloudCollaborationSessionRef.current?.updateBoard(incoming);
            announce(`${message.name || "另一個分頁"}同步了畫布`, "success");
          }
        } catch {
          announce("收到無法辨識的協作更新，已保留目前畫布。", "warning");
        }
      }
    };
    sendPresence("hello");
    const heartbeat = window.setInterval(() => { sendPresence(); refreshPeers(); }, 10_000);
    return () => {
      sendPresence("bye");
      window.clearInterval(heartbeat);
      channel.close();
      if (channelRef.current === channel) channelRef.current = null;
      peersRef.current.clear();
      setPeers([]);
    };
  }, [announce, authReady, board.id, hydrated, sessionName]);

  const screenToWorld = useCallback((clientX, clientY) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    const currentView = viewRef.current;
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left - currentView.x) / currentView.zoom,
      y: (clientY - rect.top - currentView.y) / currentView.zoom,
    };
  }, []);

  const deleteGuide = useCallback((guideId) => {
    if (!boardRef.current.guides.some((guide) => guide.id === guideId)) return;
    applyBoard((current) => ({ ...current, guides: current.guides.filter((guide) => guide.id !== guideId) }));
    setGuideDrag(null);
    announce("已刪除輔助導引線", "warning");
  }, [announce, applyBoard]);

  const startGuideDrag = useCallback((event, axis, guideId = null) => {
    if (event.button !== 0) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    event.preventDefault();
    event.stopPropagation();
    const existing = boardRef.current.guides.find((guide) => guide.id === guideId);
    const id = existing?.id || createId("guide");
    const guideAxis = existing?.axis || axis;
    let latest = existing || { id, axis: guideAxis, position: 0, isNew: true };
    let releaseGesture = () => {};
    setGuidesVisible(true);

    const update = (pointerEvent) => {
      const currentView = viewRef.current;
      const localPosition = guideAxis === "x"
        ? pointerEvent.clientX - rect.left
        : pointerEvent.clientY - rect.top;
      const viewOffset = guideAxis === "x" ? currentView.x : currentView.y;
      let position = (localPosition - viewOffset) / currentView.zoom;
      if (pointerEvent.shiftKey) position = snapGuidePosition(position, rulerUnit);
      latest = { id, axis: guideAxis, position, isNew: !existing };
      setGuideDrag(latest);
    };

    const cleanup = () => {
      window.removeEventListener("pointermove", update);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", cancel);
      releaseGesture();
    };
    const finish = (pointerEvent) => {
      update(pointerEvent);
      cleanup();
      setGuideDrag(null);
      const inside = pointerEvent.clientX >= rect.left
        && pointerEvent.clientX <= rect.right
        && pointerEvent.clientY >= rect.top
        && pointerEvent.clientY <= rect.bottom;
      const droppedOnOriginRuler = rulersVisible && (
        (guideAxis === "x" && pointerEvent.clientX - rect.left <= RULER_SIZE)
        || (guideAxis === "y" && pointerEvent.clientY - rect.top <= RULER_SIZE)
      );
      if (!inside) return;
      if (droppedOnOriginRuler) {
        if (existing) deleteGuide(id);
        return;
      }
      applyBoard((current) => ({
        ...current,
        guides: existing
          ? current.guides.map((guide) => guide.id === id ? { id, axis: guideAxis, position: latest.position } : guide)
          : [...current.guides, { id, axis: guideAxis, position: latest.position }],
      }));
      announce(`${existing ? "已移動" : "已建立"}${guideAxis === "x" ? "垂直" : "水平"}導引線：${formatGuideValue(latest.position, rulerUnit)}`, "success");
    };
    const cancel = () => {
      cleanup();
      setGuideDrag(null);
    };
    update(event);
    releaseGesture = registerPointerGesture({
      label: existing ? "移動導引線" : "建立導引線",
      affectsDocument: false,
      hasChanges: () => true,
      pause: cleanup,
      cancel,
      keep: finish,
    });
    window.addEventListener("pointermove", update);
    window.addEventListener("pointerup", finish, { once: true });
    window.addEventListener("pointercancel", cancel, { once: true });
  }, [announce, applyBoard, deleteGuide, registerPointerGesture, rulerUnit, rulersVisible]);

  const selectObject = useCallback((id, additive = false, penetrate = false) => {
    if (loadedTextFlow) {
      setLoadedTextFlow(null);
      announce("已取消放置溢出文字。", "warning");
    }
    setTool((current) => current === "3d" ? current : "select");
    const current = selectedIdsRef.current;
    const targetIds = selectionIdsForObject(boardRef.current, id, { penetrate });
    if (!targetIds.length) return;
    if (!penetrate && !additive && targetIds.length === 1 && current.length > 1 && current.includes(id)) {
      setKeyObjectId(id);
      announce(`已將「${boardRef.current.objects.find((object) => object.id === id)?.layerName || "物件"}」設為對齊基準`, "success");
      return;
    }
    const next = additive
      ? (targetIds.every((targetId) => current.includes(targetId))
        ? current.filter((item) => !targetIds.includes(item))
        : [...new Set([...current, ...targetIds])])
      : targetIds;
    selectedIdsRef.current = next;
    setSelectedIds(next);
    if (!additive || !current.length) setKeyObjectId(next[0] || null);
  }, [announce, loadedTextFlow]);

  const addMediaFiles = useCallback(async (fileList, point) => {
    const files = [...fileList].filter((file) => file.type.startsWith("image/") || file.type.startsWith("video/") || isSvgFile(file));
    if (!files.length) {
      announce("沒有找到可加入的圖片、影片或 SVG。", "warning");
      return;
    }
    try {
      const objects = await Promise.all(files.map((file, index) => mediaFileToObject(file, point, index)));
      const next = applyBoard((current) => ({ ...current, objects: [...current.objects, ...objects] }));
      const nextSelection = objects.map((object) => object.id);
      selectedIdsRef.current = nextSelection;
      setSelectedIds(nextSelection);
      setKeyObjectId(nextSelection[0] || null);
      setTool("select");
      await saveVersion({ ...next, view: viewRef.current }, translateInterfaceText(`匯入 ${objects.length} 個素材`), "automatic");
      announce(`已加入 ${objects.length} 個素材`, "success");
    } catch (error) {
      announce(error.message || "素材加入失敗。", "error");
    }
  }, [announce, applyBoard]);

  const canvasCenterWorld = useCallback(() => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return screenToWorld(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }, [screenToWorld]);

  const addGeneratedObject = useCallback((object, message) => {
    applyBoard((current) => ({ ...current, objects: [...current.objects, object] }));
    selectedIdsRef.current = [object.id];
    setSelectedIds([object.id]);
    setKeyObjectId(object.id);
    setTool("select");
    setShapeMenuOpen(false);
    announce(message, "success");
  }, [announce, applyBoard]);

  const addTextObject = useCallback(() => {
    const object = createTextObject(canvasCenterWorld());
    addGeneratedObject(object, "已加入文字物件，可直接輸入文字");
    textEditUndoRef.current = false;
    setEditingText({ id: object.id, selectAll: true });
  }, [addGeneratedObject, canvasCenterWorld]);

  const addShapeObject = useCallback((kind) => {
    const object = createShapeObject(kind, canvasCenterWorld());
    addGeneratedObject(object, `已加入${object.name}`);
  }, [addGeneratedObject, canvasCenterWorld]);

  const onMediaInput = (event) => {
    addMediaFiles(event.target.files || [], canvasCenterWorld());
    event.target.value = "";
    setShapeMenuOpen(false);
  };

  const onSvgInput = (event) => {
    addMediaFiles(event.target.files || [], canvasCenterWorld());
    event.target.value = "";
    setShapeMenuOpen(false);
  };

  const importBoardFile = useCallback(async (file, handle = null, { shouldCommit = () => true } = {}) => {
    try {
      const parsed = JSON.parse(await file.text());
      const imported = ensureBoard(parsed);
      if (!shouldCommit()) return null;
      pushUndo(boardRef.current);
      boardRef.current = imported;
      setBoard(imported);
      setView(imported.view || { x: 0, y: 0, zoom: 1 });
      setSelectedIds([]);
      setFilters(DEFAULT_FILTERS);
      setSelectedCaptureId(null);
      fileHandleRef.current = handle;
      setDirty(false);
      publishBoard(imported);
      announce(`已開啟「${imported.name}」`, "success");
      return imported;
    } catch (error) {
      announce(error.message || "Infinite Moodboard 檔案無法開啟。", "error");
      return null;
    }
  }, [announce, publishBoard, pushUndo]);

  const openBoardFile = useCallback(async () => {
    if (window.showOpenFilePicker) {
      try {
        const [handle] = await window.showOpenFilePicker({
          types: [{ description: "Infinite Moodboard 檔案", accept: { "application/json": [".moodboard", ".json"] } }],
          multiple: false,
        });
        await importBoardFile(await handle.getFile(), handle);
      } catch (error) {
        if (error.name !== "AbortError") announce("無法開啟檔案。", "error");
      }
    } else {
      boardInputRef.current?.click();
    }
  }, [announce, importBoardFile]);

  const boardSnapshot = useCallback(() => ({ ...boardRef.current, view: viewRef.current }), []);

  const setAppAutoUpdate = useCallback((enabled) => {
    const next = saveUpdatePreference(localStorage, enabled ? "auto" : "manual");
    setUpdatePreference(next);
    if (enabled) {
      const availableVersion = updateCheck.status === "available" ? updateCheck.manifest?.version : "";
      autoUpdateDeferredVersionRef.current = availableVersion || "";
      setUpdateNoticeDismissed(true);
      setUpdateAction({ status: "scheduled", message: "已開啟安全自動更新；目前工作不中斷，下次安全開啟時套用。" });
      announce("已開啟安全自動更新；不會在編輯途中重新載入。", "success");
    } else {
      autoUpdateDeferredVersionRef.current = "";
      setUpdateNoticeDismissed(false);
      setUpdateAction({ status: "idle", message: "" });
      announce("已關閉自動更新；仍可在更新通知中選擇立即更新。", "success");
    }
  }, [announce, updateCheck.manifest?.version, updateCheck.status]);

  const snoozeCurrentAppUpdate = useCallback(() => {
    const version = updateCheck.status === "available" ? updateCheck.manifest?.version : "";
    if (!version) return;
    snoozeAppUpdate(localStorage, version);
    setUpdateNoticeDismissed(true);
    setUpdateAction({ status: "idle", message: "" });
    announce("已稍後處理更新；24 小時內不會再次提示。", "success");
  }, [announce, updateCheck.manifest?.version, updateCheck.status]);

  const applyAppUpdate = useCallback(({ automatic = false } = {}) => {
    if (updateApplyPromiseRef.current) return updateApplyPromiseRef.current;
    const manifest = updateCheck.status === "available" ? updateCheck.manifest : null;
    if (!manifest) return Promise.resolve(false);

    const task = (async () => {
      setUpdateNoticeDismissed(false);
      setUpdateAction({ status: "saving", message: automatic ? "正在安全保存並準備自動更新…" : "正在保存目前工作並建立更新前備份…" });
      window.clearTimeout(saveTimerRef.current);
      const snapshot = boardSnapshot();
      if (import.meta.env.DEV && new URLSearchParams(window.location.search).get("updateFailure") === "save") {
        throw new Error("測試：無法完成本機儲存");
      }
      await persistBoardLocally(snapshot);
      await saveVersion(snapshot, translateInterfaceText("更新前自動備份"), "automatic");
      setSaveState(`本機已儲存 ${new Date().toLocaleTimeString(interfaceLocaleToIntl(interfaceLocale), { hour: "2-digit", minute: "2-digit" })}`);
      setUpdateAction({ status: "reloading", message: `備份完成，正在載入 v${manifest.version}…` });
      writeSessionValue(APP_UPDATE_ATTEMPT_STORAGE_KEY, manifest.version);
      window.location.assign(buildUpdateReloadUrl(window.location.href, manifest.version));
      return true;
    })().catch((error) => {
      const message = error?.message
        ? `更新已停止：${error.message}。目前畫面與工作內容保持不變。`
        : "更新已停止；無法完成本機儲存或備份，目前畫面與工作內容保持不變。";
      setUpdateAction({ status: "error", message });
      return false;
    }).finally(() => {
      updateApplyPromiseRef.current = null;
    });
    updateApplyPromiseRef.current = task;
    return task;
  }, [boardSnapshot, interfaceLocale, persistBoardLocally, updateCheck.manifest, updateCheck.status]);

  useEffect(() => {
    const version = updateCheck.status === "available" ? updateCheck.manifest?.version : "";
    if (!hydrated || !version || updatePreference !== "auto" || updateNoticeDismissed) return;
    if (startupUserInteractedRef.current) return;
    if (autoUpdateDeferredVersionRef.current === version) return;
    if (readSessionValue(APP_UPDATE_ATTEMPT_STORAGE_KEY) === version) return;
    applyAppUpdate({ automatic: true });
  }, [applyAppUpdate, hydrated, updateCheck.manifest?.version, updateCheck.status, updateNoticeDismissed, updatePreference]);

  const stopCloudCollaboration = useCallback(async ({ forget = false } = {}) => {
    const session = cloudCollaborationSessionRef.current;
    cloudCollaborationSessionRef.current = null;
    if (session) await session.destroy().catch(() => undefined);
    setCloudCollaboration(EMPTY_CLOUD_COLLABORATION);
    if (forget) {
      clearCollaborationResume();
      setCollaborationResume(null);
    }
  }, []);

  const applyCloudCollaborationBoard = useCallback((incomingBoard) => {
    try {
      const incoming = ensureBoard(incomingBoard);
      incoming.view = viewRef.current;
      boardRef.current = incoming;
      setBoard(incoming);
      selectedIdsRef.current = [];
      setSelectedIds([]);
      setKeyObjectId(null);
      setDirty(true);
      setSaveState("即時共編已同步");
      channelRef.current?.postMessage({
        type: "board-update",
        origin: "cloud",
        sourceId: sessionIdRef.current,
        name: sessionName,
        board: incoming,
        sentAt: new Date().toISOString(),
      });
    } catch {
      setCloudCollaboration((current) => ({ ...current, status: "degraded", message: "收到無法辨識的共編資料；目前畫布已保留。" }));
    }
  }, [sessionName]);

  const scrubCollaborationInviteFromUrl = useCallback(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("collab")) return;
    url.searchParams.delete("collab");
    window.history.replaceState({}, "", url);
  }, []);

  const collaborationSessionOptions = useCallback(() => ({
    board: boardSnapshot(),
    user: authSession.user,
    clientId: sessionIdRef.current,
    displayName: sessionName,
    onBoard: applyCloudCollaborationBoard,
    onState: (nextState) => setCloudCollaboration((current) => ({ ...current, ...nextState })),
  }), [applyCloudCollaborationBoard, authSession.user, boardSnapshot, sessionName]);

  const startCloudCollaboration = useCallback(async () => {
    if (!authReady) {
      requestAdvancedFeature("collaboration");
      return;
    }
    await stopCloudCollaboration({ forget: false });
    setCloudCollaboration({ ...EMPTY_CLOUD_COLLABORATION, status: "creating", message: "正在建立安全的共編空間…" });
    try {
      await saveVersion(boardSnapshot(), translateInterfaceText("開始即時共編前"), "automatic");
      const session = await createMoodboardCollaborationRoom(collaborationSessionOptions());
      cloudCollaborationSessionRef.current = session;
      const resume = saveCollaborationResume(localStorage, {
        roomId: session.roomId,
        boardId: boardRef.current.id,
        inviteId: session.inviteId,
      });
      setCollaborationResume(resume);
      initialCollaborationInviteRef.current = "";
      scrubCollaborationInviteFromUrl();
      announce("共編空間已建立；可複製邀請連結給協作者。", "success");
    } catch (error) {
      const message = collaborationErrorMessage(error);
      setCloudCollaboration({ ...EMPTY_CLOUD_COLLABORATION, status: "error", message });
      announce(message, "error");
    }
  }, [announce, authReady, boardSnapshot, collaborationSessionOptions, requestAdvancedFeature, scrubCollaborationInviteFromUrl, stopCloudCollaboration]);

  const joinCloudCollaboration = useCallback(async (inviteValue) => {
    if (!authReady) {
      initialCollaborationInviteRef.current = normalizeCollaborationInvite(inviteValue);
      requestAdvancedFeature("collaboration");
      return;
    }
    const inviteId = normalizeCollaborationInvite(inviteValue);
    if (!inviteId) {
      setCloudCollaboration({ ...EMPTY_CLOUD_COLLABORATION, status: "error", message: "請貼上有效的共編邀請連結或代碼。" });
      return;
    }
    await stopCloudCollaboration({ forget: false });
    setCloudCollaboration({ ...EMPTY_CLOUD_COLLABORATION, status: "joining", message: "正在確認邀請與成員權限…" });
    try {
      await saveVersion(boardSnapshot(), translateInterfaceText("加入即時共編前"), "automatic");
      const session = await joinMoodboardCollaborationInvite({ ...collaborationSessionOptions(), inviteId });
      cloudCollaborationSessionRef.current = session;
      const resume = saveCollaborationResume(localStorage, {
        roomId: session.roomId,
        boardId: boardRef.current.id,
        inviteId: session.inviteId,
      });
      setCollaborationResume(resume);
      initialCollaborationInviteRef.current = "";
      scrubCollaborationInviteFromUrl();
      announce("已加入即時共編空間。", "success");
    } catch (error) {
      const message = collaborationErrorMessage(error);
      setCloudCollaboration({ ...EMPTY_CLOUD_COLLABORATION, status: "error", message });
      announce(message, "error");
    }
  }, [announce, authReady, boardSnapshot, collaborationSessionOptions, requestAdvancedFeature, scrubCollaborationInviteFromUrl, stopCloudCollaboration]);

  const resumeCloudCollaboration = useCallback(async () => {
    if (!authReady || !collaborationResume?.roomId) return;
    await stopCloudCollaboration({ forget: false });
    setCloudCollaboration({ ...EMPTY_CLOUD_COLLABORATION, status: "connecting", message: "正在續接上次的共編空間…" });
    try {
      await saveVersion(boardSnapshot(), translateInterfaceText("續接即時共編前"), "automatic");
      const session = await resumeMoodboardCollaborationRoom({
        ...collaborationSessionOptions(),
        roomId: collaborationResume.roomId,
        inviteId: collaborationResume.inviteId,
      });
      cloudCollaborationSessionRef.current = session;
      announce("已續接上次的即時共編空間。", "success");
    } catch (error) {
      const message = collaborationErrorMessage(error);
      setCloudCollaboration({ ...EMPTY_CLOUD_COLLABORATION, status: "error", message });
      announce(message, "error");
    }
  }, [announce, authReady, boardSnapshot, collaborationResume, collaborationSessionOptions, stopCloudCollaboration]);

  const copyCloudCollaborationInvite = useCallback(async () => {
    if (!cloudCollaboration.inviteUrl) return;
    try {
      await navigator.clipboard.writeText(cloudCollaboration.inviteUrl);
      announce("共編邀請連結已複製。", "success");
    } catch {
      announce("無法自動複製；請從網址列手動複製邀請連結。", "warning");
    }
  }, [announce, cloudCollaboration.inviteUrl]);

  const leaveCloudCollaboration = useCallback(async () => {
    await stopCloudCollaboration({ forget: true });
    announce("已離開共編；目前畫布仍保存在這台裝置。", "success");
  }, [announce, stopCloudCollaboration]);

  useEffect(() => {
    if (authReady || !cloudCollaborationSessionRef.current) return;
    const session = cloudCollaborationSessionRef.current;
    cloudCollaborationSessionRef.current = null;
    session.destroy().catch(() => undefined);
    setCloudCollaboration(EMPTY_CLOUD_COLLABORATION);
  }, [authReady]);

  useEffect(() => () => {
    const session = cloudCollaborationSessionRef.current;
    cloudCollaborationSessionRef.current = null;
    session?.destroy().catch(() => undefined);
  }, []);

  useEffect(() => {
    const inviteId = initialCollaborationInviteRef.current;
    if (!hydrated || !inviteId) return;
    if (authReady) setShowCollaboration(true);
    else if (authSession.status !== "loading") requestAdvancedFeature("collaboration");
  }, [authReady, authSession.status, hydrated, requestAdvancedFeature]);

  const activateLocalMoodboard = useCallback(async (nextBoard, message) => {
    const current = boardSnapshot();
    try {
      await stopCloudCollaboration({ forget: false });
      await persistBoardLocally(current);
      if (dirty || current.objects.length) {
        await saveVersion(current, translateInterfaceText("切換 Moodboard 前"), "automatic");
      }
      cancelDriveOperations();
      const next = ensureBoard(nextBoard);
      initialBoardRef.current = next;
      boardRef.current = next;
      viewRef.current = next.view || { x: 0, y: 0, zoom: 1 };
      selectedIdsRef.current = [];
      fileHandleRef.current = null;
      undoRef.current = [];
      redoRef.current = [];
      setBoard(next);
      setView(viewRef.current);
      setSelectedIds([]);
      setKeyObjectId(null);
      setVersions(await listVersions(next.id));
      setDriveVersions({ status: "idle", items: [], fileId: "", headRevisionId: "", message: "" });
      setDirty(false);
      setSaveState("已從本機資料庫開啟");
      await persistBoardLocally(next);
      await refreshLocalLibrarySummary();
      setShowDriveLibrary(false);
      announce(message || `已開啟「${next.name}」。`, "success");
      return next;
    } catch (error) {
      announce(error?.message || "無法切換 Moodboard；目前畫布未受影響。", "error");
      return null;
    }
  }, [announce, boardSnapshot, cancelDriveOperations, dirty, persistBoardLocally, refreshLocalLibrarySummary, stopCloudCollaboration]);

  const openLocalMoodboard = useCallback((record) => {
    if (!record?.board) {
      announce("找不到這份本機 Moodboard 的內容。", "error");
      return;
    }
    if (record.id === boardRef.current.id) {
      setShowDriveLibrary(false);
      return;
    }
    activateLocalMoodboard(record.board);
  }, [activateLocalMoodboard, announce]);

  const createLocalMoodboard = useCallback(() => {
    const next = createBoard({ name: localizedDefaultBoardName(interfaceLocale) });
    activateLocalMoodboard(next, "已建立新的本機 Moodboard；原本的 Moodboard 已安全保留。");
  }, [activateLocalMoodboard, interfaceLocale]);

  const currentDriveContentBytes = useMemo(
    () => contentByteLength(serializeMoodboardSnapshot(board)),
    [board],
  );
  const currentDriveLink = driveSettings.links[board.id] || null;

  const saveBoardToGoogleDrive = useCallback(({ asCopy = false, silent = false } = {}) => {
    if (!authReady) {
      if (!silent) requestAdvancedFeature("drive");
      return Promise.resolve(false);
    }
    if (driveSavePromiseRef.current) {
      if (!silent) announce("Google Drive 正在同步目前版本。", "info");
      return driveSavePromiseRef.current;
    }
    const accessToken = currentDriveAccessToken();
    if (!accessToken) {
      setDriveSession((current) => ({ ...current, status: "authorization-required", connected: false, busy: false, message: "請重新連結 Google Drive；本機變更仍安全保留。" }));
      if (!silent) setShowDriveLibrary(true);
      return Promise.resolve(false);
    }

    const snapshot = boardSnapshot();
    const content = serializeMoodboardSnapshot(snapshot);
    const uploadBytes = contentByteLength(content);
    const timestamp = new Intl.DateTimeFormat("sv-SE", { dateStyle: "short", timeStyle: "short" })
      .format(new Date())
      .replaceAll(":", "-")
      .replace(" ", "-");
    const filename = asCopy
      ? `${safeFilename(snapshot.name, "moodboard")}-${translateInterfaceText("複本")}-${timestamp}.moodboard`
      : `${safeFilename(snapshot.name, "moodboard")}.moodboard`;
    const linkedFile = !asCopy ? driveSettings.links[snapshot.id] : null;
    const operationEpoch = driveOperationEpochRef.current;
    const controller = new AbortController();
    driveSaveControllerRef.current = controller;

    let operation;
    operation = (async () => {
      const assertCurrentOperation = () => {
        if (operationEpoch !== driveOperationEpochRef.current || controller.signal.aborted) {
          const error = new Error("Google Drive 操作已取消。");
          error.name = "AbortError";
          throw error;
        }
      };
      setDriveSession((current) => ({ ...current, status: "checking", connected: true, busy: true, message: "正在先保存本機版本，再確認 Drive 空間與遠端版本…", conflict: null }));
      try {
        try {
          await persistBoardLocally(snapshot);
          setSaveState(`本機已儲存 ${new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}`);
        } catch (error) {
          if (error?.name === "AbortError") throw error;
          throw new DriveApiError("本機安全副本寫入失敗，因此未開始雲端同步。", { code: "drive/local-save", details: error });
        }
        const queuedJob = await getSyncJob(snapshot.id);
        if (queuedJob) {
          await updateSyncJob(snapshot.id, {
            state: "syncing",
            attemptCount: Number(queuedJob.attemptCount || 0) + 1,
            lastError: "",
          });
        }
        assertCurrentOperation();
        const about = await getGoogleDriveAbout(accessToken);
        assertCurrentOperation();
        const quotaAssessment = evaluateDriveQuota(about.quota, uploadBytes);
        if (!quotaAssessment.allowed) {
          throw new DriveApiError("Google Drive 空間不足；畫布仍安全保存在這台裝置。", { code: "drive/quota", reason: "storageQuotaExceeded" });
        }
        const folderId = await ensureGoogleDriveFolder(accessToken, driveSettings.folderId);
        assertCurrentOperation();
        setDriveSession((current) => ({ ...current, status: "syncing", connected: true, busy: true, quota: about.quota, user: about.user, message: "正在上傳最新的 `.moodboard` 工作檔…" }));
        const savedFile = await uploadGoogleDriveMoodboard(accessToken, {
          board: snapshot,
          content,
          filename,
          folderId,
          existingFile: linkedFile ? { id: linkedFile.fileId } : null,
          expectedVersion: linkedFile?.version || "",
          signal: controller.signal,
        });
        assertCurrentOperation();
        updateDriveSettings((current) => linkDriveFile({ ...current, enabled: true, folderId }, snapshot, savedFile));
        const [postAbout, files] = await Promise.all([
          getGoogleDriveAbout(accessToken).catch(() => about),
          listGoogleDriveMoodboards(accessToken, folderId).catch(() => null),
        ]);
        assertCurrentOperation();
        setDriveSession((current) => ({
          ...current,
          status: "synced",
          connected: true,
          busy: false,
          message: `已同步 ${formatTime(savedFile.modifiedTime || new Date().toISOString())}`,
          quota: postAbout.quota,
          user: postAbout.user,
          files: files || current.files,
          conflict: null,
          lastSyncedAt: new Date().toISOString(),
        }));
        await removeSyncJob(snapshot.id);
        await refreshLocalLibrarySummary();
        if (boardRef.current.revision === snapshot.revision && boardRef.current.updatedAt === snapshot.updatedAt) setDirty(false);
        if (!silent) announce(asCopy ? "已另存 Google Drive 複本。" : "Google Drive 已同步。", "success");
        return true;
      } catch (error) {
        if (operationEpoch !== driveOperationEpochRef.current || error?.name === "AbortError") return false;
        const isConflict = error?.code === "drive/conflict";
        const authorizationRequired = isGoogleDriveAuthorizationError(error);
        const status = isConflict
          ? "conflict"
          : error?.code === "drive/quota"
            ? "quota"
            : error?.code === "drive/offline"
              ? "offline"
              : authorizationRequired
                ? "authorization-required"
                : "error";
        if (authorizationRequired) driveTokenRef.current = null;
        if (linkedFile && driveSettings.autoSync) {
          await enqueueSync(snapshot, { fileId: linkedFile.fileId, expectedVersion: linkedFile.version });
          await updateSyncJob(snapshot.id, {
            state: status,
            lastError: driveErrorMessage(error),
            nextAttemptAt: new Date(Date.now() + (status === "offline" ? 15_000 : 60_000)).toISOString(),
          });
          await refreshLocalLibrarySummary();
        }
        setDriveSession((current) => ({
          ...current,
          status,
          connected: status !== "authorization-required",
          busy: false,
          message: driveErrorMessage(error),
          conflict: isConflict ? error.remoteFile : null,
        }));
        if (!silent || isConflict) {
          setShowDriveLibrary(true);
          announce(driveErrorMessage(error), status === "offline" ? "warning" : "error");
        }
        return false;
      } finally {
        if (driveSavePromiseRef.current === operation) {
          driveSavePromiseRef.current = null;
          driveSaveControllerRef.current = null;
        }
      }
    })();
    driveSavePromiseRef.current = operation;
    return operation;
  }, [announce, authReady, boardSnapshot, currentDriveAccessToken, driveSettings.autoSync, driveSettings.folderId, driveSettings.links, persistBoardLocally, refreshLocalLibrarySummary, requestAdvancedFeature, updateDriveSettings]);

  const openGoogleDriveFile = useCallback(async (file) => {
    const operationEpoch = driveOperationEpochRef.current;
    const accessToken = currentDriveAccessToken();
    if (!accessToken) {
      setDriveSession((current) => ({ ...current, status: "authorization-required", connected: false, busy: false, message: "請重新連結 Google Drive 後再開啟檔案。" }));
      return;
    }
    setDriveSession((current) => ({ ...current, status: "checking", connected: true, busy: true, message: `正在開啟「${file.name}」…` }));
    try {
      const current = boardSnapshot();
      if (dirty || current.objects.length) await saveVersion(current, translateInterfaceText("切換 Drive 檔案前"), "automatic");
      let metadata = await getGoogleDriveFile(accessToken, file.id);
      if (operationEpoch !== driveOperationEpochRef.current) return;
      const content = await downloadGoogleDriveMoodboard(accessToken, file.id, { revisionId: metadata.headRevisionId });
      if (!metadata.headRevisionId) {
        const verified = await getGoogleDriveFile(accessToken, file.id);
        if (verified.version !== metadata.version) throw new DriveConflictError(verified);
        metadata = verified;
      }
      if (operationEpoch !== driveOperationEpochRef.current) return;
      const imported = await importBoardFile(
        new File([content], metadata.name, { type: "application/json" }),
        null,
        { shouldCommit: () => operationEpoch === driveOperationEpochRef.current },
      );
      if (!imported) throw new DriveApiError("Google Drive 檔案內容無法辨識。", { code: "drive/invalid-file" });
      if (operationEpoch !== driveOperationEpochRef.current) return;
      updateDriveSettings((state) => linkDriveFile(state, imported, metadata));
      setDriveSession((session) => ({
        ...session,
        status: "synced",
        connected: true,
        busy: false,
        message: `已開啟 ${metadata.name}`,
        conflict: null,
        files: session.files.map((entry) => entry.id === metadata.id ? metadata : entry),
        lastSyncedAt: new Date().toISOString(),
      }));
      setShowDriveLibrary(false);
      announce(`已從 Google Drive 開啟「${imported.name}」；切換前版本已保留。`, "success");
    } catch (error) {
      if (operationEpoch !== driveOperationEpochRef.current || error?.name === "AbortError") return;
      const isConflict = error?.code === "drive/conflict";
      const authorizationRequired = isGoogleDriveAuthorizationError(error);
      if (authorizationRequired) driveTokenRef.current = null;
      setDriveSession((current) => ({
        ...current,
        status: isConflict ? "conflict" : authorizationRequired ? "authorization-required" : "error",
        connected: !authorizationRequired,
        busy: false,
        message: driveErrorMessage(error),
        conflict: isConflict ? error.remoteFile : current.conflict,
      }));
      announce(driveErrorMessage(error), "error");
    }
  }, [announce, boardSnapshot, currentDriveAccessToken, dirty, importBoardFile, updateDriveSettings]);

  const refreshDriveVersions = useCallback(async () => {
    const boardId = boardRef.current.id;
    const link = driveSettings.links[boardId];
    if (!link?.fileId) {
      setDriveVersions({ status: "idle", items: [], fileId: "", headRevisionId: "", message: "" });
      return [];
    }
    const accessToken = currentDriveAccessToken();
    if (!accessToken) {
      setDriveVersions({ status: "authorization-required", items: [], fileId: link.fileId, headRevisionId: link.headRevisionId || "", message: "請重新連結 Google Drive 後再讀取版本。" });
      return [];
    }
    setDriveVersions((current) => ({ ...current, status: "loading", fileId: link.fileId, message: "" }));
    try {
      const metadata = await getGoogleDriveFile(accessToken, link.fileId);
      if (metadata.capabilities?.canReadRevisions === false) {
        throw new DriveApiError("目前帳號沒有讀取這份檔案版本紀錄的權限。", { code: "drive/permission", status: 403 });
      }
      const items = await listGoogleDriveRevisions(accessToken, link.fileId);
      setDriveVersions({ status: "ready", items, fileId: link.fileId, headRevisionId: metadata.headRevisionId, message: "" });
      return items;
    } catch (error) {
      const authorizationRequired = isGoogleDriveAuthorizationError(error);
      if (authorizationRequired) driveTokenRef.current = null;
      setDriveVersions({
        status: authorizationRequired ? "authorization-required" : "error",
        items: [],
        fileId: link.fileId,
        headRevisionId: link.headRevisionId || "",
        message: driveErrorMessage(error),
      });
      return [];
    }
  }, [currentDriveAccessToken, driveSettings.links]);

  const recoverGoogleDriveVersionAsCopy = useCallback(async (file, revision = null) => {
    if (!file?.id) {
      announce("找不到要復原的 Google Drive 檔案。", "error");
      return null;
    }
    const accessToken = currentDriveAccessToken();
    if (!accessToken) {
      setDriveVersions((current) => ({ ...current, status: "authorization-required", message: "請重新連結 Google Drive 後再復原版本。" }));
      announce("請重新連結 Google Drive 後再復原版本。", "error");
      return null;
    }
    setVersionBusy(true);
    try {
      const metadata = await getGoogleDriveFile(accessToken, file.id);
      const isHead = !revision || revision.id === metadata.headRevisionId;
      if (!isHead && !revision.keepForever) {
        throw new DriveApiError("這個 Drive 暫存版本無法下載；目前 Moodboard 未受影響。", { code: "drive/revision" });
      }
      const content = await downloadGoogleDriveMoodboard(accessToken, file.id, { revisionId: isHead ? "" : revision.id });
      const parsed = ensureBoard(JSON.parse(content));
      const versionTime = revision?.modifiedTime || metadata.modifiedTime || new Date().toISOString();
      const recovered = createRecoveredMoodboard(parsed, { label: `Drive 復原 ${formatTime(versionTime)}` });
      const activated = await activateLocalMoodboard(recovered, `已將 Drive 版本開成新的本機 Moodboard；原本內容仍安全保留。`);
      if (!activated) return null;
      setDriveVersions({ status: "idle", items: [], fileId: "", headRevisionId: "", message: "" });
      setShowVersions(false);
      return activated;
    } catch (error) {
      const authorizationRequired = isGoogleDriveAuthorizationError(error);
      if (authorizationRequired) driveTokenRef.current = null;
      const message = driveErrorMessage(error);
      setDriveVersions((current) => ({ ...current, status: authorizationRequired ? "authorization-required" : "error", message }));
      announce(message, "error");
      return null;
    } finally {
      setVersionBusy(false);
    }
  }, [activateLocalMoodboard, announce, currentDriveAccessToken]);

  const saveBoardFile = useCallback(async (forceDownload = false) => {
    const snapshot = boardSnapshot();
    const filename = `${safeFilename(snapshot.name, "moodboard")}.moodboard`;
    const content = `${JSON.stringify(snapshot, null, 2)}\n`;
    try {
      if (!forceDownload && window.showSaveFilePicker) {
        let handle = fileHandleRef.current;
        if (!handle) {
          handle = await window.showSaveFilePicker({
            suggestedName: filename,
            types: [{ description: "Infinite Moodboard 檔案", accept: { "application/json": [".moodboard"] } }],
          });
          fileHandleRef.current = handle;
        }
        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();
      } else {
        downloadBlob(new Blob([content], { type: "application/json" }), filename);
      }
      setDirty(false);
      announce(forceDownload ? "離線備份已下載" : "Infinite Moodboard 檔案已儲存", "success");
    } catch (error) {
      if (error.name !== "AbortError") announce("儲存失敗，畫布仍保留在本機自動儲存。", "error");
    }
  }, [announce, boardSnapshot]);

  const savePreferredBoard = useCallback(() => {
    if (!authReady) {
      saveBoardFile(false);
      return;
    }
    if (!currentDriveAccessToken()) {
      setShowDriveLibrary(true);
      setDriveSession((current) => ({ ...current, status: driveSettings.enabled ? "authorization-required" : "disconnected", connected: false, busy: false, message: driveSettings.enabled ? "請重新連結後繼續同步。" : "連結 Drive 後即可把目前 Moodboard 保存到雲端。" }));
      return;
    }
    saveBoardToGoogleDrive();
  }, [authReady, currentDriveAccessToken, driveSettings.enabled, saveBoardFile, saveBoardToGoogleDrive]);

  useEffect(() => {
    window.clearTimeout(driveSyncTimerRef.current);
    if (!hydrated || !authReady || !driveSettings.enabled || !driveSettings.autoSync || !currentDriveLink) return undefined;
    const alreadySynced = currentDriveLink.syncedRevision >= board.revision
      && (!board.updatedAt || currentDriveLink.syncedUpdatedAt === board.updatedAt);
    if (alreadySynced) return undefined;
    if (!online) {
      setDriveSession((current) => ({ ...current, status: "offline", busy: false, message: "目前離線；最新變更已先保存在這台裝置。" }));
      return undefined;
    }
    if (!currentDriveAccessToken()) {
      setDriveSession((current) => ({ ...current, status: "authorization-required", connected: false, busy: false, message: "重新連結 Drive 後會繼續同步；本機變更不會遺失。" }));
      return undefined;
    }
    setDriveSession((current) => ({ ...current, status: "pending", connected: true, busy: false, message: "停止操作後會同步最新版本。" }));
    driveSyncTimerRef.current = window.setTimeout(() => {
      saveBoardToGoogleDrive({ silent: true });
    }, 6000);
    return () => window.clearTimeout(driveSyncTimerRef.current);
  }, [authReady, board.revision, board.updatedAt, currentDriveAccessToken, currentDriveLink, driveSettings.autoSync, driveSettings.enabled, hydrated, online, saveBoardToGoogleDrive]);

  const exportBrowserHtml = useCallback(() => {
    try {
      const snapshot = boardSnapshot();
      const filename = `${safeFilename(snapshot.name, "moodboard")}-${safeFilename(translateInterfaceText("瀏覽版"), "browser-view")}.html`;
      const content = createPortableHtml(snapshot, { locale: interfaceLocale });
      downloadBlob(new Blob([content], { type: "text/html;charset=utf-8" }), filename);
      announce("瀏覽器版 HTML 已下載；可離線開啟，但不會改動原始工作檔。", "success");
    } catch {
      announce("瀏覽器版匯出失敗；原始 Infinite Moodboard 仍保留。", "error");
    }
  }, [announce, boardSnapshot, interfaceLocale]);

  const duplicateObjects = useCallback((objectIds) => {
    const selected = new Set(objectIds);
    if (!selected.size) return;
    const current = boardRef.current;
    const sources = current.objects.filter((object) => selected.has(object.id));
    const idMap = new Map(sources.map((object) => [object.id, createId("object")]));
    const artboardMap = new Map(sources.filter(isArtboardObject).map((object) => [object.id, idMap.get(object.id)]));
    const selectedGroups = (current.groups || []).filter((group) => group.memberIds.length >= 2 && group.memberIds.every((id) => selected.has(id)));
    const groupMap = new Map(selectedGroups.map((group) => [group.id, createId("group")]));
    const copies = sources.map((object) => {
      const copy = createObjectDuplicate(object, {
        id: idMap.get(object.id),
        groupId: groupMap.get(object.groupId) || null,
        artboardId: artboardMap.get(object.artboardId) || object.artboardId || null,
      });
      return {
        ...copy,
        annotationTargetIds: (object.annotationTargetIds || []).map((id) => idMap.get(id) || id),
      };
    });
    if (!copies.length) return;
    const newGroups = selectedGroups.map((group) => createGroup(
      group.memberIds.map((id) => idMap.get(id)).filter(Boolean),
      { id: groupMap.get(group.id), name: `${group.name} 複本` },
    ));
    applyBoard((boardState) => ({ ...boardState, objects: [...boardState.objects, ...copies], groups: [...(boardState.groups || []), ...newGroups] }));
    const copyIds = copies.map((object) => object.id);
    selectedIdsRef.current = copyIds;
    setSelectedIds(copyIds);
    setKeyObjectId(copyIds[0] || null);
    announce(`已複製 ${copies.length} 個物件`, "success");
  }, [announce, applyBoard]);

  const duplicateSelected = useCallback(() => duplicateObjects(selectedIdsRef.current), [duplicateObjects]);
  const duplicateLayerObject = useCallback((objectId) => duplicateObjects([objectId]), [duplicateObjects]);

  const copySelectedObjects = useCallback(() => {
    const selected = new Set(selectedIdsRef.current);
    const objects = boardRef.current.objects.filter((object) => selected.has(object.id));
    if (!objects.length) return false;
    const groups = (boardRef.current.groups || []).filter((group) => group.memberIds.every((id) => selected.has(id)));
    objectClipboardRef.current = {
      objects: objects.map((object) => ({ ...object, markers: object.markers.map((marker) => ({ ...marker })) })),
      groups: groups.map((group) => ({ ...group, memberIds: [...group.memberIds] })),
    };
    announce(`已複製 ${objects.length} 個物件到內部剪貼簿`, "success");
    return true;
  }, [announce]);

  const pasteCopiedObjects = useCallback(() => {
    const clipboard = objectClipboardRef.current;
    if (!clipboard?.objects?.length) return false;
    const idMap = new Map(clipboard.objects.map((object) => [object.id, createId("object")]));
    const groupMap = new Map((clipboard.groups || []).map((group) => [group.id, createId("group")]));
    const artboardMap = new Map(clipboard.objects.filter(isArtboardObject).map((object) => [object.id, idMap.get(object.id)]));
    const copies = clipboard.objects.map((object) => createObjectDuplicate(object, {
      id: idMap.get(object.id),
      groupId: groupMap.get(object.groupId) || null,
      artboardId: artboardMap.get(object.artboardId) || object.artboardId || null,
    })).map((object) => ({
      ...object,
      annotationTargetIds: object.annotationTargetIds.map((id) => idMap.get(id) || id),
    }));
    const groups = (clipboard.groups || []).map((group) => createGroup(
      group.memberIds.map((id) => idMap.get(id)).filter(Boolean),
      { id: groupMap.get(group.id), name: `${group.name} 複本` },
    ));
    applyBoard((current) => ({ ...current, objects: [...current.objects, ...copies], groups: [...(current.groups || []), ...groups] }));
    const ids = copies.map((object) => object.id);
    selectedIdsRef.current = ids;
    setSelectedIds(ids);
    setKeyObjectId(ids[0] || null);
    setTool("select");
    announce(`已貼上 ${copies.length} 個物件`, "success");
    return true;
  }, [announce, applyBoard]);

  const performDeleteObjects = useCallback((objectIds) => {
    const selected = new Set(objectIds);
    if (!selected.size) return;
    const count = boardRef.current.objects.filter((object) => selected.has(object.id)).length;
    if (!count) return;
    applyBoard((current) => compactBoardStructure({ ...current, objects: current.objects.filter((object) => !selected.has(object.id)) }));
    setSelectedIds((current) => current.filter((id) => !selected.has(id)));
    announce(`已刪除 ${count} 個物件；可按 ⌘Z 復原。`, "warning");
  }, [announce, applyBoard]);

  const requestDeleteObjects = useCallback((objectIds) => {
    const current = boardRef.current;
    const requested = new Set(objectIds);
    const existingIds = current.objects.filter((object) => requested.has(object.id)).map((object) => object.id);
    if (!existingIds.length) return;
    const affectedCompositions = findCompositionsAffectedByObjectDeletion(current, existingIds);
    if (affectedCompositions.length) {
      setPendingObjectDeletion({ objectIds: existingIds, affectedCompositions });
      return;
    }
    performDeleteObjects(existingIds);
  }, [performDeleteObjects]);

  const cancelPendingObjectDeletion = useCallback(() => setPendingObjectDeletion(null), []);
  const confirmPendingObjectDeletion = useCallback(() => {
    if (!pendingObjectDeletion) return;
    const { objectIds } = pendingObjectDeletion;
    setPendingObjectDeletion(null);
    performDeleteObjects(objectIds);
  }, [pendingObjectDeletion, performDeleteObjects]);

  const deleteSelected = useCallback(() => requestDeleteObjects(selectedIdsRef.current), [requestDeleteObjects]);
  const deleteLayerObject = useCallback((objectId) => requestDeleteObjects([objectId]), [requestDeleteObjects]);
  const cutSelectedObjects = useCallback(() => {
    if (!copySelectedObjects()) return;
    requestDeleteObjects(selectedIdsRef.current);
  }, [copySelectedObjects, requestDeleteObjects]);

  const selectGroup = useCallback((groupId, additive = false) => {
    const group = (boardRef.current.groups || []).find((item) => item.id === groupId);
    if (!group) return;
    const current = selectedIdsRef.current;
    const memberIds = group.memberIds.filter((id) => boardRef.current.objects.some((object) => object.id === id));
    const next = additive
      ? memberIds.every((id) => current.includes(id))
        ? current.filter((id) => !memberIds.includes(id))
        : [...new Set([...current, ...memberIds])]
      : memberIds;
    selectedIdsRef.current = next;
    setSelectedIds(next);
    setKeyObjectId(next[0] || null);
    setTool("select");
  }, []);

  const groupSelection = useCallback(() => {
    const ids = [...new Set(selectedIdsRef.current)].filter((id) => boardRef.current.objects.some((object) => object.id === id));
    if (ids.length < 2) {
      announce("至少選取 2 個物件才能建立群組。", "warning");
      return;
    }
    const group = createGroup(ids, { name: `群組 ${String((boardRef.current.groups?.length || 0) + 1).padStart(2, "0")}` });
    applyBoard((current) => {
      const strippedGroups = (current.groups || []).map((item) => ({ ...item, memberIds: item.memberIds.filter((id) => !ids.includes(id)) }));
      const next = {
        ...current,
        groups: [...strippedGroups, group],
        objects: current.objects.map((object) => ids.includes(object.id) ? { ...object, groupId: group.id } : object),
      };
      return compactBoardStructure(next);
    });
    announce(`已將 ${ids.length} 個物件建立為群組；按住 ⌘／Ctrl 可穿透選取。`, "success");
  }, [announce, applyBoard]);

  const ungroupSelection = useCallback((explicitGroupId = null) => {
    const selected = new Set(selectedIdsRef.current);
    const groupIds = explicitGroupId
      ? [explicitGroupId]
      : (boardRef.current.groups || []).filter((group) => group.memberIds.some((id) => selected.has(id))).map((group) => group.id);
    if (!groupIds.length) {
      announce("目前選取沒有可解散的群組。", "warning");
      return;
    }
    const targets = new Set(groupIds);
    applyBoard((current) => ({
      ...current,
      groups: (current.groups || []).filter((group) => !targets.has(group.id)),
      objects: current.objects.map((object) => targets.has(object.groupId) ? { ...object, groupId: null } : object),
    }));
    announce(`已解散 ${groupIds.length} 個群組；物件與圖層都保留。`, "success");
  }, [announce, applyBoard]);

  const toggleSelectionGroup = useCallback(() => {
    const selected = selectedIdsRef.current;
    const groups = boardRef.current.groups || [];
    const shared = groups.find((group) => selected.length === group.memberIds.length && group.memberIds.every((id) => selected.includes(id)));
    if (shared) ungroupSelection(shared.id);
    else groupSelection();
  }, [groupSelection, ungroupSelection]);

  const setSelectedVisibility = useCallback((visible) => {
    const selected = new Set(selectedIdsRef.current);
    if (!selected.size) return;
    applyBoard((current) => ({
      ...current,
      objects: current.objects.map((object) => selected.has(object.id) ? { ...object, visible } : object),
    }));
    announce(`已${visible ? "顯示" : "隱藏"} ${selected.size} 個選取物件`, "success");
  }, [announce, applyBoard]);

  const addArtboardBehindSelection = useCallback(() => {
    const selected = new Set(selectedIdsRef.current);
    const targets = boardRef.current.objects.filter((object) => selected.has(object.id) && object.visible && !isArtboardObject(object));
    if (!targets.length) {
      announce("請先選取要放到紙張上的物件。", "warning");
      return;
    }
    const artboard = createArtboardFromObjects(targets, { padding: 40, name: `紙張 ${(boardRef.current.objects.filter(isArtboardObject).length + 1).toString().padStart(2, "0")}` });
    if (!artboard) return;
    applyBoard((current) => {
      const targetIds = new Set(targets.map((object) => object.id));
      const objects = current.objects.map((object) => targetIds.has(object.id) ? { ...object, artboardId: artboard.id } : object);
      const firstTargetIndex = Math.min(...objects.map((object, index) => targetIds.has(object.id) ? index : Number.POSITIVE_INFINITY));
      objects.splice(Number.isFinite(firstTargetIndex) ? firstTargetIndex : 0, 0, artboard);
      return { ...current, objects };
    });
    const nextSelection = [artboard.id, ...targets.map((object) => object.id)];
    selectedIdsRef.current = nextSelection;
    setSelectedIds(nextSelection);
    setKeyObjectId(artboard.id);
    announce(`已加入紙張，四周保留 40px 邊距。`, "success");
  }, [announce, applyBoard]);

  const fitArtboardToContents = useCallback((artboardId) => {
    const artboard = boardRef.current.objects.find((object) => object.id === artboardId && isArtboardObject(object));
    const children = boardRef.current.objects.filter((object) => object.artboardId === artboardId && object.visible);
    if (!artboard || !children.length) {
      announce("這張紙目前沒有可用來符合的內容。", "warning");
      return;
    }
    const fitted = createArtboardFromObjects(children, {
      id: artboard.id,
      name: artboard.name,
      fill: artboard.fill,
      padding: artboard.paperPadding,
      createdAt: artboard.createdAt,
    });
    applyBoard((current) => ({
      ...current,
      objects: current.objects.map((object) => object.id === artboardId ? { ...artboard, ...fitted, updatedAt: new Date().toISOString() } : object),
    }));
    announce(`已依內容重新符合紙張，保留 ${Math.round(artboard.paperPadding)}px 邊距。`, "success");
  }, [announce, applyBoard]);

  const resizeArtboardPreset = useCallback((artboardId, preset, orientation) => {
    applyBoard((current) => ({
      ...current,
      objects: current.objects.map((object) => object.id === artboardId ? resizeArtboardToPreset(object, preset, orientation) : object),
    }));
  }, [applyBoard]);

  const applyAnnotation = useCallback((options) => {
    const selected = new Set(selectedIdsRef.current);
    const targets = boardRef.current.objects.filter((object) => selected.has(object.id) && object.visible);
    const annotation = createAnnotationObject(targets, options);
    if (!annotation) return;
    applyBoard((current) => ({ ...current, objects: [...current.objects, annotation] }));
    selectedIdsRef.current = [annotation.id];
    setSelectedIds([annotation.id]);
    setKeyObjectId(annotation.id);
    setShowAnnotationBuilder(false);
    setTool("select");
    setEditingText({ id: annotation.id, selectAll: !String(options.text || "").trim() });
    announce(`已加入${options.kind === "description" ? "說明" : "標題"}文字。`, "success");
  }, [announce, applyBoard]);

  const applyGrid = useCallback((options) => {
    const selected = new Set(selectedIdsRef.current);
    let sources = boardRef.current.objects.filter((object) => selected.has(object.id) && object.visible && !isArtboardObject(object));
    const center = canvasCenterWorld();
    if (!sources.length) {
      const placeholder = createShapeObject("rectangle", center);
      placeholder.name = "Grid 預留位置 01";
      placeholder.layerName = placeholder.name;
      placeholder.fill = "#58e6ff";
      sources = [placeholder];
    }
    const count = Math.max(sources.length, Math.min(100, Number(options.count) || sources.length));
    const originalsAreNew = !sources.every((source) => boardRef.current.objects.some((object) => object.id === source.id));
    const items = originalsAreNew ? sources : [...sources];
    while (items.length < count) {
      const source = sources[items.length % sources.length];
      const copy = createObjectDuplicate(source, { offset: 0, groupId: null, artboardId: null });
      copy.name = `${source.name} Grid ${String(items.length + 1).padStart(2, "0")}`;
      copy.layerName = copy.name;
      items.push(copy);
    }
    const cellWidth = Math.max(...items.map((object) => object.width));
    const cellHeight = Math.max(...items.map((object) => object.height));
    const columns = Math.max(1, Math.min(count, Number(options.columns) || 1));
    const rows = Math.ceil(count / columns);
    const startX = originalsAreNew
      ? center.x - (columns * cellWidth + (columns - 1) * options.gapX) / 2
      : selectionWorldBounds(sources)?.left;
    const startY = originalsAreNew
      ? center.y - (rows * cellHeight + (rows - 1) * options.gapY) / 2
      : selectionWorldBounds(sources)?.top;
    const arranged = arrangeObjectsInGrid(items, { ...options, columns, startX, startY });
    const arrangedMap = new Map(arranged.map((object) => [object.id, object]));
    const existingIds = new Set(boardRef.current.objects.map((object) => object.id));
    const created = arranged.filter((object) => !existingIds.has(object.id));
    applyBoard((current) => ({
      ...current,
      objects: [...current.objects.map((object) => arrangedMap.get(object.id) || object), ...created],
    }));
    const ids = arranged.map((object) => object.id);
    selectedIdsRef.current = ids;
    setSelectedIds(ids);
    setKeyObjectId(ids[0] || null);
    setShowGridBuilder(false);
    setTool("select");
    announce(`已建立 ${columns} 欄、${rows} 列，共 ${count} 個物件的 Grid。`, "success");
  }, [announce, applyBoard, canvasCenterWorld]);

  const undo = useCallback(() => {
    const previous = undoRef.current.pop();
    if (!previous) return;
    redoRef.current.push({ ...boardRef.current, view: { ...viewRef.current } });
    const next = stampBoard(previous, sessionIdRef.current);
    const nextView = previous.view || viewRef.current;
    viewRef.current = nextView;
    setView(nextView);
    boardRef.current = next;
    setBoard(next);
    setSelectedIds((current) => current.filter((id) => next.objects.some((object) => object.id === id)));
    publishBoard(next);
    setDirty(true);
    setHistorySignal((value) => value + 1);
  }, [publishBoard]);

  const redo = useCallback(() => {
    const nextSnapshot = redoRef.current.pop();
    if (!nextSnapshot) return;
    undoRef.current.push({ ...boardRef.current, view: { ...viewRef.current } });
    const next = stampBoard(nextSnapshot, sessionIdRef.current);
    const nextView = nextSnapshot.view || viewRef.current;
    viewRef.current = nextView;
    setView(nextView);
    boardRef.current = next;
    setBoard(next);
    publishBoard(next);
    setDirty(true);
    setHistorySignal((value) => value + 1);
  }, [publishBoard]);

  const updateObject = useCallback((id, patch) => {
    if (loadedTextFlow?.sourceId === id) setLoadedTextFlow(null);
    applyBoard((current) => {
      const target = current.objects.find((object) => object.id === id);
      const updatesStory = Object.prototype.hasOwnProperty.call(patch, "text");
      const now = new Date().toISOString();
      return {
        ...current,
        objects: current.objects.map((object) => {
          if (object.id === id) return { ...object, ...patch, updatedAt: now };
          if (updatesStory && target?.textFlowId && object.textFlowId === target.textFlowId) {
            return { ...object, text: patch.text, updatedAt: now };
          }
          return object;
        }),
      };
    });
  }, [applyBoard, loadedTextFlow]);

  const startTextEdit = useCallback((event, id, selectAll = false) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    if (loadedTextFlow) {
      setLoadedTextFlow(null);
      announce("已取消放置溢出文字；如要編輯，請再操作一次文字框。", "warning");
      return;
    }
    const object = boardRef.current.objects.find((item) => item.id === id);
    if (!isTextObject(object) || object.locked) {
      if (object?.locked) announce("這個文字物件已鎖定。", "warning");
      return;
    }
    selectedIdsRef.current = [id];
    setSelectedIds([id]);
    setKeyObjectId(id);
    setTool("select");
    setFilters(DEFAULT_FILTERS);
    setMobilePanel(null);
    textEditUndoRef.current = false;
    const displayText = objectDisplayText(object);
    let rangeStart = 0;
    if (object.textFlowId) {
      const frames = boardRef.current.objects
        .filter((item) => item.textFlowId === object.textFlowId)
        .sort((left, right) => left.textFlowOrder - right.textFlowOrder);
      for (const frame of frames) {
        if (frame.id === object.id) break;
        rangeStart += objectDisplayText(frame).length;
      }
    }
    textEditSessionRef.current = {
      id,
      flowId: object.textFlowId || null,
      rangeStart,
      rangeLength: displayText.length,
    };
    setEditingText({ id, selectAll });
  }, [announce, loadedTextFlow]);

  const finishTextEdit = useCallback(() => {
    textEditUndoRef.current = false;
    textEditSessionRef.current = null;
    setEditingText(null);
  }, []);

  const updateInlineText = useCallback((id, text) => {
    if (!textEditUndoRef.current) {
      pushUndo(boardRef.current);
      textEditUndoRef.current = true;
    }
    applyBoard((current) => {
      const object = current.objects.find((item) => item.id === id);
      const session = textEditSessionRef.current;
      const now = new Date().toISOString();
      if (object?.textFlowId && session?.id === id && session.flowId === object.textFlowId) {
        const story = String(object.text || "");
        const start = Math.max(0, Math.min(story.length, session.rangeStart));
        const end = Math.max(start, Math.min(story.length, start + session.rangeLength));
        const nextStory = `${story.slice(0, start)}${text}${story.slice(end)}`;
        session.rangeLength = text.length;
        return {
          ...current,
          objects: current.objects.map((item) => item.textFlowId === object.textFlowId
            ? { ...item, text: nextStory, updatedAt: now }
            : item),
        };
      }
      return {
        ...current,
        objects: current.objects.map((item) => item.id === id
          ? { ...item, text, updatedAt: now }
          : item),
      };
    }, { record: false });
  }, [applyBoard, pushUndo]);

  const resizeTextFrame = useCallback((id, patch) => {
    if (loadedTextFlow?.sourceId === id) setLoadedTextFlow(null);
    applyBoard((current) => ({
      ...current,
      objects: current.objects.map((object) => object.id === id && isTextObject(object)
        ? {
            ...object,
            ...(Number.isFinite(patch.width) ? { width: Math.max(24, patch.width) } : {}),
            ...(Number.isFinite(patch.height) ? { height: Math.max(24, patch.height) } : {}),
            updatedAt: new Date().toISOString(),
          }
        : object),
    }));
  }, [applyBoard, loadedTextFlow]);

  const autoFitTextFrame = useCallback((id, dimension) => {
    const object = boardRef.current.objects.find((item) => item.id === id);
    if (!isTextObject(object) || object.locked) return;
    const axis = dimension === "height" ? "height" : "width";
    const targetSize = measureTextFrameContent({ ...object, text: objectDisplayText(object), textFlowId: null }, axis);
    if (Math.abs(targetSize - object[axis]) < 0.5) {
      announce(`文字內容${axis === "width" ? "寬度" : "高度"}已經符合。`, "success");
      return;
    }
    const nextObject = resizeTextFrameToDimension(object, axis, targetSize);
    applyBoard((current) => ({
      ...current,
      objects: current.objects.map((item) => item.id === id ? nextObject : item),
    }));
    announce(`已讓文字框${axis === "width" ? "寬度" : "高度"}自動符合內容。`, "success");
    requestAnimationFrame(() => document.querySelector(`[data-object-id="${id}"] .canvas-text-editor`)?.focus({ preventScroll: true }));
  }, [announce, applyBoard]);

  const loadTextOverflow = useCallback((id) => {
    const object = boardRef.current.objects.find((item) => item.id === id);
    if (!isTextObject(object) || object.locked) return;
    if (loadedTextFlow?.sourceId === id) {
      setLoadedTextFlow(null);
      announce("已取消放置溢出文字。", "warning");
      return;
    }
    selectedIdsRef.current = [id];
    setSelectedIds([id]);
    setKeyObjectId(id);
    setTool("select");
    setFilters(DEFAULT_FILTERS);
    setLoadedTextFlow({ sourceId: id });
    announce("已載入溢出文字；請在空白畫布點一下建立連結文字框，Esc 可取消。", "success");
  }, [announce, loadedTextFlow]);

  const placeTextOverflow = useCallback((event) => {
    const sourceId = loadedTextFlow?.sourceId;
    if (!sourceId) return false;
    const current = boardRef.current;
    const source = current.objects.find((object) => object.id === sourceId);
    if (!isTextObject(source)) {
      setLoadedTextFlow(null);
      announce("原文字框已不存在，已取消放置。", "warning");
      return true;
    }

    const point = screenToWorld(event.clientX, event.clientY);
    const flowId = source.textFlowId || createId("text-flow");
    const frames = current.objects
      .filter((object) => object.id === source.id || object.textFlowId === flowId)
      .sort((left, right) => left.textFlowOrder - right.textFlowOrder);
    const story = String(source.text || "");
    const now = new Date().toISOString();
    const width = Math.max(24, Number(source.width) || 320);
    const height = Math.max(24, Number(source.height) || 120);
    const continuationNumber = frames.length + 1;
    const continuation = {
      ...createTextObject({ x: point.x + width / 2, y: point.y + height / 2 }),
      id: createId("object"),
      name: `${source.name} 續 ${continuationNumber}`,
      layerName: `${source.layerName} 續 ${continuationNumber}`,
      pivotX: point.x + width / 2,
      pivotY: point.y + height / 2,
      width,
      height,
      originalWidth: width,
      originalHeight: height,
      text: story,
      textFlowId: flowId,
      textFlowOrder: frames.length,
      flowText: "",
      textFlowOverflow: true,
      fontFamily: source.fontFamily,
      fontWeight: source.fontWeight,
      fontSize: source.fontSize,
      originalFontSize: source.fontSize,
      color: source.color,
      textAlign: source.textAlign,
      textAlignLast: source.textAlignLast,
      textVerticalAlign: source.textVerticalAlign,
      createdAt: now,
      updatedAt: now,
    };
    applyBoard({
      ...current,
      objects: [
        ...current.objects.map((object) => {
          if (object.id === source.id && !source.textFlowId) {
            return {
              ...object,
              textFlowId: flowId,
              textFlowOrder: 0,
              flowText: objectDisplayText(object),
              textFlowOverflow: false,
              updatedAt: now,
            };
          }
          return object;
        }),
        continuation,
      ],
    });
    selectedIdsRef.current = [continuation.id];
    setSelectedIds([continuation.id]);
    setKeyObjectId(continuation.id);
    setLoadedTextFlow(null);
    announce("已建立連結文字框；調整前一框尺寸時，文字會重新流向下一框。", "success");
    return true;
  }, [announce, applyBoard, loadedTextFlow, screenToWorld]);

  const loadLocalFonts = useCallback(async () => {
    if (typeof window.queryLocalFonts !== "function") {
      setLocalFontState({ status: "unsupported", message: "此瀏覽器不支援讀取本機字體，仍可使用內建字體。" });
      announce("目前瀏覽器不支援本機字體存取。", "warning");
      return;
    }
    setLocalFontState({ status: "loading", message: "等待瀏覽器讀取本機字體…" });
    try {
      const fonts = await window.queryLocalFonts();
      const families = [...new Set(fonts.map((font) => font.family?.trim()).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, "zh-Hant"));
      setLocalFontOptions(families.map((family) => ({ label: family, value: localFontCssValue(family) })));
      setLocalFontState({
        status: "loaded",
        message: families.length
          ? `已載入 ${families.length} 個字體家族；工作檔只保存字體名稱。`
          : "瀏覽器沒有回傳可用的本機字體。",
      });
      announce(families.length ? `已載入 ${families.length} 個本機字體家族` : "沒有找到可用的本機字體。", families.length ? "success" : "warning");
    } catch (error) {
      const denied = error?.name === "NotAllowedError" || error?.name === "SecurityError";
      setLocalFontState({
        status: denied ? "denied" : "error",
        message: denied
          ? "未取得本機字體權限；可在瀏覽器的網站設定重新允許。"
          : "無法讀取本機字體，仍可使用內建字體。",
      });
      announce(denied ? "未取得本機字體權限。" : "本機字體讀取失敗。", "warning");
    }
  }, [announce]);

  const setVideoControlsVisible = useCallback((id, visible) => {
    updateObject(id, { videoControlsVisible: visible });
  }, [updateObject]);

  const setSelectedAspectLock = useCallback((locked) => {
    const selected = new Set(selectedIdsRef.current);
    if (!selected.size) return;
    applyBoard((current) => ({
      ...current,
      objects: current.objects.map((object) => selected.has(object.id)
        ? { ...object, aspectLocked: locked, updatedAt: new Date().toISOString() }
        : object),
    }));
  }, [applyBoard]);

  const updateSelectedMicro3D = useCallback((patch) => {
    const selected = new Set(selectedIdsRef.current);
    if (!selected.size) return;
    applyBoard((current) => ({
      ...current,
      objects: current.objects.map((object) => selected.has(object.id)
        ? { ...object, ...patch, updatedAt: new Date().toISOString() }
        : object),
    }));
  }, [applyBoard]);

  const resetSelectedMicro3D = useCallback(() => {
    updateSelectedMicro3D({ tiltX: 0, tiltY: 0, depth: 0, perspective: 1000 });
  }, [updateSelectedMicro3D]);

  const changePivot = useCallback((id, anchor) => {
    applyBoard((current) => ({
      ...current,
      objects: current.objects.map((object) => object.id === id ? movePivotPreservingPlacement(object, anchor) : object),
    }));
  }, [applyBoard]);

  const restoreSize = useCallback((id) => {
    applyBoard((current) => ({
      ...current,
      objects: current.objects.map((object) => object.id === id ? restoreObjectSize(object) : object),
    }));
    announce("已還原物件的原始尺寸", "success");
  }, [announce, applyBoard]);

  const resetRotation = useCallback((id) => {
    applyBoard((current) => ({
      ...current,
      objects: current.objects.map((object) => object.id === id
        ? { ...object, rotation: 0, updatedAt: new Date().toISOString() }
        : object),
    }));
    announce("已將旋轉角度歸零", "success");
  }, [announce, applyBoard]);

  const addMarker = useCallback(() => {
    const selected = new Set(selectedIdsRef.current);
    if (!selected.size) return;
    applyBoard((current) => ({
      ...current,
      objects: current.objects.map((object) => {
        if (!selected.has(object.id)) return object;
        const markers = upsertMarkerBySymbol(object.markers, markerDraft);
        return markers === object.markers
          ? object
          : { ...object, markers, updatedAt: new Date().toISOString() };
      }),
    }));
    announce(`已套用「${MARKER_LABELS[markerDraft.symbol]} · ${MARKER_COLOR_LABELS[markerDraft.color]}」`, "success");
  }, [announce, applyBoard, markerDraft]);

  const removeMarker = useCallback((markerToRemove) => {
    const selected = new Set(selectedIdsRef.current);
    const key = markerKey(markerToRemove);
    applyBoard((current) => ({
      ...current,
      objects: current.objects.map((object) => selected.has(object.id)
        ? { ...object, markers: object.markers.filter((marker) => markerKey(marker) !== key), updatedAt: new Date().toISOString() }
        : object),
    }));
  }, [applyBoard]);

  const batchRename = useCallback(() => {
    const prefix = batchPrefix.trim();
    const selected = new Set(selectedIdsRef.current);
    if (!prefix || !selected.size) return;
    let index = 0;
    applyBoard((current) => ({
      ...current,
      objects: current.objects.map((object) => {
        if (!selected.has(object.id)) return object;
        index += 1;
        return { ...object, layerName: `${prefix} ${String(index).padStart(2, "0")}`, updatedAt: new Date().toISOString() };
      }),
    }));
    announce(`已重新命名 ${index} 個圖層`, "success");
  }, [announce, applyBoard, batchPrefix]);

  const alignSelected = useCallback((mode) => {
    const selected = selectedIdsRef.current;
    if (selected.length < 2) return;
    const keyId = selected.includes(keyObjectId) ? keyObjectId : selected[0];
    applyBoard((current) => ({
      ...current,
      objects: alignObjectsToKey(current.objects, selected, keyId, mode),
    }));
    const labels = {
      left: "靠左對齊",
      hcenter: "水平置中",
      right: "靠右對齊",
      top: "靠上對齊",
      vcenter: "垂直置中",
      bottom: "靠下對齊",
    };
    announce(`已依基準物件${labels[mode] || "對齊"}`, "success");
  }, [announce, applyBoard, keyObjectId]);

  const distributeSelected = useCallback((axis) => {
    const selected = selectedIdsRef.current;
    if (selected.length < 3) {
      announce("平均分布至少需要 3 個物件。", "warning");
      return;
    }
    const keyId = selected.includes(keyObjectId) ? keyObjectId : selected[0];
    applyBoard((current) => ({
      ...current,
      objects: distributeObjectsByGap(current.objects, selected, keyId, axis),
    }));
    announce(`已依基準物件${axis === "horizontal" ? "水平" : "垂直"}平均分布`, "success");
  }, [announce, applyBoard, keyObjectId]);

  const toggleVisibility = useCallback((id) => {
    applyBoard((current) => ({ ...current, objects: current.objects.map((object) => object.id === id ? { ...object, visible: !object.visible } : object) }));
  }, [applyBoard]);

  const moveLayer = useCallback((id, direction) => {
    applyBoard((current) => {
      const objects = [...current.objects];
      const index = objects.findIndex((object) => object.id === id);
      const nextIndex = clamp(index + direction, 0, objects.length - 1);
      if (index < 0 || nextIndex === index) return current;
      const [item] = objects.splice(index, 1);
      objects.splice(nextIndex, 0, item);
      return { ...current, objects };
    });
  }, [applyBoard]);

  const reorderLayer = useCallback((id, targetId, placement) => {
    applyBoard((current) => ({
      ...current,
      objects: reorderObjectsByVisualDrop(current.objects, id, targetId, placement),
    }));
  }, [applyBoard]);

  const centerObjectView = useCallback((id) => {
    const object = boardRef.current.objects.find((item) => item.id === id);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!object || !rect) return false;
    if (!object.visible) {
      announce(`「${object.layerName}」目前已隱藏，請先按眼睛顯示圖層。`, "warning");
      return false;
    }
    const nextView = viewObjectInViewport(object, { width: rect.width, height: rect.height });
    viewRef.current = nextView;
    setView(nextView);
    setSelectedCaptureId(null);
    setMobilePanel(null);
    if (filters.symbols.length || filters.colors.length) setFilters(DEFAULT_FILTERS);
    announce(`已將「${object.layerName}」置中顯示；物件原始位置未改變。`, "success");
    return true;
  }, [announce, filters.colors.length, filters.symbols.length]);

  const locateObject = useCallback((id) => {
    if (!centerObjectView(id)) return;
    selectedIdsRef.current = [id];
    setSelectedIds([id]);
    setKeyObjectId(id);
    setTool("select");
  }, [centerObjectView]);

  const captureCurrentView = useCallback(() => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const rawCapture = createViewCapture(
      boardRef.current,
      viewRef.current,
      { width: rect.width, height: rect.height },
    );
    const capture = { ...rawCapture, name: translateInterfaceText(rawCapture.name) };
    applyBoard((current) => ({ ...current, captures: [...current.captures, capture] }));
    setSelectedCaptureId(capture.id);
    changeLeftTab("captures");
    announce(`已建立「${capture.name}」`, "success");
  }, [announce, applyBoard, changeLeftTab]);

  const restoreComposition = useCallback((capture, selectedId = null, label = capture?.name || "構圖") => {
    if (!capture) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    const current = boardRef.current;
    const previous = current.lastComposition;
    const leavingComposition = createViewCapture(
      current,
      viewRef.current,
      { width: rect?.width || capture.viewport.width, height: rect?.height || capture.viewport.height },
      {
        id: previous?.id || createId("capture"),
        name: translateInterfaceText("切換前的構圖"),
        createdAt: previous?.createdAt,
      },
    );
    const nextView = {
      ...capture.view,
      x: capture.view.x + ((rect?.width || capture.viewport.width) - capture.viewport.width) / 2,
      y: capture.view.y + ((rect?.height || capture.viewport.height) - capture.viewport.height) / 2,
    };
    const restored = restoreViewCapture(current, capture);
    applyBoard({ ...restored, lastComposition: leavingComposition, view: nextView });
    viewRef.current = nextView;
    setView(nextView);
    setSelectedCaptureId(selectedId);
    setEditingText(null);
    textEditUndoRef.current = false;
    setSelectedIds([]);
    selectedIdsRef.current = [];
    setFilters(DEFAULT_FILTERS);
    setTool("select");
    setMobilePanel(null);
    announce(`已回到「${label}」；切換前構圖已保留`, "success");
  }, [announce, applyBoard]);

  const restoreCapture = useCallback((capture) => {
    restoreComposition(capture, capture.id, capture.name);
  }, [restoreComposition]);

  const restoreLastComposition = useCallback(() => {
    const previous = boardRef.current.lastComposition;
    if (!previous) return;
    restoreComposition(previous, null, translateInterfaceText("切換前構圖"));
  }, [restoreComposition]);

  const replaceCapture = useCallback((capture) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const replacement = createViewCapture(
      boardRef.current,
      viewRef.current,
      { width: rect.width, height: rect.height },
      capture,
    );
    applyBoard((current) => ({
      ...current,
      captures: current.captures.map((item) => item.id === capture.id ? replacement : item),
    }));
    setSelectedCaptureId(capture.id);
    announce(`已取代「${capture.name}」`, "success");
  }, [announce, applyBoard]);

  const moveCapture = useCallback((id, direction) => {
    applyBoard((current) => {
      const captures = [...current.captures];
      const index = captures.findIndex((capture) => capture.id === id);
      const nextIndex = clamp(index + direction, 0, captures.length - 1);
      if (index < 0 || nextIndex === index) return current;
      const [capture] = captures.splice(index, 1);
      captures.splice(nextIndex, 0, capture);
      return { ...current, captures };
    });
  }, [applyBoard]);

  const reorderCapture = useCallback((id, targetId, placement) => {
    applyBoard((current) => ({
      ...current,
      captures: reorderCapturesByVisualDrop(current.captures, id, targetId, placement),
    }));
  }, [applyBoard]);

  const deleteCapture = useCallback((id) => {
    const capture = boardRef.current.captures.find((item) => item.id === id);
    if (!capture) return;
    applyBoard((current) => ({
      ...current,
      captures: current.captures.filter((item) => item.id !== id),
    }));
    setSelectedCaptureId((current) => current === id ? null : current);
    announce(`已刪除「${capture.name}」；可按 ⌘Z 復原。`, "warning");
  }, [announce, applyBoard]);

  const startCanvasPan = useCallback((event, { clearSelectionOnClick = false, onMoveStart } = {}) => {
    event.preventDefault();
    const start = { x: event.clientX, y: event.clientY, view: viewRef.current };
    let moved = false;
    let releaseGesture = () => {};
    const move = (moveEvent) => {
      const dx = moveEvent.clientX - start.x;
      const dy = moveEvent.clientY - start.y;
      if (!moved && Math.hypot(dx, dy) < 3) return;
      moved = true;
      onMoveStart?.();
      setIsPanning(true);
      const nextView = { ...start.view, x: start.view.x + dx, y: start.view.y + dy };
      viewRef.current = nextView;
      setView(nextView);
    };
    const cleanup = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      releaseGesture();
    };
    const up = () => {
      cleanup();
      setIsPanning(false);
      if (!moved && clearSelectionOnClick) {
        selectedIdsRef.current = [];
        setSelectedIds([]);
      }
    };
    const cancel = () => {
      cleanup();
      setIsPanning(false);
      viewRef.current = start.view;
      setView(start.view);
    };
    releaseGesture = registerPointerGesture({
      label: "平移畫布",
      affectsDocument: false,
      hasChanges: () => moved,
      pause: cleanup,
      cancel,
      keep: up,
    });
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
    window.addEventListener("pointercancel", cancel, { once: true });
  }, [registerPointerGesture]);

  const onObjectPointerDown = useCallback((event, id) => {
    if (event.button !== 0 || filters.symbols.length || filters.colors.length) return;
    event.stopPropagation();
    if (loadedTextFlow) {
      event.preventDefault();
      announce("請在空白畫布點一下，以建立連結文字框。", "warning");
      return;
    }
    const penetrate = event.metaKey || event.ctrlKey;
    const temporarySelect = (tool === "hand" || spaceDown) && event.shiftKey;
    const selectionOverride = temporarySelect || penetrate;
    const additive = event.shiftKey && !temporarySelect;
    if ((tool === "hand" || spaceDown) && !temporarySelect) {
      startCanvasPan(event);
      return;
    }
    if (!["select", "3d"].includes(tool) && !selectionOverride) return;
    const targetObject = boardRef.current.objects.find((object) => object.id === id);
    if (!targetObject) return;
    const targetIds = selectionIdsForObject(boardRef.current, id, { penetrate });
    const pressTime = performance.now();
    objectClickRef.current = { id, time: pressTime, x: event.clientX, y: event.clientY };
    const previousSelection = [...selectedIdsRef.current];
    let movingIds;
    if (temporarySelect) {
      movingIds = targetIds;
      selectedIdsRef.current = movingIds;
      setSelectedIds(movingIds);
      setKeyObjectId(id);
    } else if (additive) {
      if (targetIds.every((targetId) => previousSelection.includes(targetId))) {
        const next = previousSelection.filter((item) => !targetIds.includes(item));
        selectedIdsRef.current = next;
        setSelectedIds(next);
        return;
      }
      movingIds = [...new Set([...previousSelection, ...targetIds])];
      selectedIdsRef.current = movingIds;
      setSelectedIds(movingIds);
      if (!previousSelection.length) setKeyObjectId(id);
    } else if (targetIds.every((targetId) => previousSelection.includes(targetId))) {
      movingIds = previousSelection;
    } else {
      movingIds = targetIds;
      selectedIdsRef.current = movingIds;
      setSelectedIds(movingIds);
      setKeyObjectId(id);
    }
    if (tool === "3d") return;
    if (targetObject.locked) return;
    event.preventDefault();
    const base = boardRef.current;
    const historyBefore = captureGestureHistory();
    const initial = new Map(base.objects.filter((object) => movingIds.includes(object.id) && !object.locked).map((object) => [object.id, { x: object.pivotX, y: object.pivotY }]));
    const startX = event.clientX;
    const startY = event.clientY;
    const zoom = viewRef.current.zoom;
    let moved = false;
    let releaseGesture = () => {};
    const move = (moveEvent) => {
      const dx = (moveEvent.clientX - startX) / zoom;
      const dy = (moveEvent.clientY - startY) / zoom;
      if (!moved && Math.hypot(dx, dy) * zoom < 3) return;
      if (!moved) {
        moved = true;
        pushUndo(base);
      }
      previewBoard({ ...base, objects: base.objects.map((object) => initial.has(object.id) ? { ...object, pivotX: initial.get(object.id).x + dx, pivotY: initial.get(object.id).y + dy } : object) });
    };
    const cleanup = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      releaseGesture();
    };
    const up = () => {
      cleanup();
      if (moved) {
        objectClickRef.current = null;
        objectTapRef.current = null;
        finalizeGesture();
      } else {
        if (!selectionOverride && !additive && targetIds.length === 1 && previousSelection.length > 1 && previousSelection.includes(id)) {
          setKeyObjectId(id);
          announce(`已將「${targetObject.layerName}」設為對齊基準`, "success");
        }
      }
    };
    const cancel = () => {
      cleanup();
      objectClickRef.current = null;
      objectTapRef.current = null;
      previewBoard(base);
      if (moved) restoreGestureHistory(historyBefore);
    };
    releaseGesture = registerPointerGesture({
      label: movingIds.length > 1 ? `移動 ${movingIds.length} 個物件` : `移動「${targetObject.layerName}」`,
      affectsDocument: true,
      hasChanges: () => moved,
      pause: cleanup,
      cancel,
      keep: up,
    });
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
    window.addEventListener("pointercancel", cancel, { once: true });
  }, [announce, captureGestureHistory, filters.colors.length, filters.symbols.length, finalizeGesture, loadedTextFlow, previewBoard, pushUndo, registerPointerGesture, restoreGestureHistory, spaceDown, startCanvasPan, tool]);

  const onObjectPointerUp = useCallback((event, id) => {
    if (event.button !== 0 || tool === "hand" || tool === "3d" || spaceDown || filters.symbols.length || filters.colors.length) return;
    if (event.target.closest?.("button, input, video, .canvas-video-controls, .canvas-text-editor")) return;
    const pending = objectClickRef.current;
    if (!pending || pending.id !== id) return;
    const now = performance.now();
    const previous = objectTapRef.current;
    const rapidSecondTap = previous
      && previous.id === id
      && now - previous.time <= 900
      && Math.hypot(event.clientX - previous.x, event.clientY - previous.y) <= 12;
    if (!rapidSecondTap) {
      objectTapRef.current = { id, time: now, x: event.clientX, y: event.clientY };
      return;
    }
    objectTapRef.current = null;
    objectClickRef.current = null;
    const object = boardRef.current.objects.find((item) => item.id === id);
    if (isTextObject(object) && !object.locked) requestAnimationFrame(() => startTextEdit(null, id));
    else centerObjectView(id);
  }, [centerObjectView, filters.colors.length, filters.symbols.length, spaceDown, startTextEdit, tool]);

  const onRotateStart = useCallback((event, id) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.detail > 1) return;
    const base = boardRef.current;
    const object = base.objects.find((item) => item.id === id);
    if (!object) return;
    const historyBefore = captureGestureHistory();
    pushUndo(base);
    setRotationGesture(true);
    let moved = false;
    let releaseGesture = () => {};
    const startPoint = screenToWorld(event.clientX, event.clientY);
    const startAngle = Math.atan2(startPoint.y - object.pivotY, startPoint.x - object.pivotX) * 180 / Math.PI;
    const move = (moveEvent) => {
      const point = screenToWorld(moveEvent.clientX, moveEvent.clientY);
      const angle = Math.atan2(point.y - object.pivotY, point.x - object.pivotX) * 180 / Math.PI;
      const delta = angle - startAngle;
      const rotation = object.rotation + (moveEvent.shiftKey ? snapRotationDelta(delta) : delta);
      if (Math.abs(rotation - object.rotation) > 0.01) moved = true;
      previewBoard({ ...base, objects: base.objects.map((item) => item.id === id ? { ...item, rotation } : item) });
    };
    const cleanup = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      releaseGesture();
    };
    const up = () => {
      cleanup();
      setRotationGesture(false);
      if (moved) finalizeGesture();
      else restoreGestureHistory(historyBefore);
    };
    const cancel = () => {
      cleanup();
      setRotationGesture(false);
      previewBoard(base);
      restoreGestureHistory(historyBefore);
    };
    releaseGesture = registerPointerGesture({
      label: `旋轉「${object.layerName}」`,
      affectsDocument: true,
      hasChanges: () => moved,
      pause: cleanup,
      cancel,
      keep: up,
    });
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
    window.addEventListener("pointercancel", cancel, { once: true });
  }, [captureGestureHistory, finalizeGesture, previewBoard, pushUndo, registerPointerGesture, restoreGestureHistory, screenToWorld]);

  const onResizeStart = useCallback((event, id, handleKey) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.detail > 1) return;
    const base = boardRef.current;
    const object = base.objects.find((item) => item.id === id);
    if (!object || object.locked) return;
    const historyBefore = captureGestureHistory();
    pushUndo(base);
    let moved = false;
    let releaseGesture = () => {};
    const startPoint = screenToWorld(event.clientX, event.clientY);
    const locked = object.aspectLocked !== false;
    setResizeGesture({
      objectId: id,
      handle: handleKey,
      pivotAnchor: resizePivotAnchor(handleKey, event.altKey),
      shift: event.shiftKey && locked,
      alt: event.altKey,
      scaleX: 1,
      scaleY: 1,
    });
    const move = (moveEvent) => {
      const point = screenToWorld(moveEvent.clientX, moveEvent.clientY);
      const nextObject = resizeObjectFromHandle(object, handleKey, startPoint, point, {
        fromCenter: moveEvent.altKey,
        preserveAspect: locked && !moveEvent.shiftKey,
      });
      if (Math.abs(nextObject.width - object.width) > 0.1 || Math.abs(nextObject.height - object.height) > 0.1) moved = true;
      previewBoard({ ...base, objects: base.objects.map((item) => item.id === id ? nextObject : item) });
      setResizeGesture({
        objectId: id,
        handle: handleKey,
        pivotAnchor: resizePivotAnchor(handleKey, moveEvent.altKey),
        shift: moveEvent.shiftKey && locked,
        alt: moveEvent.altKey,
        scaleX: nextObject.width / object.width,
        scaleY: nextObject.height / object.height,
      });
    };
    const cleanup = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      releaseGesture();
    };
    const up = () => {
      cleanup();
      setResizeGesture(null);
      if (moved) finalizeGesture();
      else restoreGestureHistory(historyBefore);
    };
    const cancel = () => {
      cleanup();
      setResizeGesture(null);
      previewBoard(base);
      restoreGestureHistory(historyBefore);
    };
    releaseGesture = registerPointerGesture({
      label: `縮放「${object.layerName}」`,
      affectsDocument: true,
      hasChanges: () => moved,
      pause: cleanup,
      cancel,
      keep: up,
    });
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
    window.addEventListener("pointercancel", cancel, { once: true });
  }, [captureGestureHistory, finalizeGesture, previewBoard, pushUndo, registerPointerGesture, restoreGestureHistory, screenToWorld]);

  const onTextFrameResizeStart = useCallback((event, id, handleKey) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.detail > 1) return;
    const base = boardRef.current;
    const object = base.objects.find((item) => item.id === id);
    if (!isTextObject(object) || object.locked) return;
    const historyBefore = captureGestureHistory();
    let didMove = false;
    let releaseGesture = () => {};
    const startPoint = screenToWorld(event.clientX, event.clientY);
    setTextFrameGesture({ objectId: id, handle: handleKey });
    const move = (moveEvent) => {
      if (!didMove) {
        pushUndo(base);
        didMove = true;
      }
      const point = screenToWorld(moveEvent.clientX, moveEvent.clientY);
      const nextObject = resizeObjectFromHandle(object, handleKey, startPoint, point, {
        fromCenter: moveEvent.altKey,
        preserveAspect: false,
        scaleText: false,
      });
      previewBoard({ ...base, objects: base.objects.map((item) => item.id === id ? nextObject : item) });
      setTextFrameGesture({ objectId: id, handle: handleKey });
    };
    const cleanup = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      releaseGesture();
    };
    const refocusEditor = () => {
      requestAnimationFrame(() => document.querySelector(`[data-object-id="${id}"] .canvas-text-editor`)?.focus({ preventScroll: true }));
    };
    const up = () => {
      cleanup();
      setTextFrameGesture(null);
      if (didMove) finalizeGesture();
      refocusEditor();
    };
    const cancel = () => {
      cleanup();
      setTextFrameGesture(null);
      previewBoard(base);
      if (didMove) restoreGestureHistory(historyBefore);
      refocusEditor();
    };
    releaseGesture = registerPointerGesture({
      label: `調整「${object.layerName}」文字框`,
      affectsDocument: true,
      hasChanges: () => didMove,
      pause: cleanup,
      cancel,
      keep: up,
    });
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
    window.addEventListener("pointercancel", cancel, { once: true });
  }, [captureGestureHistory, finalizeGesture, previewBoard, pushUndo, registerPointerGesture, restoreGestureHistory, screenToWorld]);

  const onGroupRotateStart = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    const base = boardRef.current;
    const selected = new Set(selectedIdsRef.current);
    const targets = base.objects.filter((object) => selected.has(object.id));
    if (targets.length < 2) return;
    const bounds = selectionWorldBounds(targets);
    const pivot = boundsAnchorPoint(bounds, selectionAnchor);
    const startPoint = screenToWorld(event.clientX, event.clientY);
    const startAngle = Math.atan2(startPoint.y - pivot.y, startPoint.x - pivot.x) * 180 / Math.PI;
    const historyBefore = captureGestureHistory();
    pushUndo(base);
    let moved = false;
    let releaseGesture = () => {};
    setRotationGesture(true);
    setGroupGesture({ type: "rotate", bounds, pivot, degrees: 0 });
    const move = (moveEvent) => {
      const point = screenToWorld(moveEvent.clientX, moveEvent.clientY);
      const angle = Math.atan2(point.y - pivot.y, point.x - pivot.x) * 180 / Math.PI;
      const rawDelta = angle - startAngle;
      const degrees = moveEvent.shiftKey ? snapRotationDelta(rawDelta) : rawDelta;
      if (Math.abs(degrees) > 0.01) moved = true;
      previewBoard({ ...base, objects: rotateObjectsAroundPoint(base.objects, selectedIdsRef.current, pivot, degrees) });
      setGroupGesture({ type: "rotate", bounds, pivot, degrees });
    };
    const cleanup = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      releaseGesture();
    };
    const up = () => {
      cleanup();
      setRotationGesture(false);
      setGroupGesture(null);
      if (moved) finalizeGesture();
      else restoreGestureHistory(historyBefore);
    };
    const cancel = () => {
      cleanup();
      setRotationGesture(false);
      setGroupGesture(null);
      previewBoard(base);
      restoreGestureHistory(historyBefore);
    };
    releaseGesture = registerPointerGesture({
      label: `旋轉 ${targets.length} 個物件`,
      affectsDocument: true,
      hasChanges: () => moved,
      pause: cleanup,
      cancel,
      keep: up,
    });
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
    window.addEventListener("pointercancel", cancel, { once: true });
  }, [captureGestureHistory, finalizeGesture, previewBoard, pushUndo, registerPointerGesture, restoreGestureHistory, screenToWorld, selectionAnchor]);

  const onGroupResizeStart = useCallback((event, handleKey) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.detail > 1) return;
    const base = boardRef.current;
    const selected = new Set(selectedIdsRef.current);
    const targets = base.objects.filter((object) => selected.has(object.id));
    if (targets.length < 2) return;
    const bounds = selectionWorldBounds(targets);
    const startPoint = screenToWorld(event.clientX, event.clientY);
    const locked = targets.every((object) => object.aspectLocked !== false);
    const minimumScaleX = targets.reduce((minimum, object) => Math.max(minimum, 24 / object.width), 0.0001);
    const minimumScaleY = targets.reduce((minimum, object) => Math.max(minimum, 24 / object.height), 0.0001);
    const initialTransform = resizeTransformFromHandle(bounds, handleKey, startPoint, startPoint, {
      fromCenter: event.altKey,
      preserveAspect: locked && !event.shiftKey,
      minimumScaleX,
      minimumScaleY,
    });
    const historyBefore = captureGestureHistory();
    pushUndo(base);
    let moved = false;
    let releaseGesture = () => {};
    setGroupGesture({
      type: "scale",
      bounds,
      pivot: initialTransform.pivot,
      pivotAnchor: initialTransform.pivotAnchor,
      handle: handleKey,
      scaleX: 1,
      scaleY: 1,
      shift: event.shiftKey && locked,
      alt: event.altKey,
    });
    const move = (moveEvent) => {
      const point = screenToWorld(moveEvent.clientX, moveEvent.clientY);
      const options = {
        fromCenter: moveEvent.altKey,
        preserveAspect: locked && !moveEvent.shiftKey,
        minimumScaleX,
        minimumScaleY,
      };
      const transform = resizeTransformFromHandle(bounds, handleKey, startPoint, point, options);
      if (Math.abs(transform.scaleX - 1) > 0.001 || Math.abs(transform.scaleY - 1) > 0.001) moved = true;
      previewBoard({ ...base, objects: resizeObjectsFromHandle(base.objects, selectedIdsRef.current, bounds, handleKey, startPoint, point, options) });
      setGroupGesture({
        type: "scale",
        bounds,
        pivot: transform.pivot,
        pivotAnchor: transform.pivotAnchor,
        handle: handleKey,
        scaleX: transform.scaleX,
        scaleY: transform.scaleY,
        shift: moveEvent.shiftKey && locked,
        alt: moveEvent.altKey,
      });
    };
    const cleanup = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      releaseGesture();
    };
    const up = () => {
      cleanup();
      setGroupGesture(null);
      if (moved) finalizeGesture();
      else restoreGestureHistory(historyBefore);
    };
    const cancel = () => {
      cleanup();
      setGroupGesture(null);
      previewBoard(base);
      restoreGestureHistory(historyBefore);
    };
    releaseGesture = registerPointerGesture({
      label: `縮放 ${targets.length} 個物件`,
      affectsDocument: true,
      hasChanges: () => moved,
      pause: cleanup,
      cancel,
      keep: up,
    });
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
    window.addEventListener("pointercancel", cancel, { once: true });
  }, [captureGestureHistory, finalizeGesture, previewBoard, pushUndo, registerPointerGesture, restoreGestureHistory, screenToWorld]);

  const onMicro3DRotateStart = useCallback((event, axis = "free", onClick) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.detail > 1) return;
    const base = boardRef.current;
    const selected = new Set(selectedIdsRef.current);
    const targetIds = new Set(base.objects.filter((object) => selected.has(object.id) && !object.locked).map((object) => object.id));
    if (!targetIds.size) return;
    const historyBefore = captureGestureHistory();
    const startX = event.clientX;
    const startY = event.clientY;
    let moved = false;
    let releaseGesture = () => {};
    setMicro3DGesture({ axis, deltaX: 0, deltaY: 0, deltaZ: 0 });
    const move = (moveEvent) => {
      const precision = moveEvent.altKey ? 0.16 : 0.42;
      const horizontal = (moveEvent.clientX - startX) * precision;
      const vertical = (moveEvent.clientY - startY) * precision;
      if (!moved && Math.hypot(horizontal, vertical) < 1) return;
      if (!moved) {
        moved = true;
        pushUndo(base);
      }
      let deltaX = 0;
      let deltaY = 0;
      let deltaZ = 0;
      let activeAxis = axis;
      if (axis === "x") deltaX = -vertical;
      else if (axis === "y") deltaY = horizontal;
      else if (axis === "z") deltaZ = moveEvent.shiftKey ? snapRotationDelta(horizontal) : horizontal;
      else if (moveEvent.shiftKey) {
        activeAxis = Math.abs(horizontal) >= Math.abs(vertical) ? "y" : "x";
        if (activeAxis === "x") deltaX = -vertical;
        else deltaY = horizontal;
      } else {
        deltaX = -vertical;
        deltaY = horizontal;
      }
      previewBoard({
        ...base,
        objects: base.objects.map((object) => {
          if (!targetIds.has(object.id)) return object;
          return {
            ...object,
            tiltX: Math.max(-60, Math.min(60, (Number(object.tiltX) || 0) + deltaX)),
            tiltY: Math.max(-60, Math.min(60, (Number(object.tiltY) || 0) + deltaY)),
            rotation: (Number(object.rotation) || 0) + deltaZ,
          };
        }),
      });
      setMicro3DGesture({ axis: activeAxis, deltaX, deltaY, deltaZ });
    };
    const cleanup = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      releaseGesture();
    };
    const up = () => {
      cleanup();
      setMicro3DGesture(null);
      if (moved) finalizeGesture();
      else onClick?.();
    };
    const cancel = () => {
      cleanup();
      setMicro3DGesture(null);
      previewBoard(base);
      if (moved) restoreGestureHistory(historyBefore);
    };
    releaseGesture = registerPointerGesture({
      label: targetIds.size > 1 ? `3D 旋轉 ${targetIds.size} 個物件` : "3D 旋轉物件",
      affectsDocument: true,
      hasChanges: () => moved,
      pause: cleanup,
      cancel,
      keep: up,
    });
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
    window.addEventListener("pointercancel", cancel, { once: true });
  }, [captureGestureHistory, finalizeGesture, previewBoard, pushUndo, registerPointerGesture, restoreGestureHistory]);

  const onObjectDoubleClick = useCallback((event, id) => {
    event.preventDefault();
    event.stopPropagation();
    centerObjectView(id);
  }, [centerObjectView]);

  const onCanvasPointerDown = useCallback((event) => {
    if (event.target.closest("button, input, select, a, .board-object, .filter-stage, .canvas-empty, .canvas-status, .export-dock")) return;
    if (event.button === 0 && loadedTextFlow) {
      event.preventDefault();
      placeTextOverflow(event);
      return;
    }
    if (event.button === 1 || spaceDown || (tool === "hand" && !event.shiftKey)) {
      startCanvasPan(event);
      return;
    }
    if (event.button !== 0 || filters.symbols.length || filters.colors.length) return;
    const previousBlankClick = blankClickRef.current;
    const isRapidSecondPress = previousBlankClick
      && performance.now() - previousBlankClick.time <= 900
      && Math.hypot(event.clientX - previousBlankClick.x, event.clientY - previousBlankClick.y) <= 12;
    if (event.detail > 1 || isRapidSecondPress) {
      blankClickRef.current = null;
      doubleClickPanMovedRef.current = false;
      startCanvasPan(event, { onMoveStart: () => { doubleClickPanMovedRef.current = true; } });
      return;
    }

    doubleClickPanMovedRef.current = false;
    event.preventDefault();
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    const startClient = { x: event.clientX, y: event.clientY };
    const previousSelected = [...selectedIdsRef.current];
    const previousKeyObjectId = keyObjectId;
    const initialSelected = event.shiftKey ? [...selectedIdsRef.current] : [];
    let moved = false;
    let releaseGesture = () => {};

    const move = (moveEvent) => {
      const dx = moveEvent.clientX - startClient.x;
      const dy = moveEvent.clientY - startClient.y;
      if (!moved && Math.hypot(dx, dy) < 4) return;
      moved = true;
      const left = Math.min(startClient.x, moveEvent.clientX) - canvasRect.left;
      const top = Math.min(startClient.y, moveEvent.clientY) - canvasRect.top;
      setMarquee({ left, top, width: Math.abs(dx), height: Math.abs(dy) });

      const startWorld = screenToWorld(startClient.x, startClient.y);
      const endWorld = screenToWorld(moveEvent.clientX, moveEvent.clientY);
      const worldRect = {
        left: Math.min(startWorld.x, endWorld.x),
        right: Math.max(startWorld.x, endWorld.x),
        top: Math.min(startWorld.y, endWorld.y),
        bottom: Math.max(startWorld.y, endWorld.y),
      };
      const hits = boardRef.current.objects
        .filter((object) => object.visible && objectIntersectsWorldRect(object, worldRect))
        .flatMap((object) => selectionIdsForObject(boardRef.current, object.id, { penetrate: event.metaKey || event.ctrlKey }));
      const nextSelection = [...new Set([...initialSelected, ...hits])];
      selectedIdsRef.current = nextSelection;
      setSelectedIds(nextSelection);
      if (!event.shiftKey) setKeyObjectId(nextSelection[0] || null);
    };
    const cleanup = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      releaseGesture();
    };
    const up = () => {
      cleanup();
      if (!moved && !event.shiftKey) {
        selectedIdsRef.current = [];
        setSelectedIds([]);
      }
      blankClickRef.current = moved ? null : { time: performance.now(), x: startClient.x, y: startClient.y };
      setMarquee(null);
    };
    const cancel = () => {
      cleanup();
      selectedIdsRef.current = previousSelected;
      setSelectedIds(previousSelected);
      setKeyObjectId(previousKeyObjectId);
      setMarquee(null);
      blankClickRef.current = null;
    };
    releaseGesture = registerPointerGesture({
      label: "框選物件",
      affectsDocument: false,
      hasChanges: () => moved,
      pause: cleanup,
      cancel,
      keep: up,
    });
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
    window.addEventListener("pointercancel", cancel, { once: true });
  }, [filters.colors.length, filters.symbols.length, keyObjectId, loadedTextFlow, placeTextOverflow, registerPointerGesture, screenToWorld, spaceDown, startCanvasPan, tool]);

  const zoomAround = useCallback((clientX, clientY, nextZoom) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const current = viewRef.current;
    const zoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
    const worldX = (clientX - rect.left - current.x) / current.zoom;
    const worldY = (clientY - rect.top - current.y) / current.zoom;
    const nextView = { zoom, x: clientX - rect.left - worldX * zoom, y: clientY - rect.top - worldY * zoom };
    viewRef.current = nextView;
    setView(nextView);
  }, []);

  const resetZoomAtCenter = useCallback(() => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    zoomAround(rect.left + rect.width / 2, rect.top + rect.height / 2, 1);
    announce("畫面已以中央為軸回到 100%", "success");
  }, [announce, zoomAround]);

  const onCanvasDoubleClick = useCallback((event) => {
    if (event.target.closest("button, input, select, a, .board-object, .filter-stage, .canvas-empty, .canvas-status, .export-dock")) return;
    event.preventDefault();
    if (doubleClickPanMovedRef.current) {
      doubleClickPanMovedRef.current = false;
      return;
    }
    resetZoomAtCenter();
  }, [resetZoomAtCenter]);

  const onWheel = useCallback((event) => {
    event.preventDefault();
    if (event.ctrlKey || event.metaKey) {
      zoomAround(event.clientX, event.clientY, viewRef.current.zoom * Math.exp(-event.deltaY * 0.005));
    } else {
      setView((current) => ({ ...current, x: current.x - event.deltaX, y: current.y - event.deltaY }));
    }
  }, [zoomAround]);

  const fitToContent = useCallback(() => {
    const visible = boardRef.current.objects.filter((object) => object.visible);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    if (!visible.length) {
      const nextView = { x: rect.width / 2, y: rect.height / 2, zoom: 1 };
      viewRef.current = nextView;
      setView(nextView);
      announce("畫布目前沒有可顯示的物件。", "warning");
      return;
    }
    const points = visible.flatMap(objectWorldCorners);
    const minX = Math.min(...points.map((point) => point.x));
    const maxX = Math.max(...points.map((point) => point.x));
    const minY = Math.min(...points.map((point) => point.y));
    const maxY = Math.max(...points.map((point) => point.y));
    const width = Math.max(1, maxX - minX);
    const height = Math.max(1, maxY - minY);
    const zoom = clamp(Math.min((rect.width - 96) / width, (rect.height - 96) / height), MIN_ZOOM, 1.8);
    const nextView = { zoom, x: rect.width / 2 - ((minX + maxX) / 2) * zoom, y: rect.height / 2 - ((minY + maxY) / 2) * zoom };
    viewRef.current = nextView;
    setView(nextView);
    announce(`已將 ${visible.length} 個可見物件完整顯示在視窗中。`, "success");
  }, [announce]);

  const toggleViewportScale = useCallback(() => {
    if (Math.abs(viewRef.current.zoom - 1) < 0.005) fitToContent();
    else resetZoomAtCenter();
  }, [fitToContent, resetZoomAtCenter]);

  const onZoomValueClick = useCallback((event) => {
    const now = performance.now();
    const isRapidSecondActivation = event.detail >= 2
      || (zoomValueTapRef.current > 0 && now - zoomValueTapRef.current <= 420);
    if (!isRapidSecondActivation) {
      zoomValueTapRef.current = now;
      return;
    }
    event.preventDefault();
    zoomValueTapRef.current = 0;
    toggleViewportScale();
  }, [toggleViewportScale]);

  const onZoomValueKeyDown = useCallback((event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    zoomValueTapRef.current = 0;
    toggleViewportScale();
  }, [toggleViewportScale]);

  const onPrimaryCanvasToolClick = useCallback((event, nextTool) => {
    setTool(nextTool);
    if (event.detail === 0) return;
    const now = performance.now();
    const previousActivation = canvasToolTapRef.current[nextTool];
    const isRapidSecondActivation = event.detail >= 2
      || (previousActivation > 0 && now - previousActivation <= 420);
    if (!isRapidSecondActivation) {
      canvasToolTapRef.current = { select: 0, hand: 0, [nextTool]: now };
      return;
    }
    canvasToolTapRef.current = { select: 0, hand: 0 };
    if (nextTool === "select") fitToContent();
    else resetZoomAtCenter();
  }, [fitToContent, resetZoomAtCenter]);

  useEffect(() => {
    const paste = (event) => {
      const files = [...(event.clipboardData?.files || [])].filter((file) => file.type.startsWith("image/") || file.type.startsWith("video/") || isSvgFile(file));
      if (files.length) {
        event.preventDefault();
        addMediaFiles(files, canvasCenterWorld());
      }
    };
    window.addEventListener("paste", paste);
    return () => window.removeEventListener("paste", paste);
  }, [addMediaFiles, canvasCenterWorld]);

  useEffect(() => {
    const selectAllVisibleObjects = () => {
      const ids = boardRef.current.objects.filter((object) => object.visible).map((object) => object.id);
      selectedIdsRef.current = ids;
      setSelectedIds(ids);
      setKeyObjectId(ids[0] || null);
      if (ids.length) setTool("select");
      announce(ids.length ? `已選取全部 ${ids.length} 個可見物件` : "目前沒有可選取的物件。", ids.length ? "success" : "warning");
    };
    const openCurrentListSearch = () => {
      let listId = "layers";
      if (pendingObjectDeletion) listId = "delete-impact";
      else if (preparedDownloads.length) listId = "downloads";
      else if (showShortcuts) listId = "shortcuts";
      else if (showVersions) listId = "versions";
      else if (showInterfaceThemes) listId = "themes";
      else if (leftTab === "sources") listId = "sources";
      else if (leftTab === "captures") listId = "captures";
      else if (leftTab === "filters" && (filters.symbols.length || filters.colors.length)) listId = "filter-results";
      else {
        setFocusMode(false);
        setLeftTab("layers");
        if (!leftPanelVisible) {
          setLeftPanelVisible(true);
          localStorage.setItem("moodboard-left-panel-visible", "true");
        }
      }
      window.requestAnimationFrame(() => openListSearch(listId));
    };
    const keyDown = (event) => {
      if (event.key === "Escape" && document.fullscreenElement) return;
      if (escapeCancellationRequest) {
        if (event.key === "Escape") {
          event.preventDefault();
          keepEscapeAdjustment();
        }
        return;
      }
      if (pendingAdvancedFeature) {
        if (event.key === "Escape") {
          event.preventDefault();
          closeAdvancedFeatureGate();
        }
        return;
      }
      if (showDeleteLocalData) {
        if (event.key === "Escape" && !isClearingLocalData) {
          event.preventDefault();
          setShowDeleteLocalData(false);
        }
        return;
      }
      if (pendingObjectDeletion) {
        if (event.key === "Escape") {
          event.preventDefault();
          cancelPendingObjectDeletion();
        }
        return;
      }
      if (event.key === "Escape" && requestActivePointerCancellation()) {
        event.preventDefault();
        return;
      }
      if (event.key === "Shift") {
        setModifierDown(true);
        setResizeGesture((current) => current ? { ...current, shift: true } : current);
        setGroupGesture((current) => current?.type === "scale" ? { ...current, shift: true } : current);
      }
      if (event.key === "Alt") {
        setResizeGesture((current) => current ? { ...current, alt: true, pivotAnchor: "mc" } : current);
        setGroupGesture((current) => current?.type === "scale" ? { ...current, alt: true, pivotAnchor: "mc", pivot: boundsAnchorPoint(current.bounds, "mc") } : current);
      }
      const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
      if (event.key === "Escape" && loadedTextFlow) {
        event.preventDefault();
        setLoadedTextFlow(null);
        announce("已取消放置溢出文字。", "warning");
        return;
      }
      if (event.key === "Escape" && showInterfaceThemes) {
        event.preventDefault();
        closeInterfaceThemes();
        return;
      }
      if (event.key === "Escape" && showDriveLibrary) {
        event.preventDefault();
        setShowDriveLibrary(false);
        return;
      }
      if (event.key === "Escape" && showSettings) {
        event.preventDefault();
        setShowSettings(false);
        return;
      }
      if (event.key === "Escape" && showGridBuilder) {
        event.preventDefault();
        setShowGridBuilder(false);
        return;
      }
      if (event.key === "Escape" && showAnnotationBuilder) {
        event.preventDefault();
        setShowAnnotationBuilder(false);
        return;
      }
      if (event.key === "Escape" && showShortcuts) {
        event.preventDefault();
        setShowShortcuts(false);
        return;
      }
      if (event.code === "Space" && !typing) { event.preventDefault(); setSpaceDown(true); }
      if (typing) return;
      const modifier = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();
      if (modifier && !event.altKey) {
        if (key === "s") { event.preventDefault(); savePreferredBoard(); return; }
        if (key === "o") { event.preventDefault(); openBoardFile(); return; }
        if (key === "f") { event.preventDefault(); openCurrentListSearch(); return; }
        if (key === "a") { event.preventDefault(); selectAllVisibleObjects(); return; }
        if (key === "c") { event.preventDefault(); copySelectedObjects(); return; }
        if (key === "x") { event.preventDefault(); cutSelectedObjects(); return; }
        if (key === "v" && objectClipboardRef.current?.objects?.length) { event.preventDefault(); pasteCopiedObjects(); return; }
        if (key === "z" && event.shiftKey) { event.preventDefault(); redo(); return; }
        if (key === "z") { event.preventDefault(); undo(); return; }
      }
      const shiftOnly = event.shiftKey && !modifier && !event.altKey;
      if (shiftOnly) {
        if (event.code === "Slash") { event.preventDefault(); setShowShortcuts((current) => !current); return; }
        if (event.code === "KeyV") { event.preventDefault(); setTool("select"); return; }
        if (event.code === "KeyH") { event.preventDefault(); setTool("hand"); return; }
        if (event.code === "Digit3") {
          event.preventDefault();
          if (selectedIdsRef.current.length) {
            if (tool === "3d") setTool("select");
            else requestAdvancedFeature("3d");
          }
          return;
        }
        if (event.code === "KeyR") { event.preventDefault(); toggleRulers(); return; }
        if (event.code === "Semicolon") { event.preventDefault(); toggleGuides(); return; }
        if (event.code === "Quote") { event.preventDefault(); toggleCanvasBackground(); return; }
        if (event.code === "BracketLeft") { event.preventDefault(); toggleLeftPanel(); return; }
        if (event.code === "BracketRight") { event.preventDefault(); toggleRightPanel(); return; }
        if (event.code === "Backslash") { event.preventDefault(); toggleBothPanels(); return; }
        if (event.code === "KeyF") { event.preventDefault(); toggleFocusMode(); return; }
        if (event.code === "KeyD") {
          event.preventDefault();
          if (!event.repeat) duplicateSelected();
          return;
        }
        if (event.code === "KeyG") {
          event.preventDefault();
          if (!event.repeat) toggleSelectionGroup();
          return;
        }
      }
      if (["Backspace", "Delete"].includes(event.key)) { event.preventDefault(); deleteSelected(); }
      if (event.key === "Escape") {
        event.preventDefault();
        if (shapeMenuOpen) setShapeMenuOpen(false);
        else if (dragActive) setDragActive(false);
        else if (preparedDownloads.length) closePreparedDownloads();
        else if (showVersions) setShowVersions(false);
        else if (showCollaboration) setShowCollaboration(false);
        else if (mobilePanel) setMobilePanel(null);
        else if (filters.symbols.length || filters.colors.length) setFilters(DEFAULT_FILTERS);
        else if (tool === "3d") setTool("select");
        else if (focusMode) restoreWorkspaceChrome();
        else if (!leftPanelVisible && !rightPanelVisible) showBothPanels();
        else if (selectedIdsRef.current.length) {
          selectedIdsRef.current = [];
          setSelectedIds([]);
          setKeyObjectId(null);
        }
      }
    };
    const keyUp = (event) => {
      if (event.code === "Space") setSpaceDown(false);
      if (event.key === "Shift") {
        setModifierDown(false);
        setResizeGesture((current) => current ? { ...current, shift: false } : current);
        setGroupGesture((current) => current?.type === "scale" ? { ...current, shift: false } : current);
      }
      if (event.key === "Alt") {
        setResizeGesture((current) => current ? { ...current, alt: false, pivotAnchor: resizePivotAnchor(current.handle, false) } : current);
        setGroupGesture((current) => {
          if (current?.type !== "scale") return current;
          const pivotAnchor = resizePivotAnchor(current.handle, false);
          return { ...current, alt: false, pivotAnchor, pivot: boundsAnchorPoint(current.bounds, pivotAnchor) };
        });
      }
    };
    const blur = () => {
      setSpaceDown(false);
      setModifierDown(false);
      setResizeGesture((current) => current ? { ...current, shift: false, alt: false } : current);
      setGroupGesture((current) => current?.type === "scale" ? { ...current, shift: false, alt: false } : current);
    };
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      window.removeEventListener("blur", blur);
    };
  }, [announce, cancelPendingObjectDeletion, closeAdvancedFeatureGate, closeInterfaceThemes, closePreparedDownloads, copySelectedObjects, cutSelectedObjects, deleteSelected, dragActive, duplicateSelected, escapeCancellationRequest, filters.colors.length, filters.symbols.length, focusMode, isClearingLocalData, keepEscapeAdjustment, leftPanelVisible, leftTab, loadedTextFlow, mobilePanel, openBoardFile, openListSearch, pasteCopiedObjects, pendingAdvancedFeature, pendingObjectDeletion, preparedDownloads.length, redo, requestActivePointerCancellation, requestAdvancedFeature, restoreWorkspaceChrome, rightPanelVisible, savePreferredBoard, shapeMenuOpen, showAnnotationBuilder, showBothPanels, showCollaboration, showDeleteLocalData, showDriveLibrary, showGridBuilder, showInterfaceThemes, showSettings, showShortcuts, showVersions, toggleBothPanels, toggleCanvasBackground, toggleFocusMode, toggleGuides, toggleLeftPanel, toggleRightPanel, toggleRulers, toggleSelectionGroup, tool, undo]);

  const exportObjects = useCallback((scopeOverride) => {
    const scope = typeof scopeOverride === "string" ? scopeOverride : exportScope;
    const targets = objectsForExport(boardRef.current.objects.filter((object) => object.visible), selectedIdsRef.current, scope);
    if (!targets.length) {
      announce("這個匯出範圍沒有物件。", "warning");
      return;
    }
    closePreparedDownloads();
    const downloads = targets.map((object, index) => {
      const artifact = objectExportArtifact(object);
      return {
        blob: artifact.blob,
        url: URL.createObjectURL(artifact.blob),
        filename: `${String(index + 1).padStart(2, "0")}-${safeFilename(object.name)}.${artifact.extension}`,
      };
    });
    preparedDownloadsRef.current = downloads;
    setPreparedDownloads(downloads);
    announce(`已準備 ${targets.length} 個匯出檔`, "success");
  }, [announce, closePreparedDownloads, exportScope]);

  const exportPreparedToDirectory = useCallback(() => {
    if (!canUseDirectoryPicker || !preparedDownloadsRef.current.length) return;
    const picker = window.showDirectoryPicker({ mode: "readwrite" });
    setIsExporting(true);
    picker.then(async (directory) => {
      for (const download of preparedDownloadsRef.current) {
        const fileHandle = await directory.getFileHandle(download.filename, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(download.blob);
        await writable.close();
      }
      announce(`已匯出 ${preparedDownloadsRef.current.length} 個物件到指定資料夾`, "success");
    }).catch((error) => {
      if (error.name !== "AbortError") announce(error.message || "匯出失敗。", "error");
    }).finally(() => setIsExporting(false));
  }, [announce, canUseDirectoryPicker]);

  const outputSelectionComposition = useCallback(async () => {
    const selected = new Set(selectedIdsRef.current);
    const selectedArtboards = new Set(boardRef.current.objects.filter((object) => selected.has(object.id) && isArtboardObject(object)).map((object) => object.id));
    const targets = boardRef.current.objects.filter((object) => object.visible && (selected.has(object.id) || selectedArtboards.has(object.artboardId)));
    if (!targets.length) {
      announce("請先選取要輸出的物件。", "warning");
      return;
    }

    const format = compositionOutputFormat(compositionFormat);
    setIsRenderingComposition(true);
    try {
      const rendered = await renderSelectionComposition(targets, compositionScale);
      const blob = await encodeCompositionCanvas(rendered.canvas, compositionFormat);
      const filename = `${safeFilename(`${boardRef.current.name}-選取合成`, "moodboard-composition")}.${format.extension}`;
      downloadBlob(blob, filename);
      const reducedNote = rendered.reduced ? "；尺寸過大，已在不改變比例下自動縮小" : "";
      announce(`已輸出 ${format.label} · ${rendered.pixelWidth} × ${rendered.pixelHeight}px${reducedNote}`, "success");
    } catch (error) {
      const fallbackMessage = compositionFormat === "avif"
        ? "AVIF 輸出失敗；請重試，或改用 WebP／PNG。"
        : `${format.label} 輸出失敗；原始物件仍保留。`;
      announce(error?.message || fallbackMessage, "error");
    } finally {
      setIsRenderingComposition(false);
    }
  }, [announce, compositionFormat, compositionScale]);

  const openVersionModal = useCallback(async () => {
    setShowVersions(true);
    const localRequest = listVersions(boardRef.current.id)
      .then(setVersions)
      .catch(() => announce("無法讀取本機版本紀錄。", "error"));
    await Promise.all([localRequest, refreshDriveVersions()]);
  }, [announce, refreshDriveVersions]);

  const createManualVersion = useCallback(async () => {
    setVersionBusy(true);
    try {
      await saveVersion(boardSnapshot(), versionLabel || translateInterfaceText(`手動版本 ${formatTime(new Date())}`), "manual");
      setVersions(await listVersions(boardRef.current.id));
      setVersionLabel("");
      announce("版本已建立", "success");
    } catch { announce("版本建立失敗。", "error"); }
    finally { setVersionBusy(false); }
  }, [announce, boardSnapshot, versionLabel]);

  const restoreVersion = useCallback(async (version) => {
    setVersionBusy(true);
    try {
      await saveVersion(boardSnapshot(), translateInterfaceText("還原前自動備份"), "automatic");
      const restored = ensureBoard(version.board);
      const restoredView = restored.view || viewRef.current;
      viewRef.current = restoredView;
      const next = applyBoard({ ...restored, id: boardRef.current.id, view: restoredView });
      setView(restoredView);
      setSelectedIds([]);
      setSelectedCaptureId(null);
      setFilters(DEFAULT_FILTERS);
      setVersions(await listVersions(next.id));
      announce(`已還原「${version.label}」`, "success");
    } catch { announce("版本還原失敗。", "error"); }
    finally { setVersionBusy(false); }
  }, [announce, applyBoard, boardSnapshot]);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    setDragActive(false);
    const files = [...event.dataTransfer.files];
    const boardFile = files.find((file) => /\.(moodboard|json)$/i.test(file.name));
    if (boardFile && files.length === 1) importBoardFile(boardFile);
    else addMediaFiles(files, screenToWorld(event.clientX, event.clientY));
  }, [addMediaFiles, importBoardFile, screenToWorld]);

  const filteredObjects = useMemo(() => board.objects.filter((object) => object.visible && matchesFilters(object, filters)), [board.objects, filters]);
  const sourceAssets = useMemo(() => sourceAssetsFromObjects(board.objects), [board.objects]);
  const filtersActive = filters.symbols.length + filters.colors.length > 0;
  const inspectionActive = filtersActive || leftTab === "sources";
  const exportCount = objectsForExport(board.objects.filter((object) => object.visible), selectedIds, exportScope).length;
  const soleSelectedId = selectedIds.length === 1 ? selectedIds[0] : null;
  const selectedObjects = useMemo(
    () => board.objects.filter((object) => object.visible && selectedIds.includes(object.id)),
    [board.objects, selectedIds],
  );
  const compositionCount = selectedObjects.length;
  const selectedSemanticGroup = (board.groups || []).find((group) => (
    group.memberIds.length === selectedIds.length
    && group.memberIds.every((id) => selectedIds.includes(id))
  ));
  const selectedArtboard = selectedObjects.find(isArtboardObject);
  const selectionGrouped = Boolean(selectedSemanticGroup);
  const selectionSemanticLabel = selectedArtboard
    ? "紙張＋內容"
    : selectedSemanticGroup?.name || null;
  const selectionHasArtboard = Boolean(
    selectedArtboard
    || (selectedObjects.length && selectedObjects.every((object) => object.artboardId && object.artboardId === selectedObjects[0].artboardId)),
  );
  const selectionActionBounds = selectedObjects.length ? selectionWorldBounds(selectedObjects) : null;
  const multiSelectionBounds = selectedObjects.length > 1 ? selectionWorldBounds(selectedObjects) : null;
  const selectionActionAnchor = selectionActionBounds
    ? selectionActionAnchorInViewport(selectionActionBounds, view, canvasViewportSize)
    : null;
  const selectionActionStyle = selectionActionAnchor ? {
    left: `clamp(8px, ${selectionActionAnchor.x}px, calc(100% - 252px))`,
    top: `clamp(84px, ${selectionActionAnchor.y}px, calc(100% - 28px))`,
  } : undefined;
  const showSelectionActions = Boolean(
    selectionActionAnchor
    && !inspectionActive
    && !editingText
    && !rotationGesture
    && !resizeGesture
    && !groupGesture
    && !textFrameGesture
    && !micro3DGesture,
  );
  const resolvedKeyObjectId = selectedIds.includes(keyObjectId) ? keyObjectId : (selectedIds[0] || null);
  const effectiveLeftPanelVisible = !focusMode && leftPanelVisible;
  const effectiveRightPanelVisible = !focusMode && rightPanelVisible;
  const topbarSaveState = currentDriveLink || driveSettings.enabled
    ? driveStatusPresentation(driveSession).label
    : (dirty ? "有未寫入檔案的變更" : saveState);

  return (
    <main
      ref={appRootRef}
      className={`moodboard-app ${isPanning ? "is-panning" : ""} ${isBooting ? "is-booting" : "is-boot-ready"} ${focusMode ? "is-focus-mode" : ""}`}
      data-interface-theme={(previewTheme || activeTheme).id}
      style={interfaceThemeStyle}
      aria-busy={isBooting}
    >
      {isBooting ? <StartupSequence onComplete={finishStartup} /> : null}
      <header className="app-topbar" aria-hidden={isBooting || focusMode || undefined} inert={isBooting || focusMode ? true : undefined}>
        <div className="brand-block">
          <span className="brand-mark" aria-hidden="true">∞</span>
          <div><strong>Infinite Moodboard</strong><small>PETFASHION 創意工具</small></div>
        </div>

        <div className="file-actions">
          <IconButton
            className="desktop-panel-button"
            label={leftPanelVisible ? "隱藏圖層、分群、素材與構圖側欄" : "顯示圖層、分群、素材與構圖側欄"}
            active={leftPanelVisible}
            aria-pressed={leftPanelVisible}
            onClick={toggleLeftPanel}
          >
            <PanelLeft size={18} />
          </IconButton>
          <IconButton
            className="mobile-panel-button"
            label="開啟圖層、分群、素材與構圖側欄"
            active={mobilePanel === "left"}
            aria-pressed={mobilePanel === "left"}
            onClick={() => setMobilePanel((current) => current === "left" ? null : "left")}
          >
            <PanelLeft size={18} />
          </IconButton>
          <button className="topbar-button" type="button" onClick={openBoardFile} title="從這台裝置開啟 .moodboard"><FolderOpen size={17} /><span>開啟</span></button>
          <button className="topbar-button" type="button" onClick={openGoogleDriveLibrary} title="開啟 Google Drive 中的 Moodboard"><Cloud size={17} /><span>Drive</span></button>
          <button className="topbar-button" type="button" onClick={savePreferredBoard} title={authReady ? "優先儲存到 Google Drive" : "儲存到這台裝置"}><Save size={17} /><span>儲存</span></button>
          <button className="topbar-button" type="button" onClick={exportBrowserHtml} title="匯出可用一般瀏覽器開啟的唯讀 HTML"><FileCode2 size={17} /><span>瀏覽器版</span></button>
          <IconButton label="儲存到這台裝置" onClick={() => saveBoardFile(false)}><FileArchive size={18} /></IconButton>
        </div>

        <label className="board-title-field">
          <span className="sr-only">Infinite Moodboard 名稱</span>
          <input value={board.name} onChange={(event) => applyBoard((current) => ({ ...current, name: event.target.value }))} />
          <small>{topbarSaveState}</small>
        </label>

        <div className="topbar-secondary">
          <IconButton label="復原 ⌘Z" onClick={undo} disabled={!undoRef.current.length}><Undo2 size={18} /></IconButton>
          <IconButton label="重做 ⇧⌘Z" onClick={redo} disabled={!redoRef.current.length}><Redo2 size={18} /></IconButton>
          <button className="topbar-button" type="button" onClick={openVersionModal}><History size={17} /><span>版本</span></button>
          <button
            className="topbar-button collaboration-button"
            type="button"
            aria-label={authReady
              ? cloudCollaboration.roomId
                ? `協作，${Math.max(1, cloudCollaboration.peers.length)} 位成員在線`
                : `協作，${peers.length + 1} 個分頁在線`
              : "協作，需要登入"}
            onClick={() => requestAdvancedFeature("collaboration")}
          >
            <Users size={17} /><span>協作</span>{authReady && cloudCollaboration.roomId
              ? <b>{Math.max(1, cloudCollaboration.peers.length)}</b>
              : authReady && peers.length ? <b>{peers.length + 1}</b> : null}
          </button>
          <button
            className="account-menu-button"
            type="button"
            aria-label={authReady ? `帳號：${accountDisplayName(authSession.user)}` : "登入以使用進階功能"}
            title="帳號與隱私"
            onClick={openAccountSettings}
          >
            {authReady ? <AccountAvatar user={authSession.user} size={26} /> : <UserRound size={17} />}
            <span {...(authReady ? { "data-l10n-ignore": true } : {})}>{authReady ? accountDisplayName(authSession.user) : "登入"}</span>
          </button>
          <IconButton
            className="settings-button"
            label="設定"
            active={showSettings || showInterfaceThemes}
            aria-pressed={showSettings || showInterfaceThemes}
            onClick={openSettings}
          >
            <SettingsIcon size={18} />
          </IconButton>
          <IconButton
            className="desktop-panel-button"
            label={rightPanelVisible ? "隱藏物件屬性側欄" : "顯示物件屬性側欄"}
            active={rightPanelVisible}
            aria-pressed={rightPanelVisible}
            onClick={toggleRightPanel}
          >
            <PanelRight size={18} />
          </IconButton>
          <IconButton
            className="mobile-panel-button"
            label="開啟物件屬性側欄"
            active={mobilePanel === "right"}
            aria-pressed={mobilePanel === "right"}
            onClick={() => setMobilePanel((current) => current === "right" ? null : "right")}
          >
            <PanelRight size={18} />
          </IconButton>
          <MobileTopbarMoreMenu
            open={mobileTopbarMenuOpen}
            onOpenChange={setMobileTopbarMenuOpen}
            onOpenCollaboration={() => requestAdvancedFeature("collaboration")}
            onOpenAccount={openAccountSettings}
            onOpenSettings={openSettings}
            collaborationCount={authReady && cloudCollaboration.roomId
              ? Math.max(1, cloudCollaboration.peers.length)
              : authReady && peers.length ? peers.length + 1 : 0}
          />
        </div>
      </header>

      {focusMode || (!leftPanelVisible && !rightPanelVisible) ? (
        <button
          className={`workspace-chrome-restore ${focusMode ? "" : "is-panels-only"}`}
          type="button"
          onClick={focusMode ? restoreWorkspaceChrome : showBothPanels}
          title="顯示工作區面板（Esc）"
        >
          <PanelLeft size={17} /><span>顯示面板</span><kbd>Esc</kbd>
        </button>
      ) : null}

      <div
        className={`app-body ${effectiveLeftPanelVisible ? "" : "is-left-hidden"} ${effectiveRightPanelVisible ? "" : "is-right-hidden"} ${leftPanelResizing ? "is-resizing-left" : ""}`}
        style={{ "--panel-width": `${leftPanelWidth}px` }}
        aria-hidden={isBooting || undefined}
        inert={isBooting ? true : undefined}
      >
        <LeftSidebar
          board={board}
          selectedIds={selectedIds}
          onSelect={selectObject}
          onSelectGroup={selectGroup}
          onToggleVisible={toggleVisibility}
          onSetSelectedVisibility={setSelectedVisibility}
          onExportSelected={() => exportObjects("selected")}
          onOutputSelected={outputSelectionComposition}
          onDeleteSelected={deleteSelected}
          onUngroup={ungroupSelection}
          onDuplicateLayer={duplicateLayerObject}
          onDeleteLayer={deleteLayerObject}
          onMoveLayer={moveLayer}
          onReorderLayer={reorderLayer}
          onLocate={locateObject}
          layerTypeFilter={layerTypeFilter}
          setLayerTypeFilter={setLayerTypeFilter}
          leftTab={leftTab}
          setLeftTab={changeLeftTab}
          sourceAssets={sourceAssets}
          filters={filters}
          setFilters={setFilters}
          matchCount={filteredObjects.length}
          selectedCaptureId={selectedCaptureId}
          onCapture={captureCurrentView}
          onRestoreCapture={restoreCapture}
          onRestoreLastComposition={restoreLastComposition}
          onReplaceCapture={replaceCapture}
          onMoveCapture={moveCapture}
          onReorderCapture={reorderCapture}
          onDeleteCapture={deleteCapture}
          mobilePanel={mobilePanel}
          setMobilePanel={setMobilePanel}
          panelWidth={leftPanelWidth}
          panelMaxWidth={getLeftPanelMaxWidth()}
          onPanelResizeStart={onLeftPanelResizeStart}
          onPanelResizeKeyDown={onLeftPanelResizeKeyDown}
        />

        <section className="canvas-column">
          <div
            ref={canvasToolbarRef}
            className={`canvas-toolbar ${canvasToolbarPosition ? "has-custom-position" : ""} ${canvasToolbarDragging ? "is-dragging" : ""}`}
            style={canvasToolbarPosition ? {
              "--canvas-toolbar-x": `${canvasToolbarPosition.x}px`,
              "--canvas-toolbar-y": `${canvasToolbarPosition.y}px`,
            } : undefined}
            aria-label="畫布工具"
          >
            <button
              className="canvas-toolbar-drag-handle"
              type="button"
              aria-label="移動畫布工具列"
              title="拖曳移動；方向鍵微調；連按兩下或 Home 回到預設位置"
              onPointerDown={onCanvasToolbarDragStart}
              onDoubleClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                resetCanvasToolbarPosition();
              }}
              onKeyDown={onCanvasToolbarHandleKeyDown}
            >
              <GripVertical size={15} aria-hidden="true" />
            </button>
            <div className="tool-group">
              <IconButton label="選取工具 Shift+V；連按兩下顯示全部物件" active={tool === "select"} aria-pressed={tool === "select"} onClick={(event) => onPrimaryCanvasToolClick(event, "select")}><MousePointer2 size={18} /></IconButton>
              <IconButton label="平移工具 Shift+H（按住 Shift 可暫時選取）；連按兩下回到 100%" active={tool === "hand"} aria-pressed={tool === "hand"} onClick={(event) => onPrimaryCanvasToolClick(event, "hand")}><Hand size={18} /></IconButton>
              <IconButton
                label={authReady ? "進階 3D 旋轉工具 Shift+3（拖曳選取物件旋轉）" : "進階 3D 旋轉工具 Shift+3（需要登入）"}
                active={tool === "3d"}
                aria-pressed={tool === "3d"}
                disabled={!selectedIds.length}
                onClick={() => tool === "3d" ? setTool("select") : requestAdvancedFeature("3d")}
              >
                <Box size={18} />
              </IconButton>
            </div>
            <div className="tool-divider" />
            <InsertToolbar
              open={shapeMenuOpen}
              onToggle={() => setShapeMenuOpen((current) => !current)}
              onAddText={addTextObject}
              onAddShape={addShapeObject}
              onChooseImage={() => { setShapeMenuOpen(false); imageInputRef.current?.click(); }}
              onChooseVideo={() => { setShapeMenuOpen(false); videoInputRef.current?.click(); }}
              onChooseSvg={() => { setShapeMenuOpen(false); svgInputRef.current?.click(); }}
            />
            <IconButton label="建立 Grid" onClick={() => setShowGridBuilder(true)}><LayoutGrid size={18} /></IconButton>
            <div className="tool-divider" />
            <div className="zoom-group">
              <IconButton label="縮小" onClick={() => { const rect = canvasRef.current.getBoundingClientRect(); zoomAround(rect.left + rect.width / 2, rect.top + rect.height / 2, view.zoom / 1.2); }}><ZoomOut size={17} /></IconButton>
              <button
                className="zoom-value"
                type="button"
                aria-label={`縮放 ${Math.round(view.zoom * 100)}%；連按兩下切換顯示全部與 100%`}
                title="連按兩下切換顯示全部與 100%"
                onClick={onZoomValueClick}
                onKeyDown={onZoomValueKeyDown}
              >
                {Math.round(view.zoom * 100)}%
              </button>
              <IconButton label="放大" onClick={() => { const rect = canvasRef.current.getBoundingClientRect(); zoomAround(rect.left + rect.width / 2, rect.top + rect.height / 2, view.zoom * 1.2); }}><ZoomIn size={17} /></IconButton>
            </div>
          </div>

          <div
            ref={canvasRef}
            className={`canvas-viewport canvas-background-${canvasBackground.mode} ${dragActive ? "is-drag-active" : ""} ${tool === "hand" || spaceDown ? "uses-hand" : ""} ${tool === "3d" ? "uses-3d" : ""} ${rotationGesture ? "is-rotating" : ""} ${micro3DGesture ? "is-3d-rotating" : ""} ${modifierDown ? "can-temporary-select" : ""} ${loadedTextFlow ? "is-text-flow-loaded" : ""}`}
            onPointerDown={onCanvasPointerDown}
            onDoubleClick={onCanvasDoubleClick}
            onWheel={onWheel}
            onDragEnter={(event) => { event.preventDefault(); setDragActive(true); }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => { if (event.target === event.currentTarget) setDragActive(false); }}
            onDrop={onDrop}
          >
            {!inspectionActive ? (
              <WorkspaceRulers
                rulersVisible={rulersVisible}
                guidesVisible={guidesVisible}
                guides={board.guides || []}
                draggingGuide={guideDrag}
                view={view}
                viewportSize={canvasViewportSize}
                unit={rulerUnit}
                onUnitChange={changeRulerUnit}
                onStartGuide={startGuideDrag}
                onDeleteGuide={deleteGuide}
              />
            ) : null}
            <div
              className={`world-layer ${inspectionActive ? "is-filter-muted" : ""}`}
              style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})` }}
              aria-hidden={inspectionActive}
            >
              <div className="world-origin" />
              {board.objects.filter((object) => object.visible).map((object) => (
                <CanvasObject
                  key={object.id}
                  object={object}
                  selected={selectedIds.includes(object.id)}
                  soleSelected={soleSelectedId === object.id}
                  multiSelected={selectedIds.length > 1 && selectedIds.includes(object.id)}
                  keyObject={selectedIds.length > 1 && resolvedKeyObjectId === object.id}
                  selectionEnabled={tool !== "hand" || modifierDown}
                  inverseZoom={1 / view.zoom}
                  onPointerDown={onObjectPointerDown}
                  onPointerUp={onObjectPointerUp}
                  onDoubleClick={onObjectDoubleClick}
                  onRotateStart={onRotateStart}
                  onResizeStart={onResizeStart}
                  onRestoreSize={restoreSize}
                  onResetRotation={resetRotation}
                  micro3DMode={tool === "3d"}
                  micro3DGesture={micro3DGesture}
                  onMicro3DRotateStart={onMicro3DRotateStart}
                  onResetMicro3D={resetSelectedMicro3D}
                  onVideoControlsChange={setVideoControlsVisible}
                  onSelect={selectObject}
                  resizeGesture={resizeGesture}
                  editingText={editingText}
                  textFrameGesture={textFrameGesture}
                  onStartTextEdit={startTextEdit}
                  onTextChange={updateInlineText}
                  onFinishTextEdit={finishTextEdit}
                  onTextFrameResizeStart={onTextFrameResizeStart}
                  onAutoFitTextFrame={autoFitTextFrame}
                  onLoadTextOverflow={loadTextOverflow}
                  textFlowLoaded={loadedTextFlow?.sourceId === object.id}
                />
              ))}
              {multiSelectionBounds ? (
                <SelectionGroupOverlay
                  bounds={multiSelectionBounds}
                  anchorKey={selectionAnchor}
                  inverseZoom={1 / view.zoom}
                  gesture={groupGesture}
                  onRotateStart={onGroupRotateStart}
                  onResizeStart={onGroupResizeStart}
                  micro3DMode={tool === "3d"}
                  micro3DGesture={micro3DGesture}
                  onMicro3DRotateStart={onMicro3DRotateStart}
                  onResetMicro3D={resetSelectedMicro3D}
                  semanticLabel={selectionSemanticLabel}
                />
              ) : null}
            </div>

            {showSelectionActions ? (
              <SelectionActionBar
                count={selectedObjects.length}
                hasArtboard={selectionHasArtboard}
                grouped={selectionGrouped}
                onAddArtboard={addArtboardBehindSelection}
                onAddAnnotation={() => setShowAnnotationBuilder(true)}
                onGrid={() => setShowGridBuilder(true)}
                onToggleGroup={toggleSelectionGroup}
                onDuplicate={duplicateSelected}
                onDelete={deleteSelected}
                style={selectionActionStyle}
              />
            ) : null}

            {marquee ? <div className="selection-marquee" style={marquee} aria-hidden="true" /> : null}

            {loadedTextFlow ? (
              <div className="text-flow-placement-status" role="status">
                <span className="text-flow-cursor-symbol" aria-hidden="true"><Type size={13} /><Plus size={9} /></span>
                <span><strong>已載入溢出文字</strong><small>在空白畫布點一下建立連結文字框 · Esc 取消</small></span>
              </div>
            ) : null}

            {!board.objects.length && !inspectionActive ? (
              <div className="canvas-empty">
                <div className="empty-visual" aria-hidden="true"><span /><span /><span /></div>
                <h1>把靈感放到一個沒有邊界的地方。</h1>
                <p>加入文字與基本形狀，或從桌面拖入圖片、影片與 SVG；也可以按 ⌘V 貼上。</p>
                <button className="primary-button" type="button" onClick={() => imageInputRef.current?.click()}><ImagePlus size={18} /> 加入第一張圖片</button>
                <small>素材只會留在你的瀏覽器與你主動儲存的檔案中。</small>
              </div>
            ) : null}

            {leftTab === "sources" ? <SourceStage sourceAssets={sourceAssets} /> : null}

            {filtersActive && leftTab !== "sources" ? (
              <FilterStage objects={filteredObjects} selectedIds={selectedIds} onSelect={selectObject} onClear={() => setFilters(DEFAULT_FILTERS)} filters={filters} />
            ) : null}

            {dragActive ? <div className="drop-overlay"><ImagePlus size={34} /><strong>放開以加入圖片、影片或 SVG</strong><span>原始檔不會上傳到伺服器</span></div> : null}

            <div className="canvas-status">
              <span>{`${board.objects.length} 個物件`}</span>
              <span title="目前 Moodboard 內容版本">內容 r{board.revision}</span>
              <span>{saveState}</span>
              <span className="app-version" aria-label={`Infinite Moodboard 應用程式版本 ${APP_VERSION}`} title={`Infinite Moodboard ${APP_VERSION_LABEL}`}>{APP_VERSION_LABEL}</span>
            </div>

            <div className="export-dock" role="toolbar" aria-label="匯出與合成輸出">
              <div className="export-dock-group" role="group" aria-label="匯出個別素材">
                <label>
                  <span className="sr-only">匯出範圍</span>
                  <select value={exportScope} onChange={(event) => setExportScope(event.target.value)} aria-label="匯出範圍">
                    <option value="selected">選取的物件</option>
                    <option value="unselected">未選取的物件</option>
                    <option value="all">全部物件</option>
                  </select>
                </label>
                <button type="button" onClick={exportObjects} disabled={!exportCount || isExporting || isRenderingComposition} title="每個物件各自匯出一個素材檔">
                  <Download size={16} /> {isExporting ? "匯出中…" : `匯出素材 ${exportCount ? `(${exportCount})` : ""}`}
                </button>
              </div>
              <span className="export-dock-divider" aria-hidden="true" />
              <div className="export-dock-group composition-output-group" role="group" aria-label="輸出選取物件合成圖">
                <label>
                  <span className="sr-only">合成圖格式</span>
                  <select value={compositionFormat} onChange={(event) => setCompositionFormat(event.target.value)} aria-label="合成圖格式" disabled={isRenderingComposition}>
                    <option value="png">PNG</option>
                    <option value="webp">WebP</option>
                    <option value="avif">AVIF</option>
                    <option value="pdf">PDF</option>
                  </select>
                </label>
                <label>
                  <span className="sr-only">合成圖解析度</span>
                  <select className="composition-scale-select" value={compositionScale} onChange={(event) => setCompositionScale(Number(event.target.value))} aria-label="合成圖解析度" disabled={isRenderingComposition}>
                    <option value="1">1×</option>
                    <option value="2">2×</option>
                  </select>
                </label>
                <button
                  className="composition-output-button"
                  type="button"
                  onClick={outputSelectionComposition}
                  disabled={!compositionCount || isExporting || isRenderingComposition}
                  title={compositionCount ? "依目前位置、尺寸、旋轉與 3D 外觀輸出成一張檔案；不含操作框。點陣圖保留透明背景，PDF 使用深色畫布背景。" : "請先選取要合成輸出的物件"}
                >
                  <ImageDown size={16} /> {isRenderingComposition ? "輸出中…" : `輸出合成圖 ${compositionCount ? `(${compositionCount})` : ""}`}
                </button>
              </div>
            </div>
          </div>
        </section>

        <Inspector
          board={board}
          selectedIds={selectedIds}
          onUpdateObject={updateObject}
          onPivotChange={changePivot}
          onRestoreSize={restoreSize}
          onResetRotation={resetRotation}
          onSetAspectLock={setSelectedAspectLock}
          onMicro3DChange={updateSelectedMicro3D}
          micro3DMode={tool === "3d"}
          onMicro3DModeChange={(active) => active ? requestAdvancedFeature("3d") : setTool("select")}
          markerDraft={markerDraft}
          setMarkerDraft={setMarkerDraft}
          onAddMarker={addMarker}
          onRemoveMarker={removeMarker}
          batchPrefix={batchPrefix}
          setBatchPrefix={setBatchPrefix}
          onBatchRename={batchRename}
          selectionAnchor={selectionAnchor}
          onSelectionAnchorChange={setSelectionAnchor}
          keyObjectId={resolvedKeyObjectId}
          onAlign={alignSelected}
          onDistribute={distributeSelected}
          resizeGesture={resizeGesture}
          groupGesture={groupGesture}
          localFontOptions={localFontOptions}
          localFontState={localFontState}
          onLoadLocalFonts={loadLocalFonts}
          onStartTextEdit={startTextEdit}
          onResizeTextFrame={resizeTextFrame}
          onFitArtboard={fitArtboardToContents}
          onResizeArtboardPreset={resizeArtboardPreset}
          selectionGrouped={selectionGrouped}
          onToggleGroup={toggleSelectionGroup}
          mobilePanel={mobilePanel}
          setMobilePanel={setMobilePanel}
        />
      </div>

      {mobilePanel ? <button className="mobile-scrim" type="button" aria-label="關閉面板" onClick={() => setMobilePanel(null)} /> : null}
      {!updateNoticeDismissed && !showSettings ? (
        <AppUpdateNotice
          updateCheck={updateCheck}
          updateAction={updateAction}
          autoUpdateEnabled={updatePreference === "auto"}
          onEnableAutoUpdate={() => setAppAutoUpdate(true)}
          onUpdateNow={() => applyAppUpdate()}
          onSnooze={snoozeCurrentAppUpdate}
        />
      ) : null}
      {toast ? <div className={`toast toast-${toast.tone}`} role="status">{toast.tone === "success" ? <Check size={16} /> : toast.tone === "error" ? <AlertTriangle size={16} /> : null}<span>{toast.message}</span></div> : null}

      {escapeCancellationRequest ? (
        <EscapeCancellationModal
          request={escapeCancellationRequest}
          onKeep={keepEscapeAdjustment}
          onCancel={cancelEscapeAdjustment}
        />
      ) : null}

      {pendingObjectDeletion ? (
        <DeleteCompositionWarningModal
          request={pendingObjectDeletion}
          onCancel={cancelPendingObjectDeletion}
          onConfirm={confirmPendingObjectDeletion}
        />
      ) : null}

      {showGridBuilder ? (
        <GridModal selectedCount={selectedObjects.filter((object) => !isArtboardObject(object)).length} onApply={applyGrid} onClose={() => setShowGridBuilder(false)} />
      ) : null}

      {showAnnotationBuilder ? (
        <AnnotationModal targetCount={selectedObjects.length} onApply={applyAnnotation} onClose={() => setShowAnnotationBuilder(false)} />
      ) : null}

      {showSettings ? (
        <SettingsModal
          activeTheme={activeTheme}
          accountLinkBusy={authBusy}
          accountLinkMessage={accountLinkMessage}
          accountReceipt={authReceipt}
          accountSignedIn={identitySignedIn}
          accountUser={authSession.user}
          canvasBackground={canvasBackground}
          currentDriveLink={currentDriveLink}
          driveCurrentContentBytes={currentDriveContentBytes}
          driveSession={driveSession}
          driveSettings={driveSettings}
          localLibrarySummary={localLibrarySummary}
          enableProviderTesting={providerTestMode}
          initialSection={settingsInitialSection}
          locale={interfaceLocale}
          mode={activeThemeMode}
          typography={interfaceTypography}
          updateCheck={updateCheck}
          updateAction={updateAction}
          autoUpdateEnabled={updatePreference === "auto"}
          leftPanelVisible={leftPanelVisible}
          rightPanelVisible={rightPanelVisible}
          rulersVisible={rulersVisible}
          guidesVisible={guidesVisible}
          rulerUnit={rulerUnit}
          onSetMode={setInterfaceMode}
          onSetCanvasBackground={setCanvasBackgroundMode}
          onSetLocale={(nextLocale) => setInterfaceLocale(normalizeInterfaceLocale(nextLocale))}
          onSetTypography={updateInterfaceTypography}
          onResetTypography={resetInterfaceTypography}
          onCheckForUpdates={checkForAppUpdates}
          onSetAutoUpdate={setAppAutoUpdate}
          onUpdateNow={() => applyAppUpdate()}
          onSnoozeUpdate={snoozeCurrentAppUpdate}
          onConnectDrive={connectGoogleDrive}
          onDisconnectDrive={disconnectGoogleDrive}
          onManageThemes={openInterfaceThemes}
          onMarketingPreferenceChange={updateMoodboardMarketingPreference}
          onLinkEmail={linkEmailToMoodboardAccount}
          onLinkFacebook={linkFacebookToMoodboardAccount}
          onLinkGoogle={linkGoogleToMoodboardAccount}
          onSignInRequest={() => {
            setShowSettings(false);
            requestAdvancedFeature("account");
          }}
          onSignOut={signOutOfMoodboard}
          onClearLocalData={() => {
            setShowSettings(false);
            setShowDeleteLocalData(true);
          }}
          onToggleLeftPanel={toggleLeftPanel}
          onToggleRightPanel={toggleRightPanel}
          onToggleRulers={toggleRulers}
          onToggleGuides={toggleGuides}
          onSetRulerUnit={changeRulerUnit}
          onOpenShortcuts={() => {
            setShowSettings(false);
            setShowShortcuts(true);
          }}
          onOpenDriveLibrary={() => {
            setShowSettings(false);
            openGoogleDriveLibrary();
          }}
          onSaveDrive={() => saveBoardToGoogleDrive()}
          onSetDriveAutoSync={setDriveAutoSync}
          onClose={() => setShowSettings(false)}
        />
      ) : null}

      {pendingAdvancedFeature ? (
        <AuthGate
          feature={pendingAdvancedFeature}
          session={authSession}
          locale={interfaceLocale}
          online={online}
          busy={authBusy}
          errorMessage={authMessage}
          emailLinkFlow={emailLinkFlow}
          onSetLocale={(nextLocale) => setInterfaceLocale(normalizeInterfaceLocale(nextLocale))}
          onGoogleSignIn={signInToMoodboard}
          onSendEmailLink={sendEmailLinkToMoodboard}
          onCompleteEmailLink={completeEmailLinkToMoodboard}
          onAccept={acceptMoodboardAccess}
          onSignOut={signOutOfMoodboard}
          onRetry={() => setAuthRetryKey((value) => value + 1)}
          onClose={closeAdvancedFeatureGate}
        />
      ) : null}

      {showDeleteLocalData ? (
        <DeleteLocalDataModal
          isBusy={isClearingLocalData}
          onCancel={() => !isClearingLocalData && setShowDeleteLocalData(false)}
          onConfirm={clearMoodboardFromThisDevice}
        />
      ) : null}

      {showInterfaceThemes ? (
        <InterfaceThemeModal
          themes={availableThemes}
          activeTheme={activeTheme}
          previewTheme={previewTheme}
          locale={interfaceLocale}
          onPreview={setPreviewTheme}
          onConfirm={confirmInterfaceTheme}
          onSave={saveCustomInterfaceTheme}
          onDelete={deleteCustomInterfaceTheme}
          onImport={() => themeInputRef.current?.click()}
          onExport={exportInterfaceTheme}
          onClose={closeInterfaceThemes}
        />
      ) : null}

      {showVersions ? (
        <VersionModal
          versions={versions}
          board={board}
          versionLabel={versionLabel}
          setVersionLabel={setVersionLabel}
          driveVersions={driveVersions}
          driveLinked={Boolean(currentDriveLink)}
          onCreate={createManualVersion}
          onRestore={restoreVersion}
          onRefreshDrive={refreshDriveVersions}
          onRecoverDrive={(revision) => recoverGoogleDriveVersionAsCopy({ id: currentDriveLink?.fileId, name: currentDriveLink?.name }, revision)}
          onClose={() => setShowVersions(false)}
          isBusy={versionBusy}
        />
      ) : null}
      {showShortcuts ? <ShortcutReferenceModal onClose={() => setShowShortcuts(false)} /> : null}
      {showDriveLibrary ? (
        <DriveLibraryModal
          board={board}
          currentContentBytes={currentDriveContentBytes}
          currentLink={currentDriveLink}
          driveSession={driveSession}
          driveSettings={driveSettings}
          localBoards={localBoards}
          syncJobs={syncJobs}
          onConnect={connectGoogleDrive}
          onCreateLocal={createLocalMoodboard}
          onDisconnect={disconnectGoogleDrive}
          onOpenLocal={openLocalMoodboard}
          onOpenFile={openGoogleDriveFile}
          onRecoverRemote={(file) => recoverGoogleDriveVersionAsCopy(file)}
          onRefresh={() => refreshGoogleDrive()}
          onSave={() => saveBoardToGoogleDrive()}
          onSaveCopy={() => saveBoardToGoogleDrive({ asCopy: true })}
          onSetAutoSync={setDriveAutoSync}
          onClose={() => setShowDriveLibrary(false)}
        />
      ) : null}
      {showCollaboration ? (
        <CollaborationModal
          sessionName={sessionName}
          setSessionName={setSessionName}
          peerCount={peers.length}
          driveConnected={driveSession.connected}
          driveLinked={Boolean(currentDriveLink)}
          cloud={cloudCollaboration}
          initialInvite={initialCollaborationInviteRef.current}
          resumeAvailable={Boolean(collaborationResume?.roomId && collaborationResume.boardId === board.id)}
          onCreateRoom={startCloudCollaboration}
          onJoinRoom={joinCloudCollaboration}
          onResumeRoom={resumeCloudCollaboration}
          onCopyInvite={copyCloudCollaborationInvite}
          onLeaveRoom={leaveCloudCollaboration}
          onOpenDrive={() => {
            setShowCollaboration(false);
            openGoogleDriveLibrary();
          }}
          onClose={() => setShowCollaboration(false)}
        />
      ) : null}
      {preparedDownloads.length ? (
        <ExportDownloadModal
          downloads={preparedDownloads}
          canPickDirectory={canUseDirectoryPicker}
          isExporting={isExporting}
          onExportDirectory={exportPreparedToDirectory}
          onClose={closePreparedDownloads}
        />
      ) : null}

      <input ref={imageInputRef} className="sr-only" type="file" accept="image/*" multiple onChange={onMediaInput} />
      <input ref={videoInputRef} className="sr-only" type="file" accept="video/*" multiple onChange={onMediaInput} />
      <input ref={svgInputRef} className="sr-only" type="file" accept=".svg,image/svg+xml" multiple onChange={onSvgInput} />
      <input ref={boardInputRef} className="sr-only" type="file" accept=".moodboard,.json,application/json" onChange={(event) => { const [file] = event.target.files || []; if (file) importBoardFile(file); event.target.value = ""; }} />
      <input ref={themeInputRef} className="sr-only" type="file" accept=".moodtheme,.json,application/json" onChange={(event) => { const [file] = event.target.files || []; if (file) importInterfaceThemeFile(file); event.target.value = ""; }} />
    </main>
  );
}

const rootElement = document.getElementById("root");
const moodboardRoot = rootElement.__moodboardRoot || createRoot(rootElement);
rootElement.__moodboardRoot = moodboardRoot;
moodboardRoot.render(<App />);
