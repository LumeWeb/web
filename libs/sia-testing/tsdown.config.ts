import { defineConfig } from "tsdown";
import { createLibraryConfig } from "@lumeweb/tsdown-config";

export default defineConfig(createLibraryConfig([
  "src/fixtures/index.ts",
  "src/model/index.ts",
  "src/msw/index.ts",
  "src/msw/node.ts",
  "src/http/index.ts",
  "src/sdk/index.ts",
  "src/e2e/node.ts",
  "src/e2e/cli.ts",
], {
  deps: { neverBundle: [/^node:/], skipNodeModulesBundle: true },
  sourcemap: false,
}));
