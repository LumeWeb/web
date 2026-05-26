import { defineConfig } from "tsdown";
import { createLibraryConfigWithDirs } from "@lumeweb/tsdown-config";

export default defineConfig(
  createLibraryConfigWithDirs("./src-lib/index.ts", "lib-dist/esm", {
    target: "es2022",
    platform: "node",
  })
);
