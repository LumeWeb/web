import { fixImportsPlugin } from "esbuild-fix-imports-plugin";
import { defineConfig } from "tsup";

export default defineConfig([
  {
    bundle: false,
    clean: true,
    dts: true,
    entry: ["src/**/*", "!src/**/*.yaml"],
    esbuildPlugins: [fixImportsPlugin()],
    external: ["fs", "path"],
    format: ["cjs"],
    outDir: "dist/cjs",
    outExtension: () => ({ js: ".cjs" }),
    sourcemap: true,
    target: "esnext",
    tsconfig: "./tsconfig.json",
  },
  {
    bundle: false,
    clean: true,
    dts: true,
    entry: ["src/**/*", "!src/**/*.yaml"],
    esbuildPlugins: [fixImportsPlugin()],
    external: ["fs", "path"],
    format: ["esm"],
    outDir: "dist/esm",
    sourcemap: true,
    target: "esnext",
    tsconfig: "./tsconfig.json",
  },
]);
