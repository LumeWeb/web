import type { LibraryOptions, PluginOption } from "vite";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@vitejs/plugin-react", () => {
  const reactFn = vi.fn(() => ({ name: "vite:react" }));
  return {
    __esModule: true,
    default: reactFn,
    reactCompilerPreset: vi.fn(() => "react-compiler-preset"),
  };
});

vi.mock("@rolldown/plugin-babel", () => ({
  __esModule: true,
  default: vi.fn(() => ({ name: "babel" })),
}));

vi.mock("@vitejs/devtools", () => ({
  __esModule: true,
  default: vi.fn(() => ({ name: "vite:devtools-default" })),
  DevTools: vi.fn(() => ({ name: "vite:devtools" })),
}));

vi.mock("vite", () => ({
  __esModule: true,
  default: {},
  defineConfig: vi.fn((config: unknown) => config),
}));

vi.mock("../config", () => ({
  normalizeConfigOptions: vi.fn((opts: Record<string, unknown>) => ({
    ...opts,
    appPort: opts.type === "plugin" ? 4173 : undefined,
    devPort: opts.devPort ?? 4173,
  })),
  setupPluginRegistryConfig: vi.fn(() => ({
    portalConfig: {
      domain: "default.lumeweb.com",
      feature_flags: {},
      plugins: {},
    },
  })),
}));

vi.mock("../federation", () => ({
  createHostFederationConfig: vi.fn(() => ({ name: "federation:host" })),
  createPluginFederationConfig: vi.fn(() => ({ name: "federation:plugin" })),
}));

vi.mock("../express-middleware", () => ({
  createExpressMiddlewarePlugin: vi.fn(() => ({
    name: "portal-express-middleware",
  })),
}));

vi.mock("../localhost-plugin", () => ({
  localhostAccessPlugin: vi.fn(() => ({ name: "localhost-access" })),
}));

import react from "@vitejs/plugin-react";
import { DevTools } from "@vitejs/devtools";
import babel from "@rolldown/plugin-babel";
import { defineConfig } from "vite";
import { normalizeConfigOptions, setupPluginRegistryConfig } from "../config";
import { createHostFederationConfig, createPluginFederationConfig } from "../federation";
import { createExpressMiddlewarePlugin } from "../express-middleware";
import { localhostAccessPlugin } from "../localhost-plugin";
import { Config, PLUGIN_TYPE } from "../vite-config";
import type { ConfigOptions } from "../types";

interface ResolvedConfig {
  base?: string;
  build: {
    lib?: LibraryOptions;
    minify?: boolean | "esbuild" | "terser";
    outDir?: string;
    rolldownOptions?: Record<string, unknown>;
    rollupOptions: {
      output: Record<string, unknown>;
    };
    sourcemap?: boolean | "inline" | "hidden";
    target?: string | string[];
  };
  define?: Record<string, unknown>;
  optimizeDeps?: { include?: string[] };
  plugins?: PluginOption[];
  preview?: { host?: boolean; port?: number; allowedHosts?: string[] };
  resolve?: { tsconfigPaths?: boolean };
  server?: { cors?: boolean; host?: boolean; origin?: string; port?: number };
}

function makeHostOpts(overrides: Partial<ConfigOptions> = {}): ConfigOptions {
  return {
    dir: "/app",
    name: "test-host",
    sharedModules: { react: { singleton: true } },
    type: "host",
    ...overrides,
  };
}

function makePluginOpts(overrides: Partial<ConfigOptions> = {}): ConfigOptions {
  return {
    dir: "/app",
    name: "test-plugin",
    sharedModules: { react: { singleton: true } },
    type: "plugin",
    ...overrides,
  };
}

function getConfig(opts: ConfigOptions): ResolvedConfig {
  return Config(opts) as ResolvedConfig;
}

function getOutput(opts: ConfigOptions): Record<string, unknown> {
  return getConfig(opts).build.rollupOptions.output as Record<string, unknown>;
}

function getLib(opts: ConfigOptions): LibraryOptions {
  const lib = getConfig(opts).build.lib;
  return lib as LibraryOptions;
}

describe("PLUGIN_TYPE", () => {
  it('exports "plugin" string', () => {
    expect(PLUGIN_TYPE).toBe("plugin");
  });
});

