import { jsxRuntimeExports, core_dashboard__loadShare__react__loadShare__, React } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__-D-EDec9Y.js';
import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__ } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__-BRPNVk8X.js';
import { isFolderBundle, FileStatus, UploadStatus } from './upload-Cr_MDl4Y.js';
import { createLucideIcon } from './createLucideIcon-a23Vw1TY.js';
import { Video, Music } from './video-BECdvTwc.js';

/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$7 = [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]];
const Check = createLucideIcon("check", __iconNode$7);

/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$6 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }],
  ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }]
];
const CircleAlert = createLucideIcon("circle-alert", __iconNode$6);

/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$5 = [
  [
    "path",
    {
      d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
      key: "1oefj6"
    }
  ],
  ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }],
  ["path", { d: "M10 9H8", key: "b1mrlr" }],
  ["path", { d: "M16 13H8", key: "t4e002" }],
  ["path", { d: "M16 17H8", key: "z1uh3a" }]
];
const FileText = createLucideIcon("file-text", __iconNode$5);

/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$4 = [
  [
    "path",
    {
      d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
      key: "1oefj6"
    }
  ],
  ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }]
];
const File = createLucideIcon("file", __iconNode$4);

/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$3 = [
  [
    "path",
    {
      d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
      key: "1kt360"
    }
  ]
];
const Folder = createLucideIcon("folder", __iconNode$3);

/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$2 = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2", key: "1m3agn" }],
  ["circle", { cx: "9", cy: "9", r: "2", key: "af1f0g" }],
  ["path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21", key: "1xmnt7" }]
];
const Image = createLucideIcon("image", __iconNode$2);

/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$1 = [
  ["path", { d: "M12 3v12", key: "1x0j5s" }],
  ["path", { d: "m17 8-5-5-5 5", key: "7q97r8" }],
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }]
];
const Upload = createLucideIcon("upload", __iconNode$1);

/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode = [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
];
const X = createLucideIcon("x", __iconNode);

function getDisplayName(file) {
  if (file.data.webkitRelativePath) {
    return file.data.webkitRelativePath;
  }
  if (isFolderBundle(file)) {
    const meta = file.meta;
    return meta.bundleName;
  }
  return file.name;
}
function getDisplaySize(file) {
  return file.size;
}

const si = {
  radix: 1e3,
  unit: ["b", "kb", "Mb", "Gb", "Tb", "Pb", "Eb", "Zb", "Yb"]
};
const iec = {
  radix: 1024,
  unit: ["b", "Kib", "Mib", "Gib", "Tib", "Pib", "Eib", "Zib", "Yib"]
};
const jedec = {
  radix: 1024,
  unit: ["b", "Kb", "Mb", "Gb", "Tb", "Pb", "Eb", "Zb", "Yb"]
};
const SPECS = {
  si,
  iec,
  jedec
};
function filesize(bytes, fixed = 1, spec = "jedec") {
  let _bytes = Math.abs(bytes);
  const { radix, unit } = SPECS[spec];
  let loop = 0;
  while (_bytes >= radix) {
    _bytes /= radix;
    ++loop;
  }
  return `${_bytes.toFixed(fixed)} ${unit[loop]}`;
}

