"use client";

import type { Uppy, UppyFile } from "@uppy/core";

import DropTarget from "@uppy/drop-target";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export interface DropzoneConfig {
  allowedFileTypes?: string[];
  autoProceed?: boolean;
  fieldName?: string;

  headers?: Record<string, string>;
  // File restrictions
  maxFileSize?: number;
  maxNumberOfFiles?: number;

  multiple?: boolean;
  onDragLeave?: (event: DragEvent) => void;
  onDragOver?: (event: DragEvent) => void;
  onDrop?: (event: DragEvent) => void;
  onFileAdded?: (file: DropzoneFile) => void;

  // Event callbacks
  onFilesAdded?: (files: File[]) => void;
  onUploadError?: (file: DropzoneFile, error: Error) => void;
  onUploadProgress?: (file: DropzoneFile, progress: number) => void;
  onUploadSuccess?: (file: DropzoneFile, response: any) => void;
  onValidationError?: (error: Error) => void;
  timeout?: number;
  // Upload configuration
  uploadEndpoint?: string;
  // Uppy configuration
  uppy?: Uppy;
  withCredentials?: boolean;
}

export interface DropzoneFile {
  cid?: string;
  error?: string;
  file: File;
  id: string;
  preview?: string;
  progress?: number;
  status?: "complete" | "error" | "pending" | "uploading";
}

interface DropzoneContextType {
  // Methods
  addFiles: (files: File[]) => void;
  clearFiles: () => void;

  // Refs
  containerRef: React.RefObject<HTMLDivElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  files: DropzoneFile[];

  handleFileButtonClick: (e: React.KeyboardEvent | React.MouseEvent) => void;
  handleFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // State
  isDragOver: boolean;
  removeFile: (id: string) => void;
  uploading: boolean;
}

const DropzoneContext = createContext<DropzoneContextType | null>(null);

interface DropzoneProviderProps {
  children: React.ReactNode;
  config: DropzoneConfig;
}

