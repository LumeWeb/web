// @ts-nocheck

import type { Plugin } from "vite";
import { defineConfig } from "vite";
import type { ModuleFederationOptions } from "@module-federation/vite/lib/utils/normalizeModuleFederationOptions";

import { federation } from "@module-federation/vite";
import react from "@vitejs/plugin-react";
import { createRequire } from "node:module";
import { resolve } from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import fs from "node:fs";
import express from "express";
import fetch from "node-fetch";

interface BuildInfo {
  version: string;
  gitCommit: string;
  gitBranch: string;
  buildTime: string;
  goVersion: string;
  platform: string;
  architecture: string;
}

interface PluginMeta extends Record<string, unknown> {}

interface PortalPluginConfig {
  build: BuildInfo;
  meta: PluginMeta;
  web_bundles: string[];
}

interface PortalMetaConfig {
  domain: string;
  plugins: Record<string, PortalPluginConfig>;
  feature_flags: Record<string, boolean>;
  build: BuildInfo;
}

const DEFAULT_PORTAL_DOMAIN = "default.lumeweb.com";

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
      plugins: proxyConfig.reduce((acc, route) => {
        acc[route.name] = {
          meta: {},
          web_bundles: [`http://localhost:${route.port}/mf-manifest.json`],
        };
        return acc;
      }, {}),
      feature_flags: {},
    };

    return { portalConfig };
  } catch (error) {
    console.error("Error reading or parsing proxy config file:", error);
    throw new Error(
      `Failed to setup plugin registry config from ${configPath}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

const require = createRequire(import.meta.url);

export interface ConfigOptions {
  dir: string;
  exposes?: ModuleFederationOptions["exposes"];
  name: string;
  sharedModules: ModuleFederationOptions["shared"];
  type: "host" | "plugin";
  pluginRegistryConfigFile?: string;
  devPort?: number;
  portalServer?: string;
  plugins?: PluginConfig[];
  /** Port number for react refresh host when type is "plugin" */
  appPort?: number;
}

interface PortalPlugin {
  name: string;
  port: number;
}

export interface PluginConfig {
  name: string;
  dir: string;
  exposes?: ModuleFederationOptions["exposes"];
}

const DEFAULT_PLUGIN_REGISTRY_FILE = "plugin.config.json";

function normalizeConfigOptions(opts: ConfigOptions): ConfigOptions {
  return {
    ...opts,
    devPort: opts.devPort ?? 4173,
    appPort: opts.type === "plugin" ? (opts.appPort ?? 4173) : undefined,
  };
}

export function Config(opts: ConfigOptions) {
  const normalizedOpts = normalizeConfigOptions(opts);
  let resolvedRuntimePlugins: string[] = [];
  try {
    const bridgeReactPluginPath = require.resolve(
      "@module-federation/bridge-react/plugin",
    );
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
      name,
      runtimePlugins,
      shared: sharedModules,
      remotePlugin: isPlugin,
      manifest: true,
      ignoreOrigin: true,
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
        filename: `${plugin.name}/remoteEntry-[hash].js`,
        exposes: resolvedExposes,
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

    return createBaseFederationConfig(
      opts.name,
      runtimePlugins,
      opts.sharedModules,
      opts.devPort!,
      opts.type == "plugin",
      {
        filename: "remoteEntry-[hash].js",
        exposes: resolvedExposes,
        remotes:
          opts.plugins?.reduce(
            (acc, plugin) => {
              acc[plugin.name] =
                `http://localhost:${opts.devPort}/${plugin.name}/remoteEntry.js`;
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
    localhostAccessPlugin(),
    createHostFederationConfig(normalizedOpts, resolvedRuntimePlugins),
    ...(opts.plugins?.map((plugin) =>
      createPluginFederationConfig(
        plugin,
        resolvedRuntimePlugins,
        normalizedOpts.sharedModules,
        normalizedOpts.devPort!,
      ),
    ) || []),
  ];

  const viteConfig = defineConfig({
    // base: `http://localhost:${normalizedOpts.devPort}/`,
    base: "",
    build: {
      ...(opts.type === "plugin"
        ? {
            lib: {
              entry: resolve(opts.dir, "src/index.ts"),
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
      fs: {
        preserveSymlinks: true,
      },
      port: normalizedOpts.devPort,
    },
    server: {
      cors: true,
      fs: {
        preserveSymlinks: true,
      },
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

function createExpressMiddlewarePlugin(portalConfig: PortalMetaConfig): Plugin {
  return {
    name: "portal-express-middleware",
    apply: "serve",
    configureServer(server) {
      setupExpressMiddleware(server, portalConfig);
    },
    configurePreviewServer(server) {
      setupExpressMiddleware(server, portalConfig);
    },
  };
}

function setupExpressMiddleware(server: any, portalConfig: PortalMetaConfig) {
  const expressApp = express();
  expressApp.use(express.json());

  // Enhanced meta endpoint that merges upstream config
  expressApp.get("/api/meta", async (req, res) => {
    try {
      let mergedConfig = { ...portalConfig };

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
            signal: controller.signal
          });
          
          if (!upstreamResponse.ok) {
            throw new Error(`Upstream request failed with status ${upstreamResponse.status}`);
          }

          const upstreamConfig = await upstreamResponse.json().catch(err => {
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

          // Include build info
          if (upstreamConfig.build) {
            mergedConfig.build = upstreamConfig.build;
          }
        }
      } catch (error) {
        console.error('Failed to fetch/process upstream meta config:', error);
        // Continue with local config only
      } finally {
        clearTimeout(timeout);
      }

      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(mergedConfig));
    } catch (error) {
      console.error("Error fetching/merging meta config:", error);
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(portalConfig));
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
        token: token,
        Otp: false, // Mock OTP status (disabled for testing)
      });
    });
  }

  if (portalConfig.domain && portalConfig.domain !== DEFAULT_PORTAL_DOMAIN) {
    // Configure Vite proxy for auth requests to real portal server while preserving existing proxy settings
    server.config.server.proxy = {
      ...server.config.server.proxy,
      "/api/auth": {
        target: `https://${portalConfig.domain}`,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/auth/, ""),
      },
    };
  }

  server.middlewares.use(expressApp);
}

export function localhostAccessPlugin(): Plugin {
  return {
    name: "localhost-access-plugin",
    transformIndexHtml() {
      if (!process.env.VITE_PORTAL_ALLOW_LOCALHOST) {
        return [];
      }

      return [
        {
          tag: "script",
          attrs: {
            type: "text/javascript",
          },
          children: `window.VITE_PORTAL_ALLOW_LOCALHOST = true;`,
          injectTo: "body-prepend",
        },
      ];
    },
  };
}
