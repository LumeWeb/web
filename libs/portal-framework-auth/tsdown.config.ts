import { defineConfig } from "tsdown";
export default defineConfig({
  clean: true,
  dts: true,
  entry: ["src/**/*"],
  external: /node_modules/,
  format: ["cjs", "esm"],
  hash: false,
  outputOptions(options, format) {
    options.dir = format === "es" ? "dist/esm" : "dist/cjs";
  },
  sourcemap: true,
  target: "esnext",
  tsconfig: "./tsconfig.json",
  platform: "browser",
});
