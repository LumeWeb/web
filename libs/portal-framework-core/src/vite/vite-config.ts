import { DevTools } from "@vitejs/devtools";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { defineConfig, type Plugin } from "vite";
import { resolve } from "path";
import { createHash } from "crypto";

import { normalizeConfigOptions, setupPluginRegistryConfig } from "./config";
import {
  createHostFederationConfig,
  createPluginFederationConfig,
} from "./federation";
import { createExpressMiddlewarePlugin } from "./express-middleware";
import { localhostAccessPlugin } from "./localhost-plugin";
import type { ConfigOptions } from "./types";
import type { SharedModules } from "./shared-types";
export const PLUGIN_TYPE = "plugin";

/**
 * In lib mode, Vite forces ALL assets to inline as base64 data URLs
 * (shouldInline() returns true when build.lib is set). This plugin
 * intercepts chunks after bundling and extracts inlined base64 images
 * back into separate asset files, replacing the data URLs with file paths.
 */
function extractBase64ImagesPlugin(): Plugin {
  return {
    name: "extract-base64-images",
    enforce: "post",
    generateBundle(_options, bundle) {
      const dataUrlRe =
        /new URL\(`data:image\/([a-z]+);base64,([A-Za-z0-9+/=]+)`,[^)]*\)/g;
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type !== "chunk") continue;
        const code = chunk.code;
        if (!code.includes("data:image/")) continue;
        let replaced = false;
        const newCode = code.replace(
          dataUrlRe,
          (_match, ext: string, b64: string) => {
            replaced = true;
            const buf = Buffer.from(b64, "base64");
            const hash = createHash("sha256")
              .update(buf)
              .digest("hex")
              .slice(0, 8);
            const assetPath = `static/png/image-${hash}.${ext}`;
            this.emitFile({
              type: "asset",
              source: buf,
              fileName: assetPath,
            });
            // Use relative path from the JS output dir (static/js/) to the asset dir (static/png/)
            return `new URL("../png/image-${hash}.${ext}", import.meta.url)`;
          },
        );
        if (replaced) {
          chunk.code = newCode;
        }
      }
    },
  };
}

/** Shared build config fields for both host and plugin */
function createBuildConfig(opts: ConfigOptions) {
  return {
    outDir: process.env.VITE_OUTPUT_DIR || "dist",
    ...(opts.type === "plugin"
      ? {
          lib: {
            entry: resolve(opts.dir, opts.entryFile || "src/index.ts"),
            fileName: "index",
            formats: ["es" as const],
          },
        }
      : {}),
    rolldownOptions: opts.devtools?.enabled ? { devtools: {} } : undefined,
    sourcemap: true,
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        assetFileNames: "static/[ext]/[name]-[hash].[ext]",
        chunkFileNames: "static/js/[name]-[hash].js",
        entryFileNames: "static/js/[name]-[hash].js",
        manualChunks:
          opts.type === "host"
            ? (id: string) => {
                if (id.includes("loader.ts")) {
                  return "loader";
                }
              }
            : undefined,
        minify: {
          compress: true,
          mangle: opts.minifyMangle !== false,
        },
      },
    },
    target: "esnext" as const,
  };
}

/** Shared server + preview config for both host and plugin */
function createServerPreviewConfig(opts: ConfigOptions) {
  const tunnelHost = process.env.VITE_TUNNEL_HOST;
  const tunnelProtocol = process.env.VITE_TUNNEL_PROTOCOL || "https";
  return {
    preview: {
      allowedHosts: tunnelHost ? [tunnelHost] : undefined,
      host: true,
      port: opts.devPort,
      strictPort: true,
    },
    server: {
      cors: true,
      host: true,
      origin: tunnelHost
        ? `${tunnelProtocol}://${tunnelHost}`
        : undefined,
      port: opts.devPort,
      strictPort: true,
    },
  };
}

function createHostConfig(opts: ConfigOptions) {
  const resolvedRuntimePlugins: string[] = [];
  const devtoolsOutDir = opts.devtools?.outDir ?? "devtools";

  const plugins = [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    createHostFederationConfig(opts, resolvedRuntimePlugins),
    localhostAccessPlugin(),
    extractBase64ImagesPlugin(),
    ...(opts.plugins?.map((plugin) =>
      createPluginFederationConfig(
        plugin,
        resolvedRuntimePlugins,
        opts.sharedModules,
        opts.devPort!,
      ),
    ) || []),
    opts.devtools?.enabled
      ? DevTools({
          build: {
            outDir: devtoolsOutDir,
            withApp: opts.devtools.buildWithApp ?? true,
          },
        })
      : undefined,
  ].filter(Boolean);

  const config = defineConfig({
    base: "",
    resolve: {
      tsconfigPaths: true,
    },
    build: createBuildConfig(opts),
    define: {
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "development",
      ),
      "process.env": {},
    },
    plugins,
    ...createServerPreviewConfig(opts),
    optimizeDeps: {
      include: Object.keys(opts.sharedModules as SharedModules),
    },
  });

  config.plugins!.push(
    createExpressMiddlewarePlugin(() => {
      return setupPluginRegistryConfig(opts);
    }),
  );

  return config;
}

function createPluginConfig(opts: ConfigOptions) {
  const resolvedRuntimePlugins: string[] = [];
  const devtoolsOutDir = opts.devtools?.outDir ?? "devtools";

  const plugins = [
    react({
      reactRefreshHost: `http://localhost:${opts.appPort}`,
    }),
    babel({ presets: [reactCompilerPreset()] }),
    createHostFederationConfig(opts, resolvedRuntimePlugins),
    extractBase64ImagesPlugin(),
    ...(opts.plugins?.map((plugin) =>
      createPluginFederationConfig(
        plugin,
        resolvedRuntimePlugins,
        opts.sharedModules,
        opts.devPort!,
      ),
    ) || []),
    opts.devtools?.enabled
      ? DevTools({
          build: {
            outDir: devtoolsOutDir,
            withApp: opts.devtools.buildWithApp ?? true,
          },
        })
      : undefined,
  ].filter(Boolean);

  return defineConfig({
    base: "",
    resolve: {
      tsconfigPaths: true,
    },
    build: createBuildConfig(opts),
    define: {
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "development",
      ),
      "process.env": {},
    },
    plugins,
    ...createServerPreviewConfig(opts),
    ...(opts.plugins?.length
      ? {
          optimizeDeps: {
            include: Object.keys(
              opts.sharedModules as SharedModules,
            ),
          },
        }
      : {}),
  });
}

export function Config(opts: ConfigOptions) {
  const normalizedOpts = normalizeConfigOptions(opts);
  return normalizedOpts.type === "host"
    ? createHostConfig(normalizedOpts)
    : createPluginConfig(normalizedOpts);
}
