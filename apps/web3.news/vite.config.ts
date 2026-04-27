import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import { installGlobals } from "@remix-run/node";

import Unfonts from "unplugin-fonts/vite";

installGlobals();

export default defineConfig({
  plugins: [
    remix({ ignoredRouteFiles: ["**/.*"] }),
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
  resolve: {
    tsconfigPaths: true,
  },
});
