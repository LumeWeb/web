import type { ModuleFederationOptions } from "@module-federation/vite";

import { federation } from "@module-federation/vite";
import { resolve } from "path";

import { getBaseUrl } from "./config";
import type { ConfigOptions, PluginConfig } from "./types";

export type SharedValue = string | false | Record<string, unknown>;
export type SharedModules = Record<string, SharedValue>;

export function createBaseFederationConfig(
  name: string,
  runtimePlugins: string[],
  sharedModules: SharedModules,
  devPort: number,
  configOverrides: Partial<ModuleFederationOptions> = {},
) {
  return federation({
    dts: false,
    ignoreOrigin: true,
    manifest: true,
    name,
    publicPath: "auto",
    runtimePlugins,
    shared: sharedModules,
    bundleAllCSS: true,
    ...configOverrides,
  } as ModuleFederationOptions);
}

export function createPluginFederationConfig(
  plugin: PluginConfig,
  runtimePlugins: string[],
  sharedModules: SharedModules,
  devPort: number,
) {
  const resolvedExposes = plugin.exposes
    ? Object.fromEntries(
        Object.entries(plugin.exposes).map(([key, value]) => [
          key,
          resolve(plugin.dir, value as string),
        ]),
      )
    : undefined;
  return createBaseFederationConfig(
    plugin.name,
    runtimePlugins,
    sharedModules,
    devPort,
    {
      exposes: resolvedExposes,
      filename: `${plugin.name}/remoteEntry-[hash].js`,
      virtualModuleDir: `__mf__virtual_${plugin.name.replaceAll(".", "_")}`,
    },
  );
}

export function createHostFederationConfig(
  opts: ConfigOptions,
  runtimePlugins: string[],
) {
  const resolvedExposes = opts.exposes
    ? Object.fromEntries(
        Object.entries(opts.exposes).map(([key, value]) => [
          key,
          resolve(opts.dir, value as string),
        ]),
      )
    : undefined;

  const importCfg = opts.type == "plugin" ? { import: false } : {};

  const finalSharedModules = Object.fromEntries(
    Object.entries(opts.sharedModules as SharedModules).map(([key, config]) => {
      if (config === false) {
        return [key, false];
      }
      if (typeof config === "string") {
        return [key, { requiredVersion: config, ...importCfg }];
      }
      if (typeof config === "object" && config !== null) {
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
