import { defineConfig } from "tsdown";
import { createLibraryConfig, entryPatterns } from "@lumeweb/tsdown-config";

export default defineConfig(
  createLibraryConfig(entryPatterns.withoutTests, {
    external: /node_modules/,
    format: ["cjs", "esm"],
    outputOptions(options, format) {
      options.dir = format === "es" ? "dist/esm" : "dist/cjs";
    },
  })
);