describe("Config", () => {
  beforeEach(() => {
    vi.mocked(normalizeConfigOptions).mockClear();
    vi.mocked(defineConfig).mockClear();
  });

  it("returns host config when type is host", () => {
    const config = getConfig(makeHostOpts());
    expect(config.base).toBe("");
    expect(config.build).not.toHaveProperty("lib");
  });

  it("returns plugin config when type is plugin", () => {
    const config = getConfig(makePluginOpts());
    expect(config.build).toHaveProperty("lib");
  });

  it("calls normalizeConfigOptions with opts", () => {
    const opts = makeHostOpts();
    Config(opts);
    expect(normalizeConfigOptions).toHaveBeenCalledWith(opts);
  });

  it("passes normalized devPort through to server config", () => {
    const config = getConfig(makeHostOpts());
    expect(config.server!.port).toBe(4173);
  });
});

describe("createBuildConfig", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("host type", () => {
    it("has no lib property in build config", () => {
      const config = getConfig(makeHostOpts());
      expect(config.build).not.toHaveProperty("lib");
    });

    it('defaults outDir to "dist"', () => {
      const config = getConfig(makeHostOpts());
      expect(config.build.outDir).toBe("dist");
    });

    it("uses VITE_OUTPUT_DIR env var when set", () => {
      vi.stubEnv("VITE_OUTPUT_DIR", "custom-dist");
      const config = getConfig(makeHostOpts());
      expect(config.build.outDir).toBe("custom-dist");
    });

    it("sets sourcemap to true", () => {
      const config = getConfig(makeHostOpts());
      expect(config.build.sourcemap).toBe(true);
    });

    it("sets minify to false", () => {
      const config = getConfig(makeHostOpts());
      expect(config.build.minify).toBe(false);
    });

    it('sets target to "esnext"', () => {
      const config = getConfig(makeHostOpts());
      expect(config.build.target).toBe("esnext");
    });

    it("sets assetFileNames pattern", () => {
      const output = getOutput(makeHostOpts());
      expect(output.assetFileNames).toBe("static/[ext]/[name]-[hash].[ext]");
    });

    it("sets chunkFileNames pattern", () => {
      const output = getOutput(makeHostOpts());
      expect(output.chunkFileNames).toBe("static/js/[name]-[hash].js");
    });

    it("sets entryFileNames pattern", () => {
      const output = getOutput(makeHostOpts());
      expect(output.entryFileNames).toBe("static/js/[name]-[hash].js");
    });

    it("manualChunks is a function for host type", () => {
      const output = getOutput(makeHostOpts());
      expect(typeof output.manualChunks).toBe("function");
    });

    it('manualChunks returns "loader" for ids containing "loader.ts"', () => {
      const output = getOutput(makeHostOpts());
      const manualChunks = output.manualChunks as (id: string) => string | undefined;
      expect(manualChunks("some/loader.ts")).toBe("loader");
    });

    it("manualChunks returns undefined for other ids", () => {
      const output = getOutput(makeHostOpts());
      const manualChunks = output.manualChunks as (id: string) => string | undefined;
      expect(manualChunks("other.ts")).toBeUndefined();
    });

    it("defaults minify.mangle to true", () => {
      const output = getOutput(makeHostOpts());
      const minify = output.minify as Record<string, unknown>;
      expect(minify.mangle).toBe(true);
    });

    it("uses opts.minifyMangle when set to false", () => {
      const output = getOutput(makeHostOpts({ minifyMangle: false }));
      const minify = output.minify as Record<string, unknown>;
      expect(minify.mangle).toBe(false);
    });

    it("sets minifyInternalExports to false", () => {
      const output = getOutput(makeHostOpts());
      expect(output.minifyInternalExports).toBe(false);
    });

    it("rolldownOptions is undefined when devtools not enabled", () => {
      const config = getConfig(makeHostOpts());
      expect(config.build.rolldownOptions).toBeUndefined();
    });

    it("rolldownOptions is { devtools: {} } when devtools enabled", () => {
      const config = getConfig(makeHostOpts({ devtools: { enabled: true } }));
      expect(config.build.rolldownOptions).toEqual({ devtools: {} });
    });
  });

  describe("plugin type", () => {
    it("sets lib.entry to resolve(dir, entryFile || 'src/index.ts')", () => {
      const lib = getLib(makePluginOpts());
      expect(lib.entry).toContain("/app/src/index.ts");
    });

    it("uses custom entryFile when provided", () => {
      const lib = getLib(makePluginOpts({ entryFile: "src/custom-entry.ts" }));
      expect(lib.entry).toContain("/app/src/custom-entry.ts");
    });

    it('sets lib.fileName to "index"', () => {
      const lib = getLib(makePluginOpts());
      expect(lib.fileName).toBe("index");
    });

    it("sets lib.formats to ['es']", () => {
      const lib = getLib(makePluginOpts());
      expect(lib.formats).toEqual(["es"]);
    });

    it("manualChunks is undefined for plugin type", () => {
      const output = getOutput(makePluginOpts());
      expect(output.manualChunks).toBeUndefined();
    });
  });
});

