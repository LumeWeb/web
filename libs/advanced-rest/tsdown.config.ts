import type { Options } from "tsdown";

import { defineConfig } from "tsdown";

const commonOptions: Omit<
  Options,
  "clean" | "dts" | "entry" | "format" | "outDir" | "outExtensions"
> = {
  external: [/node_modules/],
  minify: false,
  outputOptions: {
    chunkFileNames: "[name].js",
    entryFileNames: "[name].js",
  },
  sourcemap: true,
  target: "esnext",
  tsconfig: "./tsconfig.json",
};

const configs: Options[] = [
  {
    ...commonOptions,
    clean: true,
    entry: ["src/**/*", "!src/**/*.spec.ts"],
    format: "cjs",
    outDir: "dist/cjs",
    outExtensions: () => ({ js: ".cjs" }),
  },
  {
    ...commonOptions,
    clean: true,
    dts: true,
    entry: ["src/**/*", "!src/**/*.spec.ts"],
    format: "esm",
    outDir: "dist/esm",
  },
];

export default defineConfig(configs);
