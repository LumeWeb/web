"use client";

import React, { useEffect, useState } from "react";
import { useApiUrl } from "@lumeweb/portal-framework-ui";
import { Button, lazyIcon } from "@lumeweb/portal-framework-ui-core";
import { useNotification } from "@refinedev/core";

import {
  UploadManagerProvider,
  useUploadManagerContext,
} from "@/contexts/UploadManagerContext";
import { UploadStatus } from "@/types/upload";
import { UploadProgress } from "@/ui/components/UploadProgress";
import { DEFAULT_AVATAR_CONFIG } from "@/features/upload";
import { Dropzone } from "@/ui/components/Dropzone";
import { useDropzoneContext } from "@/contexts/DropzoneContext";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@lumeweb/portal-framework-ui-core";
import { createSmallFilePlugin, createLargeFilePlugin } from "@lib/util/uppy";
import XHRUpload from "@uppy/xhr-upload";
const Upload = lazyIcon("Upload");


interface AvatarUploadInnerProps {
  currentAvatar?: string;
  onSuccess: () => void;
  userName: string;
}

function AvatarUploadInner({
  currentAvatar,
  onSuccess,
  userName,
}: AvatarUploadInnerProps) {
  const { getUploadManager } = useUploadManagerContext();
  const { open } = useNotification();
  const apiUrl = useApiUrl();
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>(
    UploadStatus.IDLE,
  );

  const uploadManager = getUploadManager({
    type: "avatar",
  });

  const serviceId = "avatar-upload";

  // Register avatar service config
  useEffect(() => {
    // Check if service is already registered
    const services = uploadManager.getServices();
    const isServiceRegistered = services.some(
      (service) => service.id === serviceId,
    );

    if (!isServiceRegistered) {
      const apiDomain = new URL(apiUrl).hostname;
      const apiProto = new URL(apiUrl).protocol;
      const endpoint = `${apiProto}//account.${apiDomain}/api/account/avatar`;

      const avatarServiceConfig = {
        id: serviceId,
        name: "Avatar Upload",
        smallFilePlugin: createSmallFilePlugin(
          {
            endpoint,
            getResponseData() {
              return JSON.stringify({
                url: currentAvatar,
              });
            },
          },
          serviceId,
          XHRUpload,
        ),
        largeFilePlugin: createLargeFilePlugin(
          {
            endpoint,
          },
          serviceId,
          XHRUpload,
        ),
      };

      uploadManager.registerService(avatarServiceConfig);
    }
  }, [apiUrl]);

  useEffect(() => {
    const unsubscribeProgress = uploadManager.on("upload-progress", () => {
      setUploadProgress(uploadManager.getUploadProgress());
      setUploadStatus(uploadManager.getUploadStatus());
    });

    const unsubscribeComplete = uploadManager.on("complete", (result) => {
      if (result.successful.length > 0) {
        setUploadStatus(uploadManager.getUploadStatus());
        open?.({
          message: "Profile Updated",
          description: "Your profile picture has been updated successfully",
          type: "success",
        });
        onSuccess();
      }
      // Reset the uploader after successful upload
      uploadManager.clearFiles();
    });

    const unsubscribeError = uploadManager.on("error", () => {
      setUploadStatus(uploadManager.getUploadStatus());
      open?.({
        message: "Upload Error",
        description: "Failed to upload profile picture. Please try again.",
        type: "error",
      });
    });

    return () => {
      unsubscribeProgress();
      unsubscribeComplete();
      unsubscribeError();
    };
  }, [onSuccess, uploadManager]);

  // Clean up object URLs properly
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFilesChange = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];

      // Create a new object URL for the selected file
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    } else {
      setPreview(currentAvatar || null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Avatar Display */}
      <div className="flex justify-center">
        <Avatar className="h-20 w-20">
          <AvatarImage alt={userName} src={preview || currentAvatar} />
          <AvatarFallback>{userName?.charAt(0) || "?"}</AvatarFallback>
        </Avatar>
      </div>

      {/* Dropzone or Progress */}
      {[UploadStatus.PENDING, UploadStatus.UPLOADING, UploadStatus.PREPROCESSING].includes(uploadStatus) ? (
        <UploadProgress
          progress={uploadProgress}
          status={uploadStatus}
          variant="avatar"
        />
      ) : (
        <Dropzone
          allowedFileTypes={["image/*"]}
          maxNumberOfFiles={1}
          multiple={false}
          showFileList={false}
          uploadManager={uploadManager}
          onFilesChange={handleFilesChange}
          serviceId={serviceId}
          renderDropZone={() => <AvatarUploadDropzone />}
        />
      )}
    </div>
  );
}

function AvatarUploadDropzone({ disabled = false, multiple = false }: { disabled?: boolean; multiple?: boolean }) {
  const {
    containerRef,
    fileInputRef,
    handleFileButtonClick,
    handleFileInput,
  } = useDropzoneContext();

  return (
    <div
      aria-label="Upload profile picture. Press Enter, Space, or click to choose a file, or drag and drop an image."
      className="border-muted hover:border-muted/50 rounded-lg border-2 border-dashed p-8 text-center transition-colors"
      onClick={handleFileButtonClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleFileButtonClick(e);
        }
      }}
      ref={containerRef}
      role="button"
      tabIndex={0}>
      <input
        className="hidden"
        disabled={disabled}
        id="file-upload-input"
        multiple={multiple}
        onChange={handleFileInput}
        ref={fileInputRef}
        type="file"
      />
      <Upload className="text-muted-foreground mx-auto mb-4 h-8 w-8" />
      <p className="text-foreground mb-2">Drag and drop your image here</p>
      <p className="text-muted-foreground mb-4 text-sm">or</p>
      <Button className="bg-secondary text-foreground hover:bg-secondary/60">
        Choose File
      </Button>
    </div>
  );
}

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
  return (
    <UploadManagerProvider defaultConfig={DEFAULT_AVATAR_CONFIG}>
      <AvatarUploadInner
        currentAvatar={currentAvatar}
        onSuccess={onSuccess}
        userName={userName}
      />
    </UploadManagerProvider>
  );
}

export default AvatarUpload;