function FileItem({
  alwaysShowRemoveButton = false,
  disabled = false,
  file,
  fileItemClassName = "",
  hideStatusIndicators = false,
  onRemove
}) {
  const fileStatus = getFileStatus(file);
  const hasRemoveCallback = !!onRemove;
  const shouldShowBasedOnStatus = alwaysShowRemoveButton || fileStatus === FileStatus.PENDING;
  const shouldShowRemoveButton = hasRemoveCallback && shouldShowBasedOnStatus;
  const getFileIcon = (type) => {
    if (type === "folder") return /* @__PURE__ */ jsxRuntimeExports.jsx(Folder, { className: "h-4 w-4" });
    if (type.startsWith("image/")) return /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "h-4 w-4" });
    if (type.startsWith("video/")) return /* @__PURE__ */ jsxRuntimeExports.jsx(Video, { className: "h-4 w-4" });
    if (type.startsWith("audio/")) return /* @__PURE__ */ jsxRuntimeExports.jsx(Music, { className: "h-4 w-4" });
    if (type.includes("text") || type.includes("document"))
      return /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(File, { className: "h-4 w-4" });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `bg-muted flex items-center gap-3 rounded-lg p-3 ${fileItemClassName}`,
      children: [
        file.preview ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10", children: file.type.startsWith("image/") ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            alt: "",
            className: "h-10 w-10 rounded object-cover",
            src: file.preview
          }
        ) : file.type.startsWith("video/") ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "video",
          {
            className: "h-10 w-10 rounded object-cover",
            src: file.preview
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-primary/10 flex h-10 w-10 items-center justify-center rounded", children: getFileIcon(file.type) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-primary/10 flex h-10 w-10 items-center justify-center rounded", children: getFileIcon(file.type) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate font-medium", children: getDisplayName(file) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground text-sm", children: isFolderBundle(file) ? `Folder • ${filesize(getDisplaySize(file))}` : filesize(getDisplaySize(file)) }),
          !hideStatusIndicators && fileStatus !== FileStatus.PENDING && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Badge, { variant: getBadgeVariant(fileStatus), children: [
                fileStatus === FileStatus.PREPROCESSING && "Processing...",
                fileStatus === FileStatus.UPLOADING && (isFolderBundle(file) ? "Processing folder..." : "Uploading..."),
                fileStatus === FileStatus.COMPLETE && "Complete",
                fileStatus === FileStatus.ERROR && (file.error || "Error")
              ] }),
              fileStatus !== FileStatus.COMPLETE && (file.progress?.percentage !== void 0 || fileStatus === FileStatus.PREPROCESSING && file.progress?.preprocess?.value !== void 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                Math.round(
                  fileStatus === FileStatus.PREPROCESSING ? file.progress?.preprocess?.value || 0 : file.progress?.percentage || 0
                ),
                "%"
              ] })
            ] }),
            fileStatus !== FileStatus.COMPLETE && (file.progress?.percentage !== void 0 || fileStatus === FileStatus.PREPROCESSING && file.progress?.preprocess?.value !== void 0) && /* @__PURE__ */ jsxRuntimeExports.jsx(
              core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Progress,
              {
                className: "mt-1 h-1",
                value: fileStatus === FileStatus.PREPROCESSING ? file.progress?.preprocess?.value || 0 : file.progress?.percentage || 0
              }
            )
          ] })
        ] }),
        shouldShowRemoveButton && /* @__PURE__ */ jsxRuntimeExports.jsx(
          core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button,
          {
            disabled,
            onClick: () => onRemove(file.id),
            size: "sm",
            variant: "ghost",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
          }
        )
      ]
    },
    file.id
  );
}
function getBadgeVariant(status) {
  switch (status) {
    case FileStatus.COMPLETE:
      return "default";
    case FileStatus.ERROR:
      return "destructive";
    default:
      return "secondary";
  }
}
function getFileStatus(file) {
  if (file.error) {
    return FileStatus.ERROR;
  }
  if (file.progress?.uploadComplete) {
    return FileStatus.COMPLETE;
  }
  if (file.progress?.uploadStarted) {
    return FileStatus.UPLOADING;
  }
  if (file.progress?.preprocess) {
    return FileStatus.PREPROCESSING;
  }
  return FileStatus.PENDING;
}

