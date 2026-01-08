import { defineConfig } from "tsdown";
import { createLibraryConfigWithExternals } from "@lumeweb/tsdown-config";

export default defineConfig(
  createLibraryConfigWithExternals(
    ["./src/index.ts", "./src/vite/index.ts", "!src/**/*.{spec,stories}.{ts,tsx}"],
    [
      /node_modules/,
      "fs",
      "node:fs",
      "path",
      "node:path",
      "process",
      "node:module",
      "@vitejs/plugin-react",
      "express",
      "node-fetch",
      "@module-federation/vite",
      "vite",
    ],
    {
      outputOptions: {
        exports: "named",
      },
    }
  )
);
