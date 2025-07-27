import type { Options } from "tsdown";

import { defineConfig } from "tsdown";

const commonOptions: Options = {
  external: [/node_modules/],
  hash: false,
  minify: false,
  platform: "browser",
  sourcemap: true,
  target: "esnext",
  tsconfig: "./tsconfig.json",
  unbundle: true,
};

const configs: Options[] = [
  {
    ...commonOptions,
    clean: true,
    entry: ["src/**/*", "!src/**/*.yaml"],
    format: ["esm", "cjs"],
    outputOptions(options, format) {
      options.dir = format === "es" ? "dist/esm" : "dist/cjs";
    },
  },
];

export default defineConfig(configs);
