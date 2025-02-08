import type { PortalMeta } from "@lumeweb/portal-framework-core";

export const createMockPortalMeta = (overrides: Partial<PortalMeta> = {}) => ({
  domain: "example.com",
  feature_flags: {},
  plugins: {},
  ...overrides
});

export const createMockPlugin = (meta: any = {}) => ({
  meta,
  web_bundles: []
});
