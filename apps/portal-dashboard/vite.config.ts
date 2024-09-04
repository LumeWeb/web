import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import tsconfigPaths from "vite-tsconfig-paths";
import commonjs from "vite-plugin-commonjs";

// @ts-ignore
import path from "path";
// @ts-ignore
import fs from "fs";
import routes, { createRemixRoutes } from "./routes.js";
import { jsonRoutes } from "remix-json-routes";
import type { DefineRoutesFunction } from "@remix-run/dev/dist/config/routes.js";

export default defineConfig({
  plugins: [
    remix({
      ssr: false,
      ignoredRouteFiles: ["**/*.css"],
      routes(defineRoutes) {
        return jsonRoutes(defineRoutes, createRemixRoutes(routes));
      },
    }),
    tsconfigPaths(),
    nodePolyfills({
      protocolImports: false,
      include: ["buffer", "url"],
    }),
    commonjs({
      filter(id) {
        return id.includes("url");
      },
    }),
  ],
  build: {
    minify: false,
    outDir: "../../dist/apps/portal-dashboard",
    reportCompressedSize: true,
    commonjsOptions: { transformMixedEsModules: true },
  },
  server: {
    fs: {
      // Restrict files that could be served by Vite's dev server.  Accessing
      // files outside this directory list that aren't imported from an allowed
      // file will result in a 403.  Both directories and files can be provided.
      // If you're comfortable with Vite's dev server making any file within the
      // project root available, you can remove this option.  See more:
      // https://vitejs.dev/config/server-options.html#server-fs-allow
      allow: [
        "app",
        "routes.ts",
        fs.realpathSync(
          path.resolve("../../node_modules/@fontsource-variable/manrope"),
        ),
      ],
    },
  },
});
