import fs from "node:fs";
import { resolve } from "path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getBaseUrl,
  normalizeConfigOptions,
  normalizePortalDomain,
  setupPluginRegistryConfig,
} from "../config";
import { DEFAULT_PORTAL_DOMAIN } from "../types";
import type { ConfigOptions, PortalPlugin } from "../types";

// ── normalizePortalDomain ──────────────────────────────────────────

describe("normalizePortalDomain", () => {
  it("returns DEFAULT_PORTAL_DOMAIN when domain is undefined", () => {
    expect(normalizePortalDomain(undefined)).toBe(DEFAULT_PORTAL_DOMAIN);
  });

  it("returns DEFAULT_PORTAL_DOMAIN when domain is empty string", () => {
    expect(normalizePortalDomain("")).toBe(DEFAULT_PORTAL_DOMAIN);
  });

  it("strips https:// prefix", () => {
    expect(normalizePortalDomain("https://example.com")).toBe("example.com");
  });

  it("strips http:// prefix", () => {
    expect(normalizePortalDomain("http://example.com")).toBe("example.com");
  });

  it("strips trailing slashes", () => {
    expect(normalizePortalDomain("example.com/")).toBe("example.com");
  });

  it("strips both protocol and trailing slashes", () => {
    expect(normalizePortalDomain("https://example.com/")).toBe("example.com");
    expect(normalizePortalDomain("http://example.com///")).toBe("example.com");
  });

  it("returns domain unchanged when no protocol or slashes", () => {
    expect(normalizePortalDomain("example.com")).toBe("example.com");
  });
});

// ── getBaseUrl ──────────────────────────────────────────────────────

describe("getBaseUrl", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns http://localhost:{port} when no tunnelHost", () => {
    expect(getBaseUrl(3000)).toBe("http://localhost:3000");
  });

  it("throws error when devPort is undefined and no tunnelHost", () => {
    expect(() => getBaseUrl(undefined)).toThrow(/must specify/);
  });

  it("error message includes plugin name when available", () => {
    const plugin: PortalPlugin = { name: "my-plugin" };
    expect(() => getBaseUrl(undefined, plugin)).toThrow(/my-plugin/);
  });

  it("uses plugin.tunnelHost when provided", () => {
    const plugin: PortalPlugin = {
      name: "tunneled",
      tunnelHost: "my.tunnel.example.com",
    };
    expect(getBaseUrl(undefined, plugin)).toBe("https://my.tunnel.example.com");
  });

  it("falls back to process.env.VITE_TUNNEL_HOST", () => {
    process.env.VITE_TUNNEL_HOST = "env.tunnel.example.com";
    expect(getBaseUrl(3000)).toBe("https://env.tunnel.example.com");
  });

  it("plugin.tunnelHost takes precedence over env var", () => {
    process.env.VITE_TUNNEL_HOST = "env.tunnel.example.com";
    const plugin: PortalPlugin = {
      name: "tunneled",
      tunnelHost: "plugin.tunnel.example.com",
    };
    expect(getBaseUrl(3000, plugin)).toBe(
      "https://plugin.tunnel.example.com",
    );
  });

  it("uses plugin.tunnelProtocol when provided", () => {
    const plugin: PortalPlugin = {
      name: "tunneled",
      tunnelHost: "my.tunnel.example.com",
      tunnelProtocol: "http",
    };
    expect(getBaseUrl(undefined, plugin)).toBe("http://my.tunnel.example.com");
  });

  it("falls back to process.env.VITE_TUNNEL_PROTOCOL", () => {
    process.env.VITE_TUNNEL_HOST = "my.tunnel.example.com";
    process.env.VITE_TUNNEL_PROTOCOL = "http";
    expect(getBaseUrl(3000)).toBe("http://my.tunnel.example.com");
  });

  it("defaults tunnelProtocol to https", () => {
    const plugin: PortalPlugin = {
      name: "tunneled",
      tunnelHost: "my.tunnel.example.com",
    };
    expect(getBaseUrl(undefined, plugin)).toBe("https://my.tunnel.example.com");
  });
});

// ── normalizeConfigOptions ──────────────────────────────────────────

