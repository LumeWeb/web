import { cn } from "@lumeweb/portal-framework-ui-core";
import { Progress } from "@lumeweb/portal-framework-ui-core";
import { Check } from "lucide-react";

export interface UploadProgressProps {
  /**
   * Whether to animate progress bar when not complete
   */
  animateProgress?: boolean;

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
   * Current upload progress percentage (0-100)
   */
  progress: number;

  /**
   * Progress bar height
   */
  progressHeight?: "h-1" | "h-2" | "h-3";

  /**
   * Service name (for wizard variant)
   */
  serviceName?: string;

  /**
   * Whether to show completion checkmark
   */
  showCheckmark?: boolean;

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
}

interface ProgressTextProps {
  className?: string;
  progress: number;
  showPercentage?: boolean;
  text?: string;
}

interface SharedProgressBarProps {
  animate?: boolean;
  className?: string;
  height?: UploadProgressProps["progressHeight"];
  percentagePosition?: "both" | "left" | "right";
  progress: number;
  showPercentage?: boolean;
}

/**
 * Main UploadProgress component that composes subcomponents based on variant
 */
export function UploadProgress({
  animateProgress = false,
  className,
  description,
  fileCount = 0,
  progress,
  progressHeight = "h-2",
  serviceName,
  showCheckmark = true,
  title,
  variant = "avatar",
}: UploadProgressProps) {
  const commonProps = {
    className,
    progress,
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
}: {
  className?: string;
  progress: number;
  showCheckmark?: boolean;
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
          />
        </div>
        {showCheckmark && progress === 100 && (
          <Check className="text-success h-5 w-5" />
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
}: ProgressIconProps) {
  return (
    <Check
      className={cn(
        "text-primary h-8 w-8",
        animate && progress < 100 && "animate-bounce",
        className,
      )}
    />
  );
}

/**
 * Progress text component for displaying status messages
 */
function ProgressText({
  className,
  progress,
  showPercentage = true,
  text,
}: ProgressTextProps) {
  return (
    <p className={cn("text-muted-foreground text-sm", className)}>
      {text ||
        (progress < 100
          ? `${showPercentage ? `${Math.round(progress)}% ` : ""}complete`
          : "Finalizing upload...")}
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
}: SharedProgressBarProps) {
  return (
    <div className={cn("w-full", className)}>
      {showPercentage &&
        (percentagePosition === "left" || percentagePosition === "both") && (
          <div className="mb-2 flex items-center justify-between">
            <span className="text-foreground text-sm">Uploading...</span>
            <span className="text-muted-foreground text-sm">
              {Math.round(progress)}%
            </span>
          </div>
        )}
      <div className="bg-muted w-full overflow-hidden rounded-full">
        <div
          className={cn(
            "bg-primary rounded-full transition-all duration-300",
            height,
            animate && progress < 100 && "animate-pulse",
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      {showPercentage && percentagePosition === "right" && (
        <div className="mt-2 text-right">
          <span className="text-muted-foreground text-sm">
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
  progress,
  serviceName,
  title,
}: {
  className?: string;
  description?: string;
  fileCount?: number;
  progress: number;
  serviceName?: string;
  title?: string;
}) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="py-8 text-center">
        <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <ProgressIcon animate={true} progress={progress} />
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
        <SharedProgressBar animate={true} height="h-2" progress={progress} />
        <ProgressText
          className="mt-2"
          progress={progress}
          showPercentage={true}
        />
      </div>
    </div>
  );
}
