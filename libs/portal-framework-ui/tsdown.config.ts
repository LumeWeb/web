import type { UserConfig } from "tsdown";
import { defineConfig } from "tsdown";
import { createLibraryConfigWithPlugins } from "@lumeweb/tsdown-config";

import image from "@rollup/plugin-image";

const baseOptions: Partial<UserConfig> = {
  external: [/node_modules/, /@refinedev\/.*/],
  minify: false,
  platform: "neutral",
  plugins: [image() as any],
  sourcemap: true,
  target: "esnext",
  tsconfig: "./tsconfig.json",
  unbundle: true,
};

export default defineConfig([
  {
    ...baseOptions,
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
    ...baseOptions,
    clean: false,
    dts: true,
    entry: ["src/images.ts"],
    format: "esm",
    outDir: "dist/esm",
  },
]);
