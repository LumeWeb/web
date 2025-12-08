// @ts-nocheck
import type { ModuleFederationOptions } from "@module-federation/vite";
import type { Plugin } from "vite";

import { federation } from "@module-federation/vite";
import react from "@vitejs/plugin-react";
import express from "express";
import fetch from "node-fetch";
import fs from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

interface BuildInfo {
  architecture: string;
  buildTime: string;
  gitBranch: string;
  gitCommit: string;
  goVersion: string;
  platform: string;
  version: string;
}

type PluginMeta = Record<string, unknown>;

interface PortalMetaConfig {
  build: BuildInfo;
  domain: string;
  feature_flags: Record<string, boolean>;
  meta?: Record<string, unknown>;
  plugins: Record<string, PortalPluginConfig>;
}

interface PortalPluginConfig {
  build: BuildInfo;
  meta: PluginMeta;
  web_bundles: string[];
}

const DEFAULT_PORTAL_DOMAIN = "default.lumeweb.com";

function getBaseUrl(devPort: number, plugin?: PortalPlugin) {
  const tunnelHost = plugin?.tunnelHost || process.env.VITE_TUNNEL_HOST;
  if (!tunnelHost) {
    return `http://localhost:${devPort}`;
  }
  const tunnelProtocol = process.env.VITE_TUNNEL_PROTOCOL || "https";
  return `${tunnelProtocol}://${tunnelHost}:${devPort}`;
}

