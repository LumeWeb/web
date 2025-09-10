"use client";

import React from "react";

import type { IUploadManager } from "@/types/upload";

import { Dropzone } from "@/ui/components/Dropzone";

interface FileUploadZoneProps {
  allowFolders?: boolean;
  alwaysShowRemoveButton?: boolean;
  disabled?: boolean;
  hideStatusIndicators?: boolean;
  onFilesChange?: (files: File[]) => void;
  serviceId?: string;
  uploadManager?: IUploadManager;
}

export function FileUploadZone({
  allowFolders,
  alwaysShowRemoveButton,
  disabled,
  hideStatusIndicators,
  onFilesChange,
  serviceId,
  uploadManager,
}: FileUploadZoneProps) {
  // Set defaults for upload wizard usage
  const hideStatusIndicatorsDefault = hideStatusIndicators ?? true;
  const alwaysShowRemoveButtonDefault = alwaysShowRemoveButton ?? true;
  const allowFoldersDefault = allowFolders ?? false;

  return (
    <Dropzone
      allowFolders={allowFoldersDefault}
      alwaysShowRemoveButton={alwaysShowRemoveButtonDefault}
      disabled={disabled}
      hideStatusIndicators={hideStatusIndicatorsDefault}
      onFilesChange={onFilesChange}
      serviceId={serviceId}
      showFileList={true}
      uploadManager={uploadManager}
    />
  );
}
