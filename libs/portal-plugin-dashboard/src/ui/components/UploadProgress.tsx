import type { UppyFile } from "@uppy/core";

import { cn } from "@lumeweb/portal-framework-ui-core";
import { Progress } from "@lumeweb/portal-framework-ui-core";
import { AlertCircle, Check, Upload } from "lucide-react";

import { UploadStatus, UploadStatusType } from "@/types/upload";
import { FileItem } from "@/ui/components/FileItem";

export interface UploadProgressProps {
  /**
   * Optional custom className for additional styling
   */
  className?: string;

  /**
   * Optional description text for wizard variant
   */
  description?: string;

  /**
   * Number of files being uploaded (for wizard variant)
   */
  fileCount?: number;

  /**
   * Files being uploaded (for wizard variant)
   */
  files?: UppyFile[];

  /**
   * Current upload progress percentage (0-100)
   */
  progress: number;

  /**
   * Service name (for wizard variant)
   */
  serviceName?: string;

  /**
   * Whether to show completion checkmark
   */
  showCheckmark?: boolean;

  /**
   * Upload status
   */
  status: UploadStatusType;

  /**
   * Optional title text for wizard variant
   */
  title?: string;

  /**
   * Visual variant of the progress component
   */
  variant?: UploadProgressVariant;
}

export type UploadProgressVariant = "avatar" | "wizard";

interface ProgressIconProps {
  animate?: boolean;
  className?: string;
  progress: number;
  status: UploadStatusType;
}

interface ProgressTextProps {
  className?: string;
  progress: number;
  showPercentage?: boolean;
  status: UploadStatusType;
  text?: string;
}

interface SharedProgressBarProps {
  animate?: boolean;
  className?: string;
  height?: UploadProgressProps["progressHeight"];
  percentagePosition?: "both" | "left" | "right";
  progress: number;
  showPercentage?: boolean;
  status: UploadStatusType;
}

/**
 * Main UploadProgress component that composes subcomponents based on variant
 */
export function UploadProgress({
  className,
  description,
  fileCount = 0,
  files,
  progress,
  serviceName,
  showCheckmark = true,
  status,
  title,
  variant = "avatar",
}: UploadProgressProps) {
  const commonProps = {
    className,
    progress,
    status,
  };

  switch (variant) {
    case "avatar":
      return (
        <AvatarProgressLayout {...commonProps} showCheckmark={showCheckmark} />
      );

    case "wizard":
      return (
        <WizardProgressLayout
          {...commonProps}
          description={description}
          fileCount={fileCount}
          files={files}
          serviceName={serviceName}
          title={title}
        />
      );

    default:
      // Fallback to avatar layout
      return (
        <AvatarProgressLayout {...commonProps} showCheckmark={showCheckmark} />
      );
  }
}

/**
 * Avatar-specific progress layout - compact, horizontal design
 */
function AvatarProgressLayout({
  className,
  progress,
  showCheckmark = true,
  status,
}: {
  className?: string;
  progress: number;
  showCheckmark?: boolean;
  status: UploadStatusType;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <SharedProgressBar
            height="h-2"
            percentagePosition="both"
            progress={progress}
            showPercentage={true}
            status={status}
          />
        </div>
        {showCheckmark && status === UploadStatus.COMPLETED && (
          <Check className="text-success h-5 w-5" />
        )}
        {status === UploadStatus.ERROR && (
          <AlertCircle className="text-destructive h-5 w-5" />
        )}
        {status === UploadStatus.IDLE && (
          <Upload className="text-muted-foreground h-5 w-5" />
        )}
      </div>
    </div>
  );
}

/**
 * Progress icon component with optional animation
 */
