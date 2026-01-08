import { defineConfig } from "tsdown";
import { createLibraryConfig, entryPatterns } from "@lumeweb/shared-tsdown-config";

export default defineConfig(
  createLibraryConfig(entryPatterns.withoutSpecOrStories, {
    format: ["cjs", "esm"],
    outputOptions(options, format) {
      options.dir = format === "es" ? "dist/esm" : "dist/cjs";
      options.exports = "named";
    },
  })
);