function normalizePortalDomain(domain: string | undefined): string {
  if (!domain) return DEFAULT_PORTAL_DOMAIN;
  return domain.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

function setupPluginRegistryConfig(opts: ConfigOptions) {
  const configFile =
    opts.pluginRegistryConfigFile ?? DEFAULT_PLUGIN_REGISTRY_FILE;
  const configPath = resolve(opts.dir, configFile);

  try {
    const configFileContent = fs.readFileSync(configPath, "utf-8");
    const proxyConfig = JSON.parse(configFileContent) as PortalPlugin[];

    const portalConfig = {
      domain: normalizePortalDomain(opts.portalServer),
      feature_flags: {},
      plugins: proxyConfig.reduce((acc, route) => {
        acc[route.name] = {
          meta: {},
          web_bundles: [`${getBaseUrl(route.port, route)}/mf-manifest.json`],
        };
        return acc;
      }, {}),
    };

    return { portalConfig };
  } catch (error) {
    console.error("Error reading or parsing proxy config file:", error);
    throw new Error(
      `Failed to setup plugin registry config from ${configPath}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

const require = createRequire(import.meta.url);

export interface ConfigOptions {
  /** Port number for react refresh host when type is "plugin" */
  appPort?: number;
  devPort?: number;
  dir: string;
  entryFile?: string;
  exposes?: ModuleFederationOptions["exposes"];
  name: string;
  pluginRegistryConfigFile?: string;
  plugins?: PluginConfig[];
  portalServer?: string;
  sharedModules: ModuleFederationOptions["shared"];
  type: "host" | "plugin";
}

export interface PluginConfig {
  dir: string;
  exposes?: ModuleFederationOptions["exposes"];
  name: string;
}

interface PortalPlugin {
  name: string;
  port: number;
  tunnelHost?: string;
}

const DEFAULT_PLUGIN_REGISTRY_FILE = "plugin.config.json";

export function Config(opts: ConfigOptions) {
  const normalizedOpts = normalizeConfigOptions(opts);
  const resolvedRuntimePlugins: string[] = [];
  try {
    const bridgeReactPluginPath =
      require.resolve("@module-federation/bridge-react/plugin");
    resolvedRuntimePlugins.push(bridgeReactPluginPath);
  } catch (error) {
    console.error(
      "CRITICAL: Failed to resolve runtime plugin '@module-federation/bridge-react/plugin'. Make sure it's installed.",
      error,
    );
    throw new Error(
      "Failed to resolve required runtime plugin '@module-federation/bridge-react/plugin'.",
    );
  }

  function createBaseFederationConfig(
    name: string,
    runtimePlugins: string[],
    sharedModules: ModuleFederationOptions["shared"],
    devPort: number,
    isPlugin: boolean,
    configOverrides: Partial<ModuleFederationOptions> = {},
  ) {
    return federation({
      ignoreOrigin: true,
      manifest: true,
      name,
      publicPath: "auto",
      remotePlugin: isPlugin,
      runtimePlugins,
      shared: sharedModules,
      bundleAllCSS: true,
      ...configOverrides,
    });
  }

  function createPluginFederationConfig(
    plugin: PluginConfig,
    runtimePlugins: string[],
    sharedModules: ModuleFederationOptions["shared"],
    devPort: number,
  ) {
    const resolvedExposes = plugin.exposes
      ? Object.fromEntries(
          Object.entries(plugin.exposes).map(([key, value]) => [
            key,
            resolve(plugin.dir, value),
          ]),
        )
      : undefined;
    return createBaseFederationConfig(
      plugin.name,
      runtimePlugins,
      sharedModules,
      devPort,
      true,
      {
        exposes: resolvedExposes,
        filename: `${plugin.name}/remoteEntry-[hash].js`,
        virtualModuleDir: `__mf__virtual_${plugin.name.replace(".", "_")}`,
      },
    );
  }

  function createHostFederationConfig(
    opts: ConfigOptions,
    runtimePlugins: string[],
  ) {
    const resolvedExposes = opts.exposes
      ? Object.fromEntries(
          Object.entries(opts.exposes).map(([key, value]) => [
            key,
            resolve(opts.dir, value),
          ]),
        )
      : undefined;

    const importCfg = opts.type == "plugin" ? { import: false } : {};

    const finalSharedModules = Object.fromEntries(
      Object.entries(opts.sharedModules).map(([key, config]) => {
        if (config === false) {
          return [key, false];
        }
        if (typeof config === "string") {
          return [key, { requiredVersion: config, ...importCfg }];
        }
        if (typeof config === "object") {
          return [key, { ...config, ...importCfg }];
        }
        return [key, importCfg];
      }),
    );

    return createBaseFederationConfig(
      opts.name,
      runtimePlugins,
      finalSharedModules,
      opts.devPort!,
      opts.type == "plugin",
      {
        exposes: resolvedExposes,
        filename: "remoteEntry-[hash].js",
        remotes:
          opts.plugins?.reduce(
            (acc, plugin) => {
              acc[plugin.name] =
                `${getBaseUrl(opts.devPort!, plugin)}/${plugin.name}/remoteEntry.js`;
              return acc;
            },
            {} as Record<string, string>,
          ) || {},
      },
    );
  }

  const corePlugins = [
    normalizedOpts.type === "plugin"
      ? react({
          reactRefreshHost: `http://localhost:${normalizedOpts.appPort}`,
        })
      : react(),
    tsconfigPaths(),
    createHostFederationConfig(normalizedOpts, resolvedRuntimePlugins),
    opts.type === "host" ? localhostAccessPlugin() : undefined,
    ...(opts.plugins?.map((plugin) =>
      createPluginFederationConfig(
        plugin,
        resolvedRuntimePlugins,
        normalizedOpts.sharedModules,
        normalizedOpts.devPort!,
      ),
    ) || []),
  ].filter(Boolean);

  const viteConfig = defineConfig({
    base: "/",
    build: {
      ...(opts.type === "plugin"
        ? {
            lib: {
              entry: resolve(opts.dir, opts.entryFile || "src/index.ts"),
              fileName: "index",
              formats: ["es"],
            },
          }
        : {}),
      minify: false,
      rollupOptions: {
        output: {
          assetFileNames: "static/[ext]/[name]-[hash].[ext]",
          chunkFileNames: "static/js/[name]-[hash].js",
          entryFileNames: "static/js/[name]-[hash].js",
          manualChunks:
            opts.type === "host"
              ? (id) => {
                  if (id.includes("loader.ts")) {
                    return "loader";
                  }
                }
              : undefined,
          minifyInternalExports: false,
        },
      },

      target: "esnext",
    },
    define: {
      "process.env": {},
    },
    plugins: [...corePlugins.filter(Boolean)],
    preview: {
      allowedHosts: process.env.VITE_TUNNEL_HOST
        ? [process.env.VITE_TUNNEL_HOST]
        : undefined,
      fs: {
        preserveSymlinks: true,
      },
      host: true,
      port: normalizedOpts.devPort,
    },
    server: {
      cors: true,
      fs: {
        preserveSymlinks: true,
      },
      host: true, // Required for tunnel access
      origin: process.env.VITE_TUNNEL_HOST
        ? `${process.env.VITE_TUNNEL_PROTOCOL || "https"}://${process.env.VITE_TUNNEL_HOST}`
        : undefined,
      port: normalizedOpts.devPort,
    },
    ...(opts.type === "host" || opts.plugins?.length
      ? {
          optimizeDeps: {
            include: Object.keys(opts.sharedModules),
          },
        }
      : {}),
  });

  if (normalizedOpts.type === "host") {
    const { portalConfig } = setupPluginRegistryConfig(normalizedOpts);
    if (portalConfig) {
      viteConfig.plugins.push(createExpressMiddlewarePlugin(portalConfig));
    }
  }

  return viteConfig;
}

export function localhostAccessPlugin(): Plugin {
  return {
    name: "localhost-access-plugin",
    transformIndexHtml() {
      const scripts = [];

      if (process.env.VITE_PORTAL_ALLOW_LOCALHOST) {
        scripts.push({
          attrs: { type: "text/javascript" },
          children: `window.VITE_PORTAL_ALLOW_LOCALHOST = true;`,
          injectTo: "head-prepend",
          tag: "script",
        });
      }

      if (process.env.VITE_PORTAL_DOMAIN_IS_ROOT) {
        scripts.push({
          attrs: { type: "text/javascript" },
          children: `window.VITE_PORTAL_DOMAIN_IS_ROOT = ${process.env.VITE_PORTAL_DOMAIN_IS_ROOT};`,
          injectTo: "head-prepend",
          tag: "script",
        });
      }

      return scripts;
    },
  };
}