describe("createServerPreviewConfig", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("sets preview.host to true", () => {
    const config = getConfig(makeHostOpts());
    expect(config.preview!.host).toBe(true);
  });

  it("sets preview.port to opts.devPort", () => {
    const config = getConfig(makeHostOpts({ devPort: 3000 }));
    expect(config.preview!.port).toBe(3000);
  });

  it("sets preview.allowedHosts to [tunnelHost] when VITE_TUNNEL_HOST is set", () => {
    vi.stubEnv("VITE_TUNNEL_HOST", "my.tunnel.example.com");
    const config = getConfig(makeHostOpts());
    expect(config.preview!.allowedHosts).toEqual(["my.tunnel.example.com"]);
  });

  it("sets preview.allowedHosts to undefined when no tunnelHost", () => {
    const config = getConfig(makeHostOpts());
    expect(config.preview!.allowedHosts).toBeUndefined();
  });

  it("sets server.cors to true", () => {
    const config = getConfig(makeHostOpts());
    expect(config.server!.cors).toBe(true);
  });

  it("sets server.host to true", () => {
    const config = getConfig(makeHostOpts());
    expect(config.server!.host).toBe(true);
  });

  it("sets server.port to opts.devPort", () => {
    const config = getConfig(makeHostOpts({ devPort: 3000 }));
    expect(config.server!.port).toBe(3000);
  });

  it("sets server.origin to tunnelProtocol://tunnelHost when tunnelHost is set", () => {
    vi.stubEnv("VITE_TUNNEL_HOST", "my.tunnel.example.com");
    const config = getConfig(makeHostOpts());
    expect(config.server!.origin).toBe("https://my.tunnel.example.com");
  });

  it("sets server.origin to undefined when no tunnelHost", () => {
    const config = getConfig(makeHostOpts());
    expect(config.server!.origin).toBeUndefined();
  });

  it('defaults VITE_TUNNEL_PROTOCOL to "https" when not set', () => {
    vi.stubEnv("VITE_TUNNEL_HOST", "my.tunnel.example.com");
    const config = getConfig(makeHostOpts());
    expect(config.server!.origin).toBe("https://my.tunnel.example.com");
  });

  it("uses VITE_TUNNEL_PROTOCOL when set", () => {
    vi.stubEnv("VITE_TUNNEL_HOST", "my.tunnel.example.com");
    vi.stubEnv("VITE_TUNNEL_PROTOCOL", "http");
    const config = getConfig(makeHostOpts());
    expect(config.server!.origin).toBe("http://my.tunnel.example.com");
  });
});

