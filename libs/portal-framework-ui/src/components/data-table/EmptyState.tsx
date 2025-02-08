import { Button, cn } from "@lumeweb/portal-framework-ui-core"; // ShadCN primitive
import {
  AlertTriangle,
  FileQuestion,
  Filter,
  FolderX,
  Lock,
  RefreshCw,
  WifiOff,
} from "lucide-react";
import React from "react";

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?:
    | "default"
    | "destructive"
    | "ghost"
    | "link"
    | "outline"
    | "secondary";
}

export interface EmptyStateProps {
  action?: EmptyStateAction;
  className?: string;
  description?: React.ReactNode;
  errorDetails?: string;
  icon?: React.ReactNode;
  illustration?: React.ReactNode; // Alias for icon prop
  isCompact?: boolean;
  secondaryAction?: EmptyStateAction;
  title: string;
  type?: EmptyStateType;
}

export type EmptyStateType =
  | "custom"
  | "error"
  | "filtered"
  | "network"
  | "noData"
  | "permission";

export function EmptyState({
  action,
  className,
  description,
  errorDetails,
  icon,
  illustration,
  isCompact = false,
  secondaryAction,
  title,
  type = "noData",
}: EmptyStateProps) {
  // Default icons based on type
  const defaultIcon = React.useMemo(() => {
    switch (type) {
      case "error":
        return <AlertTriangle className="h-12 w-12 text-destructive" />;
      case "filtered":
        return <Filter className="h-12 w-12 text-muted-foreground" />;
      case "network":
        return <WifiOff className="h-12 w-12 text-muted-foreground" />;
      case "noData":
        return <FolderX className="h-12 w-12 text-muted-foreground" />;
      case "permission":
        return <Lock className="h-12 w-12 text-muted-foreground" />;
      case "custom":
      default:
        return <FileQuestion className="h-12 w-12 text-muted-foreground" />;
    }
  }, [type]);

  // Default descriptions based on type
  const defaultDescription = React.useMemo(() => {
    switch (type) {
      case "error":
        return "An error occurred while fetching data. Please try again later.";
      case "filtered":
        return "Try adjusting your filters to find what you're looking for.";
      case "network":
        return "Unable to connect to the server. Please check your internet connection.";
      case "noData":
        return "There's no data to display at the moment.";
      case "permission":
        return "You don't have permission to access this resource.";
      case "custom":
      default:
        return "";
    }
  }, [type]);

  // Default actions based on type
  const defaultAction = React.useMemo(() => {
    switch (type) {
      case "error":
      case "network":
        return {
          label: "Try again",
          onClick: () => console.log("Retry clicked"),
          variant: "default" as const,
        };
      case "filtered":
        return {
          label: "Clear filters",
          onClick: () => console.log("Clear filters clicked"),
          variant: "outline" as const,
        };
      default:
        return undefined;
    }
  }, [type]);

  // Determine the icon to display (illustration prop takes priority)
  const displayIcon = illustration || icon || defaultIcon;

  // Determine the description to display
  const displayDescription = description || defaultDescription;

  // Determine the action to display
  const displayAction = action || defaultAction;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        isCompact ? "py-6" : "py-12",
        className,
      )}>
      <div
        className={cn(
          "flex flex-col items-center",
          isCompact ? "gap-3" : "gap-4",
        )}>
        {displayIcon && (
          <div className={cn(isCompact && "scale-75")}>{displayIcon}</div>
        )}
        <div className="space-y-2">
          <h3
            className={cn(
              "font-semibold",
              isCompact ? "text-base" : "text-lg",
            )}>
            {title}
          </h3>
          {displayDescription && (
            <p
              className={cn(
                "text-muted-foreground",
                isCompact ? "text-sm max-w-md" : "max-w-lg",
              )}>
              {displayDescription}
            </p>
          )}
        </div>
        {(displayAction || secondaryAction) && (
          <div
            className={cn(
              "flex gap-2 mt-2",
              isCompact ? "flex-col sm:flex-row" : "",
            )}>
            {displayAction && (
              <Button
                className={isCompact ? "h-8 text-xs px-3" : ""}
                onClick={displayAction.onClick}
                variant={displayAction.variant || "default"}>
                {type === "error" || type === "network" ? (
                  <RefreshCw className="mr-2 h-4 w-4" />
                ) : null}
                {displayAction.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                className={isCompact ? "h-8 text-xs px-3" : ""}
                onClick={secondaryAction.onClick}
                variant={secondaryAction.variant || "outline"}>
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
        {errorDetails && type === "error" && (
          <div className="mt-4 w-full">
            <details className="text-left">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                Show error details
              </summary>
              <pre className="mt-2 whitespace-pre-wrap text-xs bg-muted p-2 rounded-md overflow-auto max-h-32 text-muted-foreground">
                {errorDetails}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
