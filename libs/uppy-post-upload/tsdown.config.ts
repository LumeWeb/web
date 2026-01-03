import { defineConfig } from "tsdown";

export default defineConfig({
  clean: true,
  dts: true,
  entry: ["./src/index.ts"],
  external: [/node_modules/],
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
  minify: false,
  platform: "neutral",
  sourcemap: true,
  target: "esnext",
  tsconfig: "./tsconfig.json",
  unbundle: true,
});
