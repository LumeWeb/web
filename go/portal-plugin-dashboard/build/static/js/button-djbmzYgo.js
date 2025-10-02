import { jsxRuntimeExports, core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__, core_dashboard__loadShare__react__loadShare__ } from './jsx-runtime-D_0QkpWj.js';
import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__ } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__-CFuxgGnQ.js';
import { UploadStatus, isFolderBundle } from './upload-Cr_MDl4Y.js';
import { core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__ } from './core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__-DOYraqnS.js';
import { z } from './index-DESmQ-Cl.js';
import { Dropzone, FileText, Check, Folder, filesize, UploadProgress, Upload } from './Dropzone-PZtk_gpk.js';
import { createLucideIcon } from './createLucideIcon-BcyKBqCx.js';
import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__ } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__-BjauFvDm.js';

/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$3 = [
  ["path", { d: "M3 3v16a2 2 0 0 0 2 2h16", key: "c24i48" }],
  ["path", { d: "M18 17V9", key: "2bz60n" }],
  ["path", { d: "M13 17V5", key: "1frdt8" }],
  ["path", { d: "M8 17v-3", key: "17ska0" }]
];
const ChartColumn = createLucideIcon("chart-column", __iconNode$3);

/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$2 = [
  ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }]
];
const Copy = createLucideIcon("copy", __iconNode$2);

/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$1 = [
  ["ellipse", { cx: "12", cy: "5", rx: "9", ry: "3", key: "msslwz" }],
  ["path", { d: "M3 5V19A9 3 0 0 0 21 19V5", key: "1wlel7" }],
  ["path", { d: "M3 12A9 3 0 0 0 21 12", key: "mv7ke4" }]
];
const Database = createLucideIcon("database", __iconNode$1);

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
      d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",
      key: "1nclc0"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
];
const Eye = createLucideIcon("eye", __iconNode);

function FileUploadZone({
  allowFolders,
  alwaysShowRemoveButton,
  disabled,
  hideStatusIndicators,
  onFilesChange,
  serviceId,
  uploadManager
}) {
  const hideStatusIndicatorsDefault = hideStatusIndicators ?? true;
  const alwaysShowRemoveButtonDefault = alwaysShowRemoveButton ?? true;
  const allowFoldersDefault = allowFolders ?? false;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Dropzone,
    {
      allowFolders: allowFoldersDefault,
      alwaysShowRemoveButton: alwaysShowRemoveButtonDefault,
      disabled,
      hideStatusIndicators: hideStatusIndicatorsDefault,
      onFilesChange,
      serviceId,
      showFileList: true,
      uploadManager
    }
  );
}

