import { defineConfig } from "tsdown";

export default defineConfig({
  clean: true,
  deps: {
    neverBundle: [/node_modules/],
  },
  dts: true,
  entry: ["./index.ts"],
  format: {
    esm: {
      outputOptions: {
        dir: "dist/esm",
        entryFileNames: "[name].js",
      },
    },
    cjs: {
      outputOptions: {
        dir: "dist/cjs",
      },
    },
  },
  hash: false,
  minify: false,
  platform: "neutral",
  sourcemap: true,
  target: "esnext",
  tsconfig: "./tsconfig.json",
  unbundle: true,
});
