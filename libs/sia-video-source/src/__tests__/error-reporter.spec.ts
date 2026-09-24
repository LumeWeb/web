/**
 * The `ErrorReporter` path: the injected fatal-failure channel
 * StreamController / SessionCoordinator use to surface a structured
 * `PlaybackFailure` as the host's protocol ERROR.
 *
 * The rules that matter here:
 *
 * - every failure identifies the failed condition (`transport`, `container`,
 *   `codec`, `layout`, `normalization`, `mse`);
 * - cancelled failures (`condition: 'cancelled'`) are dropped, never surfaced;
 * - unsupported-container and unsupported-codec stay distinct (both surface
 *   through the host's `MEDIA_ERR_SRC_NOT_SUPPORTED`, but the *context* must
 *   say which condition failed);
 * - no secret-bearing SDK object or URL is included in an error message.
 *
 * `workerErrorForFailure` maps the domain failure onto the existing
 * `WorkerErrorCode` wire kinds (`network`/`unsupported`/`decode`) so the
 * coordinator's `post({ type: WorkerToMainMessageType.ERROR, … })` call site stays a one-liner, and
 * `createErrorReporter` is the adapter that enforces the drop rule before a
 * failure ever reaches the host.
 */

import { describe, expect, it } from 'vitest';
import { workerErrorCode } from '../protocol.ts';
import {
  createErrorReporter,
  type ErrorReporter,
  failureCode,
  failureCondition,
  type PlaybackFailure,
  workerErrorForFailure,
  type WorkerErrorReport,
} from '../session/error-reporter.ts';

describe('ErrorReporter', () => {
  it('maps transport failures to the network wire kind', () => {
    expect(workerErrorForFailure({ code: failureCode.timeout, condition: failureCondition.transport })).toMatchObject({ kind: workerErrorCode.network });
    expect(workerErrorForFailure({ code: failureCode.unreachable, condition: failureCondition.transport })).toMatchObject({ kind: workerErrorCode.network });
    expect(workerErrorForFailure({ code: failureCode.unauthorized, condition: failureCondition.transport })).toMatchObject({ kind: workerErrorCode.network });
  });

  it('maps a StreamController transport:failed to the network kind and names the cause on the wire', () => {
    // The controller reports an exhausted ranged-read failure with condition
    // `transport`, code `failed`, and the underlying cause as `detail`: it
    // surfaces as the `network` wire kind (which triggers the host's reload
    // recovery) with a context that names the cause.
    const report = workerErrorForFailure({
      cause: new Error('Sia SDK read ended before the requested range was delivered'),
      code: failureCode.failed,
      condition: failureCondition.transport,
      detail: 'Sia SDK ranged read failed after 3 attempts',
    });
    expect(report?.kind).toBe(workerErrorCode.network);
    expect(report?.context).toBe('transport:failed (Sia SDK ranged read failed after 3 attempts)');
  });

  it('maps container, codec, and layout failures to unsupported', () => {
    expect(workerErrorForFailure({ code: failureCode.unknown, condition: failureCondition.container })).toMatchObject({ kind: workerErrorCode.unsupported });
    expect(workerErrorForFailure({ code: failureCode.unsupported, codec: 'hvc1.1.6.L120.90', condition: failureCondition.codec })).toMatchObject({
      kind: workerErrorCode.unsupported,
    });
    expect(workerErrorForFailure({ code: failureCode['no-rap'], condition: failureCondition.layout })).toMatchObject({ kind: workerErrorCode.unsupported });
  });

  it('maps MSE failures to decode and normalization failures to unsupported', () => {
    // Genuine decode/append failures stay on the decode path: the host's
    // decode-recovery reload is reserved for real `mse` failures.
    expect(workerErrorForFailure({ code: failureCode.quota, condition: failureCondition.mse })).toMatchObject({ kind: workerErrorCode.decode });
    expect(workerErrorForFailure({ cause: new Error('boom'), code: failureCode.append, condition: failureCondition.mse })).toMatchObject({ kind: workerErrorCode.decode });
  });

  it('keeps normalization failures off the decode kind (a seek restart is not a decode failure)', () => {
    // A pipeline/seek-servicing failure must not start the host's decode-
    // recovery full reload (which tears the pipeline down mid-seek). Both
    // normalization codes surface as fatal-but-not-reloadable `unsupported`.
    expect(workerErrorForFailure({ code: failureCode.failed, condition: failureCondition.normalization, detail: 'mux' })).toMatchObject({ kind: workerErrorCode.unsupported });
    expect(workerErrorForFailure({ code: failureCode['unsupported-route'], condition: failureCondition.normalization })).toMatchObject({ kind: workerErrorCode.unsupported });
    expect(workerErrorForFailure({ code: failureCode.failed, condition: failureCondition.normalization })?.kind).not.toBe(workerErrorCode.decode);
  });

  it('surfaces an underlying Error cause as the normalization context detail', () => {
    // StreamController forwards the conversion failure's message as `detail`,
    // so describeFailure names the real cause instead of a bare
    // `normalization:failed`. The kind mapping is untouched: still `unsupported`.
    const report = workerErrorForFailure({
      cause: new Error('Sia SDK read ended before the requested range was delivered'),
      code: failureCode.failed,
      condition: failureCondition.normalization,
      detail: 'Sia SDK read ended before the requested range was delivered',
    });
    expect(report?.context).toBe('normalization:failed (Sia SDK read ended before the requested range was delivered)');
    expect(report?.kind).toBe(workerErrorCode.unsupported);
  });

  it('drops cancelled failures so stale load generations never surface', () => {
    expect(workerErrorForFailure({ code: failureCode.superseded, condition: failureCondition.cancelled })).toBeNull();
    expect(workerErrorForFailure({ code: failureCode.destroyed, condition: failureCondition.cancelled })).toBeNull();
  });

  it('carries a diagnostic context that identifies the failed condition', () => {
    const codec = workerErrorForFailure({ code: failureCode.unsupported, codec: 'avc1.640028', condition: failureCondition.codec });
    expect(codec?.context).toContain('codec:unsupported');
    expect(codec?.context).toContain('avc1.640028');

    const container = workerErrorForFailure({ code: failureCode.unknown, condition: failureCondition.container });
    expect(container?.context).toBe('container:unknown');

    const withDetail = workerErrorForFailure({ code: failureCode.failed, condition: failureCondition.normalization, detail: 'unsupported-route' });
    expect(withDetail?.context).toContain('normalization:failed');
    expect(withDetail?.context).toContain('unsupported-route');
  });

  it('adapter drops cancelled failures before they reach the host emit', () => {
    const emitted: WorkerErrorReport[] = [];
    const reporter: ErrorReporter = createErrorReporter((report) => emitted.push(report));

    reporter.report({ code: failureCode.destroyed, condition: failureCondition.cancelled } satisfies PlaybackFailure);
    reporter.report({ cause: new Error('append boom'), code: failureCode.decode, condition: failureCondition.mse } satisfies PlaybackFailure);

    expect(emitted).toHaveLength(1);
    expect(emitted[0]).toMatchObject({ kind: workerErrorCode.decode });
  });
});
