import { defineConfig } from "tsdown";
import { createLibraryConfig } from "@lumeweb/tsdown-config";

export default defineConfig(
  createLibraryConfig(["src/**/*"], {
    external: /node_modules/,
    format: ["cjs", "esm"],
    outputOptions(options, format) {
      options.dir = format === "es" ? "dist/esm" : "dist/cjs";
    },
  })
);
