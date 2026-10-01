/**
 * ErrorReporter: the injected fatal-failure path StreamController /
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
 * - normalization (a pipeline/seek-servicing failure) is NOT `decode`: it maps
 *   to `unsupported` so the host's decode-recovery reload is never triggered by
 *   a failed trim — only genuine `mse` decode/append failures retry;
 * - transport (a ranged-read failure that exhausted its retry budget) maps to
 *   `network`, so the HOST can run its own reload recovery for a genuinely
 *   broken/unreachable transport;
 * - seek-target (a requested seek position whose data cannot be served) is a
 *   NONFATAL data-unavailable outcome: it maps to the reserved `unavailable`
 *   wire kind, never `network`/`decode`/`unsupported`, so host handling of
 *   it never triggers a transport-recovery reload. StreamController reports
 *   it when a seek-restart run hits a raw shard-shortage failure. When the
 *   failure names the failed seek target time (`time`), the report carries
 *   it onto the ERROR wire message; this layer only forwards a value the
 *   producer supplied, never fabricates one.
 * - sequential fallback is a mode, not an error (nothing here emits it);
 * - no raw secret-bearing SDK object or URL is included in a message.
 *
 * `workerErrorForFailure` maps a domain failure onto the
 * `WorkerErrorCode` wire kinds (`network`/`unsupported`/`decode`/`unavailable`)
 * so the coordinator's `post({ type: WorkerToMainMessageType.ERROR, … })` call site stays a one-liner, and
 * `createErrorReporter` is the adapter that enforces the drop rule before a
 * failure ever reaches the host.
 */

import { workerErrorCode, type WorkerErrorCode } from '../protocol.ts';

/**
 * The condition that rejected a load (or, for `seekTarget`, the condition
 * that made a requested seek unserviceable); the `PlaybackFailure`
 * discriminant vocabulary.
 */
export const failureCondition = {
  cancelled: 'cancelled',
  codec: 'codec',
  container: 'container',
  layout: 'layout',
  mse: 'mse',
  normalization: 'normalization',
  seekTarget: 'seek-target',
  transport: 'transport',
} as const;

/** The condition that rejected a load; see {@link failureCondition}. */
export type FailureCondition = (typeof failureCondition)[keyof typeof failureCondition];

/** A condition-specific failure code from the {@link PlaybackFailure} domain. */
export const failureCode = {
  append: 'append',
  dataUnavailable: 'data-unavailable',
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

/** The fatal-failure channel StreamController / SessionCoordinator report through. */
export interface ErrorReporter {
  /**
   * Reports a fatal failure. Adapters MUST drop `condition: 'cancelled'` failures
   * (stale load generations must never surface as host errors).
   */
  report(failure: PlaybackFailure): void;
}

/** A condition-specific failure code; see {@link failureCode}. */
export type FailureCode = (typeof failureCode)[keyof typeof failureCode];

/**
 * The condition-specific failure model the host's error mapping understands.
 *
 * The `seekTarget` variant is reserved on the wire: the host treats it as a
 * nonfatal data-unavailable outcome (no auto-reload). StreamController is
 * its only runtime producer, reporting it when a seek-restart run fails
 * with a raw shard-shortage error.
 */
export type PlaybackFailure =
  | { readonly cause?: unknown; readonly code: typeof failureCode.append | typeof failureCode.decode | typeof failureCode.eos | typeof failureCode.quota; readonly condition: typeof failureCondition.mse }
  | {
      readonly cause?: unknown;
      readonly code: typeof failureCode.dataUnavailable;
      readonly condition: typeof failureCondition.seekTarget;
      readonly detail?: string;
      /**
       * Optional failed seek-target time in seconds: the requested seek
       * position whose data cannot be served. Supplied by the producer when
       * it can name one; this layer forwards it (only for this variant) and
       * never invents it.
       */
      readonly time?: number;
    }
  | { readonly cause?: unknown; readonly code: typeof failureCode.failed; readonly condition: typeof failureCondition.transport; readonly detail?: string }
  | { readonly cause?: unknown; readonly code: typeof failureCode.failed | typeof failureCode['unsupported-route']; readonly condition: typeof failureCondition.normalization; readonly detail?: string }
  | { readonly cause?: unknown; readonly code: typeof failureCode.timeout | typeof failureCode.unauthorized | typeof failureCode.unreachable; readonly condition: typeof failureCondition.transport; readonly detail?: string }
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
  /**
   * Optional failed seek-target time in seconds: present only when the
   * failure is a seek-target data-unavailable outcome that names its target
   * (`PlaybackFailure` `time`). Absent for every other kind; this layer
   * forwards a producer-supplied value and never fabricates one.
   */
  readonly time?: number;
}

/**
 * Builds an {@link ErrorReporter} that maps failures through
 * {@link workerErrorForFailure} and forwards only the non-cancelled ones to
 * `emit`. The coordinator supplies `emit` as its `post({ type: WorkerToMainMessageType.ERROR, … })`.
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
  // The optional failed seek-target time rides the wire only for the
  // seek-target data-unavailable variant, and only when the producer named
  // one; every other report carries no `time`.
  return {
    context: describeFailure(failure),
    kind,
    ...(failure.condition === failureCondition.seekTarget && failure.time !== undefined ? { time: failure.time } : {}),
  };
}

function describeFailure(failure: PlaybackFailure): string {
  switch (failure.condition) {
    case failureCondition.cancelled:
      return `cancelled:${failure.code}`;
    case failureCondition.codec:
      return `codec:${failure.code}:${failure.codec}`;
    case failureCondition.container:
    case failureCondition.layout:
    case failureCondition.normalization:
    case failureCondition.seekTarget:
    case failureCondition.transport: {
      // A transport failure (including the StreamController's
      // `transport:failed` with the SDK/short-read cause as `detail`) carries
      // its real message, e.g. `transport:failed (Sia SDK ranged read failed
      // after 3 attempts (expected 65536 bytes at 0))`.
      const base = `${failure.condition}:${failure.code}`;
      return failure.detail ? `${base} (${failure.detail})` : base;
    }
    case failureCondition.mse:
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
      return workerErrorCode.decode;
    case failureCondition.normalization:
      // A normalization failure (a trim/seek restart that cannot be serviced,
      // or a load whose conversion broke) is a pipeline/seek-servicing
      // failure, not a media decode failure. Mapping it to 'decode' makes the
      // host run its retry-capped full-reload recovery — tearing the pipeline
      // down
      // mid-seek when the only real problem is the requested position. Surface
      // it as 'unsupported' (fatal, no auto-reload) instead so genuine
      // decode/append failures (`mse`) keep the decode-recovery path to
      // themselves.
      return workerErrorCode.unsupported;
    case failureCondition.seekTarget:
      // A seek target whose data cannot be served is a NONFATAL
      // data-unavailable outcome, not a broken transport; it maps to the
      // reserved `unavailable` wire kind so host handling runs neither the
      // `network` reload recovery nor the fatal `decode`/`unsupported` paths.
      return workerErrorCode.unavailable;
    case failureCondition.transport:
      return workerErrorCode.network;
  }
}
