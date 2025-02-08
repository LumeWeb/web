import { fixImportsPlugin } from "esbuild-fix-imports-plugin";
import { defineConfig } from "tsup";

export default defineConfig([
  {
    bundle: false,
    clean: true,
    dts: true,
    entry: ["src/**/*.{ts,tsx}", "!src/**/*.{spec,stories}.{ts,tsx}"],
    esbuildPlugins: [fixImportsPlugin() as any],
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
    entry: ["src/**/*.{ts,tsx}", "!src/**/*.{spec,stories}.{ts,tsx}"],
    esbuildPlugins: [fixImportsPlugin() as any],
    external: ["fs", "path"],
    format: ["esm"],
    outDir: "dist/esm",
    sourcemap: true,
    target: "esnext",
    tsconfig: "./tsconfig.json",
  },
]);