function createExpressMiddlewarePlugin(portalConfig: PortalMetaConfig): Plugin {
  return {
    apply: "serve",
    configurePreviewServer(server) {
      setupExpressMiddleware(server, portalConfig);
    },
    configureServer(server) {
      setupExpressMiddleware(server, portalConfig);
    },
    name: "portal-express-middleware",
  };
}

function normalizeConfigOptions(opts: ConfigOptions): ConfigOptions {
  return {
    ...opts,
    appPort: opts.type === "plugin" ? (opts.appPort ?? 4173) : undefined,
    devPort: opts.devPort ?? 4173,
  };
}

function setupExpressMiddleware(server: any, portalConfig: PortalMetaConfig) {
  const expressApp = express();
  expressApp.use(express.json());

  // Enhanced meta endpoint that merges upstream config
  expressApp.get("/api/meta", async (req, res) => {
    try {
      const mergedConfig = { ...portalConfig };

      if (
        portalConfig.domain &&
        portalConfig.domain !== DEFAULT_PORTAL_DOMAIN
      ) {
        const url = new URL(`https://${portalConfig.domain}/api/meta`);
        if (req.query.app) {
          url.searchParams.set("app", req.query.app as string);
        }
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        try {
          const upstreamResponse = await fetch(url.toString(), {
            signal: controller.signal,
          });

          if (!upstreamResponse.ok) {
            throw new Error(
              `Upstream request failed with status ${upstreamResponse.status}`,
            );
          }

          const upstreamConfig = await upstreamResponse.json().catch((err) => {
            throw new Error(`Failed to parse upstream config: ${err.message}`);
          });

          // Merge plugins while preserving our web_bundles
          mergedConfig.plugins = Object.fromEntries(
            Object.entries(upstreamConfig.plugins).map(
              ([pluginName, upstreamPlugin]) => {
                const localPlugin = portalConfig.plugins[pluginName];
                return [
                  pluginName,
                  {
                    ...upstreamPlugin,
                    web_bundles: localPlugin?.web_bundles,
                  },
                ];
              },
            ),
          );

          // Merge feature flags
          mergedConfig.feature_flags = {
            ...mergedConfig.feature_flags,
            ...upstreamConfig.feature_flags,
          };

          // Merge meta data
          if (upstreamConfig.meta) {
            mergedConfig.meta = {
              ...(mergedConfig.meta ?? {}),
              ...upstreamConfig.meta,
            };
          }

          // Include build info
          if (upstreamConfig.build) {
            mergedConfig.build = upstreamConfig.build;
          }
        } catch (error) {
          console.error("Failed to fetch/process upstream meta config:", error);
          // Continue with local config only
        } finally {
          clearTimeout(timeout);
        }
      }

      try {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(mergedConfig));
      } catch (error) {
        console.error("Error sending response:", error);
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(portalConfig));
      }
    } catch (error) {
      console.error("Error in meta endpoint handler:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Only setup mock auth endpoint if no portalServer is configured
  if (!portalConfig.domain || portalConfig.domain === DEFAULT_PORTAL_DOMAIN) {
    /**
     * Mock authentication completion endpoint
     *
     * Handles the final redirect after successful authentication (password or social).
     * Sets mock authentication cookies and redirects to the return URL.
     *
     * Query Parameters:
     * - return: URL to redirect to after completion (optional)
     * - token: Authentication token (required)
     *
     * Responses:
     * - 302: Redirects to return URL if provided
     * - 400: Bad request if token is missing
     * - 200: Returns token and OTP status if no redirect URL
     */
    expressApp.get("/api/auth/complete", (req, res) => {
      const { return: returnUrl, token } = req.query;

      // Validate required token parameter
      if (!token) {
        return res.status(400).json({ error: "Token is required" });
      }

      // Note: This mock endpoint intentionally skips token validation for development purposes.
      // In production, this endpoint would be replaced by the real portal server's authentication.

      // Handle redirect if return URL is provided
      if (returnUrl) {
        return res.redirect(302, returnUrl as string);
      }

      // Return authentication details if no redirect
      res.status(200).json({
        Otp: false, // Mock OTP status (disabled for testing)
        token: token,
      });
    });
  }

  if (portalConfig.domain && portalConfig.domain !== DEFAULT_PORTAL_DOMAIN) {
    // Configure Vite proxy for auth requests to real portal server while preserving existing proxy settings
    server.config.server.proxy = {
      ...server.config.server.proxy,
      "/api/auth": {
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/auth/, ""),
        secure: false,
        target: `https://${portalConfig.domain}`,
      },
    };
  }

  server.middlewares.use(expressApp);
}
