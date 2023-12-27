import { unstable_vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import { installGlobals } from "@remix-run/node";
import tsconfigPaths from "vite-tsconfig-paths";
import Unfonts from "unplugin-fonts/vite";

installGlobals();

export default defineConfig({
  plugins: [
    remix({ ignoredRouteFiles: ["**/.*"] }),
    tsconfigPaths(),
    Unfonts({
      fontsource: {
        /**
         * Fonts families lists
         */
        families: [
          { name: "Be Vietnam Pro", weights: [400], subset: "latin" },
          { name: "Jaldi", weights: [400], subset: "latin" },
        ],
      },
    }),
  ],
});
