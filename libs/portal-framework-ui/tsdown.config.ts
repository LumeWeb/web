import { defineConfig } from "tsdown";
import { createLibraryConfigWithPlugins, entryPatterns } from "@lumeweb/tsdown-config";

import image from "@rollup/plugin-image";

export default defineConfig([
  {
    ...createLibraryConfigWithPlugins(entryPatterns.withoutTests, [image() as any], {
      deps: { neverBundle: [/node_modules/, /@refinedev\/.*/] },
      unbundle: true,
    }),
  },
  {
    ...createLibraryConfigWithPlugins(["src/images.ts"], [image()], {
      clean: false,
      dts: true,
      format: "esm",
    }),
    outDir: "dist/esm",
  },
]);
