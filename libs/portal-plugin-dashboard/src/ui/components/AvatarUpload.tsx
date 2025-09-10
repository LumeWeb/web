import type { UppyFile } from "@uppy/core";

import { useApiUrl } from "@lumeweb/portal-framework-ui";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@lumeweb/portal-framework-ui-core";
import { useNotification } from "@refinedev/core";
import Uppy from "@uppy/core";
import XHRUpload from "@uppy/xhr-upload";
import React, { useEffect, useRef, useState } from "react";

import type { IUploadManager } from "@/types/upload";

import { Dropzone } from "@/ui/components/Dropzone";

import { UploadProgress } from "./UploadProgress";

const ENDPOINT = "/api/account/avatar";

interface AvatarUploadProps {
  currentAvatar?: string;
  onSuccess: () => void;
  userName: string;
}

export function AvatarUpload({
  currentAvatar,
  onSuccess,
  userName,
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<null | string>(null);
  const { open } = useNotification();
  const successTimerRef = useRef<null | number>(null);

  const apiUrl = useApiUrl();
  const apiDomain = new URL(apiUrl).hostname;
  const apiProto = new URL(apiUrl).protocol;

  const uppyRef = useRef<null | Uppy>(null);

  // Create a simple upload manager interface for the avatar uploader
  const avatarUploadManager: IUploadManager = {
    addFile: (file: File) => {
      if (uppyRef.current) {
        try {
          uppyRef.current.addFile({
            data: file,
            name: file.name,
            type: file.type,
          });
        } catch (err) {
          console.error("Error adding file to Uppy:", err);
          throw err;
        }
      }
    },
    getFiles: () => {
      if (uppyRef.current) {
        return uppyRef.current.getFiles();
      }
      return [];
    },
    removeFile: (id: string) => {
      if (uppyRef.current) {
        uppyRef.current.removeFile(id);
      }
    },
    start: () => {
      if (uppyRef.current) {
        return uppyRef.current.upload();
      }
    },
  };

  const resetState = () => {
    // Clear Uppy and reset file input to prevent duplicate entries
    if (uppyRef.current) {
      uppyRef.current.clear();
    }
    if (previewUrl) {
      try {
        URL.revokeObjectURL(previewUrl);
      } catch {}
    }
    setPreviewUrl(null);
    setUploadProgress(0);
  };

  // Revoke preview URL if component unmounts with a preview active
  useEffect(() => {
    return () => {
      if (previewUrl) {
        try {
          URL.revokeObjectURL(previewUrl);
        } catch {}
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    uppyRef.current = new Uppy({
      autoProceed: true,
      restrictions: {
        allowedFileTypes: [
          "image/png",
          "image/jpeg",
          "image/webp",
          "image/gif",
        ],
        maxFileSize: 5 * 1024 * 1024, // 5MB
        maxNumberOfFiles: 1,
      },
    }).use(XHRUpload, {
      endpoint: `${apiProto}//account.${apiDomain}${ENDPOINT}`,
      fieldName: "file",
      formData: true,
      method: "POST",
      responseType: "json",
      timeout: 30000,
      withCredentials: true,
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
  }, [apiDomain, apiProto, apiUrl]);

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
            description: "Your profile picture has been updated successfully",
            message: "Profile Updated",
            type: "success",
          });
        }, 500);
      } catch (err) {
        console.error("Upload success handler error:", err);
        setUploading(false);
        resetState();

        // Show error notification
        open?.({
          description: "Failed to process profile picture. Please try again.",
          message: "Processing Error",
          type: "error",
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
        description:
          err.message ||
          "An error occurred while uploading your profile picture",
        message: "Upload Failed",
        type: "error",
      });
    };

    const handleRestrictionFailed = (file: UppyFile, err: Error) => {
      resetState();

      // Show error notification
      open?.({
        description: "The selected file is invalid: " + err.message,
        message: "Invalid File",
        type: "error",
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

  // Custom render function for avatar drop zone
  const renderAvatarDropZone = (
    isDragOver: boolean,
    handleFileButtonClick: (e: React.KeyboardEvent | React.MouseEvent) => void,
  ) => {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors ${
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        } cursor-pointer`}
        onClick={handleFileButtonClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleFileButtonClick(e);
          }
        }}
        role="button"
        tabIndex={0}>
        <div className="text-muted-foreground mb-2 flex h-8 w-8 items-center justify-center">
          <svg
            className="h-6 w-6"
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
        <p className="text-muted-foreground text-sm">
          Drop your avatar image here or click to browse
        </p>
      </div>
    );
  };

  // Component for displaying the user avatar
  const AvatarDisplay = () => (
    <div className="flex justify-center">
      <Avatar className="h-20 w-20">
        <AvatarImage
          alt={userName || "User avatar"}
          src={previewUrl || currentAvatar}
        />
        <AvatarFallback className="bg-primary text-primary-foreground text-xl">
          {userName?.trim().charAt(0)?.toUpperCase() || "?"}
        </AvatarFallback>
      </Avatar>
    </div>
  );

  // Component for displaying upload progress
  const AvatarUploadProgress = () => (
    <UploadProgress progress={uploadProgress} variant="avatar" />
  );

  return (
    <div className="space-y-6">
      <AvatarDisplay />

      {!uploading ? (
        <Dropzone
          allowedFileTypes={[
            "image/png",
            "image/jpeg",
            "image/webp",
            "image/gif",
          ]}
          autoProceed={true}
          fieldName="file"
          maxFileSize={5 * 1024 * 1024} // 5MB
          maxNumberOfFiles={1}
          multiple={false}
          renderDropZone={renderAvatarDropZone}
          showFileList={false}
          timeout={30000}
          uploadEndpoint={`${apiProto}//account.${apiDomain}${ENDPOINT}`}
          uploadManager={avatarUploadManager}
          userName={userName}
          withCredentials={true}
        />
      ) : (
        <AvatarUploadProgress />
      )}
    </div>
  );
}
