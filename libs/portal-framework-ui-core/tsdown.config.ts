import { defineConfig, type Options } from "tsdown";

const commonOptions: Omit<
  Options,
  | "clean"
  | "dts"
  | "entry"
  | "format"
  | "outDir"
  | "outExtensions"
  | "outputOptions"
> = {
  external: [/node_modules/],
  minify: false,
  platform: "node",
  sourcemap: true,
  tsconfig: "./tsconfig.json",
};

export default defineConfig([
  {
    ...commonOptions,
    clean: true,
    dts: false,
    entry: ["src", "!**/*.stories.tsx"],
    format: ["esm", "cjs"],
    hash: false,
    outputOptions(options, format) {
      options.dir = format === "es" ? "dist/esm" : "dist/cjs";
    },
  },
  {
    ...commonOptions,
    clean: false,
    dts: { resolve: true },
    entry: ["config"],
    format: ["esm", "cjs"],
    hash: false,
    outExtensions: () => ({ js: ".cjs" }),
    outputOptions(options, format) {
      options.dir = format === "es" ? "dist/esm" : "dist/cjs";
      options.entryFileNames =
        format === "es" ? "config/[name].js" : "config/[name].cjs";
      options.exports = "named";
    },
  },
]);
