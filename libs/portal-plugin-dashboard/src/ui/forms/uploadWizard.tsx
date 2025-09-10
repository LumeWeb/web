import { isFolderBundle } from "@lib/util";
import {
  createActionHelpers,
  createEnvironmentReceiver,
  createForceRerenderReceiver,
  FormFieldConfig,
  type UnifiedEnvironment,
  useFormContext,
  WizardFormConfig,
  WizardStepDefinition,
} from "@lumeweb/portal-framework-ui";
import { cn } from "@lumeweb/portal-framework-ui-core";
import { useNotification } from "@refinedev/core";
import {
  BarChart3,
  Check,
  Copy,
  DatabaseIcon,
  Eye,
  FileText,
  Folder,
} from "lucide-react";
import React, { useEffect } from "react";
import { z } from "zod";

import { Feature as UploadFeature } from "@/features/upload";
import {
  IUploadManager,
  UIServiceConfig as ServiceConfig,
  UploadStatus,
} from "@/types/upload";
import { FileUploadZone } from "@/ui/components/form/FileUploadZone";
import { UploadProgress } from "@/ui/components/UploadProgress";
import filesize from "@/ui/util/filesize";

// Define schemas for each step
const storageSchema = z.object({
  storage: z.string().min(1),
});

// Schema for when no services are available
const noServicesStorageSchema = z.object({
  storage: z.string().optional(),
});

const filesSchema = z.object({
  files: z.array(z.instanceof(File)).min(1, "Please select at least one file"),
});

const reviewSchema = z.object({
  files: z.array(z.instanceof(File)).optional(),
  storage: z.string().optional(),
});

const completeSchema = z.object({
  fileIds: z.array(z.string()).optional(),
  files: z.array(z.instanceof(File)).min(1),
  storage: z.string().min(1),
});

type UploadWizardFormData = z.infer<typeof completeSchema> &
  z.infer<typeof filesSchema> &
  z.infer<typeof progressSchema> &
  z.infer<typeof reviewSchema> &
  z.infer<typeof storageSchema>;

// Custom components for steps
const StorageInfoDisplay = ({ service }: { service: ServiceConfig }) => {
  if (!service) {
    return null;
  }

  return (
    <div className="bg-muted mt-4 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className="bg-background rounded-lg p-2">
          {service.icon && <service.icon className="h-5 w-5" />}
        </div>
        <div>
          <h3 className="text-card-foreground font-semibold">{service.name}</h3>
          <p className="text-muted-foreground text-sm">{service.description}</p>
        </div>
      </div>
    </div>
  );
};

const StorageSelectionComponent = ({
  services,
}: {
  services: ServiceConfig[];
}) => {
  const formContext = useFormContext();
  const selectedService = formContext.formInstance.watch("storage");

  const handleServiceSelect = (serviceId: string) => {
    formContext.formInstance.setValue("storage", serviceId);
  };

  // Handle case when no services are available
  if (!services || services.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="bg-destructive/10 text-destructive mx-auto flex h-16 w-16 items-center justify-center rounded-full">
          <DatabaseIcon className="h-8 w-8" />
        </div>
        <h3 className="text-foreground mt-4 text-lg font-semibold">
          No Storage Services Available
        </h3>
        <p className="text-muted-foreground mt-2">
          Please contact support or try again later
        </p>
      </div>
    );
  }

  // Find the selected service or default to the first one
  const currentService =
    (selectedService && services.find((s) => s.id === selectedService)) ||
    services[0];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 justify-items-center gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <div
            className={cn(
              "relative h-32 w-32 cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 hover:scale-105 hover:shadow-md",
              selectedService === service.id
                ? "border-primary bg-primary/5 shadow-lg"
                : "border-muted hover:border-primary/50",
            )}
            key={service.id}
            onClick={() => handleServiceSelect(service.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleServiceSelect(service.id);
              }
            }}
            role="button"
            tabIndex={0}>
            {selectedService === service.id && (
              <div className="bg-primary absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full">
                <Check className="text-primary-foreground h-4 w-4" />
              </div>
            )}
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <div
                className={cn(
                  "rounded-lg p-2",
                  selectedService === service.id
                    ? "text-primary"
                    : "text-muted-foreground",
                )}>
                {service.icon && <service.icon className="h-8 w-8" />}
              </div>
              <span
                className={cn(
                  "text-center text-sm font-medium",
                  selectedService === service.id
                    ? "text-primary"
                    : "text-foreground",
                )}>
                {service.name}
              </span>
            </div>
          </div>
        ))}
      </div>
      {currentService && <StorageInfoDisplay service={currentService} />}
    </div>
  );
};

