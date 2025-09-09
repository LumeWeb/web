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
import {
  CheckCircle,
  Copy,
  Eye,
  File,
  FileText,
  ImageIcon,
  Music,
  RotateCcw,
  Share,
  Upload,
  Video,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import {
  type DropzoneConfig,
  type DropzoneFile,
  DropzoneProvider,
  useDropzoneContext,
} from "@/contexts/DropzoneContext";

// File status constants
const FILE_STATUS_PENDING = "pending";
const FILE_STATUS_UPLOADING = "uploading";
const FILE_STATUS_COMPLETE = "complete";
const FILE_STATUS_ERROR = "error";

// Upload stage constants
const UPLOAD_STAGE_SELECT = "select";
const UPLOAD_STAGE_UPLOAD = "upload";
const UPLOAD_STAGE_COMPLETE = "complete";

interface DropzoneProps {
  allowedFileTypes?: string[];
  autoProceed?: boolean;
  // Avatar mode
  avatarMode?: boolean;

  currentAvatar?: string;
  disabled?: boolean;
  dragLeaveClassName?: string;

  dragOverClassName?: string;
  // Styling
  dropZoneClassName?: string;
  dropZoneContent?: React.ReactNode;
  fieldName?: string;
  fileItemClassName?: string;
  fileListHeader?: React.ReactNode;

  headers?: Record<string, string>;
  // File restrictions
  maxFileSize?: number;
  maxNumberOfFiles?: number;
  multiple?: boolean;

  onAvatarSuccess?: () => void;
  onCopy?: (text: string) => void;
  onDragLeave?: (event: DragEvent) => void;
  // Event handlers
  onDragOver?: (event: DragEvent) => void;
  onDrop?: (event: DragEvent) => void;
  // File event handlers
  onFileAdded?: (file: DropzoneFile) => void;
  onFileRemove?: (id: string) => void;

  // Core functionality
  onFilesChange?: (files: File[]) => void;
  onShare?: (file: DropzoneFile) => void;

  onUploadComplete?: () => void;
  onUploadError?: (file: DropzoneFile, error: Error) => void;
  onUploadProgress?: (file: DropzoneFile, progress: number) => void;
  onUploadStart?: () => void;
  onUploadSuccess?: (file: DropzoneFile, response: any) => void;

  onValidationError?: (error: Error) => void;
  onView?: (file: DropzoneFile) => void;
  renderDropZone?: (
    isDragOver: boolean,
    handleFileButtonClick: (e: React.KeyboardEvent | React.MouseEvent) => void,
  ) => React.ReactNode;
  renderFileItem?: (
    file: DropzoneFile,
    removeFile: (id: string) => void,
  ) => React.ReactNode;

  // Custom actions for completed files
  showCopyAction?: boolean;
  showDropZone?: boolean;
  // UI configuration
  showFileList?: boolean;
  showShareAction?: boolean;

  showViewAction?: boolean;
  timeout?: number;
  // Upload configuration
  uploadEndpoint?: string;
  // Uppy integration
  uppy?: any;
  userName?: string;
  withCredentials?: boolean;
}

export function Dropzone(props: DropzoneProps) {
  const config: DropzoneConfig = {
    allowedFileTypes: props.allowedFileTypes,
    autoProceed: props.autoProceed,
    fieldName: props.fieldName,
    headers: props.headers,
    maxFileSize: props.maxFileSize,
    maxNumberOfFiles: props.maxNumberOfFiles,
    multiple: props.multiple,
    onDragLeave: props.onDragLeave,
    onDragOver: props.onDragOver,
    onDrop: props.onDrop,
    onFileAdded: props.onFileAdded,
    onFilesAdded: props.onFilesChange,
    onUploadError: props.onUploadError,
    onUploadProgress: props.onUploadProgress,
    onUploadSuccess: (file, response) => {
      props.onUploadSuccess?.(file, response);
      if (props.avatarMode) {
        // Handle avatar success with delay for UX
        setTimeout(() => {
          props.onAvatarSuccess?.();
        }, 500);
      }
    },
    onValidationError: props.onValidationError,
    timeout: props.timeout,
    uploadEndpoint: props.uploadEndpoint,
    uppy: props.uppy,
    withCredentials: props.withCredentials,
  };

  return (
    <DropzoneProvider config={config}>
      <DropzoneContent {...props} />
    </DropzoneProvider>
  );
}

function DropzoneContent({
  allowedFileTypes,
  autoProceed = false,
  avatarMode = false,
  currentAvatar,
  disabled = false,
  dragLeaveClassName = "border-border hover:border-primary/50",
  dragOverClassName = "border-primary bg-primary/5",
  dropZoneClassName = "",
  dropZoneContent,
  fieldName,
  fileItemClassName = "",
  fileListHeader,
  headers,
  maxFileSize,
  maxNumberOfFiles,
  multiple = true,
  onAvatarSuccess,
  onCopy,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileAdded,
  onFileRemove,
  onFilesChange,
  onShare,
  onUploadComplete,
  onUploadError,
  onUploadProgress,
  onUploadStart,
  onUploadSuccess,
  onValidationError,
  onView,
  renderDropZone,
  renderFileItem,
  showCopyAction = false,
  showDropZone = true,
  showFileList = true,
  showShareAction = false,
  showViewAction = false,
  timeout,
  uploadEndpoint,
  uppy,
  userName = "",
  withCredentials,
}: DropzoneProps) {
  const [uploadStage, setUploadStage] = useState<
    | typeof UPLOAD_STAGE_COMPLETE
    | typeof UPLOAD_STAGE_SELECT
    | typeof UPLOAD_STAGE_UPLOAD
  >(UPLOAD_STAGE_SELECT);

  const {
    addFiles,
    clearFiles,
    containerRef,
    fileInputRef,
    files,
    handleFileButtonClick,
    handleFileInput,
    isDragOver,
    removeFile: removeFileInternal,
    uploading,
  } = useDropzoneContext();

  // Handle file removal with custom callback
  const handleRemoveFile = (id: string) => {
    removeFileInternal(id);
    onFileRemove?.(id);
  };

  // Handle avatar upload success
  const handleAvatarSuccess = () => {
    setUploadStage(UPLOAD_STAGE_COMPLETE);
    onAvatarSuccess?.();
  };

  // Reset upload stage when files change
  useEffect(() => {
    if (files.length === 0) {
      setUploadStage(UPLOAD_STAGE_SELECT);
    }
  }, [files.length]);

  // Handle upload start
  useEffect(() => {
    if (uploading && files.length > 0) {
      onUploadStart?.();
    }
  }, [uploading, files.length, onUploadStart]);

  // Handle upload complete
  useEffect(() => {
    if (
      !uploading &&
      files.length > 0 &&
      files.every((f) => f.status === "complete")
    ) {
      onUploadComplete?.();
    }
  }, [uploading, files, onUploadComplete]);

  // Custom file item renderer
  const defaultRenderFileItem = (file: DropzoneFile) => {
    if (avatarMode) {
      return (
        <div className="bg-muted flex items-center justify-between rounded-lg p-4">
          <div className="flex items-center gap-3">
            {getFileIcon(file.file.type)}
            <div>
              <div className="font-medium">{file.file.name}</div>
              <div className="text-muted-foreground text-sm">
                {formatFileSize(file.file.size)}{" "}
                {file.cid ? `• Pinned to network` : ""}
              </div>
            </div>
          </div>
          {file.cid && (
            <div className="flex items-center gap-2">
              <code className="bg-background rounded px-2 py-1 font-mono text-xs">
                {file.cid}
              </code>
              {showCopyAction && (
                <Button
                  onClick={() => {
                    if (file.cid) {
                      navigator.clipboard.writeText(file.cid);
                      onCopy?.(file.cid);
                    }
                  }}
                  size="sm"
                  variant="outline">
                  <Copy className="h-3 w-3" />
                </Button>
              )}
              {showShareAction && (
                <Button
                  onClick={() => onShare?.(file)}
                  size="sm"
                  variant="outline">
                  <Share className="h-3 w-3" />
                </Button>
              )}
              {showViewAction && (
                <Button
                  onClick={() => onView?.(file)}
                  size="sm"
                  variant="outline">
                  <Eye className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        className={`bg-muted flex items-center gap-3 rounded-lg p-3 ${fileItemClassName}`}
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
            onClick={() => handleRemoveFile(file.id)}
            size="sm"
            variant="ghost">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  };

  // Custom drop zone renderer
  const defaultRenderDropZone = (
    isDragOver: boolean,
    handleFileButtonClick: (e: React.KeyboardEvent | React.MouseEvent) => void,
  ) => {
    if (avatarMode) {
      return (
        <div
          aria-disabled={disabled}
          aria-label="Upload profile picture. Press Enter, Space, or click to choose a file, or drag and drop an image."
          className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${dropZoneClassName} ${
            isDragOver ? dragOverClassName : dragLeaveClassName
          }`}
          onClick={handleFileButtonClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleFileButtonClick(e);
            }
          }}
          ref={containerRef}
          role="button"
          tabIndex={disabled ? -1 : 0}>
          <input
            accept="image/*"
            className="hidden"
            onChange={handleFileInput}
            ref={fileInputRef}
            type="file"
          />
          <Upload className="text-muted-foreground mx-auto mb-4 h-8 w-8" />
          <p className="text-foreground mb-2">Drag and drop your image here</p>
          <p className="text-muted-foreground mb-4 text-sm">or</p>
          <Button disabled={disabled} variant="default">
            Choose File
          </Button>
        </div>
      );
    }

    return (
      <div
        aria-disabled={disabled}
        className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${dropZoneClassName} ${
          isDragOver ? dragOverClassName : dragLeaveClassName
        } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
        onClick={handleFileButtonClick}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={onDrop}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            e.preventDefault();
            handleFileButtonClick(e);
          }
        }}
        ref={containerRef}
        role="button"
        tabIndex={disabled ? -1 : 0}>
        <Upload className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
        <h3 className="mb-2 text-lg font-semibold">Drop files here</h3>
        <p className="text-muted-foreground mb-4">
          or click to browse your files
        </p>
        <input
          className="hidden"
          disabled={disabled}
          id="file-upload-input"
          multiple={multiple}
          onChange={handleFileInput}
          ref={fileInputRef}
          type="file"
        />
        <Button disabled={disabled}>Browse Files</Button>
      </div>
    );
  };

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

  if (avatarMode && uploadStage === UPLOAD_STAGE_COMPLETE) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-accent flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Upload Complete
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {files.map((file) =>
            renderFileItem
              ? renderFileItem(file, handleRemoveFile)
              : defaultRenderFileItem(file),
          )}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => {
                clearFiles();
                setUploadStage("select");
              }}
              variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              Upload More
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {avatarMode && (
        <CardHeader>
          <CardTitle>Update Profile Picture</CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        {showDropZone &&
          (renderDropZone
            ? renderDropZone(isDragOver, handleFileButtonClick)
            : defaultRenderDropZone(isDragOver, handleFileButtonClick))}

        {/* File List */}
        {showFileList && files.length > 0 && (
          <div className="space-y-2">
            {fileListHeader || (
              <h4 className="font-semibold">Selected Files ({files.length})</h4>
            )}
            <div className="max-h-60 space-y-2 overflow-y-auto">
              {files.map((file) =>
                renderFileItem
                  ? renderFileItem(file, handleRemoveFile)
                  : defaultRenderFileItem(file),
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