function UploadProgress({
  className,
  description,
  fileCount = 0,
  files,
  progress,
  serviceName,
  showCheckmark = true,
  status,
  title,
  variant = "avatar"
}) {
  const commonProps = {
    className,
    progress,
    status
  };
  switch (variant) {
    case "avatar":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarProgressLayout, { ...commonProps, showCheckmark });
    case "wizard":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        WizardProgressLayout,
        {
          ...commonProps,
          description,
          fileCount,
          files,
          serviceName,
          title
        }
      );
    default:
      return /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarProgressLayout, { ...commonProps, showCheckmark });
  }
}
function AvatarProgressLayout({
  className,
  progress,
  showCheckmark = true,
  status
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn("space-y-4", className), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      SharedProgressBar,
      {
        height: "h-2",
        percentagePosition: "both",
        progress,
        showPercentage: true,
        status
      }
    ) }),
    showCheckmark && status === UploadStatus.COMPLETED && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "text-success h-5 w-5" }),
    status === UploadStatus.ERROR && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "text-destructive h-5 w-5" }),
    status === UploadStatus.IDLE && /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "text-muted-foreground h-5 w-5" })
  ] }) });
}
function ProgressIcon({
  animate = false,
  className,
  progress,
  status
}) {
  const getIcon = () => {
    switch (status) {
      case UploadStatus.COMPLETED:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "text-success h-8 w-8" });
      case UploadStatus.ERROR:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "text-destructive h-8 w-8" });
      case UploadStatus.UPLOADING:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "text-primary h-8 w-8" });
      case UploadStatus.IDLE:
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "text-muted-foreground h-8 w-8" });
    }
  };
  const icon = getIcon();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn(
        "flex items-center justify-center",
        animate && status === UploadStatus.UPLOADING && "animate-bounce",
        className
      ),
      children: icon
    }
  );
}
function ProgressText({
  className,
  progress,
  showPercentage = true,
  status,
  text
}) {
  const getStatusText = () => {
    switch (status) {
      case UploadStatus.COMPLETED:
        return text || "Upload complete";
      case UploadStatus.ERROR:
        return text || "Upload failed";
      case UploadStatus.IDLE:
        return text || "Ready to upload";
      case UploadStatus.UPLOADING:
        return text || `${showPercentage ? `${Math.round(progress)}% ` : ""}uploading...`;
      default:
        return text || "Ready to upload";
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "p",
    {
      className: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn(
        "text-sm",
        status === UploadStatus.ERROR ? "text-destructive" : "text-muted-foreground",
        className
      ),
      children: getStatusText()
    }
  );
}
function SharedProgressBar({
  animate = false,
  className,
  height = "h-2",
  percentagePosition = "right",
  progress,
  showPercentage = false,
  status
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn("w-full", className), children: [
    showPercentage && (percentagePosition === "left" || percentagePosition === "both") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ProgressText,
        {
          progress,
          showPercentage: false,
          status
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "span",
        {
          className: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn(
            "text-sm",
            status === UploadStatus.ERROR ? "text-destructive" : "text-muted-foreground"
          ),
          children: [
            Math.round(progress),
            "%"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-muted w-full overflow-hidden rounded-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn(
          "rounded-full transition-all duration-1000",
          height,
          status === UploadStatus.ERROR ? "bg-destructive" : status === UploadStatus.COMPLETED ? "bg-success" : "bg-primary",
          animate && status === UploadStatus.UPLOADING && "animate-pulse"
        ),
        style: { width: `${progress}%` }
      }
    ) }),
    showPercentage && percentagePosition === "right" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "span",
      {
        className: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn(
          "text-sm",
          status === UploadStatus.ERROR ? "text-destructive" : "text-muted-foreground"
        ),
        children: [
          Math.round(progress),
          "%"
        ]
      }
    ) })
  ] });
}
function WizardProgressLayout({
  className,
  description,
  fileCount = 0,
  files = [],
  progress,
  serviceName,
  status,
  title
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn("space-y-6", className), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-4 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ProgressIcon, { animate: true, progress, status }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-lg font-semibold", children: title || "Processing Your Files" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mb-4", children: description || (fileCount > 0 && serviceName ? `Uploading ${fileCount} file(s) to ${serviceName}` : "Uploading files...") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SharedProgressBar,
        {
          animate: true,
          height: "h-2",
          progress,
          status
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ProgressText,
        {
          className: "mt-2",
          progress,
          showPercentage: true,
          status
        }
      )
    ] }),
    files.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium", children: "Files in Progress" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-60 space-y-2 overflow-y-auto", children: files.map((file) => /* @__PURE__ */ jsxRuntimeExports.jsx(FileItem, { file }, file.id)) })
    ] })
  ] }) });
}

