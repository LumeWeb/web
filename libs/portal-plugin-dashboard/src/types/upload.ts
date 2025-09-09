export interface PluginConfig {
  options: object;
  plugin: any; // The actual Uppy plugin
}

export interface ServiceConfig {
  id: string;
  largeFilePlugin: PluginConfig;
  name: string;
  smallFilePlugin: PluginConfig;
}

// UI Service Config Type for FileUploadZone
export interface UIServiceConfig {
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  id: string;
  name: string;
}

export type UploadStatus = "completed" | "error" | "idle" | "uploading";
