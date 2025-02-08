import { federation } from "@module-federation/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

import * as sharedModules from "../../shared-modules";
import { env } from "./src/env";

export default defineConfig({
  build: {
    commonjsOptions: { transformMixedEsModules: true },
    emptyOutDir: true,
    minify: false,
    outDir: "../../dist/apps/portal-app-shell",
    reportCompressedSize: true,
    target: "ES2022",
  },
  define: {
    "process.env": {},
  },
  plugins: [
    react(),
    tsconfigPaths(),
    federation({
      manifest: true,
      name: env.VITE_PORTAL_APP_NAME,
      shared: sharedModules.getSharedModules(),
    }),
  ],
  resolve: {
    dedupe: Object.keys(sharedModules.getSharedModules() as any),
  },
  /*  server: {
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
  },*/
});
