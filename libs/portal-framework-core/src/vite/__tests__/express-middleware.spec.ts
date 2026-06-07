import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_PORTAL_DOMAIN } from "../types";
import type { PortalMetaConfig } from "../types";

// ── mergeUpstreamConfig ─────────────────────────────────────────────

describe("mergeUpstreamConfig", () => {
  const localConfig: PortalMetaConfig = {
    domain: "local.example.com",
    feature_flags: { darkMode: true, beta: false },
    meta: { localKey: "localVal" },
    plugins: {
      dashboard: {
        meta: {},
        web_bundles: ["http://localhost:4100/mf-manifest.json"],
      },
      localOnly: {
        meta: { localOnly: true },
        web_bundles: ["http://localhost:4200/mf-manifest.json"],
      },
    },
  };

  const upstreamConfig: PortalMetaConfig = {
    domain: "upstream.example.com",
    feature_flags: { beta: true, newFeature: true },
    meta: { upstreamKey: "upstreamVal" },
    plugins: {
      dashboard: {
        meta: { upstreamMeta: true },
        web_bundles: ["https://prod.example.com/dashboard/mf-manifest.json"],
      },
      upstreamOnly: {
        meta: { upstreamOnly: true },
        web_bundles: ["https://prod.example.com/upstream/mf-manifest.json"],
      },
    },
  };

  it("merges plugins: upstream plugin data preserved, local web_bundles override", async () => {
    const { mergeUpstreamConfig } = await import("../express-middleware");
    const result = mergeUpstreamConfig(localConfig, upstreamConfig);
    expect(result.plugins["dashboard"]).toEqual({
      meta: { upstreamMeta: true },
      web_bundles: ["http://localhost:4100/mf-manifest.json"],
    });
  });

  it("merges feature_flags: upstream + local (upstream wins on conflict)", async () => {
    const { mergeUpstreamConfig } = await import("../express-middleware");
    const result = mergeUpstreamConfig(localConfig, upstreamConfig);
    expect(result.feature_flags).toEqual({
      darkMode: true,
      beta: true,
      newFeature: true,
    });
  });

  it("merges meta: upstream + local (upstream wins on conflict)", async () => {
    const { mergeUpstreamConfig } = await import("../express-middleware");
    const result = mergeUpstreamConfig(localConfig, upstreamConfig);
    expect(result.meta).toEqual({
      localKey: "localVal",
      upstreamKey: "upstreamVal",
    });
  });

  it("passes through upstream build info", async () => {
    const { mergeUpstreamConfig } = await import("../express-middleware");
    const withBuild: PortalMetaConfig = {
      ...upstreamConfig,
      build: {
        architecture: "amd64",
        buildTime: "2024-01-01T00:00:00Z",
        gitBranch: "main",
        gitCommit: "abc123",
        goVersion: "1.22",
        platform: "linux",
        version: "1.0.0",
      },
    };
    const result = mergeUpstreamConfig(localConfig, withBuild);
    expect(result.build).toEqual(withBuild.build);
  });

  it("handles missing upstream meta", async () => {
    const { mergeUpstreamConfig } = await import("../express-middleware");
    const noMetaUpstream: PortalMetaConfig = {
      domain: "upstream.example.com",
      feature_flags: {},
      plugins: {},
    };
    const result = mergeUpstreamConfig(localConfig, noMetaUpstream);
    expect(result.meta).toEqual({ localKey: "localVal" });
  });

  it("handles missing upstream build", async () => {
    const { mergeUpstreamConfig } = await import("../express-middleware");
    const result = mergeUpstreamConfig(localConfig, upstreamConfig);
    expect(result.build).toBeUndefined();
  });

  it("preserves local-only plugins not present in upstream", async () => {
    const { mergeUpstreamConfig } = await import("../express-middleware");
    const result = mergeUpstreamConfig(localConfig, upstreamConfig);
    expect(result.plugins["localOnly"]).toEqual({
      meta: { localOnly: true },
      web_bundles: ["http://localhost:4200/mf-manifest.json"],
    });
  });

  it("handles plugins only in upstream config (not in local)", async () => {
    const { mergeUpstreamConfig } = await import("../express-middleware");
    const result = mergeUpstreamConfig(localConfig, upstreamConfig);
    expect(result.plugins["upstreamOnly"]).toEqual({
      meta: { upstreamOnly: true },
      web_bundles: ["https://prod.example.com/upstream/mf-manifest.json"],
    });
  });

  it("preserves upstream web_bundles when local plugin has no web_bundles", async () => {
    const { mergeUpstreamConfig } = await import("../express-middleware");
    const localWithPartial: PortalMetaConfig = {
      domain: "local.example.com",
      feature_flags: {},
      plugins: {
        dashboard: {
          meta: {},
        },
      },
    };
    const result = mergeUpstreamConfig(localWithPartial, upstreamConfig);
    expect(result.plugins["dashboard"].web_bundles).toEqual([
      "https://prod.example.com/dashboard/mf-manifest.json",
    ]);
  });

  it("local web_bundles override upstream web_bundles", async () => {
    const { mergeUpstreamConfig } = await import("../express-middleware");
    const result = mergeUpstreamConfig(localConfig, upstreamConfig);
    expect(result.plugins["dashboard"].web_bundles).toEqual([
      "http://localhost:4100/mf-manifest.json",
    ]);
  });

  it("does not mutate the original localConfig", async () => {
    const { mergeUpstreamConfig } = await import("../express-middleware");
    const original = JSON.parse(JSON.stringify(localConfig));
    mergeUpstreamConfig(localConfig, upstreamConfig);
    expect(localConfig).toEqual(original);
  });
});

