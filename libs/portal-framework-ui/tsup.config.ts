import { fixImportsPlugin } from "esbuild-fix-imports-plugin";
import inlineImage from "esbuild-plugin-inline-image";
import { defineConfig } from "tsup";

function esbuildOptions(options) {
  options.assetNames = "assets/[name]-[hash]";
  options.loader = {
    ...options.loader,
    ".gif": "file",
    ".jpeg": "file",
    ".jpg": "file",
    ".png": "file",
    ".svg": "file",
  };
}

export default defineConfig([
  {
    bundle: false,
    clean: true,
    entry: [
      "src/**/*",
      "!src/images/**",
      "!**/image.ts",
      "!**/image.d.ts",
      "!**/*.{stories,spec}.{ts,tsx}",
      "!**/*.{stories,spec}.disabled.{ts,tsx}",
      "!**/*.spec.disabled.{ts,tsx}",
      "!__mocks__/**",
    ],
    esbuildPlugins: [fixImportsPlugin() as any, inlineImage({ limit: -1 })],
    external: ["fs", "path", "react", "react-dom"],
    format: ["cjs"],
    minify: false,
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
    entry: [
      "src/**/*",
      "!src/images/**",
      "!**/image.ts",
      "!**/image.d.ts",
      "!**/*.{stories,spec}.{ts,tsx}",
      "!**/*.{stories,spec).disabled.{ts,tsx}",
      "!**/*.spec.disabled.{ts,tsx}",
      "!__mocks__/**",
    ],
    esbuildPlugins: [fixImportsPlugin() as any],
    external: ["fs", "path", "react", "react-dom"],
    format: ["esm"],
    minify: false,
    outDir: "dist/esm",
    sourcemap: true,
    target: "esnext",
    tsconfig: "./tsconfig.json",
  },
  {
    clean: true,
    dts: true,
    entry: ["src/images.ts"],
    esbuildOptions,
    esbuildPlugins: [fixImportsPlugin() as any, inlineImage({ limit: -1 })],
    external: ["fs", "path", "react", "react-dom"],
    format: ["esm"],
    minify: false,
    outDir: "dist/esm",
    sourcemap: true,
    target: "esnext",
    tsconfig: "./tsconfig.json",
  },
]);
