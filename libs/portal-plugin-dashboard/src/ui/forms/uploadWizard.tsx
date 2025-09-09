import {
  FormFieldConfig,
  useFormContext,
  WizardFormConfig,
  WizardStepDefinition,
} from "@lumeweb/portal-framework-ui";
import { cn } from "@lumeweb/portal-framework-ui-core";
import {
  BarChart3,
  Check,
  Copy,
  DatabaseIcon,
  Eye,
  FileText,
} from "lucide-react";
import React from "react";
import { z } from "zod";

import type { UIServiceConfig as ServiceConfig } from "@/types/upload";

import { useUploadManager } from "@/hooks/useUploadManager";
import { FileUploadZone } from "@/ui/components/form/FileUploadZone";
import { UploadProgress } from "@/ui/components/UploadProgress";

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
  files: z.array(z.instanceof(File)).min(1),
  storage: z.string().min(1),
});

const progressSchema = z.object({
  files: z.array(z.instanceof(File)).min(1),
  storage: z.string().min(1),
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

// Storage info data
const globalStorage = {
  get available() {
    return this.total - this.used;
  },
  total: 10, // GB
  used: 1.8, // GB
  get usedPercentage() {
    return (this.used / this.total) * 100;
  },
};

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

const FileStorageInfoComponent = () => (
  <div className="mb-4">
    <div className="bg-muted flex items-center justify-between rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 rounded-lg p-2">
          <Database className="text-primary h-5 w-5" />
        </div>
        <div>
          <h3 className="text-foreground font-semibold">
            Your Account Storage
          </h3>
          <p className="text-muted-foreground text-sm">
            Available space for all your files
          </p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-foreground text-2xl font-bold">
          {globalStorage.available.toFixed(1)} GB
        </div>
        <div className="text-muted-foreground text-sm">
          of {globalStorage.total} GB available
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="bg-muted h-2 w-24 overflow-hidden rounded-full">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${globalStorage.usedPercentage}%` }}
            />
          </div>
          <span className="text-muted-foreground text-xs">
            {globalStorage.usedPercentage.toFixed(0)}% used
          </span>
        </div>
      </div>
    </div>
  </div>
);

const ReviewComponent = ({
  files,
  service,
}: {
  files: File[];
  service: ServiceConfig;
}) => (
  <div className="space-y-6">
    <div className="bg-muted flex items-center gap-3 rounded-lg p-3">
      <div className="bg-background rounded-lg p-2">
        <service.icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="font-semibold">Storage Method: {service.name}</h3>
        <p className="text-muted-foreground text-sm">{service.description}</p>
      </div>
    </div>

    <div>
      <h4 className="mb-2 font-medium">Selected Files ({files.length})</h4>
      <div className="max-h-40 space-y-2 overflow-y-auto">
        {files.map((file, index) => (
          <div
            className="bg-muted flex items-center gap-3 rounded p-2"
            key={index}>
            <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded">
              <FileText className="text-primary h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-muted-foreground text-xs">
                {file.size > 0 ? (file.size / 1024).toFixed(1) : "0"} KB
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ProgressComponent = ({
  files,
  service,
}: {
  files: File[];
  service: ServiceConfig;
}) => {
  // Use the upload manager hook to get current state
  const { uploadError, uploadProgress, uploadStatus } = useUploadManager();

  return (
    <UploadProgress
      description={`Uploading ${files.length} file(s) to ${service.name}`}
      fileCount={files.length}
      progress={uploadProgress || 0}
      serviceName={service.name}
      title="Processing Your Files"
      variant="wizard"
    />
  );
};

const CompleteComponent = ({
  files,
  service,
}: {
  files: File[];
  service: ServiceConfig;
}) => {
  // Generate mock file IDs
  const generateFileId = () =>
    `${Math.random().toString(36).substr(2, 8)}-${Math.random().toString(36).substr(2, 4)}`;

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
          {files.length} file(s) have been saved to {service.name}
        </p>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium">Your Files</h4>
        <div className="max-h-48 space-y-2 overflow-y-auto">
          {files.map((file, index) => {
            const mockId = generateFileId();
            return (
              <div className="bg-muted space-y-2 rounded-lg p-3" key={index}>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded">
                    <FileText className="text-primary h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {file.size > 0 ? (file.size / 1024).toFixed(1) : "0"} KB •
                      Saved to {service.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pl-11">
                  <div className="text-muted-foreground flex-1 text-xs">
                    <span className="font-medium">File ID:</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pl-11">
                  <code className="bg-background flex-1 break-all rounded px-2 py-1 font-mono text-xs">
                    {mockId}
                  </code>
                  <button
                    className={cn(
                      "border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md border p-2",
                    )}
                    onClick={() => navigator.clipboard.writeText(mockId)}>
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export function uploadWizardForm(
  services: ServiceConfig[],
): WizardFormConfig<UploadWizardFormData> {
  // Determine if we have services available
  const hasServices = services && services.length > 0;

  const stepDefinitions: WizardStepDefinition<UploadWizardFormData>[] = [
    {
      description: "Select where you want to store your files",
      fields: [
        {
          component: (data) => (
            <StorageSelectionComponent services={services} />
          ),
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
      description: "Choose the files you want to upload",
      fields: [
        {
          component: () => <FileStorageInfoComponent />,
          name: "storageInfo",
          type: "custom",
        } as FormFieldConfig<UploadWizardFormData>,
        {
          component: (data, formMethods) => (
            <FileUploadZone
              disabled={false}
              onFilesChange={(files) => formMethods.setValue("files", files)}
            />
          ),
          label: "Files",
          name: "files",
          required: true,
          type: "custom",
        } as FormFieldConfig<UploadWizardFormData>,
      ],
      icon: FileText,
      shortTitle: "Files",
      submitLabel: "Next",
      title: "Select Files",
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
            />
          ),
          name: "review",
          type: "custom",
        } as FormFieldConfig<UploadWizardFormData>,
      ],
      icon: Eye,
      shortTitle: "Review",
      submitLabel: "Start Upload",
      title: "Review",
      validationSchema: reviewSchema,
    },
    {
      // Disable navigation during upload
      allowStepNavigation: false,
      description: "Uploading your files",
      fields: [
        {
          component: (data) => (
            <ProgressComponent
              files={data.files}
              service={
                services.find((s) => s.id === data.storage) || services[0]
              }
            />
          ),
          name: "progress",
          type: "custom",
        } as FormFieldConfig<UploadWizardFormData>,
      ],
      icon: BarChart3,
      shortTitle: "Upload",
      title: "Upload",
      validationSchema: progressSchema,
    },
    {
      allowStepNavigation: false,
      description: "Upload finished",
      fields: [
        {
          component: (data) => (
            <CompleteComponent
              files={data.files}
              service={
                services.find((s) => s.id === data.storage) || services[0]
              }
            />
          ),
          name: "complete",
          type: "custom",
        } as FormFieldConfig<UploadWizardFormData>,
      ],
      icon: Check,
      shortTitle: "Done",
      title: "Complete",
      validationSchema: completeSchema,
    },
  ];

  return {
    allowStepNavigation: false,
    defaultValues: {
      fileIds: [],
      files: [],
      storage: services[0]?.id || "",
    },
    descriptionMaxWidth: "sm", // Use a slightly larger width for better readability
    // Disable next button when no services are available
    disableNextButton: !hasServices,
    onSubmit: async (data) => {
      // The wizard handles each step individually, so this is just a final callback
      return { success: true };
    },
    // Disable navigation during upload
    stepNavigationDisabled: [3, 4], // Disable navigation to progress and complete steps
    steps: stepDefinitions,
    submitLabel: "Done",
  };
}
