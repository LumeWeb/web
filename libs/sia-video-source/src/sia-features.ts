/**
 * The shared Video.js v10 feature triple for the Sia media engine.
 *
 * `siaFeatures` mirrors how the packaged video.js stack ships `videoFeatures`:
 * a single explicitly typed MUTABLE tuple of the three Sia player features —
 * recovery, then load acceptance, then source information — that works with
 * BOTH consumption APIs without a separate vanilla/React split or a custom
 * player factory:
 *
 * - non-React: `combine(...siaFeatures)` assembles a store; the same tuple
 *   feeds `createStore()` exactly like any other `PlayerFeature` array;
 * - React: `createPlayer({ features: siaFeatures })` (or a composition such as
 *   `[...videoFeatures, ...siaFeatures]`) wires the same three slices into the
 *   player store that the `/react` hooks (`useSiaRecovery`/`useSiaLoad`/
 *   `useSiaSourceInfo`) and the shared selectors read.
 *
 * The tuple MUST stay a mutable, explicitly annotated tuple (NOT `as const`):
 * React `createPlayer`'s `Features extends AnyPlayerFeature[]` constraint
 * rejects a `readonly` as-const literal (TS2769), while `combine(...)` accepts
 * either. The individual `siaRecoveryFeature`/`siaLoadFeature`/
 * `siaSourceInfoFeature` exports remain available unchanged for
 * override/custom composition.
 */
import type { PlayerFeature } from '@videojs/core/dom';
import type { SiaLoadState } from './sia-load-feature.ts';
import { siaLoadFeature } from './sia-load-feature.ts';
import type { SiaRecoveryState } from './sia-recovery-feature.ts';
import { siaRecoveryFeature } from './sia-recovery-feature.ts';
import type { SiaSourceInfoState } from './sia-source-info-feature.ts';
import { siaSourceInfoFeature } from './sia-source-info-feature.ts';

/**
 * The ordered Sia player-feature triple. `PlayerFeature<SiaRecoveryState>`
 * first, `PlayerFeature<SiaLoadState>` second, then
 * `PlayerFeature<SiaSourceInfoState>` — exactly the recovery-then-load-then-
 * source-info order React consumers and the selectors rely on.
 */
export type SiaFeatures = [
  PlayerFeature<SiaRecoveryState>,
  PlayerFeature<SiaLoadState>,
  PlayerFeature<SiaSourceInfoState>,
];

/** The shared mutable tuple: recovery, then load, then source info. See the module doc first. */
export const siaFeatures: SiaFeatures = [
  siaRecoveryFeature,
  siaLoadFeature,
  siaSourceInfoFeature,
];
