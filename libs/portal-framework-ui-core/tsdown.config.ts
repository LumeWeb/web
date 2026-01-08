import type { UserConfig } from "tsdown";
import { defineConfig } from "tsdown";

const baseOptions: Partial<UserConfig> = {
  external: [/node_modules/],
  minify: false,
  platform: "neutral",
  sourcemap: true,
  target: "esnext",
  tsconfig: "./tsconfig.json",
  unbundle: true,
};

export default defineConfig([
  {
    ...baseOptions,
    clean: true,
    dts: false,
    entry: ["./src/index.ts", "!**/*.stories.tsx", "!**/*.css"],
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
    copy: [
      { to: "dist/esm", from: "src/tailwind.css" },
      { to: "dist/esm", from: "src/tailwind-plugin.css" },
    ],
  },
  {
    ...baseOptions,
    clean: false,
    dts: { resolve: true },
    entry: ["./config/*"],
    format: {
      esm: {
        outputOptions: {
          dir: "dist/esm",
          entryFileNames: "config/[name].js",
        },
      },
      cjs: {
        outputOptions: {
          dir: "dist/cjs",
          entryFileNames: "config/[name].cjs",
        },
      },
    },
  },
]);
