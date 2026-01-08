import type { UserConfig } from "tsdown";

import image from "@rollup/plugin-image";
import { defineConfig } from "tsdown";

const commonOptions: Partial<UserConfig> = {
  external: [/node_modules/, /@refinedev\/.*/],
  hash: false,
  minify: false,
  platform: "browser",
  plugins: [image() as any],
  sourcemap: true,
  target: "esnext",
  tsconfig: "./tsconfig.json",
  unbundle: true,
};

const configs: UserConfig[] = [
  {
    ...commonOptions,
    clean: true,
    entry: [
      "src/**/*",
      "!**/image*/**",
      "!**/*image*/**",
      "!**/*.{stories,spec}.{ts,tsx}",
      "!**/*.{stories,spec}.disabled.{ts,tsx}",
      "!**/*.md",
      "!__mocks__/**",
      "!tests/**",
    ],
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
