import type { ModuleFederationOptions } from "@module-federation/vite";

import type { SharedModules } from "./federation";

/** Build info matching the Go build.Info struct. See schemas/portal-meta.v1.json */
export interface BuildInfo {
  architecture: string;
  buildTime: string;
  gitBranch: string;
  gitCommit: string;
  goVersion: string;
  platform: string;
  version: string;
}

export type PluginMeta = Record<string, unknown>;

export interface PortalMetaConfig {
  build?: BuildInfo;
  domain: string;
  feature_flags: Record<string, boolean>;
  meta?: Record<string, unknown>;
  plugins: Record<string, PortalPluginConfig>;
}

export interface PortalPluginConfig {
  build?: BuildInfo;
  meta: PluginMeta;
  web_bundles: string[];
}

/** A web bundle definition in the plugin registry. See schemas/plugin-registry.v1.json */
export interface RegistryWebBundle {
  manifestUrl: string;
  targetApps?: string[];
}

export interface PortalPlugin {
  name: string;
  port?: number;
  tunnelHost?: string;
  tunnelProtocol?: "http" | "https";
  local?: boolean;
  /**
   * When true, this plugin is excluded from the /api/meta response entirely
   * — both local entries and upstream (server-side) plugins with the same name.
   * The client will never see the plugin, so Module Federation won't load it.
   */
  ignore?: boolean;
  web_bundles?: RegistryWebBundle[];
  meta?: PluginMeta;
  build?: BuildInfo;
}

export interface DevToolsOptions {
  /** Enable DevTools plugin. Defaults to false. */
  enabled?: boolean;
  /** Generate DevTools static build alongside app build. Defaults to true when enabled. */
  buildWithApp?: boolean;
  /** Output directory for DevTools build, relative to build.outDir. Defaults to "devtools". */
  outDir?: string;
}

export interface ConfigOptions {
  /** Port number for react refresh host when type is "plugin" */
  appPort?: number;
  /** DevTools configuration */
  devtools?: DevToolsOptions;
  devPort?: number;
  dir: string;
  entryFile?: string;
  exposes?: ModuleFederationOptions["exposes"];
  /** Enable mangling of variable names in minified output. Defaults to true. */
  minifyMangle?: boolean;
  name: string;
  pluginRegistryConfigFile?: string;
  plugins?: PluginConfig[];
  portalServer?: string;
  sharedModules: SharedModules;
  type: "host" | "plugin";
}

export interface PluginConfig {
  dir: string;
  exposes?: ModuleFederationOptions["exposes"];
  name: string;
}

export const DEFAULT_PORTAL_DOMAIN = "default.lumeweb.com";
export const DEFAULT_PLUGIN_REGISTRY_FILE = "plugin.config.json";
