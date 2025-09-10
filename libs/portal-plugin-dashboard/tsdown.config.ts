import { defineConfig } from "tsdown";

export default defineConfig({
  clean: true,
  dts: true,
  entry: ["./src-lib/index.ts"],
  external: [/node_modules/],
  format: ["esm", "cjs"],
  minify: false,
  outputOptions(options, format) {
    options.dir = format === "es" ? "lib-dist/esm" : "lib-dist/cjs";
  },
  platform: "node",
  sourcemap: true,
  target: "es2022",
  tsconfig: "./tsconfig.json",
  unbundle: true,
});
