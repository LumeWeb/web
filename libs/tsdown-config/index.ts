import path from "node:path";
import fs from "node:fs";
import type { UserConfig } from "tsdown";

/**
 * Base configuration options common to all Lume Web library builds
 */
const baseOptions: Partial<UserConfig> = {
  clean: true,
  deps: {
    skipNodeModulesBundle: true,
  },
  dts: true,
  hash: false,
  minify: false,
  platform: "neutral",
  sourcemap: true,
  target: "esnext",
  tsconfig: "./tsconfig.json",
  unbundle: true,
};

/**
 * Create a standard library configuration
 */
export function createLibraryConfig(
  entry: string | string[],
  options: Partial<UserConfig> = {}
): UserConfig {
  return {
    ...baseOptions,
    entry: Array.isArray(entry) ? entry : [entry],
    format: {
      esm: {
        outputOptions: {
          dir: "dist/esm",
          entryFileNames: "[name].js",
        },
      }
    },
    ...options,
  };
}

/**
 * Create a library configuration with custom output directories
 */
export function createLibraryConfigWithDirs(
  entry: string | string[],
  esmDir: string,
  options: Partial<UserConfig> = {}
): UserConfig {
  return {
    ...baseOptions,
    entry: Array.isArray(entry) ? entry : [entry],
    format: {
      esm: {
        outputOptions: {
          dir: esmDir,
          entryFileNames: "[name].js",
        },
      },
    },
    ...options,
  };
}

/**
 * Create a library configuration with custom external dependencies
 */
export function createLibraryConfigWithExternals(
  entry: string | string[],
  externals: (string | RegExp)[],
  options: Partial<UserConfig> = {}
): UserConfig {
  const filteredExternals = externals.filter(
    (e) => !(e instanceof RegExp && e.source === "node_modules")
  );

  return {
    ...baseOptions,
    entry: Array.isArray(entry) ? entry : [entry],
    format: {
      esm: {
        outputOptions: {
          dir: "dist/esm",
          entryFileNames: "[name].js",
        },
      },
    },
    deps: {
      skipNodeModulesBundle: true,
      ...(filteredExternals.length > 0 ? { neverBundle: filteredExternals } : {}),
    },
    ...options,
  };
}

/**
 * Create a library configuration with plugins
 */
export function createLibraryConfigWithPlugins(
  entry: string | string[],
  plugins: any[],
  options: Partial<UserConfig> = {}
): UserConfig {
  return {
    ...baseOptions,
    entry: Array.isArray(entry) ? entry : [entry],
    format: {
      esm: {
        outputOptions: {
          dir: "dist/esm",
          entryFileNames: "[name].js",
        },
      }
    },
    plugins,
    ...options,
  };
}

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".avif"];
const imageExtRegex = new RegExp(
  `(${IMAGE_EXTENSIONS.map((ext) => ext.replace(".", "\\.")).join("|")})$`,
);

/**
 * Replacement for @rollup/plugin-image using rolldown's emitFile API.
 * Emits images as separate asset files instead of inlining as base64 data URLs.
 * Exports `import.meta.ROLLUP_FILE_URL_<ref>` so consumers get a URL string.
 */
export function rolldownImageAssetPlugin() {
  return {
    name: "rolldown-image-asset",
    resolveId: {
      filter: { id: imageExtRegex },
      handler(source: string, importer: string) {
        if (!importer || path.isAbsolute(source)) return null;
        return path.resolve(path.dirname(importer), source);
      },
    },
    load: {
      filter: { id: imageExtRegex },
      handler(id: string) {
        const referenceId = this.emitFile({
          type: "asset",
          name: path.basename(id),
          source: fs.readFileSync(id),
        });
        return `export default import.meta.ROLLUP_FILE_URL_${referenceId};`;
      },
    },
  };
}

/**
 * Common entry patterns
 */
export const entryPatterns = {
  singleFile: "./src/index.ts",
  allFiles: [
    "src/**/*",
    "!**/__tests__/**",
    "!**/*.test.ts",
    "!**/*.test.tsx",
    "!**/*.spec.ts",
    "!**/*.spec.tsx",
    "!**/*.stories.ts",
    "!**/*.stories.tsx",
    "!**/*.md",
    "!**/*.png",
    "!**/*.jpg",
    "!**/*.jpeg",
    "!**/*.svg",
    "!**/*.webp",
    "!**/*.gif",
  ],
  allFilesWithYaml: [
    "src/**/*",
    "!**/__tests__/**",
    "!**/*.test.ts",
    "!**/*.test.tsx",
    "!**/*.spec.ts",
    "!**/*.spec.tsx",
    "!**/*.stories.ts",
    "!**/*.stories.tsx",
    "!src/**/*.yaml",
    "!**/*.md",
    "!**/*.png",
    "!**/*.jpg",
    "!**/*.jpeg",
    "!**/*.svg",
    "!**/*.webp",
    "!**/*.gif",
  ],
  withoutSpecOrStories: [
    "src/**/*",
    "!src/**/*.{spec,stories}.{ts,tsx}",
    "!**/*.md",
    "!**/*.png",
    "!**/*.jpg",
    "!**/*.jpeg",
    "!**/*.svg",
    "!**/*.webp",
    "!**/*.gif",
  ],
  withoutTests: ["src/**/*", "!**/__tests__/**", "!**/*.test.{ts,tsx}", "!**/*.spec.{ts,tsx}", "!**/*.spec.disabled.{ts,tsx}", "!**/*.md", "!**/*.png", "!**/*.jpg", "!**/*.jpeg", "!**/*.svg", "!**/*.webp", "!**/*.gif"],
};
