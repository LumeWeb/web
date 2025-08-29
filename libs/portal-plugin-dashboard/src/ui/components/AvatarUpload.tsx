import { useApiUrl } from "@lumeweb/portal-framework-ui";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  cn,
  Progress,
} from "@lumeweb/portal-framework-ui-core";
import Uppy from "@uppy/core";
import type { UppyFile } from "@uppy/core";
import DropTarget from "@uppy/drop-target";
import XHRUpload from "@uppy/xhr-upload";
import { Check, Upload } from "lucide-react";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNotification } from "@refinedev/core";

const ENDPOINT = "/api/account/avatar";

interface AvatarUploadContextType {
  containerRef: React.RefObject<HTMLDivElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileButtonClick: () => void;
  handleFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  previewUrl: null | string;
  uploading: boolean;
  uploadProgress: number;
}

const AvatarUploadContext = createContext<AvatarUploadContextType | null>(null);

interface AvatarUploadProps {
  currentAvatar?: string;
  onSuccess: () => void;
  userName: string;
}

interface AvatarUploadProviderProps {
  children: React.ReactNode;
  onSuccess: () => void;
}

export function AvatarUpload({
  currentAvatar,
  onSuccess,
  userName,
}: AvatarUploadProps) {
  return (
    <AvatarUploadProvider onSuccess={onSuccess}>
      <AvatarUploadUI currentAvatar={currentAvatar} userName={userName} />
    </AvatarUploadProvider>
  );
}

