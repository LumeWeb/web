import type { Request, Response } from "express";
import type { Plugin, PreviewServer, ViteDevServer } from "vite";

import express from "express";
import fetch from "node-fetch";

import type { PortalMetaConfig } from "./types";
import { DEFAULT_PORTAL_DOMAIN } from "./types";

export function mergeUpstreamConfig(
  portalConfig: PortalMetaConfig,
  upstreamConfig: PortalMetaConfig,
): PortalMetaConfig {
  const mergedConfig: PortalMetaConfig = { ...portalConfig };

  mergedConfig.plugins = Object.fromEntries(
    Object.entries(upstreamConfig.plugins).map(
      ([pluginName, upstreamPlugin]) => {
        const localPlugin = portalConfig.plugins[pluginName];
        return [
          pluginName,
          {
            ...upstreamPlugin,
            web_bundles: localPlugin?.web_bundles ?? upstreamPlugin.web_bundles,
          },
        ];
      },
    ),
  );

  for (const [pluginName, localPlugin] of Object.entries(
    portalConfig.plugins,
  )) {
    if (!(pluginName in mergedConfig.plugins)) {
      mergedConfig.plugins[pluginName] = localPlugin;
    }
  }

  mergedConfig.feature_flags = {
    ...mergedConfig.feature_flags,
    ...upstreamConfig.feature_flags,
  };

  if (upstreamConfig.meta) {
    mergedConfig.meta = {
      ...(mergedConfig.meta ?? {}),
      ...upstreamConfig.meta,
    };
  }

  if (upstreamConfig.build) {
    mergedConfig.build = upstreamConfig.build;
  }

  return mergedConfig;
}

export function setupExpressMiddleware(
  server: ViteDevServer | PreviewServer,
  portalConfig: PortalMetaConfig,
): void {
  const expressApp = express();
  expressApp.use(express.json());

  expressApp.get("/api/meta", async (req: Request, res: Response) => {
    try {
      let mergedConfig: PortalMetaConfig = { ...portalConfig };

      if (
        portalConfig.domain &&
        portalConfig.domain !== DEFAULT_PORTAL_DOMAIN
      ) {
        const url = new URL(`https://${portalConfig.domain}/api/meta`);
        if (req.query.app) {
          url.searchParams.set("app", req.query.app as string);
        }
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        try {
          const upstreamResponse = await fetch(url.toString(), {
            signal: controller.signal,
          });

          if (!upstreamResponse.ok) {
            throw new Error(
              `Upstream request failed with status ${upstreamResponse.status}`,
            );
          }

          const upstreamConfig = (await upstreamResponse.json().catch((err) => {
            throw new Error(`Failed to parse upstream config: ${err.message}`);
          })) as PortalMetaConfig;

          mergedConfig = mergeUpstreamConfig(portalConfig, upstreamConfig);
        } catch (error) {
          console.error("Failed to fetch/process upstream meta config:", error);
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

  if (!portalConfig.domain || portalConfig.domain === DEFAULT_PORTAL_DOMAIN) {
    expressApp.get("/api/auth/complete", (req: Request, res: Response) => {
      const { return: returnUrl, token } = req.query;

      if (!token) {
        return res.status(400).json({ error: "Token is required" });
      }

      if (returnUrl) {
        return res.redirect(302, returnUrl as string);
      }

      res.status(200).json({
        Otp: false,
        token: token,
      });
    });
  }

  if (portalConfig.domain && portalConfig.domain !== DEFAULT_PORTAL_DOMAIN) {
    server.config.server.proxy = {
      ...server.config.server.proxy,
      "/api/auth": {
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api\/auth/, ""),
        secure: false,
        target: `https://${portalConfig.domain}`,
      },
    };
  }

  server.middlewares.use(expressApp);
}

export function createExpressMiddlewarePlugin(
  configLoader: () => PortalMetaConfig,
): Plugin {
  return {
    apply: "serve",
    configurePreviewServer(server) {
      const portalConfig = configLoader();
      setupExpressMiddleware(server, portalConfig);
    },
    configureServer(server) {
      const portalConfig = configLoader();
      setupExpressMiddleware(server, portalConfig);
    },
    name: "portal-express-middleware",
  };
}
