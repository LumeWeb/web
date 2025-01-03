export type PluginConfig = {
  plugin: any; // The actual Uppy plugin
  options: object;
};

export type ServiceConfig = {
  id: string;
  name: string;
  smallFilePlugin: PluginConfig;
  largeFilePlugin: PluginConfig;
};