const DropzoneContext = core_dashboard__loadShare__react__loadShare__.createContext(null);
function DropzoneProvider({ children, config }) {
  const [isDragOver, setIsDragOver] = core_dashboard__loadShare__react__loadShare__.useState(false);
  const containerRef = core_dashboard__loadShare__react__loadShare__.useRef(null);
  const fileInputRef = core_dashboard__loadShare__react__loadShare__.useRef(null);
  const directoryInputRef = core_dashboard__loadShare__react__loadShare__.useRef(null);
  const {
    multiple = true,
    onDragLeave,
    onDragOver,
    onDrop,
    uploadManager
  } = config;
  if (!uploadManager) {
    throw new Error("uploadManager is required in DropzoneConfig");
  }
  const getFiles = core_dashboard__loadShare__react__loadShare__.useCallback(() => {
    return uploadManager.getFiles();
  }, [uploadManager]);
  const addFiles = core_dashboard__loadShare__react__loadShare__.useCallback(
    (newFiles) => {
      newFiles.forEach((file) => {
        uploadManager.addFile(file, config.serviceId);
      });
    },
    [config.serviceId, uploadManager]
  );
  const removeFile = core_dashboard__loadShare__react__loadShare__.useCallback(
    (id) => {
      uploadManager.removeFile(id);
    },
    [uploadManager]
  );
  const handleFileInput = core_dashboard__loadShare__react__loadShare__.useCallback(
    (e) => {
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files);
        if (multiple || selectedFiles.length === 1) {
          addFiles(selectedFiles);
        } else if (selectedFiles.length > 1) {
          addFiles([selectedFiles[0]]);
        }
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [addFiles, multiple]
  );
  const handleDirectoryInput = core_dashboard__loadShare__react__loadShare__.useCallback(
    (e) => {
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files);
        addFiles(selectedFiles);
        if (directoryInputRef.current) {
          directoryInputRef.current.value = "";
        }
      }
    },
    [addFiles]
  );
  const handleFileButtonClick = core_dashboard__loadShare__react__loadShare__.useCallback(
    (e) => {
      e.stopPropagation();
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    },
    []
  );
  const handleDirectoryButtonClick = core_dashboard__loadShare__react__loadShare__.useCallback(
    (e) => {
      e.stopPropagation();
      if (directoryInputRef.current) {
        directoryInputRef.current.click();
      }
    },
    []
  );
  const handleDragOver = core_dashboard__loadShare__react__loadShare__.useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
      onDragOver?.(e);
    },
    [onDragOver]
  );
  const handleDragLeave = core_dashboard__loadShare__react__loadShare__.useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      onDragLeave?.(e);
    },
    [onDragLeave]
  );
  const handleDrop = core_dashboard__loadShare__react__loadShare__.useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (e.dataTransfer?.files) {
        const droppedFiles = Array.from(e.dataTransfer.files);
        addFiles(droppedFiles);
      }
      onDrop?.(e);
    },
    [addFiles, onDrop]
  );
  const setupDragAndDropListeners = core_dashboard__loadShare__react__loadShare__.useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("dragover", handleDragOver);
    container.addEventListener("dragleave", handleDragLeave);
    container.addEventListener("drop", handleDrop);
    return () => {
      container.removeEventListener("dragover", handleDragOver);
      container.removeEventListener("dragleave", handleDragLeave);
      container.removeEventListener("drop", handleDrop);
    };
  }, [handleDragOver, handleDragLeave, handleDrop]);
  React.useEffect(() => {
    setupDragAndDropListeners();
  }, [setupDragAndDropListeners]);
  const contextValue = {
    containerRef,
    fileInputRef,
    directoryInputRef,
    getFiles,
    handleFileButtonClick,
    handleFileInput,
    handleDirectoryButtonClick,
    handleDirectoryInput,
    isDragOver,
    removeFile,
    uploading: uploadManager.getUploadStatus() === UploadStatus.UPLOADING,
    uploadManager
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DropzoneContext.Provider, { value: contextValue, children });
}
function useDropzoneContext() {
  const context = core_dashboard__loadShare__react__loadShare__.useContext(DropzoneContext);
  if (!context) {
    throw new Error(
      "useDropzoneContext must be used within a DropzoneProvider"
    );
  }
  return context;
}

