import { defineConfig } from "tsdown";
export default defineConfig({
  clean: true,
  dts: true,
  entry: ["src", "!src/**/*.{spec,stories}.{ts,tsx}"],
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
  format: ["cjs", "esm"],
  hash: false,
  outputOptions(options, format) {
    options.dir = format === "es" ? "dist/esm" : "dist/cjs";
    options.exports = "named";
  },
  platform: "browser",
  sourcemap: true,
  target: "esnext",
  tsconfig: "./tsconfig.json",
  unbundle: true,
});
