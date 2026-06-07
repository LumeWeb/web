import { beforeEach, describe, expect, it, vi } from "vitest";

import { createBaseFederationConfig, createHostFederationConfig, createPluginFederationConfig } from "../federation";
import type { ConfigOptions, PortalPlugin, PluginConfig } from "../types";

vi.mock("@module-federation/vite", () => ({
  federation: vi.fn((opts: unknown) => opts),
}));

vi.mock("../config", () => ({
  getBaseUrl: vi.fn(
    (devPort: number | undefined, plugin?: { tunnelHost?: string }) => {
      if (plugin?.tunnelHost) return `https://${plugin.tunnelHost}`;
      return `http://localhost:${devPort}`;
    },
  ),
}));

import { federation } from "@module-federation/vite";
import { getBaseUrl } from "../config";

// ── createBaseFederationConfig ──────────────────────────────────────

describe("createBaseFederationConfig", () => {
  beforeEach(() => {
    vi.mocked(federation).mockClear();
  });

  it("calls federation() with correct base options", () => {
    createBaseFederationConfig("my-app", [], {}, 4173);

    expect(federation).toHaveBeenCalledWith(
      expect.objectContaining({
        dts: false,
        ignoreOrigin: true,
        manifest: true,
        name: "my-app",
        publicPath: "auto",
        runtimePlugins: [],
        shared: {},
        bundleAllCSS: true,
      }),
    );
  });

  it("spreads configOverrides into federation options", () => {
    createBaseFederationConfig("my-app", [], {}, 4173, {
      filename: "custom-entry.js",
      exposes: { "./Module": "./src/module" },
    });

    expect(federation).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: "custom-entry.js",
        exposes: { "./Module": "./src/module" },
      }),
    );
  });

  it("returns the federation result", () => {
    const mockResult = { name: "result" };
    vi.mocked(federation).mockReturnValue(mockResult as never);

    const result = createBaseFederationConfig("my-app", [], {}, 4173);
    expect(result).toBe(mockResult);
  });

  it("passes runtimePlugins through", () => {
    const plugins = ["./runtime-plugin-a", "./runtime-plugin-b"];
    createBaseFederationConfig("my-app", plugins, {}, 4173);

    expect(federation).toHaveBeenCalledWith(
      expect.objectContaining({
        runtimePlugins: plugins,
      }),
    );
  });

  it("passes sharedModules through", () => {
    const shared = { react: { singleton: true } };
    createBaseFederationConfig("my-app", [], shared, 4173);

    expect(federation).toHaveBeenCalledWith(
      expect.objectContaining({
        shared,
      }),
    );
  });
});

// ── createPluginFederationConfig ────────────────────────────────────

describe("createPluginFederationConfig", () => {
  beforeEach(() => {
    vi.mocked(federation).mockClear();
  });

  it("resolves exposes paths relative to plugin.dir", () => {
    const plugin: PluginConfig = {
      dir: "/app/plugins/my-plugin",
      exposes: { "./Component": "./src/Component.tsx" },
      name: "my-plugin",
    };

    createPluginFederationConfig(plugin, [], {}, 4173);

    expect(federation).toHaveBeenCalledWith(
      expect.objectContaining({
        exposes: {
          "./Component": expect.stringContaining("/app/plugins/my-plugin/"),
        },
      }),
    );
  });

  it("sets filename with plugin name", () => {
    const plugin: PluginConfig = {
      dir: "/app",
      name: "dashboard",
    };

    createPluginFederationConfig(plugin, [], {}, 4173);

    expect(federation).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: "dashboard/remoteEntry-[hash].js",
      }),
    );
  });

  it("sets virtualModuleDir with plugin name (dots replaced with underscores)", () => {
    const plugin: PluginConfig = {
      dir: "/app",
      name: "my.plugin",
    };

    createPluginFederationConfig(plugin, [], {}, 4173);

    expect(federation).toHaveBeenCalledWith(
      expect.objectContaining({
        virtualModuleDir: "__mf__virtual_my_plugin",
      }),
    );
  });

  it("replaces ALL dots in plugin name for virtualModuleDir", () => {
    const plugin: PluginConfig = {
      dir: "/app",
      name: "org.my.plugin",
    };

    createPluginFederationConfig(plugin, [], {}, 4173);

    expect(federation).toHaveBeenCalledWith(
      expect.objectContaining({
        virtualModuleDir: "__mf__virtual_org_my_plugin",
      }),
    );
  });

  it("handles missing exposes", () => {
    const plugin: PluginConfig = {
      dir: "/app",
      name: "no-exposes",
    };

    createPluginFederationConfig(plugin, [], {}, 4173);

    expect(federation).toHaveBeenCalledWith(
      expect.objectContaining({
        exposes: undefined,
      }),
    );
  });
});

// ── createHostFederationConfig ──────────────────────────────────────