function Dropzone(props) {
  const config = {
    allowedFileTypes: props.allowedFileTypes,
    allowFolders: props.allowFolders,
    maxFileSize: props.maxFileSize,
    maxNumberOfFiles: props.maxNumberOfFiles,
    multiple: props.multiple,
    onDragLeave: props.onDragLeave,
    onDragOver: props.onDragOver,
    onDrop: props.onDrop,
    onValidationError: props.onValidationError,
    serviceId: props.serviceId,
    uploadManager: props.uploadManager
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DropzoneProvider, { config, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DropzoneContent, { ...props }) });
}
function DropzoneContent({
  allowFolders = false,
  alwaysShowRemoveButton = false,
  disabled = false,
  dragLeaveClassName = "border-border hover:border-primary/50",
  dragOverClassName = "border-primary bg-primary/5",
  dropZoneClassName = "",
  fileItemClassName = "",
  fileListHeader,
  hideStatusIndicators = false,
  multiple = true,
  onFileRemove,
  onFilesChange,
  onUploadComplete,
  onUploadStart,
  renderDropZone,
  renderFileItem,
  showDropZone = true,
  showFileList = true
}) {
  const {
    containerRef,
    fileInputRef,
    directoryInputRef,
    getFiles,
    handleFileButtonClick,
    handleFileInput,
    handleDirectoryButtonClick,
    handleDirectoryInput,
    isDragOver,
    removeFile: removeFileInternal,
    uploading,
    uploadManager
  } = useDropzoneContext();
  const [forceUpdate, setForceUpdate] = core_dashboard__loadShare__react__loadShare__.useState(0);
  const files = getFiles();
  const handleRemoveFile = (id) => {
    removeFileInternal(id);
    onFileRemove?.(id);
    onFilesChange?.(getFiles().map((f) => f.data));
  };
  core_dashboard__loadShare__react__loadShare__.useEffect(() => {
    if (uploading && files.length > 0) {
      onUploadStart?.();
    }
  }, [uploading, files.length, onUploadStart]);
  core_dashboard__loadShare__react__loadShare__.useEffect(() => {
    if (!uploading && files.length > 0 && files.every((f) => f.status === UploadStatus.COMPLETED)) {
      onUploadComplete?.();
    }
  }, [uploading, files, onUploadComplete]);
  core_dashboard__loadShare__react__loadShare__.useEffect(() => {
    if (!uploadManager) return;
    const forceUpdateCallback = () => {
      setForceUpdate((prev) => prev + 1);
    };
    const handleFilesChange = () => {
      onFilesChange?.(getFiles().map((f) => f.data));
    };
    const cleanupFileAdded = uploadManager.on(
      "file-added",
      forceUpdateCallback
    );
    const cleanupFileRemoved = uploadManager.on(
      "file-removed",
      forceUpdateCallback
    );
    const cleanupUploadProgress = uploadManager.on(
      "upload-progress",
      forceUpdateCallback
    );
    const cleanupComplete = uploadManager.on("complete", forceUpdateCallback);
    const cleanupError = uploadManager.on("error", forceUpdateCallback);
    const cleanupFilesAdded = uploadManager.on(
      "files-added",
      handleFilesChange
    );
    const cleanupPreprocessProgress = uploadManager.on(
      "preprocess-progress",
      () => {
        forceUpdateCallback();
      }
    );
    const cleanupPreprocessComplete = uploadManager.on(
      "preprocess-complete",
      () => {
        forceUpdateCallback();
      }
    );
    return () => {
      cleanupFileAdded();
      cleanupFileRemoved();
      cleanupUploadProgress();
      cleanupComplete();
      cleanupError();
      cleanupPreprocessProgress();
      cleanupPreprocessComplete();
      cleanupFilesAdded();
    };
  }, [uploadManager, onFilesChange]);
  const defaultRenderDropZone = (isDragOver2, handleFileButtonClick2, handleDirectoryButtonClick2) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "aria-disabled": disabled,
        className: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn(
          "dropzone-container rounded-lg border-2 border-dashed p-8 text-center transition-colors",
          dropZoneClassName,
          isDragOver2 ? dragOverClassName : dragLeaveClassName,
          disabled ? "cursor-not-allowed opacity-50" : ""
        ),
        ref: containerRef,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "text-muted-foreground mx-auto mb-4 h-12 w-12" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-lg font-semibold", children: "Drop files here" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mb-4", children: "or click to browse your files" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              className: "hidden",
              disabled,
              id: "file-upload-input",
              multiple,
              onChange: handleFileInput,
              ref: fileInputRef,
              type: "file"
            }
          ),
          allowFolders && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              className: "hidden",
              disabled,
              id: "directory-upload-input",
              multiple,
              onChange: handleDirectoryInput,
              ref: directoryInputRef,
              type: "file",
              webkitdirectory: "",
              directory: ""
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 sm:flex-row sm:justify-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button,
              {
                disabled,
                onClick: handleFileButtonClick2,
                type: "button",
                children: "Upload Files"
              }
            ),
            allowFolders && /* @__PURE__ */ jsxRuntimeExports.jsx(
              core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button,
              {
                disabled,
                onClick: handleDirectoryButtonClick2,
                type: "button",
                variant: "secondary",
                children: "Upload Directory"
              }
            )
          ] })
        ]
      }
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Card, { className: "border-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.CardContent, { className: "space-y-4", children: [
    showDropZone && (renderDropZone ? renderDropZone(
      isDragOver,
      handleFileButtonClick,
      handleDirectoryButtonClick,
      {
        containerRef,
        directoryInputRef,
        disabled,
        dragLeaveClassName,
        dragOverClassName,
        dropZoneClassName,
        fileInputRef,
        multiple
      }
    ) : defaultRenderDropZone(
      isDragOver,
      handleFileButtonClick,
      handleDirectoryButtonClick
    )),
    showFileList && files.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      fileListHeader || /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "font-semibold", children: [
        "Selected Files (",
        files.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-60 space-y-2 overflow-y-auto", children: files.map(
        (file) => renderFileItem ? renderFileItem(file, handleRemoveFile, {
          disabled,
          fileItemClassName
        }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          FileItem,
          {
            alwaysShowRemoveButton,
            disabled,
            file,
            fileItemClassName,
            hideStatusIndicators,
            onRemove: handleRemoveFile
          },
          file.id
        )
      ) })
    ] })
  ] }) });
}

export { Check, Dropzone, FileText, Folder, Upload, UploadProgress, filesize, useDropzoneContext };