const storageSchema = z.object({
  storage: z.string().min(1)
});
const noServicesStorageSchema = z.object({
  storage: z.string().optional()
});
const filesSchema = z.object({
  files: z.array(z.instanceof(File)).min(1, "Please select at least one file")
});
z.object({
  files: z.array(z.instanceof(File)).optional(),
  storage: z.string().optional()
});
const completeSchema = z.object({
  fileIds: z.array(z.string()).optional(),
  files: z.array(z.instanceof(File)).min(1),
  storage: z.string().min(1)
});
const StorageInfoDisplay = ({ service }) => {
  if (!service) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-muted mt-4 rounded-lg p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-background rounded-lg p-2", children: service.icon && /* @__PURE__ */ jsxRuntimeExports.jsx(service.icon, { className: "h-5 w-5" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-card-foreground font-semibold", children: service.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: service.description })
    ] })
  ] }) });
};
const StorageSelectionComponent = ({
  services
}) => {
  const formContext = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.useFormContext();
  const selectedService = formContext.formInstance.watch("storage");
  const handleServiceSelect = (serviceId) => {
    formContext.formInstance.setValue("storage", serviceId);
  };
  if (!services || services.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-destructive/10 text-destructive mx-auto flex h-16 w-16 items-center justify-center rounded-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Database, { className: "h-8 w-8" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-foreground mt-4 text-lg font-semibold", children: "No Storage Services Available" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-2", children: "Please contact support or try again later" })
    ] });
  }
  const currentService = selectedService && services.find((s) => s.id === selectedService) || services[0];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 justify-items-center gap-4 sm:grid-cols-2 lg:grid-cols-3", children: services.map((service) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn(
          "relative h-32 w-32 cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 hover:scale-105 hover:shadow-md",
          selectedService === service.id ? "border-primary bg-primary/5 shadow-lg" : "border-muted hover:border-primary/50"
        ),
        onClick: () => handleServiceSelect(service.id),
        onKeyDown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleServiceSelect(service.id);
          }
        },
        role: "button",
        tabIndex: 0,
        children: [
          selectedService === service.id && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-primary absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "text-primary-foreground h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full flex-col items-center justify-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn(
                  "rounded-lg p-2",
                  selectedService === service.id ? "text-primary" : "text-muted-foreground"
                ),
                children: service.icon && /* @__PURE__ */ jsxRuntimeExports.jsx(service.icon, { className: "h-8 w-8" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn(
                  "text-center text-sm font-medium",
                  selectedService === service.id ? "text-primary" : "text-foreground"
                ),
                children: service.name
              }
            )
          ] })
        ]
      },
      service.id
    )) }),
    currentService && /* @__PURE__ */ jsxRuntimeExports.jsx(StorageInfoDisplay, { service: currentService })
  ] });
};
const ReviewComponent = ({
  service,
  uploadManager
}) => {
  const uppyFiles = uploadManager?.getFiles() || [];
  const fileCount = uppyFiles.length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted flex items-center gap-3 rounded-lg p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-background rounded-lg p-2", children: service.icon && /* @__PURE__ */ jsxRuntimeExports.jsx(service.icon, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold", children: [
          "Storage Method: ",
          service.name
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: service.description })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "mb-2 font-medium", children: [
        "Files to Upload (",
        fileCount,
        ")"
      ] }),
      fileCount > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-40 space-y-2 overflow-y-auto", children: uppyFiles.map((file, index) => {
        const isBundle = isFolderBundle(file);
        const displayName = isBundle ? file.meta?.bundleName : file.name;
        const displaySize = file.size;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "bg-muted flex items-center gap-3 rounded p-2",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-primary/10 flex h-8 w-8 items-center justify-center rounded", children: isBundle ? /* @__PURE__ */ jsxRuntimeExports.jsx(Folder, { className: "text-primary h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "text-primary h-4 w-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-sm font-medium", children: displayName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs", children: filesize(displaySize) })
              ] })
            ]
          },
          index
        );
      }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground py-4 text-center", children: "No files selected" })
    ] })
  ] });
};
const createUploadErrorNotification = (open, error) => {
  const message = error instanceof Error ? error.message : typeof error === "string" ? error : "An unknown upload error occurred";
  open?.({
    description: message,
    message: "Upload Error",
    type: "error"
  });
};
const ProgressComponent = ({
  forceRerender,
  retryCount,
  service,
  uploadManager
}) => {
  const uppyFiles = uploadManager?.getFiles() || [];
  const fileCount = uppyFiles.length;
  const progress = uploadManager?.getUploadProgress() || 0;
  const status = uploadManager?.getUploadStatus() || "idle";
  const { open } = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useNotification();
  core_dashboard__loadShare__react__loadShare__.useEffect(() => {
    const handleProgress = () => {
      forceRerender?.();
    };
    const cleanupProgress = uploadManager?.on(
      "upload-progress",
      handleProgress
    );
    const handleError = (error) => {
      createUploadErrorNotification(open, error);
      forceRerender?.();
    };
    const cleanupError = uploadManager?.on("error", handleError);
    const cleanupUploadError = uploadManager?.on("upload-error", handleError);
    return () => {
      if (cleanupProgress) cleanupProgress();
      if (cleanupError) cleanupError();
      if (cleanupUploadError) cleanupUploadError();
    };
  }, [uploadManager, open, retryCount, forceRerender]);
  core_dashboard__loadShare__react__loadShare__.useEffect(() => {
    const errors = uploadManager?.getUploadErrors?.();
    if (errors && errors.length > 0) {
      errors.forEach((error) => {
        if (error) {
          createUploadErrorNotification(open, error);
        }
      });
      forceRerender?.();
    }
  }, [uploadManager, open, retryCount, forceRerender]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    UploadProgress,
    {
      description: `Uploading ${fileCount} file(s) to ${service.name} (will be queued for processing)`,
      fileCount,
      files: uppyFiles,
      progress,
      serviceName: service.name,
      status,
      title: "Processing Your Files",
      variant: "wizard"
    }
  );
};
const UploadedFileItem = ({
  fileData,
  serviceName
}) => {
  const cid = fileData.meta?.cid;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted space-y-2 rounded-lg p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "text-primary h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-sm font-medium", children: fileData.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-xs", children: [
          filesize(fileData.size),
          " • Queued in ",
          serviceName
        ] })
      ] })
    ] }),
    cid && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 pl-11 pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground flex-1 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "CID:" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pl-11", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "bg-background flex-1 break-all rounded px-2 py-1 font-mono text-xs", children: cid }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn(
              "border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md border p-2"
            ),
            onClick: () => navigator.clipboard.writeText(cid),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3 w-3" })
          }
        )
      ] })
    ] })
  ] });
};
const CompleteComponent = ({
  service,
  uploadManager
}) => {
  const uploadedFiles = uploadManager?.getUploadedFiles() || [];
  const fileCount = uploadedFiles.length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-8 w-8 text-green-600" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-lg font-semibold", children: "Files Uploaded and Queued" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
        fileCount,
        " ",
        fileCount === 1 ? "file" : "files",
        " have been uploaded and queued for processing in ",
        service.name,
        ". Processing may take some time to complete."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium", children: "Uploaded Files" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-48 space-y-2 overflow-y-auto", children: uploadedFiles.map((fileData, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        UploadedFileItem,
        {
          fileData,
          serviceName: service.name
        },
        index
      )) })
    ] })
  ] });
};
function uploadWizardForm(services, uploadFeature) {
  const uploadManager = uploadFeature?.getManager();
  const hasServices = services && services.length > 0;
  const { forceRerender, forceRerenderCallback } = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.createForceRerenderReceiver();
  const { environmentSync, environmentSyncCallback } = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.createEnvironmentReceiver();
  uploadManager.clearFiles();
  let isNavigating = false;
  let pendingNavigation = null;
  const eventListeners = /* @__PURE__ */ new Map();
  const cleanupEventListeners = (uploadManager2) => {
    if (uploadManager2 && eventListeners.has(uploadManager2)) {
      const listeners2 = eventListeners.get(uploadManager2);
      Object.values(listeners2 || {}).forEach((cleanup) => {
        if (cleanup) cleanup();
      });
      eventListeners.delete(uploadManager2);
    }
  };
  cleanupEventListeners(uploadManager);
  const eventsToListen = [
    { handler: forceRerender, name: "error" },
    { handler: forceRerender, name: "upload-error" },
    {
      handler: () => {
        if (!isNavigating) {
          const env = environmentSync();
          if (env?.step?.jumpTo) {
            env.step.jumpTo(5);
          }
        } else {
          pendingNavigation = {
            fromStep: 0,
            toStep: 5,
            type: "jumpTo"
          };
        }
        forceRerender?.();
      },
      name: "complete"
    }
  ];
  const listeners = {};
  eventsToListen.forEach((event) => {
    listeners[event.name] = uploadManager?.on(event.name, event.handler);
  });
  if (uploadManager) {
    eventListeners.set(uploadManager, listeners);
  }
  const stepDefinitions = [
    {
      description: "Select where you want to store your files",
      fields: [
        {
          component: () => /* @__PURE__ */ jsxRuntimeExports.jsx(StorageSelectionComponent, { services }),
          name: "storage",
          required: hasServices,
          // Only required when services are available
          type: "custom"
        }
      ],
      icon: Database,
      shortTitle: "Method",
      submitLabel: "Next",
      title: "Choose Storage Method",
      validationSchema: hasServices ? storageSchema : noServicesStorageSchema
      // Use appropriate schema
    },
    {
      description: "Choose files or folders you want to upload",
      fields: [
        {
          component: (data) => {
            const service = services.find((s) => s.id === data.storage) || services[0];
            return /* @__PURE__ */ jsxRuntimeExports.jsx(StorageInfoDisplay, { service });
          },
          name: "storageInfo",
          type: "custom"
        },
        {
          component: (props) => {
            const { formMethods } = props;
            core_dashboard__loadShare__react__loadShare__.useEffect(() => {
              if (uploadManager?.setUIDropTarget) {
                const dropzoneElement = document.querySelector(
                  ".dropzone-container"
                );
                if (dropzoneElement) {
                  uploadManager.setUIDropTarget(
                    dropzoneElement,
                    formMethods.getValues().storage
                  );
                }
              }
              formMethods.setValue(
                "files",
                uploadManager?.getFiles().map((f) => f.data)
              );
              return () => {
                if (uploadManager?.clearUIDropTarget) {
                  uploadManager.clearUIDropTarget();
                }
              };
            }, [formMethods]);
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              FileUploadZone,
              {
                allowFolders: true,
                disabled: false,
                onFilesChange: async (files) => {
                  formMethods.setValue("files", files);
                },
                serviceId: formMethods.getValues().storage,
                uploadManager
              }
            );
          },
          label: "Files or Folders",
          name: "files",
          required: true,
          type: "custom"
        }
      ],
      icon: FileText,
      shortTitle: "Files",
      submitLabel: "Next",
      title: "Select Files or Folders",
      validationSchema: filesSchema
    },
    {
      description: "Review your upload settings",
      fields: [
        {
          component: (data) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            ReviewComponent,
            {
              files: data.files,
              service: services.find((s) => s.id === data.storage) || services[0],
              uploadManager
            }
          ),
          name: "review",
          type: "custom"
        }
      ],
      icon: Eye,
      onStepSubmit: async () => {
        uploadManager.start();
      },
      shortTitle: "Review",
      submitLabel: "Start Upload",
      title: "Review"
    },
    {
      actionButtons: ({ environment }) => {
        const status = uploadManager?.getUploadStatus();
        const { back, cancel, retry } = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.createActionHelpers();
        if ([UploadStatus.PENDING, UploadStatus.UPLOADING].includes(status)) {
          return [
            cancel(() => {
              return uploadManager?.cancelAll();
            }, "Cancel")
          ];
        }
        if (status === UploadStatus.ERROR) {
          return [
            back(() => {
              return environment?.step?.onPrevious();
            }, "Back"),
            retry(async () => {
              uploadManager?.clearErrors();
              return environment?.step?.onRetry?.();
            }),
            cancel(() => {
              return uploadManager?.cancelAll();
            }, "Cancel")
          ];
        }
        return void 0;
      },
      // Disable navigation during upload - this step-level config will take precedence over wizard-level
      allowStepNavigation: (data) => {
        const status = uploadManager?.getUploadStatus();
        return status !== UploadStatus.UPLOADING;
      },
      description: "Uploading your files",
      fields: [
        {
          component: ({ stepEnvironment, value: data }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            ProgressComponent,
            {
              forceRerender,
              retryCount: stepEnvironment?.retryCount,
              service: services.find((s) => s.id === data?.storage) || services[0],
              uploadManager
            }
          ),
          name: "progress",
          type: "custom"
        }
      ],
      icon: ChartColumn,
      onRetryStep: async () => {
        return uploadManager.start();
      },
      onStepSubmit: async () => {
        uploadManager.start();
      },
      shortTitle: "Upload",
      submitLabel: "Start Upload",
      title: "Upload"
    },
    {
      actionButtons: ({ environment }) => {
        const { button } = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.createActionHelpers();
        return [
          button(() => {
            uploadManager.clearFiles();
            environment?.container?.onClose();
          }, "Done")
        ];
      },
      // This step explicitly blocks navigation, demonstrating step-level precedence
      allowStepNavigation: false,
      description: "Upload finished",
      fields: [
        {
          component: (data) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            CompleteComponent,
            {
              service: services.find((s) => s.id === data.storage) || services[0],
              uploadManager
            }
          ),
          name: "complete",
          type: "custom"
        }
      ],
      icon: Check,
      shortTitle: "Done",
      submitLabel: "Done",
      title: "Complete",
      validationSchema: completeSchema
    }
  ];
  return {
    defaultValues: {
      fileIds: [],
      files: [],
      storage: services[0]?.id || ""
    },
    descriptionMaxWidth: "sm",
    // Use a slightly larger width for better readability
    // Disable next button when no services are available
    disableNextButton: !hasServices,
    environmentSync: environmentSyncCallback,
    forceRerender: forceRerenderCallback,
    steps: stepDefinitions,
    submitLabel: "Done",
    onNavigationStart: () => {
      isNavigating = true;
    },
    onNavigationEnd: () => {
      isNavigating = false;
      if (pendingNavigation) {
        const navigationRequest = pendingNavigation;
        pendingNavigation = null;
        const env = environmentSync();
        if (env?.step?.jumpTo) {
          env.step.jumpTo(navigationRequest.toStep);
        }
      }
    },
    onNavigationError: () => {
      isNavigating = false;
      pendingNavigation = null;
    }
  };
}

