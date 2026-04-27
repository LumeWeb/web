import type { UserConfig } from "tsdown";
import { defineConfig } from "tsdown";
import { createLibraryConfig } from "@lumeweb/tsdown-config";

export default defineConfig([
  // Build the main source (src/index.ts) - ESM format with templates
  {
    ...createLibraryConfig("./src/index.ts", { platform: "node" }),
    format: {
      esm: {
        outputOptions: {
          dir: "dist/esm",
          entryFileNames: "[name].js",
        },
      },
    },
    copy: [{ from: "src/templates", to: "dist/esm" }],
  },
  // Build the main source (src/index.ts) - CJS format with templates
  {
    ...createLibraryConfig("./src/index.ts", { platform: "node" }),
    format: {
      cjs: {
        outputOptions: {
          dir: "dist/cjs",
        },
      },
    },
    clean: false,
    copy: [{ from: "src/templates", to: "dist/cjs" }],
  },
]);
