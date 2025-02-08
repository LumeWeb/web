// @ts-nocheck

import type { ModuleFederationOptions } from "@module-federation/vite/lib/utils/normalizeModuleFederationOptions";

import { federation } from "@module-federation/vite";
import react from "@vitejs/plugin-react";
import * as fs from "fs";
import { createRequire } from "node:module";
import path, { dirname, resolve } from "path";
import * as process from "process";
import { AliasOptions, defineConfig, Plugin } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const require = createRequire(import.meta.url);

export interface ConfigOptions {
  dir: string;
  exposes: ModuleFederationOptions["exposes"];
  name: string;
  sharedModules: ModuleFederationOptions["shared"];
}

export function Config(opts: ConfigOptions) {
  let resolvedRuntimePlugins: string[] = [];
  try {
    const bridgeReactPluginPath = require.resolve(
      "@module-federation/bridge-react/plugin",
    );
    resolvedRuntimePlugins.push(bridgeReactPluginPath);
  } catch (error) {
    console.error(
      "CRITICAL: Failed to resolve runtime plugin '@module-federation/bridge-react/plugin'. Make sure it's installed.",
      error,
    );
    throw new Error(
      "Failed to resolve required runtime plugin '@module-federation/bridge-react/plugin'.",
    );
  }

  const sharedAliases = createSharedModuleAliases(opts);

  return defineConfig({
    base: "http://localhost:4173/",
    build: {
      lib: {
        entry: resolve(opts.dir, "src/index.ts"),
        fileName: "index",
        formats: ["es"],
      },
      minify: false,
      rollupOptions: {
        output: {
          assetFileNames: "static/[ext]/[name]-[hash].[ext]",
          chunkFileNames: "static/js/[name]-[hash].js",
          entryFileNames: "static/js/[name]-[hash].js",
          minifyInternalExports: false,
        },
      },
      target: "esnext",
    },
    define: {
      "process.env": {},
    },
    plugins: [
      react(),
      tsconfigPaths(),
      overrideHtmlInjection(),
      federation({
        exposes: opts.exposes,
        filename: "remoteEntry-[hash].js",
        injectEntryCode: react.preambleCode.replace(
          "__BASE__",
          "http://localhost:4173",
        ),
        manifest: true,
        name: opts.name,
        remotes: {},
        runtimePlugins: resolvedRuntimePlugins,
        shared: opts.sharedModules,
      }),
    ],
    preview: {
      fs: {
        preserveSymlinks: true,
      },
      port: 4173,
    },
    resolve: {
      //  alias: { ...sharedAliases },
    },
    server: {
      cors: true,
      fs: {
        preserveSymlinks: true,
      },
      port: 4173,
    },
  });
}

function createSharedModuleAliases(opts: ConfigOptions): AliasOptions {
  const sharedModuleNames = Object.keys(opts.sharedModules);
  const allModulesToAlias = Array.from(
    new Set([
      "@lumeweb/portal-framework-ui/images",
      "react-dom/client",
      "react/jsx-dev-runtime",
      "react/jsx-runtime",
      ...sharedModuleNames.filter((item) => item !== "react-router"),
    ]),
  );
  const aliases: Record<string, string> = {};
  const projectRoot = process.cwd();

  for (const moduleName of allModulesToAlias) {
    const parts = moduleName.split("/");
    const isScoped = moduleName.startsWith("@");
    const isDeep = parts.length > (isScoped ? 2 : 1);

    const resolvedPath = resolveModulePathForAlias(
      moduleName,
      projectRoot,
      isDeep,
    );

    if (resolvedPath) {
      aliases[moduleName] = resolvedPath;
    } else {
      if (
        opts.sharedModules[moduleName] ||
        ["@lumeweb/portal-framework-ui/images", "react-dom/client"].includes(
          moduleName,
        )
      ) {
        console.error(
          `CRITICAL: Could not resolve required module/subpath for alias "${moduleName}". Build might fail or lead to unexpected behavior.`,
        );
        // Consider throwing an error here if resolution failure for required modules is unacceptable
        // throw new Error(`Failed to resolve required module/subpath for alias: ${moduleName}`);
      }
      // Optional: Log a warning for potentially optional deep imports if necessary during debugging
      // else { console.warn(`Could not resolve potentially optional deep import "${moduleName}" for alias.`); }
    }
  }
  return aliases;
}

