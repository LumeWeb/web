/**
 * ErrorReporter contract: the injected fatal-failure path StreamController /
 * SessionCoordinator use to surface a structured {@link PlaybackFailure} as
 * the host's protocol ERROR.
 *
 * The error model: every failure identifies the condition that rejected it
 * (`transport`, `container`, `codec`, `layout`, `normalization`, `mse`) plus
 * a condition-specific code, and:
 *
 * - stale/cancelled failures (`condition: 'cancelled'`) are dropped, never
 *   surfaced — a superseded seek or teardown must not produce a host error;
 * - unsupported-container and unsupported-codec stay distinct (both map to the
 *   host's `MEDIA_ERR_SRC_NOT_SUPPORTED`, but the *context* names the condition);
 * - sequential fallback is a mode, not an error (nothing here emits it);
 * - no raw secret-bearing SDK object or URL is included in a message.
 *
 * `workerErrorForFailure` maps a domain failure onto the existing
 * `WorkerErrorCode` wire kinds (`network`/`unsupported`/`decode`) so the
 * coordinator's `post({ type: 'ERROR', … })` call site stays a one-liner, and
 * `createErrorReporter` is the adapter that enforces the drop rule before a
 * failure ever reaches the host.
 */

import { workerErrorCode, type WorkerErrorCode } from '../protocol.ts';

/** The condition that rejected a load; the `PlaybackFailure` discriminant vocabulary. */
export const failureCondition = {
  cancelled: 'cancelled',
  codec: 'codec',
  container: 'container',
  layout: 'layout',
  mse: 'mse',
  normalization: 'normalization',
  transport: 'transport',
} as const;

/** The condition that rejected a load; see {@link failureCondition}. */
export type FailureCondition = (typeof failureCondition)[keyof typeof failureCondition];

/** A condition-specific failure code from the {@link PlaybackFailure} domain. */
export const failureCode = {
  append: 'append',
  decode: 'decode',
  destroyed: 'destroyed',
  eos: 'eos',
  failed: 'failed',
  'limits-exceeded': 'limits-exceeded',
  malformed: 'malformed',
  'missing-index': 'missing-index',
  'no-rap': 'no-rap',
  quota: 'quota',
  superseded: 'superseded',
  timeout: 'timeout',
  unauthorized: 'unauthorized',
  unknown: 'unknown',
  unreachable: 'unreachable',
  'unsafe-random-access': 'unsafe-random-access',
  unsupported: 'unsupported',
  'unsupported-route': 'unsupported-route',
} as const;

/** The seam SurfaceController / SessionCoordinator report fatal failures through. */
export interface ErrorReporter {
  /**
   * Reports a fatal failure. Adapters MUST drop `condition: 'cancelled'` failures
   * (stale epochs must never surface as host errors).
   */
  report(failure: PlaybackFailure): void;
}

/** A condition-specific failure code; see {@link failureCode}. */
export type FailureCode = (typeof failureCode)[keyof typeof failureCode];

/** The condition-specific failure model the host's error mapping understands. */
export type PlaybackFailure =
  | { readonly cause?: unknown; readonly code: typeof failureCode.append | typeof failureCode.decode | typeof failureCode.eos | typeof failureCode.quota; readonly condition: typeof failureCondition.mse }
  | { readonly cause?: unknown; readonly code: typeof failureCode.failed | typeof failureCode['unsupported-route']; readonly condition: typeof failureCondition.normalization; readonly detail?: string }
  | { readonly cause?: unknown; readonly code: typeof failureCode.timeout | typeof failureCode.unauthorized | typeof failureCode.unreachable; readonly condition: typeof failureCondition.transport }
  | { readonly code: typeof failureCode.destroyed | typeof failureCode.superseded; readonly condition: typeof failureCondition.cancelled }
  | { readonly code: typeof failureCode.malformed | typeof failureCode.unknown | typeof failureCode['limits-exceeded']; readonly condition: typeof failureCondition.container; readonly detail?: string }
  | { readonly code: typeof failureCode.unsupported; readonly codec: string; readonly condition: typeof failureCondition.codec; readonly mime?: string }
  | { readonly code: typeof failureCode['missing-index'] | typeof failureCode['no-rap'] | typeof failureCode['unsafe-random-access']; readonly condition: typeof failureCondition.layout; readonly detail?: string };

/**
 * The coordinator-ready wire form: the existing `WorkerErrorCode` kind plus a
 * diagnostic context string. `null` means "drop silently" (cancelled).
 */
export interface WorkerErrorReport {
  readonly context?: string;
  readonly kind: WorkerErrorCode;
}

/**
 * Builds an {@link ErrorReporter} that maps failures through
 * {@link workerErrorForFailure} and forwards only the non-cancelled ones to
 * `emit`. The coordinator supplies `emit` as its `post({ type: 'ERROR', … })`.
 */
export function createErrorReporter(emit: (report: WorkerErrorReport) => void): ErrorReporter {
  return {
    report(failure: PlaybackFailure): void {
      const report = workerErrorForFailure(failure);
      if (report) emit(report);
    },
  };
}

/**
 * Maps a domain {@link PlaybackFailure} onto the wire kinds the host's
 * `MediaError` mapping already understands. Returns `null` for cancelled
 * failures so they are dropped rather than surfaced.
 */
export function workerErrorForFailure(failure: PlaybackFailure): null | WorkerErrorReport {
  const kind = errorKindForFailure(failure);
  if (kind === null) return null;
  return { context: describeFailure(failure), kind };
}

function describeFailure(failure: PlaybackFailure): string {
  switch (failure.condition) {
    case failureCondition.cancelled:
      return `cancelled:${failure.code}`;
    case failureCondition.codec:
      return `codec:${failure.code}:${failure.codec}`;
    case failureCondition.container:
    case failureCondition.layout:
    case failureCondition.normalization: {
      const base = `${failure.condition}:${failure.code}`;
      return failure.detail ? `${base} (${failure.detail})` : base;
    }
    case failureCondition.mse:
    case failureCondition.transport:
      return `${failure.condition}:${failure.code}`;
  }
}

function errorKindForFailure(failure: PlaybackFailure): null | WorkerErrorCode {
  switch (failure.condition) {
    case failureCondition.cancelled:
      return null;
    case failureCondition.codec:
    case failureCondition.container:
    case failureCondition.layout:
      return workerErrorCode.unsupported;
    case failureCondition.mse:
    case failureCondition.normalization:
      return workerErrorCode.decode;
    case failureCondition.transport:
      return workerErrorCode.network;
  }
}
