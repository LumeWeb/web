import { defineConfig } from "tsdown";

export default defineConfig({
  clean: true,
  dts: true,
  entry: ["./src-lib/index.ts"],
  external: [/node_modules/],
  minify: false,
  format: {
    esm: {
      outputOptions: {
        dir: "lib-dist/esm",
        entryFileNames: "[name].js",
      },
    },
    cjs: {
      outputOptions: {
        dir: "lib-dist/cjs",
      },
    },
  },
  platform: "node",
  sourcemap: true,
  target: "es2022",
  tsconfig: "./tsconfig.json",
  unbundle: true,
});
