import { defineConfig } from "tsdown";
import { createLibraryConfig } from "@lumeweb/tsdown-config";

export default defineConfig(
  createLibraryConfig(
    [
      "./src/index.ts",
      "./src/worker.ts",
      "./src/react/index.tsx",
      "!src/**/*.{spec,stories}.{ts,tsx}",
      "!src/**/*.test.{ts,tsx}",
    ],
    {
      outputOptions: {
        exports: "named",
      },
    }
  )
);
