import type { UserConfig } from "tsdown";

/**
 * Base configuration options common to all Lume Web library builds
 */
const baseOptions: Partial<UserConfig> = {
  clean: true,
  dts: true,
  external: [/node_modules/],
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
      },
      cjs: {
        outputOptions: {
          dir: "dist/cjs",
        },
      },
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
  cjsDir: string,
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
      cjs: {
        outputOptions: {
          dir: cjsDir,
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
      cjs: {
        outputOptions: {
          dir: "dist/cjs",
        },
      },
    },
    external: externals,
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
      },
      cjs: {
        outputOptions: {
          dir: "dist/cjs",
        },
      },
    },
    plugins,
    ...options,
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
  ],
  withoutSpecOrStories: [
    "src/**/*",
    "!src/**/*.{spec,stories}.{ts,tsx}",
  ],
  withoutTests: ["src/**/*", "!**/__tests__/**", "!**/*.test.ts", "!**/*.spec.ts"],
};
