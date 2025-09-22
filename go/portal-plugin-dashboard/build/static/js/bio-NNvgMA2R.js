import { core_dashboard__loadShare__react__loadShare__, core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__, jsxRuntimeExports } from './jsx-runtime-D_0QkpWj.js';
import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__ } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__-CFuxgGnQ.js';
import { core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__ } from './core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__-DOYraqnS.js';
import { Card } from './Card-Dhqiz4WT.js';
import { Uppy, XHRUpload } from './index-BJRwIKY-.js';
import { Dropzone, UploadProgress, Check } from './UploadProgress-DV-AG4es.js';
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

const ENDPOINT = "/api/account/avatar";
function AvatarUpload({
  currentAvatar,
  onSuccess,
  userName
}) {
  const [uploading, setUploading] = core_dashboard__loadShare__react__loadShare__.useState(false);
  const [uploadProgress, setUploadProgress] = core_dashboard__loadShare__react__loadShare__.useState(0);
  const [previewUrl, setPreviewUrl] = core_dashboard__loadShare__react__loadShare__.useState(null);
  const { open } = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useNotification();
  const successTimerRef = core_dashboard__loadShare__react__loadShare__.useRef(null);
  const apiUrl = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.useApiUrl();
  const apiDomain = new URL(apiUrl).hostname;
  const apiProto = new URL(apiUrl).protocol;
  const uppyRef = core_dashboard__loadShare__react__loadShare__.useRef(null);
  const avatarUploadManager = {
    addFile: (file) => {
      if (uppyRef.current) {
        try {
          uppyRef.current.addFile({
            data: file,
            name: file.name,
            type: file.type
          });
        } catch (err) {
          console.error("Error adding file to Uppy:", err);
          throw err;
        }
      }
    },
    getFiles: () => {
      if (uppyRef.current) {
        return uppyRef.current.getFiles();
      }
      return [];
    },
    removeFile: (id) => {
      if (uppyRef.current) {
        uppyRef.current.removeFile(id);
      }
    },
    start: () => {
      if (uppyRef.current) {
        return uppyRef.current.upload();
      }
    }
  };
  const resetState = () => {
    if (uppyRef.current) {
      uppyRef.current.clear();
    }
    if (previewUrl) {
      try {
        URL.revokeObjectURL(previewUrl);
      } catch {
      }
    }
    setPreviewUrl(null);
    setUploadProgress(0);
  };
  core_dashboard__loadShare__react__loadShare__.useEffect(() => {
    return () => {
      if (previewUrl) {
        try {
          URL.revokeObjectURL(previewUrl);
        } catch {
        }
      }
    };
  }, [previewUrl]);
  core_dashboard__loadShare__react__loadShare__.useEffect(() => {
    uppyRef.current = new Uppy({
      autoProceed: true,
      restrictions: {
        allowedFileTypes: [
          "image/png",
          "image/jpeg",
          "image/webp",
          "image/gif"
        ],
        maxFileSize: 5 * 1024 * 1024,
        // 5MB
        maxNumberOfFiles: 1
      }
    }).use(XHRUpload, {
      endpoint: `${apiProto}//account.${apiDomain}${ENDPOINT}`,
      fieldName: "file",
      formData: true,
      method: "POST",
      responseType: "json",
      timeout: 3e4,
      withCredentials: true
    });
    return () => {
      if (successTimerRef.current !== null) {
        clearTimeout(successTimerRef.current);
        successTimerRef.current = null;
      }
      if (uppyRef.current) {
        uppyRef.current.destroy();
      }
    };
  }, [apiDomain, apiProto, apiUrl]);
  core_dashboard__loadShare__react__loadShare__.useEffect(() => {
    if (!uppyRef.current) return;
    const handleFileAdded = (file) => {
      setUploading(true);
      const url = URL.createObjectURL(file.data);
      setPreviewUrl(url);
    };
    const handleUploadProgress = (file, progress) => {
      const percentage = progress.bytesTotal > 0 ? progress.bytesUploaded / progress.bytesTotal * 100 : 0;
      setUploadProgress(percentage);
    };
    const handleUploadSuccess = async (file, response) => {
      try {
        setUploadProgress(100);
        successTimerRef.current = window.setTimeout(() => {
          setUploading(false);
          resetState();
          onSuccess();
          open?.({
            description: "Your profile picture has been updated successfully",
            message: "Profile Updated",
            type: "success"
          });
        }, 500);
      } catch (err) {
        console.error("Upload success handler error:", err);
        setUploading(false);
        resetState();
        open?.({
          description: "Failed to process profile picture. Please try again.",
          message: "Processing Error",
          type: "error"
        });
      }
    };
    const handleUploadError = (file, err) => {
      console.error("Upload error:", err);
      setUploading(false);
      setUploadProgress(0);
      resetState();
      open?.({
        description: err.message || "An error occurred while uploading your profile picture",
        message: "Upload Failed",
        type: "error"
      });
    };
    const handleRestrictionFailed = (file, err) => {
      resetState();
      open?.({
        description: "The selected file is invalid: " + err.message,
        message: "Invalid File",
        type: "error"
      });
    };
    uppyRef.current.on("file-added", handleFileAdded);
    uppyRef.current.on("upload-progress", handleUploadProgress);
    uppyRef.current.on("upload-success", handleUploadSuccess);
    uppyRef.current.on("upload-error", handleUploadError);
    uppyRef.current.on("restriction-failed", handleRestrictionFailed);
    return () => {
      if (uppyRef.current) {
        uppyRef.current.off("file-added", handleFileAdded);
        uppyRef.current.off("upload-progress", handleUploadProgress);
        uppyRef.current.off("upload-success", handleUploadSuccess);
        uppyRef.current.off("upload-error", handleUploadError);
        uppyRef.current.off("restriction-failed", handleRestrictionFailed);
      }
    };
  }, [onSuccess, open]);
  const renderAvatarDropZone = (isDragOver, handleFileButtonClick) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: `flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors ${isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"} cursor-pointer`,
        onClick: handleFileButtonClick,
        onKeyDown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleFileButtonClick(e);
          }
        },
        role: "button",
        tabIndex: 0,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground mb-2 flex h-8 w-8 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "svg",
            {
              className: "h-6 w-6",
              fill: "none",
              stroke: "currentColor",
              viewBox: "0 0 24 24",
              xmlns: "http://www.w3.org/2000/svg",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "path",
                {
                  d: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2
                }
              )
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Drop your avatar image here or click to browse" })
        ]
      }
    );
  };
  const AvatarDisplay = () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Avatar, { className: "h-20 w-20", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.AvatarImage,
      {
        alt: userName || "User avatar",
        src: previewUrl || currentAvatar
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.AvatarFallback, { className: "bg-primary text-primary-foreground text-xl", children: userName?.trim().charAt(0)?.toUpperCase() || "?" })
  ] }) });
  const AvatarUploadProgress = () => /* @__PURE__ */ jsxRuntimeExports.jsx(UploadProgress, { progress: uploadProgress, variant: "avatar" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarDisplay, {}),
    !uploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dropzone,
      {
        allowedFileTypes: [
          "image/png",
          "image/jpeg",
          "image/webp",
          "image/gif"
        ],
        autoProceed: true,
        fieldName: "file",
        maxFileSize: 5 * 1024 * 1024,
        maxNumberOfFiles: 1,
        multiple: false,
        renderDropZone: renderAvatarDropZone,
        showFileList: false,
        timeout: 3e4,
        uploadEndpoint: `${apiProto}//account.${apiDomain}${ENDPOINT}`,
        uploadManager: avatarUploadManager,
        userName,
        withCredentials: true
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarUploadProgress, {})
  ] });
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
    type: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.DialogType.CUSTOM
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
