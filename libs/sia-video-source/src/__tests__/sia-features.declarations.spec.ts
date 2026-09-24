/**
 * Declaration / import-resolution guard for the ROOT `siaFeatures` tuple.
 *
 * A non-React Video.js v10 consumer must be able to import `siaFeatures` and
 * `SiaFeatures` from the package root with only the non-React video.js
 * packages installed (`@videojs/core/dom`, `@videojs/store`, `@videojs/media`)
 * — never `@videojs/react`. The React hooks (`/react`) may require
 * `@videojs/react`, but the root entry — including `sia-features.d.ts` — may
 * not.
 *
 * This is enforced against the BUILT declarations (run `pnpm build` first):
 *
 * 1. The emitted root d.ts text must never mention `@videojs/react`.
 * 2. `SiaFeatures` must be an explicitly typed MUTABLE tuple of the exact
 *    ordered feature triple — not a readonly `as const` literal — so non-React
 *    `combine(...siaFeatures)` AND React `createPlayer({ features: siaFeatures })`
 *    both accept it. Real TypeScript programs prove this three ways: a
 *    non-React consumer compiles with `@videojs/react` deliberately
 *    unresolvable, a React consumer type-compiles `createPlayer` with the
 *    tuple and the `[...videoFeatures, ...siaFeatures]` composition, and a
 *    readonly `as const` tuple is asserted to FAIL the mutable constraint
 *    (TS2769) — which is why the exported const must stay a mutable tuple.
 *
 * Node-only: `./fixtures/declaration-check` provides the shared lazy helpers.
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
 * `siaFeatures` from the package root. `index.js` re-exports
 * `./sia-features.js`, so both files must stay react-free.
 */
const ROOT_DTS_FILES = ['index.d.ts', 'sia-features.d.ts'];

describe('root siaFeatures declarations stay consumable without @videojs/react', () => {
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
    'the SiaFeatures pair type comes from @videojs/core/dom or @videojs/store, not @videojs/react',
    () => {
      const { exists, path, text } = builtFile('sia-features.d.ts');
      expect(exists, `missing ${path}; run \`pnpm build\` first`).toBe(true);
      // The tuple's `PlayerFeature` type is attributed to a public non-React
      // module — emitted either as a named import (`import { PlayerFeature }
      // from "@videojs/core/dom"`) or as an inline `import("@videojs/store")`.
      expect(text).toMatch(/@videojs\/(?:core\/dom|store)/);
    },
  );

  it.skipIf(IS_BROWSER)(
    'a non-React consumer combines the tuple with @videojs/react deliberately unresolvable',
    () => {
      const { exists, path } = builtFile('index.js');
      expect(exists, `missing ${path}; run \`pnpm build\` first`).toBe(true);

      // A representative non-React v10 consumer: assemble a plain store with
      // the tuple and read state — no React component in sight.
      const consumer = `
import { combine, createStore } from '@videojs/store';
import type { PlayerTarget } from '@videojs/core/dom';
import { siaFeatures, type SiaFeatures } from ${JSON.stringify(path)};

const pair: SiaFeatures = siaFeatures;
const store = createStore<PlayerTarget>()(combine(...pair));
void store;
`;

      const diagnostics = compileConsumer(consumer, { blockReact: true });
      const reactLeaks = messageTexts(diagnostics).filter((message) =>
        message.includes('@videojs/react'),
      );

      expect(
        reactLeaks,
        'root declarations must not force a non-React consumer to resolve @videojs/react; ' +
          're-run `pnpm build` after source changes and check dist/esm/sia-features.d.ts',
      ).toEqual([]);
      expect(
        diagnostics,
        'the non-React consumer must type-check against the built root entry',
      ).toEqual([]);
    },
  );

  it.skipIf(IS_BROWSER)(
    'a React consumer type-compiles createPlayer({ features: siaFeatures }) and [...videoFeatures, ...siaFeatures]',
    () => {
      const { exists, path } = builtFile('index.js');
      expect(exists, `missing ${path}; run \`pnpm build\` first`).toBe(true);

      const consumer = `
import { createPlayer } from '@videojs/react';
import { videoFeatures } from '@videojs/core/dom';
import { siaFeatures } from ${JSON.stringify(path)};

const directPlayer = createPlayer({ features: siaFeatures });
const composedPlayer = createPlayer({ features: [...videoFeatures, ...siaFeatures] });
void directPlayer;
void composedPlayer;
`;

      const diagnostics = compileConsumer(consumer);
      expect(
        diagnostics,
        'createPlayer must accept the mutable siaFeatures tuple and the [...videoFeatures, ...siaFeatures] ' +
          'composition; re-run `pnpm build` after source changes and check dist/esm/sia-features.d.ts',
      ).toEqual([]);
    },
  );

  it.skipIf(IS_BROWSER)(
    'a readonly as-const tuple fails createPlayer (TS2769), proving the mutable annotation is required',
    () => {
      const { exists, path } = builtFile('index.js');
      expect(exists, `missing ${path}; run \`pnpm build\` first`).toBe(true);

      const consumer = `
import { createPlayer } from '@videojs/react';
import { siaRecoveryFeature, siaLoadFeature, siaSourceInfoFeature } from ${JSON.stringify(path)};

const frozen = [siaRecoveryFeature, siaLoadFeature, siaSourceInfoFeature] as const;
void createPlayer({ features: frozen });
`;

      const diagnostics = compileConsumer(consumer);
      expect(
        diagnostics.some((diagnostic) => diagnostic.code === 2769),
        'a readonly as-const tuple must fail the mutable Features constraint (TS2769), so the exported ' +
          'siaFeatures const has to stay an explicitly typed MUTABLE tuple',
      ).toBe(true);
    },
  );
});
