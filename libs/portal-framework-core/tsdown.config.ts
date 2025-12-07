import { defineConfig } from "tsdown";
export default defineConfig({
  clean: true,
  dts: true,
  entry: [
    "./src/index.ts",
    "./src/vite/index.ts",
    "!src/**/*.{spec,stories}.{ts,tsx}",
  ],
  external: [
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
  format: {
    esm: {
      outputOptions: {
        dir: "dist/esm",
      },
    },
    cjs: {
      outputOptions: {
        dir: "dist/cjs",
      },
    },
  },
  hash: false,
  outputOptions: {
    exports: "named",
  },
  platform: "browser",
  sourcemap: true,
  target: "esnext",
  tsconfig: "./tsconfig.json",
  unbundle: true,
});
