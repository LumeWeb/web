export interface BuildInfo {
  architecture?: string;
  buildTime?: string;
  gitBranch?: string;
  gitCommit?: string;
  goVersion?: string;
  platform?: string;
  version?: string;
}

export interface Identity {
  created_at: string;
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  otp: boolean;
  verified: boolean;
}

export interface PortalMeta {
  build?: BuildInfo;
  domain: string;
  feature_flags: Record<string, boolean>;
  meta?: Record<string, unknown>;
  plugins: PortalMetaPlugins;
}

export interface PortalMetaPlugin {
  build?: BuildInfo;
  meta: PortalPluginMeta;
  web_bundles: string[];
}

export type PortalMetaPlugins = Record<string, PortalMetaPlugin>;

type PortalPluginMeta = Record<string, any>;
