import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import tsconfigPaths from "vite-tsconfig-paths";
import commonjs from "vite-plugin-commonjs";

import path from "path";
import fs from "fs";

export default defineConfig({
  cacheDir: "../../node_modules/.vite/apps/portal-dashboard",
  plugins: [
    remix({
      ssr: false,
      ignoredRouteFiles: ["**/*.css"],
      buildDirectory: "../../dist/apps/portal-dashboard",
      routes(defineRoutes) {
        return defineRoutes((route) => {
          route("/", "routes/index.tsx", { index: true });
          route("/account", "app/routes/Account/index.tsx", { index: true });
          route("/account/verify", "app/routes/Account/verify.tsx");
          route("/login", "app/routes/Login/index.tsx");
          route("/register", "app/routes/Register/index.tsx");
        });
      },
    }),
    tsconfigPaths(),
    nodePolyfills({
      protocolImports: false,
      include: ["buffer", "url", "events"],
    }),
    commonjs({
      filter(id) {
        return id.includes("url") || id.includes("events");
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
        fs.realpathSync(
          path.resolve("../../node_modules/@fontsource-variable/manrope"),
        ),
      ],
    },
  },
});