const ReviewComponent = ({
  service,
  uploadManager,
}: {
  service: ServiceConfig;
  uploadManager: IUploadManager;
}) => {
  // Get files directly from uploadManager to ensure proper synchronization
  const uppyFiles = uploadManager?.getFiles() || [];
  const fileCount = uppyFiles.length;

  return (
    <div className="space-y-6">
      <div className="bg-muted flex items-center gap-3 rounded-lg p-3">
        <div className="bg-background rounded-lg p-2">
          {service.icon && <service.icon className="h-5 w-5" />}
        </div>
        <div>
          <h3 className="font-semibold">Storage Method: {service.name}</h3>
          <p className="text-muted-foreground text-sm">{service.description}</p>
        </div>
      </div>

      <div>
        <h4 className="mb-2 font-medium">Selected Files ({fileCount})</h4>
        {fileCount > 0 ? (
          <div className="max-h-40 space-y-2 overflow-y-auto">
            {uppyFiles.map((file, index) => {
              // Handle folder bundles properly
              const isBundle = isFolderBundle(file);
              const displayName = isBundle ? file.meta?.bundleName : file.name;
              const displaySize = file.size; // UppyFile already has the correct size including bundles

              return (
                <div
                  className="bg-muted flex items-center gap-3 rounded p-2"
                  key={index}>
                  <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded">
                    {isBundle ? (
                      <Folder className="text-primary h-4 w-4" />
                    ) : (
                      <FileText className="text-primary h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {displayName}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {filesize(displaySize)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-muted-foreground py-4 text-center">
            No files selected
          </div>
        )}
      </div>
    </div>
  );
};

const createUploadErrorNotification = (open: any, error: unknown) => {
  const message = error instanceof Error ? error.message : 
                typeof error === 'string' ? error : 
                'An unknown upload error occurred';
  
  open?.({
    description: message,
    message: "Upload Error",
    type: "error",
  });
};

const ProgressComponent = ({
  forceRerender,
  retryCount,
  service,
  uploadManager,
}: {
  forceRerender?: () => void;
  retryCount?: number;
  service: ServiceConfig;
  uploadManager: IUploadManager;
}) => {
  // Get file count from uppy instead of form data
  const uppyFiles = uploadManager?.getFiles() || [];
  const fileCount = uppyFiles.length;

  // Directly use the uploadManager's state instead of duplicating it
  const progress = uploadManager?.getUploadProgress() || 0;
  const status = uploadManager?.getUploadStatus() || "idle";
  const { open } = useNotification();

  // Listen for upload progress updates and trigger rerender
  useEffect(() => {
    const handleProgress = () => {
      // Force rerender on progress update
      forceRerender?.();
    };

    // Add progress listener
    const cleanupProgress = uploadManager?.on(
      "upload-progress",
      handleProgress,
    );

    // Listen for upload errors and display notifications
    // Retrigger when retryCount changes
    const handleError = (error: unknown) => {
      createUploadErrorNotification(open, error);
      // Force rerender on error
      forceRerender?.();
    };

    // Add error listener
    const cleanupError = uploadManager?.on("error", handleError);

    // Add upload-error listener
    const cleanupUploadError = uploadManager?.on("upload-error", handleError);

    // Cleanup listeners on component unmount or when retryCount changes
    return () => {
      if (cleanupProgress) cleanupProgress();
      if (cleanupError) cleanupError();
      if (cleanupUploadError) cleanupUploadError();
    };
  }, [uploadManager, open, retryCount, forceRerender]);

  // Check for existing errors that might have been recorded before component mount
  // Retrigger when retryCount changes
  useEffect(() => {
    const errors = uploadManager?.getUploadErrors?.();
    if (errors && errors.length > 0) {
      errors.forEach((error) => {
        if (error) {
          createUploadErrorNotification(open, error);
        }
      });
      // Force rerender if we see errors
      forceRerender?.();
    }
  }, [uploadManager, open, retryCount, forceRerender]);

  return (
    <UploadProgress
      description={`Uploading ${fileCount} file(s) to ${service.name}`}
      fileCount={fileCount}
      files={uppyFiles}
      progress={progress}
      serviceName={service.name}
      status={status}
      title="Processing Your Files"
      variant="wizard"
    />
  );
};

const UploadedFileItem = ({
  fileData,
  serviceName,
}: {
  fileData: any;
  serviceName: string;
}) => {
  const cid = fileData.meta?.cid;

  return (
    <div className="bg-muted space-y-2 rounded-lg p-3">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded">
          <FileText className="text-primary h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{fileData.name}</p>
          <p className="text-muted-foreground text-xs">
            {filesize(fileData.size)} • Saved to {serviceName}
          </p>
        </div>
      </div>
      {cid && (
        <>
          <div className="flex items-center gap-2 pl-11 pt-2">
            <div className="text-muted-foreground flex-1 text-xs">
              <span className="font-medium">CID:</span>
            </div>
          </div>
          <div className="flex items-center gap-2 pl-11">
            <code className="bg-background flex-1 break-all rounded px-2 py-1 font-mono text-xs">
              {cid}
            </code>
            <button
              className={cn(
                "border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md border p-2",
              )}
              onClick={() => navigator.clipboard.writeText(cid)}>
              <Copy className="h-3 w-3" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const CompleteComponent = ({
  service,
  uploadManager,
}: {
  service: ServiceConfig;
  uploadManager: IUploadManager;
}) => {
  // Directly use the uploadManager's uploaded files state
  const uploadedFiles = uploadManager?.getUploadedFiles() || [];
  const fileCount = uploadedFiles.length;

  return (
    <div className="space-y-6">
      <div className="py-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">
          Files Successfully Uploaded
        </h3>
        <p className="text-muted-foreground">
          {fileCount} {fileCount === 1 ? "file" : "files"} have been saved to{" "}
          {service.name}
        </p>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium">Your Files</h4>
        <div className="max-h-48 space-y-2 overflow-y-auto">
          {uploadedFiles.map((fileData, index) => (
            <UploadedFileItem
              fileData={fileData}
              key={index}
              serviceName={service.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Global event listener tracking
const eventListeners = new Map<
  IUploadManager,
  Record<string, (() => void) | undefined>
>();

// Helper method to clean up existing event listeners
const cleanupEventListeners = (uploadManager: IUploadManager) => {
  if (uploadManager && eventListeners.has(uploadManager)) {
    const listeners = eventListeners.get(uploadManager);
    Object.values(listeners || {}).forEach((cleanup) => {
      if (cleanup) cleanup();
    });
    eventListeners.delete(uploadManager);
  }
};

// Helper method to setup event listeners
const setupEventListeners = (
  uploadManager: IUploadManager,
  forceRerender: (() => void) | undefined,
  environmentSync: (() => null | UnifiedEnvironment) | undefined,
) => {
  const handleError = () => {
    // Force rerender on error
    forceRerender?.();
  };

  const handleComplete = (data: { failed?: any[] }) => {
    // Jump to step 5 (complete step) when upload is finished
    const env = environmentSync?.();
    if (env?.step?.jumpTo && (!data.failed || data.failed.length === 0)) {
      env.step.jumpTo(5);
    }
    // Force rerender on complete
    forceRerender?.();
  };

  // Define events to listen to
  const eventsToListen: { handler: () => void; name: string }[] = [
    { handler: handleError, name: "error" },
    { handler: handleError, name: "upload-error" },
    { handler: handleComplete, name: "complete" },
  ];

  // Add event listeners and track them globally
  const listeners: Record<string, (() => void) | undefined> = {};
  eventsToListen.forEach((event) => {
    listeners[event.name] = uploadManager?.on(event.name, event.handler);
  });

  // Store cleanup functions for later removal
  if (uploadManager) {
    eventListeners.set(uploadManager, listeners);
  }

  return listeners;
};

export function uploadWizardForm(
  services: ServiceConfig[],
  uploadFeature: UploadFeature,
): WizardFormConfig<UploadWizardFormData> {
  const uploadManager = uploadFeature?.getManager();
  // Determine if we have services available
  const hasServices = services && services.length > 0;

  // Clean up any existing event listeners for this uploadManager
  cleanupEventListeners(uploadManager);

  // Create force rerender receiver
  const { forceRerender, forceRerenderCallback } =
    createForceRerenderReceiver();

  // Create environment receiver for accessing environment state
  const { environmentSync, environmentSyncCallback } =
    createEnvironmentReceiver();

  // Setup event listeners
  setupEventListeners(uploadManager, forceRerender, environmentSync);

  // Clear any existing files from previous uploads
  uploadManager.clearFiles();

  const stepDefinitions: WizardStepDefinition<UploadWizardFormData>[] = [
    {
      description: "Select where you want to store your files",
      fields: [
        {
          component: () => <StorageSelectionComponent services={services} />,
          name: "storage",
          required: hasServices, // Only required when services are available
          type: "custom",
        } as FormFieldConfig<UploadWizardFormData>,
      ],
      icon: DatabaseIcon,
      shortTitle: "Method",
      submitLabel: "Next",
      title: "Choose Storage Method",
      validationSchema: hasServices ? storageSchema : noServicesStorageSchema, // Use appropriate schema
    },
    {
      description: "Choose files or folders you want to upload",
      fields: [
        {
          component: (data) => {
            const service =
              services.find((s) => s.id === data.storage) || services[0];
            return <StorageInfoDisplay service={service} />;
          },
          name: "storageInfo",
          type: "custom",
        } as FormFieldConfig<UploadWizardFormData>,
        {
          component: (props) => {
            const { formMethods } = props;

            // Set up the drop target with the selected service ID when component renders
            useEffect(() => {
              if (uploadManager?.setUIDropTarget) {
                // Find the dropzone element using the specific class selector
                const dropzoneElement = document.querySelector(
                  ".dropzone-container",
                );
                if (dropzoneElement) {
                  uploadManager.setUIDropTarget(
                    dropzoneElement,
                    formMethods.getValues().storage,
                  );
                }
              }

              formMethods.setValue(
                "files",
                uploadManager?.getFiles().map((f) => f.data),
              );

              // Cleanup function to clear the drop target when component unmounts
              return () => {
                if (uploadManager?.clearUIDropTarget) {
                  uploadManager.clearUIDropTarget();
                }
              };
            }, [formMethods]);

            return (
              <FileUploadZone
                allowFolders={true}
                disabled={false}
                onFilesChange={async (files) => {
                  // Sync form with uploadManager's complete file list
                  formMethods.setValue("files", files);
                }}
                serviceId={formMethods.getValues().storage}
                uploadManager={uploadManager}
              />
            );
          },
          label: "Files or Folders",
          name: "files",
          required: true,
          type: "custom",
        } as FormFieldConfig<UploadWizardFormData>,
      ],
      icon: FileText,
      shortTitle: "Files",
      submitLabel: "Next",
      title: "Select Files or Folders",
      validationSchema: filesSchema,
    },
    {
      description: "Review your upload settings",
      fields: [
        {
          component: (data) => (
            <ReviewComponent
              files={data.files}
              service={
                services.find((s) => s.id === data.storage) || services[0]
              }
              uploadManager={uploadManager}
            />
          ),
          name: "review",
          type: "custom",
        } as FormFieldConfig<UploadWizardFormData>,
      ],
      icon: Eye,
      onStepSubmit: async () => {
        // Start the upload process
        uploadManager.start();
      },
      shortTitle: "Review",
      submitLabel: "Start Upload",
      title: "Review",
    },
    {
      actionButtons: ({ environment }) => {
        const status = uploadManager?.getUploadStatus();

        const { back, cancel, retry } = createActionHelpers();

        if ([UploadStatus.PENDING, UploadStatus.UPLOADING].includes(status)) {
          return [
            cancel(() => {
              // Cancel and close dialog
              return uploadManager?.cancelAll();
            }, "Cancel"),
          ];
        }

        // If upload status is ERROR, show back, retry, and cancel buttons
        if (status === UploadStatus.ERROR) {
          return [
            back(() => {
              return environment?.step?.onPrevious();
            }, "Back"),
            retry(async () => {
              uploadManager?.clearErrors();
              // Trigger a rerender when retrying
              return environment?.step?.onRetry?.();
            }),
            cancel(() => {
              // Cancel and close dialog
              return uploadManager?.cancelAll();
            }, "Cancel"),
          ];
        }

        // For other statuses, fallback to default actions
        return undefined;
      },
      // Disable navigation during upload - this step-level config will take precedence over wizard-level
      allowStepNavigation: (data) => {
        // Allow navigation only if upload is not in progress
        const status = uploadManager?.getUploadStatus();
        return status !== UploadStatus.UPLOADING;
      },
      description: "Uploading your files",
      fields: [
        {
          component: ({ stepEnvironment, value: data }) => (
            <ProgressComponent
              forceRerender={forceRerender}
              retryCount={stepEnvironment?.retryCount}
              service={
                services.find((s) => s.id === data?.storage) || services[0]
              }
              uploadManager={uploadManager}
            />
          ),
          name: "progress",
          type: "custom",
        } as FormFieldConfig<UploadWizardFormData>,
      ],
      icon: BarChart3,
      onRetryStep: async () => {
        // Trigger a rerender when retrying
        return uploadManager.start();
      },
      onStepSubmit: async () => {
        // Start the upload process
        uploadManager.start();
      },
      shortTitle: "Upload",
      submitLabel: "Start Upload",
      title: "Upload",
    },
    {
      actionButtons: ({ environment }) => {
        const { button } = createActionHelpers();
        return [
          button(() => {
            // Clear the upload manager before closing
            uploadManager.clearFiles();
            // Close the dialog
            environment?.container?.onClose();
          }, "Done"),
        ];
      },
      // This step explicitly blocks navigation, demonstrating step-level precedence
      allowStepNavigation: false,
      description: "Upload finished",
      fields: [
        {
          component: (data) => (
            <CompleteComponent
              service={
                services.find((s) => s.id === data.storage) || services[0]
              }
              uploadManager={uploadManager}
            />
          ),
          name: "complete",
          type: "custom",
        } as FormFieldConfig<UploadWizardFormData>,
      ],
      icon: Check,
      shortTitle: "Done",
      submitLabel: "Done",
      title: "Complete",
      validationSchema: completeSchema,
    },
  ];

  return {
    defaultValues: {
      fileIds: [],
      files: [],
      storage: services[0]?.id || "",
    },
    descriptionMaxWidth: "sm", // Use a slightly larger width for better readability
    // Disable next button when no services are available
    disableNextButton: !hasServices,
    environmentSync: environmentSyncCallback,
    forceRerender: forceRerenderCallback,
    steps: stepDefinitions,
    submitLabel: "Done",
  };
}