function ProgressIcon({
  animate = false,
  className,
  progress,
  status,
}: ProgressIconProps) {
  const getIcon = () => {
    switch (status) {
      case UploadStatus.COMPLETED:
        return <Check className="text-success h-8 w-8" />;
      case UploadStatus.ERROR:
        return <AlertCircle className="text-destructive h-8 w-8" />;
      case UploadStatus.UPLOADING:
        return <Upload className="text-primary h-8 w-8" />;
      case UploadStatus.IDLE:
      default:
        return <Upload className="text-muted-foreground h-8 w-8" />;
    }
  };

  const icon = getIcon();

  return (
    <div
      className={cn(
        "flex items-center justify-center",
        animate && status === UploadStatus.UPLOADING && "animate-bounce",
        className,
      )}>
      {icon}
    </div>
  );
}

/**
 * Progress text component for displaying status messages
 */
function ProgressText({
  className,
  progress,
  showPercentage = true,
  status,
  text,
}: ProgressTextProps) {
  const getStatusText = () => {
    switch (status) {
      case UploadStatus.COMPLETED:
        return text || "Upload complete";
      case UploadStatus.ERROR:
        return text || "Upload failed";
      case UploadStatus.IDLE:
        return text || "Ready to upload";
      case UploadStatus.UPLOADING:
        return (
          text ||
          `${showPercentage ? `${Math.round(progress)}% ` : ""}uploading...`
        );
      default:
        return text || "Ready to upload";
    }
  };

  return (
    <p
      className={cn(
        "text-sm",
        status === UploadStatus.ERROR
          ? "text-destructive"
          : "text-muted-foreground",
        className,
      )}>
      {getStatusText()}
    </p>
  );
}

/**
 * Shared progress bar component that can be used across different layouts
 */
function SharedProgressBar({
  animate = false,
  className,
  height = "h-2",
  percentagePosition = "right",
  progress,
  showPercentage = false,
  status,
}: SharedProgressBarProps) {
  return (
    <div className={cn("w-full", className)}>
      {showPercentage &&
        (percentagePosition === "left" || percentagePosition === "both") && (
          <div className="mb-2 flex items-center justify-between">
            <ProgressText
              progress={progress}
              showPercentage={false}
              status={status}
            />
            <span
              className={cn(
                "text-sm",
                status === UploadStatus.ERROR
                  ? "text-destructive"
                  : "text-muted-foreground",
              )}>
              {Math.round(progress)}%
            </span>
          </div>
        )}
      <div className="bg-muted w-full overflow-hidden rounded-full">
        <div
          className={cn(
            "rounded-full transition-all duration-1000",
            height,
            status === UploadStatus.ERROR
              ? "bg-destructive"
              : status === UploadStatus.COMPLETED
                ? "bg-success"
                : "bg-primary",
            animate && status === UploadStatus.UPLOADING && "animate-pulse",
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      {showPercentage && percentagePosition === "right" && (
        <div className="mt-2 text-right">
          <span
            className={cn(
              "text-sm",
              status === UploadStatus.ERROR
                ? "text-destructive"
                : "text-muted-foreground",
            )}>
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Wizard-specific progress layout - centered, vertical design
 */
function WizardProgressLayout({
  className,
  description,
  fileCount = 0,
  files = [],
  progress,
  serviceName,
  status,
  title,
}: {
  className?: string;
  description?: string;
  fileCount?: number;
  files?: UppyFile[];
  progress: number;
  serviceName?: string;
  status: UploadStatusType;
  title?: string;
}) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-6">
        <div className="py-4 text-center">
          <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <ProgressIcon animate={true} progress={progress} status={status} />
          </div>
          <h3 className="mb-2 text-lg font-semibold">
            {title || "Processing Your Files"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {description ||
              (fileCount > 0 && serviceName
                ? `Uploading ${fileCount} file(s) to ${serviceName}`
                : "Uploading files...")}
          </p>
          <SharedProgressBar
            animate={true}
            height="h-2"
            progress={progress}
            status={status}
          />
          <ProgressText
            className="mt-2"
            progress={progress}
            showPercentage={true}
            status={status}
          />
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Files in Progress</h4>
            <div className="max-h-60 space-y-2 overflow-y-auto">
              {files.map((file) => (
                <FileItem file={file} key={file.id} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
