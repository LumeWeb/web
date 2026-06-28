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
  "zod",
  "@tanstack/react-table",
  "@refinedev/react-router",
  "@hookform/resolvers",
  "@refinedev/react-hook-form",
  "@uppy/core",
  "nanoevents",
  "react-icons",
  "otpauth",
  "qrcode",
];

export function getSharedModules() {
  return modules.reduce<Record<string, { singleton: boolean }>>(
    (acc, module) => {
      acc[module] = {
        singleton: true,
      };
      return acc;
    },
    {},
  );
}