describe("normalizeConfigOptions", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("uses VITE_PORT env var for base port", () => {
    process.env.VITE_PORT = "5000";
    const opts: ConfigOptions = {
      dir: "/app",
      name: "test",
      sharedModules: {},
      type: "plugin",
    };
    const result = normalizeConfigOptions(opts);
    expect(result.appPort).toBe(5000);
    expect(result.devPort).toBe(5000);
  });

  it("defaults base port to 4173 when no env var", () => {
    const opts: ConfigOptions = {
      dir: "/app",
      name: "test",
      sharedModules: {},
      type: "plugin",
    };
    const result = normalizeConfigOptions(opts);
    expect(result.appPort).toBe(4173);
    expect(result.devPort).toBe(4173);
  });

  it("sets appPort for plugin type", () => {
    const opts: ConfigOptions = {
      dir: "/app",
      name: "test",
      sharedModules: {},
      type: "plugin",
    };
    const result = normalizeConfigOptions(opts);
    expect(result.appPort).toBe(4173);
  });

  it("sets appPort to undefined for host type", () => {
    const opts: ConfigOptions = {
      dir: "/app",
      name: "test",
      sharedModules: {},
      type: "host",
    };
    const result = normalizeConfigOptions(opts);
    expect(result.appPort).toBeUndefined();
  });

  it("sets devPort from opts when provided", () => {
    const opts: ConfigOptions = {
      devPort: 8080,
      dir: "/app",
      name: "test",
      sharedModules: {},
      type: "host",
    };
    const result = normalizeConfigOptions(opts);
    expect(result.devPort).toBe(8080);
  });

  it("preserves all other opts properties", () => {
    const opts: ConfigOptions = {
      dir: "/my/app",
      name: "my-app",
      portalServer: "https://portal.example.com/",
      sharedModules: { react: { singleton: true } },
      type: "host",
    };
    const result = normalizeConfigOptions(opts);
    expect(result.dir).toBe("/my/app");
    expect(result.name).toBe("my-app");
    expect(result.portalServer).toBe("https://portal.example.com/");
    expect(result.sharedModules).toEqual({ react: { singleton: true } });
    expect(result.type).toBe("host");
  });
});

// ── setupPluginRegistryConfig ───────────────────────────────────────

