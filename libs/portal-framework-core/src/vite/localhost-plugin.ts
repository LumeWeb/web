import type { HtmlTagDescriptor, Plugin } from "vite";

export function localhostAccessPlugin(): Plugin {
  return {
    name: "localhost-access-plugin",
    transformIndexHtml() {
      const scripts: HtmlTagDescriptor[] = [];

      if (process.env.VITE_PORTAL_ALLOW_LOCALHOST) {
        scripts.push({
          attrs: { type: "text/javascript" },
          children: `window.VITE_PORTAL_ALLOW_LOCALHOST = true;`,
          injectTo: "head-prepend",
          tag: "script",
        });
      }

      if (process.env.VITE_PORTAL_DOMAIN_IS_ROOT) {
        const isRoot = process.env.VITE_PORTAL_DOMAIN_IS_ROOT === "true";
        scripts.push({
          attrs: { type: "text/javascript" },
          children: `window.VITE_PORTAL_DOMAIN_IS_ROOT = ${JSON.stringify(isRoot)};`,
          injectTo: "head-prepend",
          tag: "script",
        });
      }

      return scripts;
    },
  };
}
