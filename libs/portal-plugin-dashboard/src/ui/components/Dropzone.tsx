"use client";

import type { UppyFile } from "@uppy/core";

import { Card, CardContent } from "@lumeweb/portal-framework-ui-core";
import { UploadStatus } from "@/types/upload";
import { Button } from "@lumeweb/portal-framework-ui-core";
import { cn } from "@lumeweb/portal-framework-ui-core";
import { Upload } from "lucide-react";
import React, { useEffect, useState } from "react";

import type { IUploadManager } from "@/types/upload";

import {
  type DropzoneConfig,
  DropzoneProvider,
  useDropzoneContext,
} from "@/contexts/DropzoneContext";
import { FileItem } from "@/ui/components/FileItem";

interface DropzoneProps {
  allowedFileTypes?: string[];
  allowFolders?: boolean;
  alwaysShowRemoveButton?: boolean;
  disabled?: boolean;
  dragLeaveClassName?: string;
  dragOverClassName?: string;
  dropZoneClassName?: string;
  fileItemClassName?: string;
  fileListHeader?: React.ReactNode;
  hideStatusIndicators?: boolean;
  maxFileSize?: number;
  maxNumberOfFiles?: number;
  multiple?: boolean;
  onDragLeave?: (event: DragEvent) => void;
  onDragOver?: (event: DragEvent) => void;
  onDrop?: (event: DragEvent) => void;
  onFileRemove?: (id: string) => void;
  onFilesChange?: (files: File[]) => void;
  onUploadComplete?: () => void;
  onUploadStart?: () => void;
  renderDropZone?: (
    isDragOver: boolean,
    handleFileButtonClick: (e: React.KeyboardEvent | React.MouseEvent) => void,
    handleDirectoryButtonClick: (
      e: React.KeyboardEvent | React.MouseEvent,
    ) => void,
    defaultProps: any,
  ) => React.ReactNode;
  renderFileItem?: (
    file: UppyFile,
    removeFile: (id: string) => void,
    defaultProps: any,
  ) => React.ReactNode;
  serviceId?: string;
  showDropZone?: boolean;
  showFileList?: boolean;
  uploadManager?: IUploadManager;
}

export function Dropzone(props: DropzoneProps) {
  const config: DropzoneConfig = {
    allowedFileTypes: props.allowedFileTypes,
    allowFolders: props.allowFolders,
    maxFileSize: props.maxFileSize,
    maxNumberOfFiles: props.maxNumberOfFiles,
    multiple: props.multiple,
    onDragLeave: props.onDragLeave,
    onDragOver: props.onDragOver,
    onDrop: props.onDrop,
    onValidationError: props.onValidationError,
    serviceId: props.serviceId,
    uploadManager: props.uploadManager,
  };

  return (
    <DropzoneProvider config={config}>
      <DropzoneContent {...props} />
    </DropzoneProvider>
  );
}

