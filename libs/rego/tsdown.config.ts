import { defineConfig } from "tsdown";
import { createLibraryConfig, entryPatterns } from "@lumeweb/tsdown-config";

export default defineConfig(
  createLibraryConfig(entryPatterns.withoutTests, {
    hash: false,
  })
);
