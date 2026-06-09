import type { HtmlTagDescriptor, Plugin } from "vite";

export function localhostAccessPlugin(): Plugin {
  return {
    name: "localhost-access-plugin",
    transformIndexHtml(html) {
      const tags: HtmlTagDescriptor[] = [];

      if (process.env.VITE_PORTAL_ALLOW_LOCALHOST) {
        tags.push({
          attrs: { type: "text/javascript" },
          children: `window.VITE_PORTAL_ALLOW_LOCALHOST = true;`,
          injectTo: "head-prepend",
          tag: "script",
        });
      }

      if (process.env.VITE_PORTAL_DOMAIN_IS_ROOT) {
        const isRoot = process.env.VITE_PORTAL_DOMAIN_IS_ROOT === "true";
        tags.push({
          attrs: { type: "text/javascript" },
          children: `window.VITE_PORTAL_DOMAIN_IS_ROOT = ${JSON.stringify(isRoot)};`,
          injectTo: "head-prepend",
          tag: "script",
        });
      }

      if (process.env.VITE_PORTAL_BRAND) {
        tags.push({
          attrs: { type: "text/javascript" },
          children: `window.VITE_PORTAL_BRAND = ${JSON.stringify(process.env.VITE_PORTAL_BRAND)};`,
          injectTo: "head-prepend",
          tag: "script",
        });

        const brand =
          typeof process.env.VITE_PORTAL_BRAND === "string"
            ? JSON.parse(process.env.VITE_PORTAL_BRAND)
            : process.env.VITE_PORTAL_BRAND;

        if (brand?.logoUrl) {
          const updatedHtml = html.replace(
            /(<div\s+data-loader-logo\s+[^>]*>)([\s\S]*?)(<\/div>)/,
            `$1<img alt="Logo" src="${brand.logoUrl}" />$3`,
          );
          return { html: updatedHtml, tags };
        }
      }

      return tags;
    },
  };
}
