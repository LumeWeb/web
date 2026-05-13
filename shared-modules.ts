import type { ModuleFederationOptions } from "@module-federation/vite";

const modules = [
  "@lumeweb/portal-framework-core",
  "@lumeweb/portal-framework-ui",
  "@lumeweb/portal-framework-ui-core",
  "@lumeweb/advanced-rest-provider",
  "@refinedev/core",
  "@tanstack/react-query",
  "react",
  "react-dom",
  "react-router",
  "react-hook-form",
  "@lumeweb/analytics",
];

export function getSharedModules(): ModuleFederationOptions["shared"] {
  return modules.reduce<Record<string, { singleton: boolean }>>(
    (acc, module) => {
      acc[module] = {
        singleton: true,
      };
      return acc;
    },
    {}
  ) satisfies ModuleFederationOptions["shared"];
}
