import { defineConfig } from "tsdown";
import { createLibraryConfigWithExternals } from "@lumeweb/tsdown-config";

export default defineConfig(
  createLibraryConfigWithExternals(
    "./src/index.ts",
    [/node_modules/, "@uppy/core", "@uppy/tus", "stream"]
  )
);
