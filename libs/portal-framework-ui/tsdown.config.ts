import type { Options } from "tsdown";

import image from "@rollup/plugin-image";
import { defineConfig } from "tsdown";

const commonOptions: Options = {
  external: [/node_modules/],
  hash: false,
  minify: false,
  platform: "browser",
  plugins: [image() as any],
  sourcemap: true,
  target: "esnext",
  tsconfig: "./tsconfig.json",
  unbundle: true,
};

const configs: Options[] = [
  {
    ...commonOptions,
    clean: true,
    entry: [
      "src/**/*",
      "!**/image*/**",
      "!**/*image*/**",
      "!**/*.{stories,spec}.{ts,tsx}",
      "!__mocks__/**",
      "!tests/**",
    ],
    format: ["esm", "cjs"],
    outputOptions(options, format) {
      options.dir = format === "es" ? "dist/esm" : "dist/cjs";
    },
  },
  {
    ...commonOptions,
    clean: false,
    dts: true,
    entry: ["src/images.ts"],
    format: "esm",
    outDir: "dist/esm",
  },
  /*  {
    ...commonOptions,
    clean: true,
    dts: false,
    entry: ["src/!**!/!*.stories.tsx"],
    format: "esm",
    outDir: "stories-dist",
    outputOptions: {
      chunkFileNames: "[name].js",
      entryFileNames: "[name].js",
    },
    target: "esnext",
  },*/
];

export default defineConfig(configs);
