import { defineConfig, type UserConfig } from "tsdown";

const commonOptions = {
  external: [/node_modules/],
  minify: false,
  platform: "node",
  sourcemap: true,
  tsconfig: "./tsconfig.json",
  unbundle: true,
} satisfies UserConfig;

export default defineConfig([
  {
    ...commonOptions,
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
    ...commonOptions,
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