describe("createHostFederationConfig", () => {
  beforeEach(() => {
    vi.mocked(federation).mockClear();
    vi.mocked(getBaseUrl).mockClear();
  });

  it("resolves exposes paths relative to opts.dir", () => {
    const opts: ConfigOptions = {
      dir: "/app/host",
      exposes: { "./App": "./src/App.tsx" },
      name: "host-app",
      sharedModules: {},
      type: "host",
      devPort: 4173,
    };

    createHostFederationConfig(opts, []);

    expect(federation).toHaveBeenCalledWith(
      expect.objectContaining({
        exposes: {
          "./App": expect.stringContaining("/app/host/"),
        },
      }),
    );
  });

  it("normalizes shared modules: string → {requiredVersion}", () => {
    const opts: ConfigOptions = {
      dir: "/app",
      name: "host-app",
      sharedModules: { react: "^18.0.0" },
      type: "host",
      devPort: 4173,
    };

    createHostFederationConfig(opts, []);

    expect(federation).toHaveBeenCalledWith(
      expect.objectContaining({
        shared: expect.objectContaining({
          react: { requiredVersion: "^18.0.0" },
        }),
      }),
    );
  });

  it("normalizes shared modules: false → false", () => {
    const opts: ConfigOptions = {
      dir: "/app",
      name: "host-app",
      sharedModules: { unused: false },
      type: "host",
      devPort: 4173,
    };

    createHostFederationConfig(opts, []);

    expect(federation).toHaveBeenCalledWith(
      expect.objectContaining({
        shared: expect.objectContaining({
          unused: false,
        }),
      }),
    );
  });

  it("normalizes shared modules: object → spread", () => {
    const opts: ConfigOptions = {
      dir: "/app",
      name: "host-app",
      sharedModules: { react: { singleton: true, requiredVersion: "^18.0.0" } },
      type: "host",
      devPort: 4173,
    };

    createHostFederationConfig(opts, []);

    expect(federation).toHaveBeenCalledWith(
      expect.objectContaining({
        shared: expect.objectContaining({
          react: { singleton: true, requiredVersion: "^18.0.0" },
        }),
      }),
    );
  });

  it("adds import: false for plugin type", () => {
    const opts: ConfigOptions = {
      dir: "/app",
      name: "plugin-app",
      sharedModules: { react: "^18.0.0" },
      type: "plugin",
      devPort: 4173,
    };

    createHostFederationConfig(opts, []);

    expect(federation).toHaveBeenCalledWith(
      expect.objectContaining({
        shared: expect.objectContaining({
          react: { requiredVersion: "^18.0.0", import: false },
        }),
      }),
    );
  });

  it("does not add import: false for host type", () => {
    const opts: ConfigOptions = {
      dir: "/app",
      name: "host-app",
      sharedModules: { react: "^18.0.0" },
      type: "host",
      devPort: 4173,
    };

    createHostFederationConfig(opts, []);

    expect(federation).toHaveBeenCalledWith(
      expect.objectContaining({
        shared: expect.objectContaining({
          react: { requiredVersion: "^18.0.0" },
        }),
      }),
    );
    const sharedArg = vi.mocked(federation).mock.calls[0][0] as Record<string, unknown>;
    const sharedModules = sharedArg.shared as Record<string, unknown>;
    expect(sharedModules.react).not.toHaveProperty("import");
  });

  it("builds remotes from opts.plugins using getBaseUrl", () => {
    const opts: ConfigOptions = {
      dir: "/app",
      name: "host-app",
      plugins: [
        { dir: "/plugins/a", name: "plugin-a" },
        { dir: "/plugins/b", name: "plugin-b", tunnelHost: "b.tunnel.example.com" } as PortalPlugin & PluginConfig,
      ],
      sharedModules: {},
      type: "host",
      devPort: 4173,
    };

    createHostFederationConfig(opts, []);

    expect(federation).toHaveBeenCalledWith(
      expect.objectContaining({
        remotes: {
          "plugin-a": "http://localhost:4173/plugin-a/remoteEntry.js",
          "plugin-b": "https://b.tunnel.example.com/plugin-b/remoteEntry.js",
        },
      }),
    );
  });

  it("handles empty plugins list", () => {
    const opts: ConfigOptions = {
      dir: "/app",
      name: "host-app",
      plugins: [],
      sharedModules: {},
      type: "host",
      devPort: 4173,
    };

    createHostFederationConfig(opts, []);

    expect(federation).toHaveBeenCalledWith(
      expect.objectContaining({
        remotes: {},
      }),
    );
  });

  it("handles undefined plugins", () => {
    const opts: ConfigOptions = {
      dir: "/app",
      name: "host-app",
      sharedModules: {},
      type: "host",
      devPort: 4173,
    };

    createHostFederationConfig(opts, []);

    expect(federation).toHaveBeenCalledWith(
      expect.objectContaining({
        remotes: {},
      }),
    );
  });

  it("sets filename to remoteEntry-[hash].js for host", () => {
    const opts: ConfigOptions = {
      dir: "/app",
      name: "host-app",
      sharedModules: {},
      type: "host",
      devPort: 4173,
    };

    createHostFederationConfig(opts, []);

    expect(federation).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: "remoteEntry-[hash].js",
      }),
    );
  });
});
