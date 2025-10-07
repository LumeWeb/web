import { core_dashboard__loadShare__react__loadShare__, jsxRuntimeExports, core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__ } from './jsx-runtime-D_0QkpWj.js';
import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__ } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__-CFuxgGnQ.js';
import { core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__ } from './core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__-DOYraqnS.js';
import { Card } from './Card-Dhqiz4WT.js';
import { Manager, DEFAULT_AVATAR_CONFIG, createLargeFilePlugin, XHRUpload, createSmallFilePlugin } from './Manager-BotPTYRU.js';
import { UploadStatus } from './upload-Cr_MDl4Y.js';
import { UploadProgress, Dropzone, useDropzoneContext, Upload, Check } from './Dropzone-PZtk_gpk.js';
import './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__-BjauFvDm.js';
import { createLucideIcon } from './createLucideIcon-BcyKBqCx.js';
import { format } from './format-CT9KiSuR.js';

/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$1 = [
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M3 10h18", key: "8toen8" }]
];
const Calendar = createLucideIcon("calendar", __iconNode$1);

/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode = [
  [
    "path",
    {
      d: "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z",
      key: "1tc9qg"
    }
  ],
  ["circle", { cx: "12", cy: "13", r: "3", key: "1vg3eu" }]
];
const Camera = createLucideIcon("camera", __iconNode);

const UploadManagerContext = core_dashboard__loadShare__react__loadShare__.createContext(
  null
);
function UploadManagerProvider({
  children,
  defaultConfig
}) {
  const uploadManagerRef = core_dashboard__loadShare__react__loadShare__.useRef(null);
  const config = defaultConfig;
  const getUploadManager = (newConfig) => {
    if (!uploadManagerRef.current) {
      uploadManagerRef.current = new Manager(
        config || newConfig || { type: "main" }
      );
    }
    return uploadManagerRef.current;
  };
  const resetUploadManager = () => {
    if (uploadManagerRef.current) {
      uploadManagerRef.current.reset();
      uploadManagerRef.current = null;
    }
  };
  const contextValue = {
    getUploadManager,
    resetUploadManager
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(UploadManagerContext.Provider, { value: contextValue, children });
}
function useUploadManagerContext() {
  const context = core_dashboard__loadShare__react__loadShare__.useContext(UploadManagerContext);
  if (!context) {
    throw new Error(
      "useUploadManagerContext must be used within an UploadManagerProvider"
    );
  }
  return context;
}

function AvatarUploadInner({
  currentAvatar,
  onSuccess,
  userName
}) {
  const { getUploadManager } = useUploadManagerContext();
  const { open } = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useNotification();
  const apiUrl = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.useApiUrl();
  const [preview, setPreview] = core_dashboard__loadShare__react__loadShare__.useState(currentAvatar || null);
  const [uploadProgress, setUploadProgress] = core_dashboard__loadShare__react__loadShare__.useState(0);
  const [uploadStatus, setUploadStatus] = core_dashboard__loadShare__react__loadShare__.useState(
    UploadStatus.IDLE
  );
  const uploadManager = getUploadManager({
    type: "avatar"
  });
  const serviceId = "avatar-upload";
  core_dashboard__loadShare__react__loadShare__.useEffect(() => {
    const services = uploadManager.getServices();
    const isServiceRegistered = services.some(
      (service) => service.id === serviceId
    );
    if (!isServiceRegistered) {
      const apiDomain = new URL(apiUrl).hostname;
      const apiProto = new URL(apiUrl).protocol;
      const endpoint = `${apiProto}//account.${apiDomain}/api/account/avatar`;
      const avatarServiceConfig = {
        id: serviceId,
        name: "Avatar Upload",
        smallFilePlugin: createSmallFilePlugin(
          {
            endpoint,
            getResponseData() {
              return JSON.stringify({
                url: currentAvatar
              });
            }
          },
          serviceId,
          XHRUpload
        ),
        largeFilePlugin: createLargeFilePlugin(
          {
            endpoint
          },
          serviceId,
          XHRUpload
        )
      };
      uploadManager.registerService(avatarServiceConfig);
    }
  }, [apiUrl]);
  core_dashboard__loadShare__react__loadShare__.useEffect(() => {
    const unsubscribeProgress = uploadManager.on("upload-progress", () => {
      setUploadProgress(uploadManager.getUploadProgress());
      setUploadStatus(uploadManager.getUploadStatus());
    });
    const unsubscribeComplete = uploadManager.on("complete", (result) => {
      if (result.successful.length > 0) {
        setUploadStatus(uploadManager.getUploadStatus());
        open?.({
          message: "Profile Updated",
          description: "Your profile picture has been updated successfully",
          type: "success"
        });
        onSuccess();
      }
      uploadManager.clearFiles();
    });
    const unsubscribeError = uploadManager.on("error", () => {
      setUploadStatus(uploadManager.getUploadStatus());
      open?.({
        message: "Upload Error",
        description: "Failed to upload profile picture. Please try again.",
        type: "error"
      });
    });
    return () => {
      unsubscribeProgress();
      unsubscribeComplete();
      unsubscribeError();
    };
  }, [onSuccess, uploadManager]);
  core_dashboard__loadShare__react__loadShare__.useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);
  const handleFilesChange = (files) => {
    if (files.length > 0) {
      const file = files[0];
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    } else {
      setPreview(currentAvatar || null);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Avatar, { className: "h-20 w-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.AvatarImage, { alt: userName, src: preview || currentAvatar }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.AvatarFallback, { children: userName?.charAt(0) || "?" })
    ] }) }),
    [UploadStatus.PENDING, UploadStatus.UPLOADING, UploadStatus.PREPROCESSING].includes(uploadStatus) ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      UploadProgress,
      {
        progress: uploadProgress,
        status: uploadStatus,
        variant: "avatar"
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dropzone,
      {
        allowedFileTypes: ["image/*"],
        maxNumberOfFiles: 1,
        multiple: false,
        showFileList: false,
        uploadManager,
        onFilesChange: handleFilesChange,
        serviceId,
        renderDropZone: () => /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarUploadDropzone, {})
      }
    )
  ] });
}
function AvatarUploadDropzone({ disabled = false, multiple = false }) {
  const {
    containerRef,
    fileInputRef,
    handleFileButtonClick,
    handleFileInput
  } = useDropzoneContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "aria-label": "Upload profile picture. Press Enter, Space, or click to choose a file, or drag and drop an image.",
      className: "border-muted hover:border-muted/50 rounded-lg border-2 border-dashed p-8 text-center transition-colors",
      onClick: handleFileButtonClick,
      onKeyDown: (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleFileButtonClick(e);
        }
      },
      ref: containerRef,
      role: "button",
      tabIndex: 0,
      children: [
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "text-muted-foreground mx-auto mb-4 h-8 w-8" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground mb-2", children: "Drag and drop your image here" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mb-4 text-sm", children: "or" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, { className: "bg-secondary text-foreground hover:bg-secondary/60", children: "Choose File" })
      ]
    }
  );
}
function AvatarUpload({
  currentAvatar,
  onSuccess,
  userName
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(UploadManagerProvider, { defaultConfig: DEFAULT_AVATAR_CONFIG, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    AvatarUploadInner,
    {
      currentAvatar,
      onSuccess,
      userName
    }
  ) });
}

