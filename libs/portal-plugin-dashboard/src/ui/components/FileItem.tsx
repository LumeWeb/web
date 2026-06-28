import type { UppyFile } from "@uppy/core";

import { isFolderBundle } from "@lib/util";
import { Badge, Button, Progress, lazyIcon } from "@lumeweb/portal-framework-ui-core";

import React from "react";

import { FileStatus } from "@/types/upload";
import { getDisplayName, getDisplaySize } from "@/ui/util/file";
import filesize from "@/ui/util/filesize";
const File = lazyIcon("File");
const FileText = lazyIcon("FileText");
const Folder = lazyIcon("Folder");
const ImageIcon = lazyIcon("ImageIcon");
const Music = lazyIcon("Music");
const Video = lazyIcon("Video");
const X = lazyIcon("X");


interface FileItemProps {
  alwaysShowRemoveButton?: boolean;
  disabled?: boolean;
  file: UppyFile;
  fileItemClassName?: string;
  hideStatusIndicators?: boolean;
  onRemove?: (id: string) => void;
}

export function FileItem({
  alwaysShowRemoveButton = false,
  disabled = false,
  file,
  fileItemClassName = "",
  hideStatusIndicators = false,
  onRemove,
}: FileItemProps) {
  const fileStatus = getFileStatus(file);
  const hasRemoveCallback = !!onRemove;
  const shouldShowBasedOnStatus =
    alwaysShowRemoveButton || fileStatus === FileStatus.PENDING;
  const shouldShowRemoveButton = hasRemoveCallback && shouldShowBasedOnStatus;

  const getFileIcon = (type: string) => {
    if (type === "folder") return <Folder className="h-4 w-4" />;
    if (type.startsWith("image/")) return <ImageIcon className="h-4 w-4" />;
    if (type.startsWith("video/")) return <Video className="h-4 w-4" />;
    if (type.startsWith("audio/")) return <Music className="h-4 w-4" />;
    if (type.includes("text") || type.includes("document"))
      return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  return (
    <div
      className={`bg-muted flex items-center gap-3 rounded-lg p-3 ${fileItemClassName}`}
      key={file.id}>
      {file.preview ? (
        <div className="h-10 w-10">
          {file.type.startsWith("image/") ? (
            <img
              alt=""
              className="h-10 w-10 rounded object-cover"
              src={file.preview}
            />
          ) : file.type.startsWith("video/") ? (
            <video
              className="h-10 w-10 rounded object-cover"
              src={file.preview}
            />
          ) : (
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded">
              {getFileIcon(file.type)}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded">
          {getFileIcon(file.type)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{getDisplayName(file)}</div>
        <div className="text-muted-foreground text-sm">
          {isFolderBundle(file)
            ? `Folder • ${filesize(getDisplaySize(file))}`
            : filesize(getDisplaySize(file))}
        </div>
        {!hideStatusIndicators && fileStatus !== FileStatus.PENDING && (
          <div className="mt-1">
            <div className="flex items-center gap-2 text-xs">
              <Badge variant={getBadgeVariant(fileStatus)}>
                {fileStatus === FileStatus.PREPROCESSING && "Processing..."}
                {fileStatus === FileStatus.UPLOADING &&
                  (isFolderBundle(file)
                    ? "Processing folder..."
                    : "Uploading...")}
                {fileStatus === FileStatus.COMPLETE && "Complete"}
                {fileStatus === FileStatus.ERROR && (file.error || "Error")}
              </Badge>
              {fileStatus !== FileStatus.COMPLETE &&
                ((file.progress?.percentage !== undefined) || 
                 (fileStatus === FileStatus.PREPROCESSING && file.progress?.preprocess?.value !== undefined)) && (
                  <span>
                    {Math.round(
                      fileStatus === FileStatus.PREPROCESSING 
                        ? file.progress?.preprocess?.value || 0
                        : file.progress?.percentage || 0
                    )}%
                  </span>
                )}
            </div>
            {fileStatus !== FileStatus.COMPLETE &&
              ((file.progress?.percentage !== undefined) || 
               (fileStatus === FileStatus.PREPROCESSING && file.progress?.preprocess?.value !== undefined)) && (
                <Progress
                  className="mt-1 h-1"
                  value={
                    fileStatus === FileStatus.PREPROCESSING 
                      ? file.progress?.preprocess?.value || 0
                      : file.progress?.percentage || 0
                  }
                />
              )}
          </div>
        )}
      </div>
      {shouldShowRemoveButton && (
        <Button
          disabled={disabled}
          onClick={() => onRemove(file.id)}
          size="sm"
          variant="ghost">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

function getBadgeVariant(
  status: FileStatus,
): "default" | "destructive" | "secondary" {
  switch (status) {
    case FileStatus.COMPLETE:
      return "default";
    case FileStatus.ERROR:
      return "destructive";
    default:
      return "secondary";
  }
}

function getFileStatus(file: UppyFile): FileStatus {
  if (file.error) {
    return FileStatus.ERROR;
  }
  if (file.progress?.uploadComplete) {
    return FileStatus.COMPLETE;
  }
  if (file.progress?.uploadStarted) {
    return FileStatus.UPLOADING;
  }
  // Check if file is in preprocessing state
  if (file.progress?.preprocess) {
    return FileStatus.PREPROCESSING;
  }
  return FileStatus.PENDING;
}
