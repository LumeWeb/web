import { defineConfig } from "tsdown";

export default defineConfig({
  clean: true,
  dts: true,
  entry: ["./src/index.ts", "!src/**/*.{spec,stories}.{ts,tsx}"],
  external: [/node_modules/, "@uppy/core", "@uppy/tus", "stream"],
  hash: false,
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
  platform: "neutral",
  sourcemap: true,
  target: "esnext",
  tsconfig: "./tsconfig.json",
  unbundle: true,
});