function uploadAvatarDialogConfig(userName, currentAvatar, onSuccess) {
  return {
    content: /* @__PURE__ */ jsxRuntimeExports.jsx(
      AvatarUpload,
      {
        currentAvatar,
        onSuccess,
        userName
      }
    ),
    title: "Update Profile Picture",
    type: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.DialogTypes.CUSTOM
  };
}

function Bio() {
  const { data: identity, refetch } = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useGetIdentity();
  const { avatarUrl, displayName } = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.useAvatar();
  const { closeDialog, openDialog } = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.useDialog();
  if (!identity) {
    return null;
  }
  const handleAvatarUpdate = () => {
    refetch?.();
    closeDialog();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Avatar, { className: "h-24 w-24", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.AvatarImage, { alt: displayName, src: avatarUrl }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.AvatarFallback, { className: "bg-primary text-primary-foreground text-2xl", children: identity.firstName?.charAt(0) || identity.lastName?.charAt(0) || "?" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button,
        {
          className: "absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0",
          onClick: () => openDialog(
            uploadAvatarDialogConfig(
              displayName,
              avatarUrl,
              handleAvatarUpdate
            )
          ),
          size: "sm",
          variant: "secondary",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-4 w-4" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-foreground text-lg font-semibold", children: displayName }),
      identity.verified && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-success flex h-5 w-5 items-center justify-center rounded-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "text-success-foreground h-3 w-3" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground mt-4 flex w-full flex-col gap-2 text-sm", children: identity.created_at && (() => {
      try {
        const createdDate = new Date(identity.created_at);
        if (isNaN(createdDate.getTime())) return null;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Account created ",
            format(createdDate, "MMMM yyyy")
          ] })
        ] });
      } catch {
        return null;
      }
    })() })
  ] }) });
}

export { Bio as default };