export function DropzoneProvider({ children, config }: DropzoneProviderProps) {
  const [files, setFiles] = useState<DropzoneFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uppyRef = useRef<null | Uppy>(config.uppy || null);

  const {
    allowedFileTypes,
    autoProceed = false,
    fieldName = "file",
    headers = {},
    maxFileSize,
    maxNumberOfFiles,
    multiple = true,
    onDragLeave,
    onDragOver,
    onDrop,
    onFileAdded,
    onFilesAdded,
    onUploadError,
    onUploadProgress,
    onUploadSuccess,
    onValidationError,
    timeout = 30000,
    uploadEndpoint,
    uppy,
    withCredentials = false,
  } = config;

  // Initialize Uppy instance if not provided
  useEffect(() => {
    if (!uppy && !uppyRef.current) {
      // Import Uppy dynamically to avoid SSR issues
      import("@uppy/core").then(({ default: Uppy }) => {
        uppyRef.current = new Uppy({
          autoProceed,
          restrictions: {
            allowedFileTypes,
            maxFileSize,
            maxNumberOfFiles,
          },
        });

        // Add XHRUpload plugin if upload endpoint is provided
        if (uploadEndpoint) {
          import("@uppy/xhr-upload").then(({ default: XHRUpload }) => {
            uppyRef.current?.use(XHRUpload, {
              endpoint: uploadEndpoint,
              fieldName,
              headers,
              timeout,
              withCredentials,
            });
          });
        }

        // Add DropTarget plugin
        uppyRef.current.use(DropTarget, {
          target: containerRef.current!,
        });

        // Set up Uppy event listeners
        setupUppyEventListeners();
      });
    } else if (uppy && !uppyRef.current) {
      uppyRef.current = uppy;
      setupUppyEventListeners();
    }

    return () => {
      if (uppyRef.current && !config.uppy) {
        uppyRef.current.destroy();
        uppyRef.current = null;
      }
    };
  }, [
    uppy,
    autoProceed,
    allowedFileTypes,
    maxFileSize,
    maxNumberOfFiles,
    uploadEndpoint,
    fieldName,
    headers,
    timeout,
    withCredentials,
  ]);

  const setupUppyEventListeners = useCallback(() => {
    if (!uppyRef.current) return;

    const handleFileAdded = (file: UppyFile) => {
      setUploading(true);

      const dropzoneFile: DropzoneFile = {
        file: file.data as File,
        id: file.id,
        preview:
          file.data instanceof File &&
          (file.data.type.startsWith("image/") ||
            file.data.type.startsWith("video/"))
            ? URL.createObjectURL(file.data)
            : undefined,
        progress: 0,
        status: "pending",
      };

      setFiles((prev) => [...prev, dropzoneFile]);
      onFileAdded?.(dropzoneFile);
    };

    const handleUploadProgress = (
      file: UppyFile,
      progress: { bytesTotal: number; bytesUploaded: number },
    ) => {
      const percentage =
        progress.bytesTotal > 0
          ? (progress.bytesUploaded / progress.bytesTotal) * 100
          : 0;

      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id
            ? { ...f, progress: percentage, status: "uploading" as const }
            : f,
        ),
      );

      const dropzoneFile = files.find((f) => f.id === file.id);
      if (dropzoneFile) {
        onUploadProgress?.(dropzoneFile, percentage);
      }
    };

    const handleUploadSuccess = (file: UppyFile, response: any) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id
            ? { ...f, progress: 100, status: "complete" as const }
            : f,
        ),
      );

      setUploading(false);

      const dropzoneFile = files.find((f) => f.id === file.id);
      if (dropzoneFile) {
        onUploadSuccess?.(dropzoneFile, response);
      }
    };

    const handleUploadError = (file: UppyFile, error: Error) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id
            ? {
                ...f,
                error: error.message,
                progress: 0,
                status: "error" as const,
              }
            : f,
        ),
      );

      setUploading(false);

      const dropzoneFile = files.find((f) => f.id === file.id);
      if (dropzoneFile) {
        onUploadError?.(dropzoneFile, error);
      }
    };

    const handleRestrictionFailed = (file: UppyFile, error: Error) => {
      onValidationError?.(error);
    };

    const handleComplete = () => {
      setUploading(false);
    };

    uppyRef.current.on("file-added", handleFileAdded);
    uppyRef.current.on("upload-progress", handleUploadProgress);
    uppyRef.current.on("upload-success", handleUploadSuccess);
    uppyRef.current.on("upload-error", handleUploadError);
    uppyRef.current.on("restriction-failed", handleRestrictionFailed);
    uppyRef.current.on("complete", handleComplete);

    return () => {
      if (uppyRef.current) {
        uppyRef.current.off("file-added", handleFileAdded);
        uppyRef.current.off("upload-progress", handleUploadProgress);
        uppyRef.current.off("upload-success", handleUploadSuccess);
        uppyRef.current.off("upload-error", handleUploadError);
        uppyRef.current.off("restriction-failed", handleRestrictionFailed);
        uppyRef.current.off("complete", handleComplete);
      }
    };
  }, [
    files,
    onFileAdded,
    onUploadProgress,
    onUploadSuccess,
    onUploadError,
    onValidationError,
  ]);

  // Notify parent of file changes
  useEffect(() => {
    if (onFilesAdded) {
      onFilesAdded(files.map((f) => f.file));
    }
  }, [files, onFilesAdded]);

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.preview) {
          try {
            URL.revokeObjectURL(file.preview);
          } catch {}
        }
      });
    };
  }, [files]);

  const validateFiles = useCallback(
    (newFiles: File[]): boolean => {
      // Check file count restrictions
      if (
        maxNumberOfFiles &&
        files.length + newFiles.length > maxNumberOfFiles
      ) {
        const error = new Error(`Maximum ${maxNumberOfFiles} files allowed`);
        onValidationError?.(error);
        return false;
      }

      // Check file types
      if (allowedFileTypes && allowedFileTypes.length > 0) {
        for (const file of newFiles) {
          const isValidType = allowedFileTypes.some((type) => {
            if (type.startsWith(".")) {
              // Extension matching
              return file.name.toLowerCase().endsWith(type.toLowerCase());
            } else {
              // MIME type matching
              return (
                file.type === type ||
                file.type.startsWith(type.replace("*", ""))
              );
            }
          });

          if (!isValidType) {
            const error = new Error(`File type not allowed: ${file.name}`);
            onValidationError?.(error);
            return false;
          }
        }
      }

      // Check file sizes
      if (maxFileSize) {
        for (const file of newFiles) {
          if (file.size > maxFileSize) {
            const error = new Error(`File too large: ${file.name}`);
            onValidationError?.(error);
            return false;
          }
        }
      }

      return true;
    },
    [
      allowedFileTypes,
      files.length,
      maxFileSize,
      maxNumberOfFiles,
      onValidationError,
    ],
  );

  const addFiles = useCallback(
    (newFiles: File[]) => {
      // Validate files first
      if (!validateFiles(newFiles)) {
        return;
      }

      // If using Uppy, add files to the instance
      if (uppyRef.current) {
        newFiles.forEach((file) => {
          try {
            uppyRef.current?.addFile({
              data: file,
              name: file.name,
              type: file.type,
            });
          } catch (err) {
            console.error("Error adding file to Uppy:", err);
            onValidationError?.(err as Error);
          }
        });
      } else {
        // Fallback: add files directly to state
        const fileItems: DropzoneFile[] = newFiles.map((file) => ({
          file,
          id: Math.random().toString(36).substr(2, 9),
          preview:
            file.type.startsWith("image/") || file.type.startsWith("video/")
              ? URL.createObjectURL(file)
              : undefined,
          progress: 0,
          status: "pending",
        }));

        setFiles((prev) => [...prev, ...fileItems]);
      }
    },
    [validateFiles, onValidationError],
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) {
        try {
          URL.revokeObjectURL(file.preview);
        } catch {}
      }

      // Remove from Uppy if available
      if (uppyRef.current) {
        uppyRef.current.removeFile(id);
      }

      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const clearFiles = useCallback(() => {
    // Clear Uppy if available
    if (uppyRef.current) {
      uppyRef.current.cancelAll();
      uppyRef.current.clear();
    }

    // Revoke preview URLs
    files.forEach((file) => {
      if (file.preview) {
        try {
          URL.revokeObjectURL(file.preview);
        } catch {}
      }
    });

    setFiles([]);
    setUploading(false);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [files]);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files);
        if (multiple || selectedFiles.length === 1) {
          addFiles(selectedFiles);
        } else if (selectedFiles.length > 1) {
          // If multiple is false, only take the first file
          addFiles([selectedFiles[0]]);
        }

        // Reset file input value to allow selecting the same file again
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [addFiles, multiple],
  );

  const handleFileButtonClick = useCallback(
    (e: React.KeyboardEvent | React.MouseEvent) => {
      e.stopPropagation();
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    },
    [],
  );

  const contextValue: DropzoneContextType = {
    addFiles,
    clearFiles,
    containerRef,
    fileInputRef,
    files,
    handleFileButtonClick,
    handleFileInput,
    isDragOver,
    removeFile,
    uploading,
  };

  return (
    <DropzoneContext.Provider value={contextValue}>
      {children}
    </DropzoneContext.Provider>
  );
}

export function useDropzoneContext() {
  const context = useContext(DropzoneContext);
  if (!context) {
    throw new Error(
      "useDropzoneContext must be used within a DropzoneProvider",
    );
  }
  return context;
}
