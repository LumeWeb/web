import { defineConfig } from "tsdown";
import { createLibraryConfigWithDirs } from "@lumeweb/tsdown-config";

export default defineConfig(
  createLibraryConfigWithDirs("./src-lib/index.ts", "lib-dist/esm", "lib-dist/cjs", {
    target: "es2022",
    platform: "node",
  })
);
