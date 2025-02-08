import { defineConfig } from "tsdown";
export default defineConfig({
  clean: true,
  dts: true,
  entry: ["src", "!src/**/*.{spec,stories}.{ts,tsx}"],
  external: [/node_modules/, "fs", "path", "process", "node:module"],
  format: ["cjs", "esm"],
  hash: false,
  outputOptions(options, format) {
    options.dir = format === "es" ? "dist/esm" : "dist/cjs";
    options.exports = "named";
  },
  sourcemap: true,
  target: "esnext",
  tsconfig: "./tsconfig.json",
  unbundle: true,
  platform: "browser",
});
