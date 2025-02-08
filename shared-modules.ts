import type { ModuleFederationOptions } from "@module-federation/vite/lib/utils/normalizeModuleFederationOptions";

const modules = [
  "@lumeweb/portal-framework-core",
  "@lumeweb/portal-framework-ui",
  "@lumeweb/portal-framework-ui-core",
  "@refinedev/core",
  "@tanstack/react-query",
  "react",
  "react-dom",
  "react-router",
  "react-hook-form",
];

export function getSharedModules(): ModuleFederationOptions["shared"] {
  return modules.reduce((acc, module) => {
    acc[module] = {
      eager: true,
      singleton: true,
    };
    return acc;
  }, {}) satisfies ModuleFederationOptions["shared"];
}
