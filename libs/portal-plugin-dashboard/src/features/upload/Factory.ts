import { Sdk } from "@lumeweb/portal-sdk";
import { Manager, UploadManagerConfig } from "src/features/upload/Manager";

import { UPLOAD_TYPE_AVATAR, UPLOAD_TYPE_MAIN } from "@/types/upload";

// Predefined configuration for avatar uploads
const AVATAR_UPLOAD_CONFIG: Partial<UploadManagerConfig> = {
  allowedFileTypes: ["image/*"],
  autoProceed: true,
  maxNumberOfFiles: 1,
  type: UPLOAD_TYPE_AVATAR,
};

export class Factory {
  static createAvatarUploadManager(sdk?: Sdk): Manager {
    const config: UploadManagerConfig = {
      sdk,
      ...AVATAR_UPLOAD_CONFIG,
    } as UploadManagerConfig;

    return new Manager(config);
  }

  static createMainUploadManager(sdk?: Sdk): Manager {
    const config: UploadManagerConfig = {
      sdk,
      type: UPLOAD_TYPE_MAIN,
    };

    return new Manager(config);
  }

  static createUploadManager(config: UploadManagerConfig): Manager {
    return new Manager(config);
  }
}
