import { defineConfig } from "tsdown";
import { createLibraryConfig } from "@lumeweb/tsdown-config";

export default defineConfig(
  createLibraryConfig(
    [
      "./src/index.ts",
      "./src/worker.ts",
      "./src/worker-setup.ts",
      "./src/react/index.tsx",
      "./src/sia-stream-service.ts",
      "./src/sia-stream-zustand.ts",
      "./src/testing/index.ts",
      "./src/testing/player.ts",
      "./src/testing/reader.ts",
      "./src/testing/worker.ts",
      "!src/**/*.{spec,stories}.{ts,tsx}",
      "!src/**/*.test.{ts,tsx}",
    ],
    {
      deps: { neverBundle: [/^node:/], skipNodeModulesBundle: true },
      copy: [
        {
          from: [
            "src/__fixtures__/media/browser-decodable-long.mp4",
            "src/__fixtures__/media/browser-decodable-avc-aac.mp4",
          ],
          to: "dist/esm/__fixtures__/media",
          flatten: true,
        },
      ],
      outputOptions: {
        exports: "named",
      },
    },
  ),
);
