export type Identity = {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  otp: boolean;
  verified: boolean;
  created_at: string;
};

export interface PortalMeta {
  domain: string;
  feature_flags: Record<string, boolean>;

  plugins: PortalMetaPlugins;
}

export interface PortalMetaPlugin {
  meta: PortalPluginMeta;
  web_bundles: string[];
}

export type PortalMetaPlugins = Record<string, PortalMetaPlugin>;

type PortalPluginMeta = Record<string, any>;
