import { defineConfig } from "tsdown";
import { createLibraryConfig } from "@lumeweb/tsdown-config";

export default defineConfig({
  ...createLibraryConfig("./src/index.ts", { platform: "node" }),
  copy: [{ from: "src/templates", to: "dist/esm" }],
});
