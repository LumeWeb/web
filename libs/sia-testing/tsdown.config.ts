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
      "src/vitest.ts",
      "src/testing/live/agent.ts",
    ],
    {
      deps: {
        alwaysBundle: [/^@noble\/hashes/],
        neverBundle: [/^node:/],
        onlyBundle: [/^@noble\/hashes/],
      },
      sourcemap: false,
    },
  ),
);
