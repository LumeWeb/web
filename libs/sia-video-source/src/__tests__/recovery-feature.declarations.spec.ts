/**
 * Declaration / import-resolution guard for the ROOT recovery feature.
 *
 * A non-React Video.js v10 consumer must be able to import `siaRecoveryFeature`,
 * `selectSiaRecovery` and `SiaRecoveryState` from the package root with only
 * the non-React video.js packages installed (`@videojs/core/dom`,
 * `@videojs/store`, `@videojs/media`) — never `@videojs/react`. The React
 * hook (`/react`) may require `@videojs/react`, but the root entry may not.
 *
 * This is enforced against the BUILT declarations (run `pnpm build` first —
 * turbo orders `build` before consumers of `dist/**`):
 *
 * 1. The emitted root d.ts text must never mention `@videojs/react`, and the
 *    feature const's type must be attributed to a public non-React module
 *    (`@videojs/core/dom` / `@videojs/store`).
 * 2. A real TypeScript program compiles a non-React consumer against the built
 *    root entry with `@videojs/react` deliberately made unresolvable; a leaked
 *    react reference in the declarations fails the compile with TS2307
 *    ("Cannot find module '@videojs/react'").
 *
 * Node-only: it reads the build output (the browser test mode has no `fs`).
 */
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import ts from 'typescript';

const IS_BROWSER = typeof document !== 'undefined';

/**
 * Package build output — resolved lazily: reading it touches `process`/`fs`,
 * which only run in node mode. This spec's tests are skipped in the browser
 * test mode (which has no node globals), but the module must still load there.
 */
function esmDir(): string {
  return join(resolve(process.cwd()), 'dist/esm');
}

/**
 * The root declaration files a non-React consumer pulls in when it imports
 * from the package root. `index.js` re-exports `./sia-recovery-feature.js`,
 * so both files must stay react-free.
 */
const ROOT_DTS_FILES = ['index.d.ts', 'sia-recovery-feature.d.ts'];

describe('root recovery declarations stay consumable without @videojs/react', () => {
  it.skipIf(IS_BROWSER)(
    'emitted root d.ts never references @videojs/react',
    () => {
      for (const file of ROOT_DTS_FILES) {
        const path = join(esmDir(), file);
        expect(existsSync(path), `missing ${path}; run \`pnpm build\` first`).toBe(true);
        const text = readFileSync(path, 'utf8');
        expect(
          text,
          `${file} must not reference the React entry of the video.js stack (non-React consumers would need @videojs/react installed)`,
        ).not.toMatch(/@videojs\/react/);
      }
    },
  );

  it.skipIf(IS_BROWSER)(
    'the feature const type comes from @videojs/core/dom or @videojs/store, not @videojs/react',
    () => {
      const path = join(esmDir(), 'sia-recovery-feature.d.ts');
      expect(existsSync(path), `missing ${path}; run \`pnpm build\` first`).toBe(true);
      const text = readFileSync(path, 'utf8');
      expect(text).toMatch(/import\("@videojs\/(?:core\/dom|store)"\)/);
    },
  );

  it.skipIf(IS_BROWSER)(
    'a non-React consumer type-checks with @videojs/react deliberately unresolvable',
    () => {
      const entry = join(esmDir(), 'index.js');
      expect(existsSync(entry), `missing ${entry}; run \`pnpm build\` first`).toBe(true);

      // A representative non-React v10 consumer: assemble a plain store with
      // the feature and read the selector — no React component in sight.
      const consumer = `
import { combine, createStore } from '@videojs/store';
import type { PlayerTarget } from '@videojs/core/dom';
import {
  siaRecoveryFeature,
  selectSiaRecovery,
  type SiaRecoveryState,
} from ${JSON.stringify(entry)};

const store = createStore<PlayerTarget>()(combine(siaRecoveryFeature));
const state: SiaRecoveryState | undefined = selectSiaRecovery(store.state);
const active: boolean = state?.active ?? false;
void active;
`;

      const options: ts.CompilerOptions = {
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

      // The consumer lives under the package dir (not $TMPDIR) so NodeNext
      // module resolution finds the package's own node_modules symlinks for
      // @videojs/store, @videojs/core/dom, etc. Use a scratch dir under the
      // git-ignored dist so nothing shows up in the worktree.
      const scratch = mkdtempSync(join(esmDir(), '.declaration-check-'));
      const consumerFile = join(scratch, 'consumer.ts');
      writeFileSync(consumerFile, consumer);

      try {
        const host = ts.createCompilerHost(options, true);
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

        const program = ts.createProgram([consumerFile], options, host);
        const diagnostics = ts.getPreEmitDiagnostics(program);
        const reactLeaks = diagnostics
          .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
          .filter((message) => message.includes('@videojs/react'));

        expect(
          reactLeaks,
          'root declarations must not force a non-React consumer to resolve @videojs/react; ' +
            're-run `pnpm build` after source changes and check dist/esm/sia-recovery-feature.d.ts',
        ).toEqual([]);
      } finally {
        rmSync(scratch, { force: true, recursive: true });
      }
    },
  );
});
