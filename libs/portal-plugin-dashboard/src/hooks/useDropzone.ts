import React, { useCallback, useEffect } from "react";
import { DropzoneProvider, useDropzoneContext, type DropzoneConfig } from "@/contexts/DropzoneContext";

interface UseDropzoneProps {
  // File restrictions
  maxFileSize?: number;
  allowedFileTypes?: string[];
  maxNumberOfFiles?: number;
  
  // Event callbacks
  onFilesAdded?: (files: File[]) => void;
  onDragOver?: (event: DragEvent) => void;
  onDragLeave?: (event: DragEvent) => void;
  onDrop?: (event: DragEvent) => void;
  onValidationError?: (error: Error) => void;
  
  // Uppy integration
  useUppy?: boolean;
  uppy?: any;
  
  // Upload configuration
  uploadEndpoint?: string;
  fieldName?: string;
  headers?: Record<string, string>;
  timeout?: number;
  withCredentials?: boolean;
  
  // File event handlers
  onFileAdded?: (file: any) => void;
  onUploadProgress?: (file: any, progress: number) => void;
  onUploadSuccess?: (file: any, response: any) => void;
  onUploadError?: (file: any, error: Error) => void;
  
  // Behavior flags
  autoProceed?: boolean;
  multiple?: boolean;
}

interface FileItem {
  id: string;
  file: File;
  preview?: string;
  status?: "pending" | "uploading" | "complete" | "error";
  progress?: number;
  error?: string;
}

interface UseDropzoneReturn {
  // Refs
  containerRef: React.RefObject<HTMLDivElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  
  // State
  isDragOver: boolean;
  files: FileItem[];
  
  // Handlers
  handleDragOver: (event: React.DragEvent) => void;
  handleDragLeave: (event: React.DragEvent) => void;
  handleDrop: (event: React.DragEvent) => void;
  handleFileInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileButtonClick: (event: React.KeyboardEvent | React.MouseEvent) => void;
  removeFile: (id: string) => void;
  
  // Methods
  addFiles: (newFiles: File[]) => void;
  reset: () => void;
}

export function useDropzone(props: UseDropzoneProps = {}): UseDropzoneReturn {
  const {
    maxFileSize,
    allowedFileTypes,
    maxNumberOfFiles,
    onFilesAdded,
    onDragOver,
    onDragLeave,
    onDrop,
    onValidationError,
    useUppy = false,
    uppy,
    autoProceed = false,
    multiple = true,
    uploadEndpoint,
    fieldName,
    headers,
    timeout,
    withCredentials,
    onFileAdded,
    onUploadProgress,
    onUploadSuccess,
    onUploadError,
  } = props;

  // Map old hook interface to new context interface
  const config: DropzoneConfig = {
    maxFileSize,
    allowedFileTypes,
    maxNumberOfFiles,
    uppy,
    autoProceed,
    multiple,
    uploadEndpoint,
    fieldName,
    headers,
    timeout,
    withCredentials,
    onFilesAdded,
    onFileAdded,
    onUploadProgress,
    onUploadSuccess,
    onUploadError,
    onValidationError,
    onDragOver,
    onDragLeave,
    onDrop,
  };

  const context = useDropzoneContext();

  // Map context files to old FileItem interface
  const files: FileItem[] = context.files.map(file => ({
    id: file.id,
    file: file.file,
    preview: file.preview,
    status: file.status,
    progress: file.progress,
    error: file.error,
  }));

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDragOver?.(e as unknown as DragEvent);
  }, [onDragOver]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDragLeave?.(e as unknown as DragEvent);
  }, [onDragLeave]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDrop?.(e as unknown as DragEvent);
  }, [onDrop]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    context.handleFileInput(e);
  }, [context]);

  const handleFileButtonClick = useCallback((e: React.KeyboardEvent | React.MouseEvent) => {
    context.handleFileButtonClick(e);
  }, [context]);

  const addFiles = useCallback((newFiles: File[]) => {
    context.addFiles(newFiles);
  }, [context]);

  const removeFile = useCallback((id: string) => {
    context.removeFile(id);
  }, [context]);

  const reset = useCallback(() => {
    context.clearFiles();
  }, [context]);

  return {
    containerRef: context.containerRef,
    fileInputRef: context.fileInputRef,
    isDragOver: context.isDragOver,
    files,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInput,
    handleFileButtonClick,
    removeFile,
    addFiles,
    reset,
  };
}

// Provider component for backward compatibility
export function DropzoneProviderWrapper({ children, config }: { children: React.ReactNode; config: DropzoneConfig }) {
  return (
    <DropzoneProvider config={config}>
      {children}
    </DropzoneProvider>
  );
}