describe("setupPluginRegistryConfig", () => {
  const baseOpts: ConfigOptions = {
    dir: "/app",
    name: "test",
    sharedModules: {},
    type: "host",
  };

  let existsSyncSpy: ReturnType<typeof vi.spyOn>;
  let readFileSyncSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    existsSyncSpy = vi.spyOn(fs, "existsSync");
    readFileSyncSpy = vi.spyOn(fs, "readFileSync");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("throws when config file doesn't exist", () => {
    existsSyncSpy.mockReturnValue(false);
    expect(() => setupPluginRegistryConfig(baseOpts)).toThrow(
      /not found/,
    );
  });

  it("parses local plugin entries correctly", () => {
    const registry = [
      {
        name: "local-plugin",
        port: 4180,
        tunnelHost: "local.tunnel.example.com",
        local: true,
      },
    ];

    existsSyncSpy.mockReturnValue(true);
    readFileSyncSpy.mockImplementation((path: string) => {
      if (path.includes("plugin-registry.v1.json")) {
        return JSON.stringify({ type: "array" });
      }
      return JSON.stringify(registry);
    });

    const result = setupPluginRegistryConfig(baseOpts);
    expect(result.portalConfig.plugins["local-plugin"]).toEqual({
      meta: {},
      web_bundles: ["https://local.tunnel.example.com/mf-manifest.json"],
    });
  });

  it("parses explicit web_bundles entries", () => {
    const registry = [
      {
        name: "web-bundle-plugin",
        web_bundles: [
          { manifestUrl: "https://a.example.com/mf-manifest.json" },
          { manifestUrl: "https://b.example.com/mf-manifest.json" },
        ],
      },
    ];

    existsSyncSpy.mockReturnValue(true);
    readFileSyncSpy.mockImplementation((path: string) => {
      if (path.includes("plugin-registry.v1.json")) {
        return JSON.stringify({ type: "array" });
      }
      return JSON.stringify(registry);
    });

    const result = setupPluginRegistryConfig(baseOpts);
    expect(result.portalConfig.plugins["web-bundle-plugin"]).toEqual({
      meta: {},
      web_bundles: [
        "https://a.example.com/mf-manifest.json",
        "https://b.example.com/mf-manifest.json",
      ],
    });
  });

  it("parses legacy port-based entries", () => {
    const registry = [{ name: "legacy-plugin", port: 4100 }];

    existsSyncSpy.mockReturnValue(true);
    readFileSyncSpy.mockImplementation((path: string) => {
      if (path.includes("plugin-registry.v1.json")) {
        return JSON.stringify({ type: "array" });
      }
      return JSON.stringify(registry);
    });

    const result = setupPluginRegistryConfig(baseOpts);
    expect(result.portalConfig.plugins["legacy-plugin"]).toEqual({
      meta: {},
      web_bundles: ["http://localhost:4100/mf-manifest.json"],
    });
  });

  it("validates against JSON schema and warns on invalid entries", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const registry = [{ port: 4100 }];

    existsSyncSpy.mockReturnValue(true);
    readFileSyncSpy.mockImplementation((path: string) => {
      if (path.includes("plugin-registry.v1.json")) {
        return JSON.stringify({
          type: "array",
          items: {
            type: "object",
            required: ["name"],
          },
        });
      }
      return JSON.stringify(registry);
    });

    const result = setupPluginRegistryConfig(baseOpts);
    expect(warnSpy).toHaveBeenCalled();
    expect(result.portalConfig).toBeDefined();
    warnSpy.mockRestore();
  });

  it("throws on invalid JSON", () => {
    existsSyncSpy.mockReturnValue(true);
    readFileSyncSpy.mockImplementation((path: string) => {
      if (path.includes("plugin-registry.v1.json")) {
        return JSON.stringify({ type: "array" });
      }
      return "not valid json {{{";
    });

    expect(() => setupPluginRegistryConfig(baseOpts)).toThrow(
      /Failed to setup/,
    );
  });

  it("normalizes portal domain", () => {
    const registry = [{ name: "test-plugin", port: 4100 }];

    existsSyncSpy.mockReturnValue(true);
    readFileSyncSpy.mockImplementation((path: string) => {
      if (path.includes("plugin-registry.v1.json")) {
        return JSON.stringify({ type: "array" });
      }
      return JSON.stringify(registry);
    });

    const opts: ConfigOptions = {
      ...baseOpts,
      portalServer: "https://my.portal.com/",
    };
    const result = setupPluginRegistryConfig(opts);
    expect(result.portalConfig.domain).toBe("my.portal.com");
  });

  it("handles missing meta (defaults to {})", () => {
    const registry = [{ name: "no-meta-plugin", port: 4100 }];

    existsSyncSpy.mockReturnValue(true);
    readFileSyncSpy.mockImplementation((path: string) => {
      if (path.includes("plugin-registry.v1.json")) {
        return JSON.stringify({ type: "array" });
      }
      return JSON.stringify(registry);
    });

    const result = setupPluginRegistryConfig(baseOpts);
    expect(result.portalConfig.plugins["no-meta-plugin"].meta).toEqual({});
  });

  it("preserves plugin meta when provided", () => {
    const registry = [
      {
        name: "meta-plugin",
        port: 4100,
        meta: { version: "1.0.0", description: "test" },
      },
    ];

    existsSyncSpy.mockReturnValue(true);
    readFileSyncSpy.mockImplementation((path: string) => {
      if (path.includes("plugin-registry.v1.json")) {
        return JSON.stringify({ type: "array" });
      }
      return JSON.stringify(registry);
    });

    const result = setupPluginRegistryConfig(baseOpts);
    expect(result.portalConfig.plugins["meta-plugin"].meta).toEqual({
      version: "1.0.0",
      description: "test",
    });
  });

  it("preserves plugin build info when provided", () => {
    const buildInfo = {
      architecture: "amd64",
      buildTime: "2024-01-01T00:00:00Z",
      gitBranch: "main",
      gitCommit: "abc123",
      goVersion: "1.22",
      platform: "linux",
      version: "1.0.0",
    };
    const registry = [{ name: "build-plugin", port: 4100, build: buildInfo }];

    existsSyncSpy.mockReturnValue(true);
    readFileSyncSpy.mockImplementation((path: string) => {
      if (path.includes("plugin-registry.v1.json")) {
        return JSON.stringify({ type: "array" });
      }
      return JSON.stringify(registry);
    });

    const result = setupPluginRegistryConfig(baseOpts);
    expect(result.portalConfig.plugins["build-plugin"].build).toEqual(
      buildInfo,
    );
  });

  it("uses custom pluginRegistryConfigFile when provided", () => {
    const registry = [{ name: "custom-file-plugin", port: 4100 }];

    existsSyncSpy.mockReturnValue(true);
    readFileSyncSpy.mockImplementation((path: string) => {
      if (path.includes("plugin-registry.v1.json")) {
        return JSON.stringify({ type: "array" });
      }
      return JSON.stringify(registry);
    });

    const opts: ConfigOptions = {
      ...baseOpts,
      pluginRegistryConfigFile: "custom-plugins.json",
    };
    setupPluginRegistryConfig(opts);

    const calledPath = readFileSyncSpy.mock.calls.find(
      (call: unknown[]) => !String(call[0]).includes("plugin-registry.v1.json"),
    )?.[0] as string;
    expect(calledPath).toContain("custom-plugins.json");
  });

  it("initializes feature_flags as empty object", () => {
    const registry = [{ name: "test-plugin", port: 4100 }];

    existsSyncSpy.mockReturnValue(true);
    readFileSyncSpy.mockImplementation((path: string) => {
      if (path.includes("plugin-registry.v1.json")) {
        return JSON.stringify({ type: "array" });
      }
      return JSON.stringify(registry);
    });

    const result = setupPluginRegistryConfig(baseOpts);
    expect(result.portalConfig.feature_flags).toEqual({});
  });

  it("skips ignored plugins and adds them to ignoredPlugins set", () => {
    const registry = [
      { name: "active-plugin", port: 4100 },
      { name: "ignored-plugin", port: 4101, ignore: true },
    ];

    existsSyncSpy.mockReturnValue(true);
    readFileSyncSpy.mockImplementation((path: string) => {
      if (path.includes("plugin-registry.v1.json")) {
        return JSON.stringify({ type: "array" });
      }
      return JSON.stringify(registry);
    });

    const result = setupPluginRegistryConfig(baseOpts);
    expect(result.portalConfig.plugins["active-plugin"]).toBeDefined();
    expect(result.portalConfig.plugins["ignored-plugin"]).toBeUndefined();
    expect(result.ignoredPlugins.has("ignored-plugin")).toBe(true);
    expect(result.ignoredPlugins.has("active-plugin")).toBe(false);
  });
});
