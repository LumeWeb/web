/**
 * Shared lazy node-mode helpers for the declaration / import-resolution
 * guards in the sibling `*.declarations.spec.ts` files.
 *
 * A non-React Video.js v10 consumer must be able to import from the package
 * root with only the non-React video.js packages installed
 * (`@videojs/core/dom`, `@videojs/store`, `@videojs/media`) — never
 * `@videojs/react`. The React hooks (`/react`) may require `@videojs/react`,
 * but the root entry may not.
 *
 * The guards run against the BUILT declarations (run `pnpm build` first —
 * turbo orders `build` before consumers of `dist/**`):
 *
 * - `builtFile(relativePath)` reads one `dist/esm` file for text-level checks
 *   (e.g. the emitted root d.ts must never mention `@videojs/react`).
 * - `compileConsumer(source, { blockReact })` compiles a real TypeScript
 *   consumer program against the built root entry; when `blockReact` is set,
 *   `@videojs/react` is deliberately made unresolvable (simulating a non-React
 *   install), so a leaked react reference fails the compile with TS2307
 *   ("Cannot find module '@videojs/react'").
 * - `messageTexts(diagnostics)` flattens diagnostics into plain message
 *   strings for the assertions.
 *
 * Node-only: everything that touches `process`/`fs`/the compiler happens
 * lazily inside the functions/options below, so importing this module is safe
 * in browser-mode test discovery (which has no node globals). The specs skip
 * their tests there via `it.skipIf(IS_BROWSER)`.
 */
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import ts from 'typescript';

/** True during browser-mode test discovery, where node globals are absent. */
export const IS_BROWSER = typeof document !== 'undefined';

/** A file read from the built `dist/esm` output. */
export interface BuiltFile {
  /** Whether the file exists on disk (run `pnpm build` if not). */
  readonly exists: boolean;
  /** Absolute path under `dist/esm`. */
  readonly path: string;
  /** File text when it exists; empty string otherwise. */
  readonly text: string;
}

/** Options for {@link compileConsumer}. */
export interface CompileConsumerOptions {
  /**
   * Simulate a non-React install by making `@videojs/react` unresolvable; a
   * leaked react reference in the declarations then fails the compile with
   * TS2307 ("Cannot find module '@videojs/react'").
   */
  blockReact?: boolean;
}

/**
 * Compiler options shared by every consumer program: NodeNext resolution so
 * the consumer resolves the package's own node_modules symlinks (pnpm) for
 * `@videojs/store`, `@videojs/core/dom`, `@videojs/react`, etc.
 */
const COMPILER_OPTIONS: ts.CompilerOptions = {
  ignoreDeprecations: '6.0',
  lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  noEmit: true,
  skipDefaultLibCheck: true,
  skipLibCheck: false,
  strict: true,
  target: ts.ScriptTarget.ES2022,
  types: ['node'],
};

/** Reads one file relative to `dist/esm` from the built package output. */
export function builtFile(relativePath: string): BuiltFile {
  const path = join(esmDir(), relativePath);
  const exists = existsSync(path);
  return {
    exists,
    path,
    text: exists ? readFileSync(path, 'utf8') : '',
  };
}

/**
 * Compiles one consumer program against the built root entry and returns its
 * pre-emit diagnostics. The consumer lives under the package dir (not
 * $TMPDIR) so NodeNext module resolution finds the package's own node_modules
 * symlinks; a scratch dir under the git-ignored dist keeps the worktree clean
 * and is always removed.
 */
export function compileConsumer(
  source: string,
  options: CompileConsumerOptions = {},
): readonly ts.Diagnostic[] {
  const scratch = mkdtempSync(join(esmDir(), '.declaration-check-'));
  const consumerFile = join(scratch, 'consumer.ts');
  writeFileSync(consumerFile, source);
  try {
    const host = ts.createCompilerHost(COMPILER_OPTIONS, true);
    if (options.blockReact) {
      const originalResolve = host.resolveModuleNames?.bind(host);
      host.resolveModuleNames = (names, containing, reused, redirected, opts, sourceFile) => {
        const resolved = originalResolve
          ? originalResolve(names, containing, reused, redirected, opts, sourceFile)
          : names.map((name) =>
              ts.resolveModuleName(name, containing, opts, host, undefined, redirected).resolvedModule,
            );
        // Simulate a non-React install: @videojs/react cannot be resolved.
        return resolved.map((result, index) =>
          names[index] === '@videojs/react' ? undefined : result,
        );
      };
    }
    const program = ts.createProgram([consumerFile], COMPILER_OPTIONS, host);
    return ts.getPreEmitDiagnostics(program);
  } finally {
    rmSync(scratch, { force: true, recursive: true });
  }
}

/**
 * Flattens each diagnostic's possibly-nested message text into plain strings.
 */
export function messageTexts(diagnostics: readonly ts.Diagnostic[]): string[] {
  return diagnostics.map((diagnostic) =>
    ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
  );
}

/**
 * Package build output — resolved lazily: reading it touches `process`/`fs`,
 * which only run in node mode.
 */
function esmDir(): string {
  return join(resolve(process.cwd()), 'dist/esm');
}
