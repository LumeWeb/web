"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@lumeweb/portal-framework-ui-core";
import { Button } from "@lumeweb/portal-framework-ui-core";
import { Progress } from "@lumeweb/portal-framework-ui-core";
import { Badge } from "@lumeweb/portal-framework-ui-core";
import { File, FileText, ImageIcon, Music, Video, X } from "lucide-react";
import React from "react";

import type { ProtocolCapability } from "@/capabilities/protocol";

import { Dropzone, type DropzoneFile } from "@/ui/components/Dropzone";

// File status constants
const FILE_STATUS_PENDING = "pending";
const FILE_STATUS_UPLOADING = "uploading";
const FILE_STATUS_COMPLETE = "complete";
const FILE_STATUS_ERROR = "error";

// UI Service Config Type
export interface UIServiceConfig {
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  id: string;
  name: string;
}

interface FileUploadZoneProps {
  disabled?: boolean;
  onFilesChange?: (files: File[]) => void;
}

export function FileUploadZone({
  disabled,
  onFilesChange,
}: FileUploadZoneProps) {
  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="h-4 w-4" />;
    if (type.startsWith("video/")) return <Video className="h-4 w-4" />;
    if (type.startsWith("audio/")) return <Music className="h-4 w-4" />;
    if (type.includes("text") || type.includes("document"))
      return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  return (
    <Dropzone
      disabled={disabled}
      multiple={true}
      onFilesChange={onFilesChange}
      renderDropZone={(isDragOver, handleFileButtonClick) => (
        <div
          aria-disabled={disabled}
          className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          onClick={handleFileButtonClick}
          onDrop={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !disabled) {
              e.preventDefault();
              handleFileButtonClick(e);
            }
          }}
          role="button"
          tabIndex={disabled ? -1 : 0}>
          <input
            className="hidden"
            disabled={disabled}
            id="file-upload-input"
            multiple
            type="file"
          />
          <div className="text-muted-foreground mx-auto mb-4 h-12 w-12">
            <svg
              className="h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold">Drop files here</h3>
          <p className="text-muted-foreground mb-4">
            or click to browse your files
          </p>
          <Button disabled={disabled}>Browse Files</Button>
        </div>
      )}
      renderFileItem={(
        file: DropzoneFile,
        removeFile: (id: string) => void,
      ) => (
        <div
          className="bg-muted flex items-center gap-3 rounded-lg p-3"
          key={file.id}>
          {file.preview ? (
            <div className="h-10 w-10">
              {file.file.type.startsWith("image/") ? (
                <img
                  alt=""
                  className="h-10 w-10 rounded object-cover"
                  src={file.preview}
                />
              ) : file.file.type.startsWith("video/") ? (
                <video
                  className="h-10 w-10 rounded object-cover"
                  src={file.preview}
                />
              ) : (
                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded">
                  {getFileIcon(file.file.type)}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded">
              {getFileIcon(file.file.type)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium">{file.file.name}</div>
            <div className="text-muted-foreground text-sm">
              {formatFileSize(file.file.size)}
            </div>
            {file.status !== FILE_STATUS_PENDING && (
              <div className="mt-1">
                <div className="flex items-center gap-2 text-xs">
                  <Badge
                    variant={
                      file.status === FILE_STATUS_COMPLETE
                        ? "default"
                        : "secondary"
                    }>
                    {file.status === FILE_STATUS_UPLOADING && "Uploading..."}
                    {file.status === FILE_STATUS_COMPLETE && "Complete"}
                    {file.status === FILE_STATUS_ERROR && "Error"}
                  </Badge>
                  {file.status !== FILE_STATUS_COMPLETE &&
                    file.progress !== undefined && (
                      <span>{Math.round(file.progress)}%</span>
                    )}
                </div>
                {file.status !== FILE_STATUS_COMPLETE &&
                  file.progress !== undefined && (
                    <Progress className="mt-1 h-1" value={file.progress} />
                  )}
              </div>
            )}
          </div>
          {file.status === FILE_STATUS_PENDING && (
            <Button
              disabled={disabled}
              onClick={() => removeFile(file.id)}
              size="sm"
              variant="ghost">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
      showFileList={true}
    />
  );
}