// ── createExpressMiddlewarePlugin ───────────────────────────────────

describe("createExpressMiddlewarePlugin", () => {
  it("returns a Vite plugin with correct name", async () => {
    const { createExpressMiddlewarePlugin } = await import(
      "../express-middleware"
    );
    const loader = () =>
      ({
        domain: DEFAULT_PORTAL_DOMAIN,
        feature_flags: {},
        plugins: {},
      }) as PortalMetaConfig;
    const plugin = createExpressMiddlewarePlugin(loader);
    expect(plugin.name).toBe("portal-express-middleware");
  });

  it("has apply: 'serve'", async () => {
    const { createExpressMiddlewarePlugin } = await import(
      "../express-middleware"
    );
    const loader = () =>
      ({
        domain: DEFAULT_PORTAL_DOMAIN,
        feature_flags: {},
        plugins: {},
      }) as PortalMetaConfig;
    const plugin = createExpressMiddlewarePlugin(loader);
    expect(plugin.apply).toBe("serve");
  });

  it("has configureServer and configurePreviewServer methods", async () => {
    const { createExpressMiddlewarePlugin } = await import(
      "../express-middleware"
    );
    const loader = () =>
      ({
        domain: DEFAULT_PORTAL_DOMAIN,
        feature_flags: {},
        plugins: {},
      }) as PortalMetaConfig;
    const plugin = createExpressMiddlewarePlugin(loader);
    expect(typeof plugin.configureServer).toBe("function");
    expect(typeof plugin.configurePreviewServer).toBe("function");
  });
});

// ── setupExpressMiddleware ──────────────────────────────────────────

const mockGet = vi.fn();
const mockUse = vi.fn();
const mockJsonMiddleware = vi.fn();
const mockExpressApp = { get: mockGet, use: mockUse };

const mockExpress = Object.assign(
  vi.fn(() => mockExpressApp),
  { json: vi.fn(() => mockJsonMiddleware) },
);

vi.mock("express", () => ({
  default: mockExpress,
}));

vi.mock("node-fetch", () => ({
  default: vi.fn(),
}));

describe("setupExpressMiddleware", () => {
  let mockServer: {
    config: { server: { proxy: Record<string, unknown> } };
    middlewares: { use: ReturnType<typeof vi.fn> };
  };

  beforeEach(() => {
    mockGet.mockClear();
    mockUse.mockClear();
    mockServer = {
      config: {
        server: {
          proxy: {},
        },
      },
      middlewares: {
        use: vi.fn(),
      },
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sets up /api/meta route", async () => {
    const { setupExpressMiddleware: setup } = await import(
      "../express-middleware"
    );
    const portalConfig: PortalMetaConfig = {
      domain: DEFAULT_PORTAL_DOMAIN,
      feature_flags: {},
      plugins: {},
    };

    setup(mockServer as never, portalConfig);
    expect(mockGet).toHaveBeenCalledWith(
      "/api/meta",
      expect.any(Function),
    );
  });

  it("sets up /api/auth/complete route when domain is default", async () => {
    const { setupExpressMiddleware: setup } = await import(
      "../express-middleware"
    );
    const portalConfig: PortalMetaConfig = {
      domain: DEFAULT_PORTAL_DOMAIN,
      feature_flags: {},
      plugins: {},
    };

    setup(mockServer as never, portalConfig);
    expect(mockGet).toHaveBeenCalledWith(
      "/api/auth/complete",
      expect.any(Function),
    );
  });

  it("does NOT set up /api/auth/complete when domain is non-default", async () => {
    const { setupExpressMiddleware: setup } = await import(
      "../express-middleware"
    );
    const portalConfig: PortalMetaConfig = {
      domain: "custom.example.com",
      feature_flags: {},
      plugins: {},
    };

    setup(mockServer as never, portalConfig);
    const authCompleteCall = mockGet.mock.calls.find(
      (call: unknown[]) => call[0] === "/api/auth/complete",
    );
    expect(authCompleteCall).toBeUndefined();
  });

  it("sets up proxy when domain is non-default", async () => {
    const { setupExpressMiddleware: setup } = await import(
      "../express-middleware"
    );
    const portalConfig: PortalMetaConfig = {
      domain: "custom.example.com",
      feature_flags: {},
      plugins: {},
    };

    setup(mockServer as never, portalConfig);
    expect(mockServer.config.server.proxy["/api/auth"]).toBeDefined();
    expect(mockServer.config.server.proxy["/api/auth"]).toEqual({
      changeOrigin: true,
      rewrite: expect.any(Function),
      secure: false,
      target: "https://custom.example.com",
    });
  });

  it("does NOT set up proxy when domain is default", async () => {
    const { setupExpressMiddleware: setup } = await import(
      "../express-middleware"
    );
    const portalConfig: PortalMetaConfig = {
      domain: DEFAULT_PORTAL_DOMAIN,
      feature_flags: {},
      plugins: {},
    };

    setup(mockServer as never, portalConfig);
    expect(mockServer.config.server.proxy["/api/auth"]).toBeUndefined();
  });

  it("calls server.middlewares.use() with express app", async () => {
    const { setupExpressMiddleware: setup } = await import(
      "../express-middleware"
    );
    const portalConfig: PortalMetaConfig = {
      domain: DEFAULT_PORTAL_DOMAIN,
      feature_flags: {},
      plugins: {},
    };

    setup(mockServer as never, portalConfig);
    expect(mockServer.middlewares.use).toHaveBeenCalled();
  });
});