// Component for displaying the user avatar
function AvatarDisplay({
  currentAvatar,
  previewUrl,
  userName,
}: {
  currentAvatar?: string;
  previewUrl: null | string;
  userName: string;
}) {
  return (
    <div className="flex justify-center">
      <Avatar className="h-20 w-20">
        <AvatarImage alt={userName || "User avatar"} src={previewUrl || currentAvatar} />
        <AvatarFallback className="bg-primary text-primary-foreground text-xl">
          {(userName?.trim().charAt(0)?.toUpperCase() || "?")}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}

function AvatarUploadProvider({
  children,
  onSuccess,
}: AvatarUploadProviderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<null | string>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { open } = useNotification();
  const successTimerRef = useRef<number | null>(null);

  const uppyRef = useRef<null | Uppy>(null);

  const apiUrl = useApiUrl();
  const apiDomain = new URL(apiUrl).hostname;
  const apiProto = new URL(apiUrl).protocol;

  const resetState = () => {
    // Clear Uppy and reset file input to prevent duplicate entries
    if (uppyRef.current) {
      uppyRef.current.clear();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (previewUrl) {
      try { URL.revokeObjectURL(previewUrl); } catch {}
    }
    setPreviewUrl(null);
    setUploadProgress(0);
  };

  // Revoke preview URL if component unmounts with a preview active
  useEffect(() => {
    return () => {
      if (previewUrl) {
        try { URL.revokeObjectURL(previewUrl); } catch {}
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    uppyRef.current = new Uppy({
      autoProceed: true,
      restrictions: {
        allowedFileTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
        maxFileSize: 5 * 1024 * 1024, // 5MB
        maxNumberOfFiles: 1,
      },
    })
      .use(XHRUpload, {
        endpoint: `${apiProto}//account.${apiDomain}${ENDPOINT}`,
        fieldName: "file",
        formData: true,
        method: "POST",
        responseType: "json",
        timeout: 30000,
        withCredentials: true,
      })
      .use(DropTarget, {
        target: containerRef.current!,
      });

    return () => {
      if (successTimerRef.current !== null) {
        clearTimeout(successTimerRef.current);
        successTimerRef.current = null;
      }
      if (uppyRef.current) {
        uppyRef.current.destroy();
      }
    };
  }, [apiProto, apiUrl, containerRef]);

  useEffect(() => {
    if (!uppyRef.current) return;

    const handleFileAdded = (file: UppyFile) => {
      setUploading(true);

      const url = URL.createObjectURL(file.data as Blob);
      setPreviewUrl(url);
    };

    const handleUploadProgress = (
      file: UppyFile,
      progress: { bytesTotal: number; bytesUploaded: number },
    ) => {
      const percentage =
        progress.bytesTotal > 0
          ? (progress.bytesUploaded / progress.bytesTotal) * 100
          : 0;
      setUploadProgress(percentage);
    };

    const handleUploadSuccess = async (file: UppyFile, response: any) => {
      try {
        setUploadProgress(100);
        // store timeout so we can clear it on unmount
        successTimerRef.current = window.setTimeout(() => {
          setUploading(false);
          resetState();
          onSuccess();
          
          // Show success notification
          open?.({
            type: "success",
            message: "Profile Updated",
            description: "Your profile picture has been updated successfully",
          });
        }, 500);
      } catch (err) {
        console.error("Upload success handler error:", err);
        setUploading(false);
        resetState();
        
        // Show error notification
        open?.({
          type: "error",
          message: "Processing Error",
          description: "Failed to process profile picture. Please try again.",
        });
      }
    };

    const handleUploadError = (file: UppyFile, err: Error) => {
      console.error("Upload error:", err);
      setUploading(false);
      setUploadProgress(0);
      resetState();
      
      // Show error notification
      open?.({
        type: "error",
        message: "Upload Failed",
        description: err.message || "An error occurred while uploading your profile picture",
      });
    };

    const handleRestrictionFailed = (file: UppyFile, err: Error) => {
      resetState();
      
      // Show error notification
      open?.({
        type: "error",
        message: "Invalid File",
        description: "The selected file is invalid: " + err.message,
      });
    };

    uppyRef.current.on("file-added", handleFileAdded);
    uppyRef.current.on("upload-progress", handleUploadProgress);
    uppyRef.current.on("upload-success", handleUploadSuccess);
    uppyRef.current.on("upload-error", handleUploadError);
    uppyRef.current.on("restriction-failed", handleRestrictionFailed);

    return () => {
      if (uppyRef.current) {
        uppyRef.current.off("file-added", handleFileAdded);
        uppyRef.current.off("upload-progress", handleUploadProgress);
        uppyRef.current.off("upload-success", handleUploadSuccess);
        uppyRef.current.off("upload-error", handleUploadError);
        uppyRef.current.off("restriction-failed", handleRestrictionFailed);
      }
    };
  }, [onSuccess, open]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0] && uppyRef.current) {
      const file = e.target.files[0];
      try {
        uppyRef.current.addFile({
          data: file,
          name: file.name,
          source: "file-input",
          type: file.type,
        });
      } catch (err) {
        console.error("Error adding file to Uppy:", err);
        open?.({
          type: "error",
          message: "File Error",
          description: "Error with the selected file: " + (err as Error).message,
        });
      }
    }
  };

  const handleFileButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <AvatarUploadContext.Provider
      value={{
        containerRef,
        fileInputRef,
        handleFileButtonClick,
        handleFileInput,
        previewUrl,
        uploading,
        uploadProgress,
      }}>
      {children}
    </AvatarUploadContext.Provider>
  );
}

function AvatarUploadUI({
  currentAvatar,
  userName,
}: {
  currentAvatar?: string;
  userName: string;
}) {
  const {
    containerRef,
    fileInputRef,
    handleFileButtonClick,
    handleFileInput,
    previewUrl,
    uploading,
    uploadProgress,
  } = useAvatarUpload();

  return (
    <div className="space-y-6">
      <AvatarDisplay
        currentAvatar={currentAvatar}
        previewUrl={previewUrl}
        userName={userName}
      />

      {!uploading ? (
        <div
          className={cn(
            "rounded-lg border-2 border-dashed p-8 text-center transition-colors",
            "border-muted hover:border-muted/50",
          )}
          ref={containerRef}
          role="button"
          tabIndex={0}
          aria-label="Upload profile picture. Press Enter, Space, or click to choose a file, or drag and drop an image."
          onClick={handleFileButtonClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleFileButtonClick();
            }
          }}>
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
          <Button onClick={handleFileButtonClick} variant="default">
            Choose File
          </Button>
        </div>
      ) : (
        <UploadProgress uploadProgress={uploadProgress} />
      )}
    </div>
  );
}

// Component for displaying upload progress
function UploadProgress({ uploadProgress }: { uploadProgress: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-foreground text-sm">Uploading...</span>
            <span className="text-muted-foreground text-sm">
              {Math.round(uploadProgress)}%
            </span>
          </div>
          <Progress className="h-2" value={uploadProgress} />
        </div>
        {uploadProgress === 100 && <Check className="text-success h-5 w-5" />}
      </div>
    </div>
  );
}

function useAvatarUpload() {
  const context = useContext(AvatarUploadContext);
  if (!context) {
    throw new Error(
      "useAvatarUpload must be used within an AvatarUploadProvider",
    );
  }
  return context;
}