describe("createHostConfig", () => {
  beforeEach(() => {
    vi.mocked(react).mockClear();
    vi.mocked(babel).mockClear();
    vi.mocked(DevTools).mockClear();
    vi.mocked(createHostFederationConfig).mockClear();
    vi.mocked(createPluginFederationConfig).mockClear();
    vi.mocked(createExpressMiddlewarePlugin).mockClear();
    vi.mocked(localhostAccessPlugin).mockClear();
    vi.mocked(defineConfig).mockClear();
    vi.mocked(setupPluginRegistryConfig).mockClear();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('sets base to ""', () => {
    const config = getConfig(makeHostOpts());
    expect(config.base).toBe("");
  });

  it("sets resolve.tsconfigPaths to true", () => {
    const config = getConfig(makeHostOpts());
    expect(config.resolve!.tsconfigPaths).toBe(true);
  });

  it('sets define["process.env.NODE_ENV"] to JSON.stringify(process.env.NODE_ENV || "development")', () => {
    const config = getConfig(makeHostOpts());
    expect(config.define!["process.env.NODE_ENV"]).toBe(
      JSON.stringify(process.env.NODE_ENV || "development"),
    );
  });

  it("uses NODE_ENV when set", () => {
    vi.stubEnv("NODE_ENV", "production");
    const config = getConfig(makeHostOpts());
    expect(config.define!["process.env.NODE_ENV"]).toBe(
      JSON.stringify("production"),
    );
  });

  it('sets define["process.env"] to {}', () => {
    const config = getConfig(makeHostOpts());
    expect(config.define!["process.env"]).toEqual({});
  });

  it("includes react plugin", () => {
    Config(makeHostOpts());
    expect(react).toHaveBeenCalled();
  });

  it("includes babel plugin", () => {
    Config(makeHostOpts());
    expect(babel).toHaveBeenCalled();
  });

  it("includes federation config", () => {
    Config(makeHostOpts());
    expect(createHostFederationConfig).toHaveBeenCalled();
  });

  it("includes localhostAccessPlugin", () => {
    Config(makeHostOpts());
    expect(localhostAccessPlugin).toHaveBeenCalled();
  });

  it("does NOT include DevTools when devtools.enabled is falsy", () => {
    Config(makeHostOpts());
    expect(DevTools).not.toHaveBeenCalled();
  });

  it("includes DevTools when devtools.enabled is true", () => {
    Config(makeHostOpts({ devtools: { enabled: true } }));
    expect(DevTools).toHaveBeenCalled();
  });

  it("sets optimizeDeps.include to Object.keys(sharedModules)", () => {
    const sharedModules = { react: { singleton: true }, lodash: {} };
    const config = getConfig(makeHostOpts({ sharedModules }));
    expect(config.optimizeDeps!.include).toEqual(["react", "lodash"]);
  });

  it("pushes express middleware plugin after defineConfig returns", () => {
    const config = getConfig(makeHostOpts());
    expect(createExpressMiddlewarePlugin).toHaveBeenCalled();
    const plugins = config.plugins!;
    const lastPlugin = plugins[plugins.length - 1];
    expect(lastPlugin).toEqual({ name: "portal-express-middleware" });
  });

  it("express middleware plugin is the last plugin in the array", () => {
    const config = getConfig(makeHostOpts());
    const plugins = config.plugins!;
    const lastPlugin = plugins[plugins.length - 1] as { name: string };
    expect(lastPlugin.name).toBe("portal-express-middleware");
  });
});

describe("createPluginConfig", () => {
  beforeEach(() => {
    vi.mocked(react).mockClear();
    vi.mocked(babel).mockClear();
    vi.mocked(DevTools).mockClear();
    vi.mocked(createHostFederationConfig).mockClear();
    vi.mocked(createPluginFederationConfig).mockClear();
    vi.mocked(createExpressMiddlewarePlugin).mockClear();
    vi.mocked(localhostAccessPlugin).mockClear();
    vi.mocked(defineConfig).mockClear();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('sets base to ""', () => {
    const config = getConfig(makePluginOpts());
    expect(config.base).toBe("");
  });

  it("sets resolve.tsconfigPaths to true", () => {
    const config = getConfig(makePluginOpts());
    expect(config.resolve!.tsconfigPaths).toBe(true);
  });

  it('sets define["process.env.NODE_ENV"]', () => {
    const config = getConfig(makePluginOpts());
    expect(config.define!["process.env.NODE_ENV"]).toBe(
      JSON.stringify(process.env.NODE_ENV || "development"),
    );
  });

  it('sets define["process.env"] to {}', () => {
    const config = getConfig(makePluginOpts());
    expect(config.define!["process.env"]).toEqual({});
  });

  it("includes react plugin with reactRefreshHost", () => {
    Config(makePluginOpts({ appPort: 4173 }));
    expect(react).toHaveBeenCalledWith(
      expect.objectContaining({
        reactRefreshHost: "http://localhost:4173",
      }),
    );
  });

  it("does NOT include localhostAccessPlugin", () => {
    Config(makePluginOpts());
    expect(localhostAccessPlugin).not.toHaveBeenCalled();
  });

  it("does NOT include express middleware plugin", () => {
    Config(makePluginOpts());
    expect(createExpressMiddlewarePlugin).not.toHaveBeenCalled();
  });

  it("includes optimizeDeps when opts.plugins has entries", () => {
    const config = getConfig(
      makePluginOpts({
        plugins: [{ dir: "/plugins/a", name: "plugin-a" }],
      }),
    );
    expect(config.optimizeDeps).toBeDefined();
    expect(config.optimizeDeps!.include).toBeDefined();
  });

  it("omits optimizeDeps when opts.plugins is empty", () => {
    const config = getConfig(makePluginOpts({ plugins: [] }));
    expect(config.optimizeDeps).toBeUndefined();
  });

  it("omits optimizeDeps when opts.plugins is undefined", () => {
    const config = getConfig(makePluginOpts());
    expect(config.optimizeDeps).toBeUndefined();
  });
});