function findPackageJson(
  moduleName: string,
  searchRoot: string,
): null | { packageDir: string; packageJsonPath: string } {
  const resolveOptions = { paths: [searchRoot] };
  const directJsonPathTarget = `${moduleName}/package.json`;

  try {
    const packageJsonPath = require.resolve(
      directJsonPathTarget,
      resolveOptions,
    );
    return { packageDir: dirname(packageJsonPath), packageJsonPath };
  } catch (error) {
    if (isExportsRestrictionError(error)) {
      let mainEntryPath: string;
      try {
        mainEntryPath = require.resolve(moduleName, resolveOptions);
      } catch (mainEntryError) {
        console.error(
          `Failed to resolve main entry point for "${moduleName}" during package.json search fallback. Error: ${(mainEntryError as Error).message}`,
        );
        return null;
      }

      let currentDir = dirname(mainEntryPath);
      const rootPath = resolve(searchRoot, "/");
      let iterations = 0;
      const maxIterations = 15;

      while (iterations < maxIterations) {
        const potentialPath = path.join(currentDir, "package.json");
        if (fs.existsSync(potentialPath)) {
          return { packageDir: currentDir, packageJsonPath: potentialPath };
        }
        if (
          currentDir === rootPath ||
          currentDir === searchRoot ||
          dirname(currentDir) === currentDir
        ) {
          break;
        }
        currentDir = dirname(currentDir);
        iterations++;
      }
      console.error(
        `Fallback package.json search failed for "${moduleName}" starting from ${dirname(mainEntryPath)}.`,
      );
      return null;
    } else {
      console.error(
        `Failed to resolve "${directJsonPathTarget}" directly. Error: ${(error as Error).message}`,
      );
      return null;
    }
  }
}

function getPotentialEntryPointFromExports(
  exportsField: any,
  subpath: string,
): null | string {
  if (
    !exportsField ||
    typeof exportsField !== "object" ||
    exportsField === null
  ) {
    return null;
  }

  let exportEntry = exportsField[subpath];
  if (!exportEntry) return null;

  if (typeof exportEntry === "string") {
    return exportEntry;
  } else if (typeof exportEntry === "object") {
    // Prioritize 'import' condition
    let importTarget = exportEntry.import;
    if (typeof importTarget === "string") {
      return importTarget;
    } else if (
      typeof importTarget === "object" &&
      typeof importTarget.default === "string"
    ) {
      return importTarget.default;
    }
    // Fallback to 'default' condition if 'import' not found/suitable
    if (typeof exportEntry.default === "string") {
      return exportEntry.default;
    }
  }
  return null;
}

function isExportsRestrictionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    (error as any).code === "ERR_PACKAGE_PATH_NOT_EXPORTED" ||
    error.message.includes('is not defined by "exports"')
  );
}

function overrideHtmlInjection(): Plugin {
  let root: string;
  let virtualIndexPath: null | string = null;
  let listenersAttached = false;

  const cleanup = () => {
    if (virtualIndexPath && fs.existsSync(virtualIndexPath)) {
      const fileToDelete = virtualIndexPath;
      virtualIndexPath = null; // Prevent immediate re-entry issues
      try {
        fs.unlinkSync(fileToDelete);
      } catch (e) {
        console.error(
          `[overrideHtmlInjection] Failed to clean up virtual index.html: ${fileToDelete}`,
          e,
        );
      }
    }
  };

  const attachCleanupListeners = () => {
    if (!listenersAttached && typeof process?.on === "function") {
      process.on("exit", cleanup);
      process.on("SIGINT", () => {
        cleanup();
        process.exit(0);
      });
      process.on("SIGTERM", () => {
        cleanup();
        process.exit(0);
      });
      listenersAttached = true;
    } else if (!listenersAttached) {
      console.error(
        "[overrideHtmlInjection] CRITICAL: Could not attach cleanup listeners, process.on is not available!",
      );
    }
  };

  return {
    configResolved(config) {
      root = config.root;
      const potentialIndexPath = path.join(root, "index.html");

      if (!fs.existsSync(potentialIndexPath)) {
        virtualIndexPath = potentialIndexPath;
        try {
          fs.writeFileSync(
            virtualIndexPath,
            `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head><body><!-- Virtual entry --></body></html>`,
            "utf-8",
          );
          attachCleanupListeners(); // Attach listeners only if file was created
        } catch (writeError) {
          console.error(
            `[overrideHtmlInjection] Failed to create virtual index.html at ${virtualIndexPath}:`,
            writeError,
          );
          virtualIndexPath = null; // Reset path if creation failed
        }
      } else {
        virtualIndexPath = null; // Ensure cleanup doesn't run if user provided the file
      }
    },
    enforce: "pre",
    name: "override-html-injection",
    // buildEnd hook might be slightly more reliable than process exit in some scenarios,
    // but process exit handlers are crucial for dev server interrupts (SIGINT/SIGTERM).
    // Let's keep the process handlers as they cover more cases.
  };
}

