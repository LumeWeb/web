import { defineConfig } from "tsdown";
export default defineConfig({
  clean: true,
  dts: true,
  entry: ["src/**/*"],
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
  sourcemap: true,
  target: "esnext",
  tsconfig: "./tsconfig.json",
});