function uploadWizardDialogConfig(services, uploadManager, onComplete, onCancel) {
  const hasServices = services && services.length > 0;
  const { cancel, done } = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.createActionHelpers();
  return {
    // When no services available, provide a close action button
    ...!hasServices && {
      actionButtons: [cancel(onCancel, "Close")]
    },
    formConfig: uploadWizardForm(services, uploadManager),
    onError: onCancel,
    onSubmit: async (data) => {
      return { success: true };
    },
    onSuccess: onComplete,
    preventCloseOnOutsideClick: true,
    size: "6xl",
    title: "Upload Files",
    type: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.DialogTypes.WIZARD_FORM
  };
}

function useUploadManager() {
  const framework = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.useFramework();
  const { open } = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useNotification();
  const [services, setServices] = core_dashboard__loadShare__react__loadShare__.useState([]);
  const [uploadManager, setUploadManager] = core_dashboard__loadShare__react__loadShare__.useState(null);
  const getUploadFeature = core_dashboard__loadShare__react__loadShare__.useCallback(async () => {
    if (!framework) {
      throw new Error("Framework not available");
    }
    const feature = await framework.framework.getFeature("dashboard:upload");
    if (!feature) {
      throw new Error("Upload feature not found");
    }
    return feature;
  }, [framework]);
  core_dashboard__loadShare__react__loadShare__.useEffect(() => {
    const fetchServices = async () => {
      try {
        const feature = await getUploadFeature();
        setUploadManager(feature);
        const handleError = (file, error) => {
          open?.({
            description: error?.message,
            message: "Upload Error",
            type: "error"
          });
        };
        const handleRestrictionFailed = (file, error) => {
          open?.({
            description: error?.message,
            message: "Invalid File",
            type: "error"
          });
        };
        const cleanupError = feature.on("error", handleError);
        const cleanupRestrictionFailed = feature.on(
          "restriction-failed",
          handleRestrictionFailed
        );
        const serviceConfigs = feature.getServices();
        const uiServices = await Promise.all(
          serviceConfigs.map(async (serviceConfig) => {
            const protocolCapability = await framework?.framework.getCapability(
              serviceConfig.id
            );
            if (!protocolCapability) {
              throw new Error(
                `Protocol capability not found for service ${serviceConfig.id}`
              );
            }
            return {
              description: protocolCapability.getDescription(),
              icon: protocolCapability.getIcon(),
              id: serviceConfig.id,
              name: protocolCapability.getName()
            };
          })
        );
        setServices(uiServices);
        return () => {
          cleanupError();
          cleanupRestrictionFailed();
        };
      } catch (error) {
        setServices([]);
        setUploadManager(null);
      }
    };
    fetchServices();
  }, [getUploadFeature, framework]);
  const addFile = core_dashboard__loadShare__react__loadShare__.useCallback(
    async (file, serviceId) => {
      if (!uploadManager) {
        throw new Error("Upload manager not available");
      }
      return uploadManager.addFile(file, serviceId);
    },
    [uploadManager]
  );
  const start = core_dashboard__loadShare__react__loadShare__.useCallback(async () => {
    if (!uploadManager) {
      throw new Error("Upload manager not available");
    }
    return uploadManager.start();
  }, [uploadManager]);
  const getFiles = core_dashboard__loadShare__react__loadShare__.useCallback(async () => {
    if (!uploadManager) {
      throw new Error("Upload manager not available");
    }
    return uploadManager.getFiles();
  }, [uploadManager]);
  const removeFile = core_dashboard__loadShare__react__loadShare__.useCallback(
    async (id) => {
      if (!uploadManager) {
        throw new Error("Upload manager not available");
      }
      return uploadManager.removeFile(id);
    },
    [uploadManager]
  );
  const cancelAll = core_dashboard__loadShare__react__loadShare__.useCallback(async () => {
    if (!uploadManager) {
      throw new Error("Upload manager not available");
    }
    return uploadManager.cancelAll();
  }, [uploadManager]);
  const getUploadProgress = core_dashboard__loadShare__react__loadShare__.useCallback(() => {
    if (!uploadManager) {
      throw new Error("Upload manager not available");
    }
    return uploadManager.getUploadProgress();
  }, [uploadManager]);
  const getUploadStatus = core_dashboard__loadShare__react__loadShare__.useCallback(() => {
    if (!uploadManager) {
      throw new Error("Upload manager not available");
    }
    return uploadManager.getUploadStatus();
  }, [uploadManager]);
  const on = core_dashboard__loadShare__react__loadShare__.useCallback(
    (event, callback) => {
      if (!uploadManager) {
        throw new Error("Upload manager not available");
      }
      return uploadManager.on(event, callback);
    },
    [uploadManager]
  );
  const off = core_dashboard__loadShare__react__loadShare__.useCallback(
    (event, callback) => {
      if (!uploadManager) {
        throw new Error("Upload manager not available");
      }
      return uploadManager.off(event, callback);
    },
    [uploadManager]
  );
  const getManager = core_dashboard__loadShare__react__loadShare__.useCallback(() => {
    return uploadManager?.getManager();
  }, [uploadManager]);
  const getUploadErrors = core_dashboard__loadShare__react__loadShare__.useCallback(() => {
    if (!uploadManager) {
      throw new Error("Upload manager not available");
    }
    return uploadManager.getUploadErrors();
  }, [uploadManager]);
  return {
    addFile,
    cancelAll,
    getFiles,
    getManager,
    getUploadErrors,
    getUploadProgress,
    getUploadStatus,
    off,
    on,
    removeFile,
    services,
    start,
    uploadManager
  };
}

function UploadButton() {
  const { openDialog } = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.useDialog();
  const uploadManager = useUploadManager();
  const handleUploadClick = () => {
    openDialog(
      uploadWizardDialogConfig(
        uploadManager.services,
        uploadManager,
        () => {
          console.log("Upload process completed successfully");
        },
        (error) => {
          console.error("Upload process failed:", error);
        }
      )
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button,
    {
      className: "relative h-16 w-full justify-center",
      onClick: handleUploadClick,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "absolute left-4 h-4 w-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 text-center", children: "Upload" })
      ]
    }
  );
}

export { UploadButton as default };