function resolveModulePathForAlias(
  moduleName: string,
  searchRoot: string,
  isDeepImport: boolean,
): null | string {
  const resolveOptions = { paths: [searchRoot] };
  const baseModuleName = isDeepImport
    ? moduleName.startsWith("@")
      ? moduleName.split("/").slice(0, 2).join("/")
      : moduleName.split("/")[0]
    : moduleName;

  const packageJsonInfo = findPackageJson(baseModuleName, searchRoot);
  if (!packageJsonInfo) return null;

  let packageJson: any;
  try {
    packageJson = JSON.parse(
      fs.readFileSync(packageJsonInfo.packageJsonPath, "utf-8"),
    );
  } catch (parseError) {
    console.error(
      `Error parsing package.json for "${baseModuleName}": ${parseError}`,
    );
    return null;
  }

  const subpath = isDeepImport
    ? "./" + moduleName.substring(baseModuleName.length + 1)
    : ".";

  // Helper function to verify a potential path
  const verifyPath = (
    potentialEntryPoint: null | string | undefined,
  ): null | string => {
    if (typeof potentialEntryPoint === "string") {
      try {
        const potentialResolvedPath = resolve(
          packageJsonInfo.packageDir,
          potentialEntryPoint,
        );
        // Use require.resolve for definitive check, handles directory indexes etc.
        return require.resolve(potentialResolvedPath);
      } catch (_) {
        // Error during verification is expected if path isn't resolvable
      }
    }
    return null;
  };

  if (isDeepImport) {
    // Attempt 1 (Deep): Direct require.resolve (Node's native handling)
    try {
      return require.resolve(moduleName, resolveOptions);
    } catch (_) {
      // If direct fails (e.g., exports restriction), proceed to manual check
    }

    // Attempt 2 (Deep): Manually check exports
    const potentialEntryPoint = getPotentialEntryPointFromExports(
      packageJson.exports,
      subpath,
    );
    const verifiedPath = verifyPath(potentialEntryPoint);
    if (verifiedPath) return verifiedPath;
  } else {
    // Attempt 1 (Base): Manually check exports
    let potentialEntryPoint = getPotentialEntryPointFromExports(
      packageJson.exports,
      subpath, // subpath is "." for base
    );
    let verifiedPath = verifyPath(potentialEntryPoint);
    if (verifiedPath) return verifiedPath;

    // Attempt 2 (Base): Check 'module' field if exports didn't resolve
    if (!verifiedPath && typeof packageJson.module === "string") {
      verifiedPath = verifyPath(packageJson.module);
      if (verifiedPath) return verifiedPath;
    }

    // Attempt 3 (Base): Fallback to direct require.resolve (likely CJS)
    try {
      return require.resolve(moduleName, resolveOptions);
    } catch (finalError) {
      // Log final failure if all attempts fail for base module
      console.error(
        `Failed to resolve base module "${moduleName}" via exports, module field, or direct resolution. Error: ${(finalError as Error).message}`,
      );
    }
  }

  // Final failure point for deep imports or if all base attempts failed
  if (isDeepImport) {
    console.error(
      `Failed to resolve deep import "${moduleName}" via direct resolution or package.json exports.`,
    );
  }
  return null;
}
