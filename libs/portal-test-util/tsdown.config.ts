import { defineConfig } from "tsdown";
import { createLibraryConfig } from "@lumeweb/tsdown-config";

export default defineConfig(
  createLibraryConfig(["src/**/*"], {
    hash: false,
  })
);
