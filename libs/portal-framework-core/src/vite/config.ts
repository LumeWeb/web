import fs from "node:fs";
import { resolve } from "path";
import Ajv from "ajv";

import { PLUGIN_REGISTRY_SCHEMA_PATH } from "./schema-paths";
import type {
  ConfigOptions,
  PortalMetaConfig,
  PortalPlugin,
  PortalPluginConfig,
} from "./types";
import {
  DEFAULT_PLUGIN_REGISTRY_FILE,
  DEFAULT_PORTAL_DOMAIN,
} from "./types";

export function normalizePortalDomain(domain: string | undefined): string {
  if (!domain) return DEFAULT_PORTAL_DOMAIN;
  return domain.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

export function getBaseUrl(
  devPort: number | undefined,
  plugin?: PortalPlugin,
): string {
  const tunnelHost = plugin?.tunnelHost || process.env.VITE_TUNNEL_HOST;
  if (!tunnelHost) {
    if (devPort === undefined) {
      throw new Error(
        `Plugin '${plugin?.name}' must specify either 'port', 'tunnelHost', or 'web_bundles'/'custom'`,
      );
    }
    return `http://localhost:${devPort}`;
  }
  const tunnelProtocol =
    plugin?.tunnelProtocol || process.env.VITE_TUNNEL_PROTOCOL || "https";
  return `${tunnelProtocol}://${tunnelHost}`;
}

export function normalizeConfigOptions(opts: ConfigOptions): ConfigOptions {
  const envPort = process.env.VITE_PORT;
  const basePort = envPort ? parseInt(envPort, 10) : 4173;

  return {
    ...opts,
    appPort: opts.type === "plugin" ? (opts.appPort ?? basePort) : undefined,
    devPort: opts.devPort ?? basePort,
  };
}

export function setupPluginRegistryConfig(opts: ConfigOptions): {
  portalConfig: PortalMetaConfig;
} {
  const configFile =
    opts.pluginRegistryConfigFile ?? DEFAULT_PLUGIN_REGISTRY_FILE;
  const configPath = resolve(opts.dir, configFile);

  if (!fs.existsSync(configPath)) {
    throw new Error(
      `Plugin registry config file not found at ${configPath}. This file is required for dev/preview mode. Create it or disable the plugin registry.`,
    );
  }

  try {
    const configFileContent = fs.readFileSync(configPath, "utf-8");
    const registry = JSON.parse(configFileContent) as PortalPlugin[];

    const schemaPath = PLUGIN_REGISTRY_SCHEMA_PATH;
    if (fs.existsSync(schemaPath)) {
      const ajv = new Ajv({ strict: false });
      const schema = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));
      const validate = ajv.compile(schema);
      if (!validate(registry)) {
        for (const err of validate.errors ?? []) {
          console.warn(
            `[plugin-config] Validation: ${err.instancePath} — ${err.message}`,
          );
        }
      }
    }

    const plugins: Record<string, PortalPluginConfig> = {};

    for (const entry of registry) {
      const { name, custom, web_bundles, meta, build, port, tunnelHost, tunnelProtocol } =
        entry;

      if (custom) {
        plugins[name] = {
          meta: meta ?? {},
          web_bundles: [custom.manifestUrl],
          build: build,
        };
        continue;
      }

      if (web_bundles && web_bundles.length > 0) {
        plugins[name] = {
          meta: meta ?? {},
          web_bundles: web_bundles.map((b) => b.manifestUrl),
          build: build,
        };
        continue;
      }

      const baseUrl = getBaseUrl(port, entry);
      plugins[name] = {
        meta: meta ?? {},
        web_bundles: [`${baseUrl}/mf-manifest.json`],
        build: build,
      };
    }

    const portalConfig: PortalMetaConfig = {
      domain: normalizePortalDomain(opts.portalServer),
      feature_flags: {},
      plugins,
    };

    return { portalConfig };
  } catch (error) {
    console.error("Error reading or parsing proxy config file:", error);
    throw new Error(
      `Failed to setup plugin registry config from ${configPath}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
