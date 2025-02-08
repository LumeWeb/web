import { defineConfig } from "tsup";

export default defineConfig([
  {
    bundle: false,
    clean: true,
    dts: true,
    entry: ["src/**/*"],
    external: [],
    format: ["cjs"],
    outDir: "dist/cjs",
    outExtension: () => ({ js: ".cjs" }),
    sourcemap: true,
    splitting: false,
    target: "esnext",
    tsconfig: "./tsconfig.json",
  },
  {
    bundle: false,
    clean: true,
    dts: true,
    entry: ["src/**/*"],
    external: [],
    format: ["esm"],
    outDir: "dist/esm",
    sourcemap: true,
    splitting: false,
    target: "esnext",
    tsconfig: "./tsconfig.json",
  },
]);
