import { defineConfig, UserConfig } from "tsdown";

const commonOptions: UserConfig = {
  external: [/node_modules/],
  hash: false,
  minify: false,
  platform: "browser",
  sourcemap: true,
  target: "esnext",
  tsconfig: "./tsconfig.json",
  unbundle: true,
};

const configs: UserConfig[] = [
  {
    ...commonOptions,
    clean: true,
    entry: ["src/**/*"],
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
];

export default defineConfig(configs);
