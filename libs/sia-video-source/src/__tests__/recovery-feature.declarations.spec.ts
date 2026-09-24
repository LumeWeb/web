/**
 * Declaration / import-resolution guard for the ROOT recovery feature.
 *
 * A non-React Video.js v10 consumer must be able to import `siaRecoveryFeature`,
 * `selectSiaRecovery` and `SiaRecoveryState` from the package root with only
 * the non-React video.js packages installed (`@videojs/core/dom`,
 * `@videojs/store`, `@videojs/media`) — never `@videojs/react`. The React
 * hook (`/react`) may require `@videojs/react`, but the root entry may not.
 *
 * This is enforced against the BUILT declarations (run `pnpm build` first):
 * the emitted root d.ts must never mention `@videojs/react`, and a real
 * TypeScript program compiles a non-React consumer against the built root
 * entry with `@videojs/react` deliberately made unresolvable — a leaked react
 * reference in the declarations fails the compile with TS2307.
 *
 * Node-only: see `./fixtures/declaration-check` for the shared lazy helpers.
 */
import { describe, expect, it } from 'vitest';
import {
  builtFile,
  compileConsumer,
  IS_BROWSER,
  messageTexts,
} from './fixtures/declaration-check';

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
        const { exists, path, text } = builtFile(file);
        expect(exists, `missing ${path}; run \`pnpm build\` first`).toBe(true);
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
      const { exists, path, text } = builtFile('sia-recovery-feature.d.ts');
      expect(exists, `missing ${path}; run \`pnpm build\` first`).toBe(true);
      expect(text).toMatch(/import\("@videojs\/(?:core\/dom|store)"\)/);
    },
  );

  it.skipIf(IS_BROWSER)(
    'a non-React consumer type-checks with @videojs/react deliberately unresolvable',
    () => {
      const { exists, path } = builtFile('index.js');
      expect(exists, `missing ${path}; run \`pnpm build\` first`).toBe(true);

      // A representative non-React v10 consumer: assemble a plain store with
      // the feature and read the selector — no React component in sight.
      const consumer = `
import { combine, createStore } from '@videojs/store';
import type { PlayerTarget } from '@videojs/core/dom';
import {
  siaRecoveryFeature,
  selectSiaRecovery,
  type SiaRecoveryState,
} from ${JSON.stringify(path)};

const store = createStore<PlayerTarget>()(combine(siaRecoveryFeature));
const state: SiaRecoveryState | undefined = selectSiaRecovery(store.state);
const active: boolean = state?.active ?? false;
void active;
`;

      const diagnostics = compileConsumer(consumer, { blockReact: true });
      const reactLeaks = messageTexts(diagnostics).filter((message) =>
        message.includes('@videojs/react'),
      );

      expect(
        reactLeaks,
        'root declarations must not force a non-React consumer to resolve @videojs/react; ' +
          're-run `pnpm build` after source changes and check dist/esm/sia-recovery-feature.d.ts',
      ).toEqual([]);
    },
  );
});
