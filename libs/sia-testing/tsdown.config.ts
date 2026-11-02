import { defineConfig } from "tsdown";
import { createLibraryConfig } from "@lumeweb/tsdown-config";

export default defineConfig(
  createLibraryConfig(
    [
      "src/node.ts",
      "src/mock.ts",
      "src/client.ts",
      "src/http.ts",
      "src/msw.ts",
      "src/playwright.ts",
    ],
    {
      deps: { neverBundle: [/^node:/], skipNodeModulesBundle: true },
      sourcemap: false,
    },
  ),
);
