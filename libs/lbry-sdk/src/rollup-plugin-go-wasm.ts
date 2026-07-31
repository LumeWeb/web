/**
 * Minimal rolldown/tsdown plugin for Go → WASM compilation.
 *
 * Adapted from vite-plugin-golang-wasm (MIT, slainless) but stripped down:
 * - No teamortix/golang-wasm dependency (we use syscall/js directly)
 * - TinyGo support via goBinaryPath + goBuildExtraArgs
 * - Emits .wasm as Rollup asset, generates loader that fetches + instantiates
 * - wasm_exec.js loaded from TinyGo or standard Go toolchain
 *
 * Usage in tsdown.config.ts:
 *   import { goWasm } from "@/rollup-plugin-go-wasm";
 *   export default defineConfig({
 *     plugins: [goWasm({
 *       goBuildExtraArgs: ["-target", "wasm", "-no-debug"],
 *       cwd: "./wasm/go",
 *     })],
 *     ...createLibraryConfig(...)
 *   });
 */

import { execFile } from "node:child_process";
import { extname, basename, join, isAbsolute, resolve, relative } from "node:path";
import { realpathSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import type { Plugin, TransformPluginContext } from "rolldown";

export interface GoWasmPluginOptions {
  /** Path to go/tinygo binary. Defaults to "tinygo" (resolved via PATH). */
  goBinaryPath?: string;
  /** Path to wasm_exec.js. Defaults to tinygo targets/wasm_exec.js. */
  wasmExecPath?: string;
  /** Trusted TinyGo root directory. Defaults to TINYGOROOT env or discovered via `tinygo env TINYGOROOT`. */
  trustedRoot?: string;
  /** Extra build args (e.g. ["-target", "wasm", "-no-debug"]). */
  goBuildExtraArgs?: string[];
  /** Env overrides for the build process. */
  env?: Record<string, string>;
  /** Working directory for the build. Defaults to cwd. */
  cwd?: string;
}

const WASM_EXEC_VIRTUAL_ID = "\0virtual:wasm_exec";
const WASM_BRIDGE_VIRTUAL_ID = "\0virtual:wasm_bridge";

/**
 * The JS bridge code injected into the bundle.
 * Loads wasm_exec.js, instantiates the WASM module, and returns a proxy
 * that calls functions on globalThis.__lbrySDK__.
 */
const BRIDGE_CODE = `
const g = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : self;

// wasm_exec.js is loaded as a side-effect module via virtual:wasm_exec
// It defines the Go class on the global scope.

export default async function loadGoWasm(wasmBytes) {
  const go = new Go();
  const result = await WebAssembly.instantiate(await wasmBytes, go.importObject);
  go.run(result.instance);
  return g.__lbrySDK__;
}
`;

export function goWasm(options: GoWasmPluginOptions = {}): Plugin {
  // Resolve the go binary path.
  // Priority: explicit option > env var > discover via PATH at buildStart.
  const goBinaryOption = options.goBinaryPath ?? process.env.TINYGOPATH ?? "tinygo";
  const wasmExecPathOption = options.wasmExecPath;
  // Trusted root: explicit option > TINYGOROOT env > discovered at buildStart
  const trustedRootOption = options.trustedRoot ?? process.env.TINYGOROOT;

  /**
   * Validate that a path is absolute and within the trusted TinyGo root.
   * Resolves symlinks via realpathSync to prevent traversal attacks.
   * Throws if the path is relative, non-absolute, or escapes the trusted root.
   */
  function assertTrustedPath(p: string, label: string, root: string): void {
    if (!isAbsolute(p)) {
      throw new Error(
        `Refusing to ${label} from non-absolute path: ${p}. Provide an absolute path.`
      );
    }
    if (!isAbsolute(root)) {
      throw new Error(
        `Refusing to ${label}: trusted root must be an absolute path, got ${root}.`
      );
    }
    // Resolve symlinks — if the path doesn't exist yet, resolve the parent
    let real: string;
    try {
      real = realpathSync(p);
    } catch {
      // Path may not exist yet (e.g. wasmExecPath before install) — resolve literally
      real = resolve(p);
    }
    const realRoot = (() => {
      try {
        return realpathSync(root);
      } catch {
        return resolve(root);
      }
    })();
    const rel = relative(realRoot, real);
    if (rel.startsWith("..") || isAbsolute(rel)) {
      throw new Error(
        `Refusing to ${label} from untrusted path: ${p} (resolves to ${real}, outside trusted root ${realRoot}).`
      );
    }
  }

  // Synchronous validation at construction time:
  // - Reject relative paths immediately (even without trusted root)
  // - If trusted root is known, validate absolute paths against it
  if (!isAbsolute(goBinaryOption)) {
    // Allow bare names like "tinygo" — they'll be resolved via PATH in buildStart
    if (goBinaryOption.includes("/")) {
      throw new Error(
        `Refusing to run go binary from non-absolute path: ${goBinaryOption}. Provide an absolute path or bare name.`
      );
    }
  } else if (trustedRootOption) {
    assertTrustedPath(goBinaryOption, "run go binary", trustedRootOption);
  }
  if (wasmExecPathOption) {
    if (!isAbsolute(wasmExecPathOption)) {
      throw new Error(
        `Refusing to load wasm_exec.js from non-absolute path: ${wasmExecPathOption}. Provide an absolute path.`
      );
    }
    if (trustedRootOption) {
      assertTrustedPath(wasmExecPathOption, "load wasm_exec.js", trustedRootOption);
    }
  }

  let pathsValidationPromise: Promise<void> | null = null;
  let resolvedGoBinary: string | null = null;
  let resolvedWasmExecPath: string | null = null;
  const extraArgs = options.goBuildExtraArgs ?? ["-target", "wasm"];
  // Security-sensitive env vars that callers must not override
  const SENSITIVE_ENV_KEYS = new Set(["PATH", "GOPATH", "GOROOT", "HOME", "GOCACHE", "LD_LIBRARY_PATH"]);
  const buildEnv: Record<string, string> = {};
  if (options.env) {
    for (const [key, value] of Object.entries(options.env)) {
      if (SENSITIVE_ENV_KEYS.has(key)) continue; // silently drop
      buildEnv[key] = value;
    }
  }
  const buildCwd = options.cwd ?? process.cwd();

  let tempDir: string | null = null;

  return {
    name: "go-wasm",

    async buildStart() {
      if (!pathsValidationPromise) {
        pathsValidationPromise = (async () => {
          // If the option is already an absolute path, validate and use it.
          // If it's a bare name, resolve it to an absolute path via which/where.
          if (isAbsolute(goBinaryOption)) {
            // Will validate against trusted root after root is resolved
            resolvedGoBinary = goBinaryOption;
          } else {
            // Resolve bare name to absolute path using PATH
            const whichCmd = process.platform === "win32" ? "where" : "which";
            resolvedGoBinary = await new Promise<string>((resolveP, rejectP) => {
              execFile(whichCmd, [goBinaryOption], (err, stdout) => {
                if (err) {
                  rejectP(new Error(`Could not find "${goBinaryOption}" on PATH. Set goBinaryPath or TINYGOPATH to an absolute path.`));
                } else {
                  resolveP(stdout.trim().split(/\r?\n/)[0]);
                }
              });
            });
          }

          // Resolve the trusted root:
          // 1. Explicit option or TINYGOROOT env (already validated at construction)
          // 2. Run `tinygo env TINYGOROOT` to discover
          let trustedRoot: string | undefined = trustedRootOption;
          if (!trustedRoot) {
            const tinygoRoot = await new Promise<string>((resolveP, rejectP) => {
              execFile(resolvedGoBinary!, ["env", "TINYGOROOT"], (err, stdout) => {
                if (err) rejectP(new Error(`Failed to query TINYGOROOT from ${resolvedGoBinary}: ${err.message}`));
                else resolveP(stdout.trim());
              });
            });
            if (!tinygoRoot) {
              throw new Error("tinygo env TINYGOROOT returned empty — cannot determine trusted root");
            }
            trustedRoot = tinygoRoot;
          } else if (!isAbsolute(goBinaryOption)) {
            // Trusted root was known at construction but binary was PATH-resolved.
            // Validate the resolved binary against the trusted root now.
            assertTrustedPath(resolvedGoBinary!, "run go binary", trustedRoot);
          }

          // Resolve wasm_exec.js:
          // 1. Explicit option (already validated at construction if trusted root known)
          // 2. ${trustedRoot}/targets/wasm_exec.js
          if (wasmExecPathOption) {
            // Already validated at construction if trustedRootOption was set.
            // If trusted root was discovered at buildStart, validate now.
            if (!trustedRootOption) {
              assertTrustedPath(wasmExecPathOption, "load wasm_exec.js", trustedRoot);
            }
            resolvedWasmExecPath = wasmExecPathOption;
          } else {
            resolvedWasmExecPath = join(trustedRoot, "targets", "wasm_exec.js");
          }

          if (!resolvedWasmExecPath) {
            throw new Error("Could not resolve wasm_exec.js path");
          }
        })();
      }
      await pathsValidationPromise;
      tempDir = await mkdtemp(join(tmpdir(), "go-wasm-"));
    },

    async buildEnd() {
      if (tempDir) {
        await rm(tempDir, { recursive: true, force: true }).catch(() => {});
      }
    },

    resolveId(source: string) {
      if (source === "virtual:wasm_exec") return WASM_EXEC_VIRTUAL_ID;
      if (source === "virtual:wasm_bridge") return WASM_BRIDGE_VIRTUAL_ID;
      return null;
    },

    async load(id: string) {
      // Load wasm_exec.js as a virtual module with no treeshaking
      if (id === WASM_EXEC_VIRTUAL_ID) {
        const code = await readFile(resolvedWasmExecPath!, "utf-8");
        return { code, moduleSideEffects: "no-treeshake" as const };
      }

      // Load the bridge module
      if (id === WASM_BRIDGE_VIRTUAL_ID) {
        return { code: BRIDGE_CODE, moduleSideEffects: "no-treeshake" as const };
      }

      return null;
    },

    async transform(this: TransformPluginContext, code: string, id: string) {
      // Only process .go files
      if (extname(id) !== ".go") return null;

      const outputPath = join(tempDir!, basename(id, ".go") + ".wasm");

      // Build the Go file to WASM
      await new Promise<void>((resolve, reject) => {
        // Build a minimal env — do NOT spread process.env, which would
        // let attacker-controlled PATH/GOPATH/etc. redirect the build.
        const env: Record<string, string> = {
          ...buildEnv,
          GOCACHE: join(tempDir!, ".gocache"),
        };
        // Inherit only essential vars that the toolchain needs.
        const ESSENTIAL_ENV = ["HOME", "USER", "LANG", "LC_ALL", "TMPDIR"] as const;
        for (const key of ESSENTIAL_ENV) {
          if (process.env[key] !== undefined) {
            env[key] = process.env[key]!;
          }
        }
        execFile(
          resolvedGoBinary!,
          ["build", ...extraArgs, "-o", outputPath, id],
          {
            cwd: buildCwd,
            env,
          },
          (err, stdout, stderr) => {
            if (stdout) console.log(stdout);
            if (stderr) console.error(stderr);
            if (err) reject(err);
            else resolve();
          }
        );
      });

      // Emit the WASM as a Rollup asset and get the URL reference
      const source = await readFile(outputPath);
      const refId = this.emitFile({
        type: "asset",
        name: basename(id, ".go") + ".wasm",
        source,
      });

      // Generate loader code that fetches the asset URL and instantiates
      return {
        code: `
import 'virtual:wasm_exec';
import loadGoWasm from 'virtual:wasm_bridge';

const wasmUrl = import.meta.ROLLUP_FILE_URL_${refId};
const wasmBytes = fetch(wasmUrl).then(r => r.arrayBuffer());
export default await loadGoWasm(wasmBytes);
`,
        moduleSideEffects: "no-treeshake" as const,
      };
    },
  };
}