function DropzoneContent({
  allowFolders = false,
  alwaysShowRemoveButton = false,
  disabled = false,
  dragLeaveClassName = "border-border hover:border-primary/50",
  dragOverClassName = "border-primary bg-primary/5",
  dropZoneClassName = "",
  fileItemClassName = "",
  fileListHeader,
  hideStatusIndicators = false,
  multiple = true,
  onFileRemove,
  onFilesChange,
  onUploadComplete,
  onUploadStart,
  renderDropZone,
  renderFileItem,
  showDropZone = true,
  showFileList = true,
}: DropzoneProps) {
  const {
    containerRef,
    fileInputRef,
    directoryInputRef,
    getFiles,
    handleFileButtonClick,
    handleFileInput,
    handleDirectoryButtonClick,
    handleDirectoryInput,
    isDragOver,
    removeFile: removeFileInternal,
    uploading,
    uploadManager,
  } = useDropzoneContext();

  const [forceUpdate, setForceUpdate] = useState(0);
  const files = getFiles();

  // Handle file removal with custom callback
  const handleRemoveFile = (id: string) => {
    removeFileInternal(id);
    onFileRemove?.(id);
    // Notify parent of file changes
    onFilesChange?.(getFiles().map((f) => f.data));
  };

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
      files.every((f) => f.status === UploadStatus.COMPLETED)
    ) {
      onUploadComplete?.();
    }
  }, [uploading, files, onUploadComplete]);

  // Wire uppy event callbacks to force component refreshes
  useEffect(() => {
    if (!uploadManager) return;

    // Force update callback to trigger re-renders
    const forceUpdateCallback = () => {
      setForceUpdate((prev) => prev + 1);
    };

    // Callback to notify parent of file changes
    const handleFilesChange = () => {
      onFilesChange?.(getFiles().map((f) => f.data));
    };

    // Register only for essential events that the component actually needs
    const cleanupFileAdded = uploadManager.on(
      "file-added",
      forceUpdateCallback,
    );
    const cleanupFileRemoved = uploadManager.on(
      "file-removed",
      forceUpdateCallback,
    );
    const cleanupUploadProgress = uploadManager.on(
      "upload-progress",
      forceUpdateCallback,
    );
    const cleanupComplete = uploadManager.on("complete", forceUpdateCallback);
    const cleanupError = uploadManager.on("error", forceUpdateCallback);

    // Also register for files-added event to trigger onFilesChange
    const cleanupFilesAdded = uploadManager.on(
      "files-added",
      handleFilesChange,
    );

    // Register for preprocess events
    const cleanupPreprocessProgress = uploadManager.on(
      "preprocess-progress",
      () => {
        forceUpdateCallback();
      },
    );

    const cleanupPreprocessComplete = uploadManager.on(
      "preprocess-complete",
      () => {
        forceUpdateCallback();
      },
    );

    // Cleanup function to remove all event callbacks
    return () => {
      cleanupFileAdded();
      cleanupFileRemoved();
      cleanupUploadProgress();
      cleanupComplete();
      cleanupError();
      cleanupPreprocessProgress();
      cleanupPreprocessComplete();
      cleanupFilesAdded();
    };
  }, [uploadManager, onFilesChange]);

  // Default drop zone renderer
  const defaultRenderDropZone = (
    isDragOver: boolean,
    handleFileButtonClick: (e: React.KeyboardEvent | React.MouseEvent) => void,
    handleDirectoryButtonClick: (
      e: React.KeyboardEvent | React.MouseEvent,
    ) => void,
  ) => {
    return (
      <div
        aria-disabled={disabled}
        className={cn(
          "dropzone-container rounded-lg border-2 border-dashed p-8 text-center transition-colors",
          dropZoneClassName,
          isDragOver ? dragOverClassName : dragLeaveClassName,
          disabled ? "cursor-not-allowed opacity-50" : "",
        )}
        ref={containerRef}>
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
        {allowFolders && (
          <input
            className="hidden"
            disabled={disabled}
            id="directory-upload-input"
            multiple={multiple}
            onChange={handleDirectoryInput}
            ref={directoryInputRef}
            type="file"
            webkitdirectory=""
            directory=""
          />
        )}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            disabled={disabled}
            onClick={handleFileButtonClick}
            type="button">
            Upload Files
          </Button>
          {allowFolders && (
            <Button
              disabled={disabled}
              onClick={handleDirectoryButtonClick}
              type="button"
              variant="secondary">
              Upload Directory
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="border-0">
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        {showDropZone &&
          (renderDropZone
            ? renderDropZone(
                isDragOver,
                handleFileButtonClick,
                handleDirectoryButtonClick,
                {
                  containerRef,
                  directoryInputRef,
                  disabled,
                  dragLeaveClassName,
                  dragOverClassName,
                  dropZoneClassName,
                  fileInputRef,
                  multiple,
                },
              )
            : defaultRenderDropZone(
                isDragOver,
                handleFileButtonClick,
                handleDirectoryButtonClick,
              ))}

        {/* File List */}
        {showFileList && files.length > 0 && (
          <div className="space-y-2">
            {fileListHeader || (
              <h4 className="font-semibold">Selected Files ({files.length})</h4>
            )}
            <div className="max-h-60 space-y-2 overflow-y-auto">
              {files.map((file) =>
                renderFileItem ? (
                  renderFileItem(file as UppyFile, handleRemoveFile, {
                    disabled,
                    fileItemClassName,
                  })
                ) : (
                  <FileItem
                    alwaysShowRemoveButton={alwaysShowRemoveButton}
                    disabled={disabled}
                    file={file as UppyFile}
                    fileItemClassName={fileItemClassName}
                    hideStatusIndicators={hideStatusIndicators}
                    key={file.id}
                    onRemove={handleRemoveFile}
                  />
                ),
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
