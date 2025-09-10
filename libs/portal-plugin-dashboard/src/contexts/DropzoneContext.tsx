"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

import type { IUploadManager } from "@/types/upload";

import { UploadStatus } from "@/types/upload";

export interface DropzoneConfig {
  allowedFileTypes?: string[];
  allowFolders?: boolean;
  maxFileSize?: number;
  maxNumberOfFiles?: number;
  multiple?: boolean;
  onDragLeave?: (event: DragEvent) => void;
  onDragOver?: (event: DragEvent) => void;
  onDrop?: (event: DragEvent) => void;
  onValidationError?: (error: Error) => void;
  serviceId?: string;
  uploadManager?: IUploadManager;
}

interface DropzoneContextType {
  // Refs
  containerRef: React.RefObject<HTMLDivElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  directoryInputRef: React.RefObject<HTMLInputElement>;
  // Methods
  getFiles: () => UppyFileDefault[];

  handleFileButtonClick: (e: React.KeyboardEvent | React.MouseEvent) => void;
  handleFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDirectoryButtonClick: (e: React.KeyboardEvent | React.MouseEvent) => void;
  handleDirectoryInput: (e: React.ChangeEvent<HTMLInputElement>) => void;

  // State
  isDragOver: boolean;
  removeFile: (id: string) => void;
  uploading: boolean;

  // Upload manager reference for event callback registration
  uploadManager: IUploadManager;
}

const DropzoneContext = createContext<DropzoneContextType | null>(null);

interface DropzoneProviderProps {
  children: React.ReactNode;
  config: DropzoneConfig;
}

export function DropzoneProvider({ children, config }: DropzoneProviderProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const directoryInputRef = useRef<HTMLInputElement>(null);

  const {
    allowedFileTypes,
    allowFolders,
    maxFileSize,
    maxNumberOfFiles,
    multiple = true,
    onDragLeave,
    onDragOver,
    onDrop,
    uploadManager,
  } = config;

  if (!uploadManager) {
    throw new Error("uploadManager is required in DropzoneConfig");
  }

  const getFiles = useCallback(() => {
    return uploadManager.getFiles();
  }, [uploadManager]);

  const addFiles = useCallback(
    (newFiles: File[]) => {
      // Add files through uploadManager
      newFiles.forEach((file) => {
        uploadManager.addFile(file, config.serviceId);
      });
    },
    [config.serviceId, uploadManager],
  );

  const removeFile = useCallback(
    (id: string) => {
      uploadManager.removeFile(id);
    },
    [uploadManager],
  );

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

  const handleDirectoryInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files);
        addFiles(selectedFiles);
        
        // Reset directory input value to allow selecting the same folder again
        if (directoryInputRef.current) {
          directoryInputRef.current.value = "";
        }
      }
    },
    [addFiles],
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

  const handleDirectoryButtonClick = useCallback(
    (e: React.KeyboardEvent | React.MouseEvent) => {
      e.stopPropagation();
      if (directoryInputRef.current) {
        directoryInputRef.current.click();
      }
    },
    [],
  );

  const handleDragOver = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
      onDragOver?.(e);
    },
    [onDragOver],
  );

  const handleDragLeave = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      onDragLeave?.(e);
    },
    [onDragLeave],
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (e.dataTransfer?.files) {
        const droppedFiles = Array.from(e.dataTransfer.files);
        addFiles(droppedFiles);
      }

      onDrop?.(e);
    },
    [addFiles, onDrop],
  );

  // Set up drag and drop event listeners
  const setupDragAndDropListeners = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("dragover", handleDragOver);
    container.addEventListener("dragleave", handleDragLeave);
    container.addEventListener("drop", handleDrop);

    return () => {
      container.removeEventListener("dragover", handleDragOver);
      container.removeEventListener("dragleave", handleDragLeave);
      container.removeEventListener("drop", handleDrop);
    };
  }, [handleDragOver, handleDragLeave, handleDrop]);

  // Add event listeners when component mounts
  React.useEffect(() => {
    setupDragAndDropListeners();
  }, [setupDragAndDropListeners]);

  const contextValue: DropzoneContextType = {
    containerRef,
    fileInputRef,
    directoryInputRef,
    getFiles,
    handleFileButtonClick,
    handleFileInput,
    handleDirectoryButtonClick,
    handleDirectoryInput,
    isDragOver,
    removeFile,
    uploading: uploadManager.getUploadStatus() === UploadStatus.UPLOADING,
    uploadManager,
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
