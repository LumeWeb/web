/**
 * Worker-side MSE composition root:
 * owns the worker `MediaSource` lifecycle for the `SessionCoordinator` —
 * one fresh MediaSource per load, its `MediaSourceHandle` transferred to the
 * host as a `HANDLE` protocol message, live getters served to the per-load
 * `MseAppendPipe`, and worker-side teardown/rebuild semantics:
 *
 * - `createSink(context)` (the coordinator's `sinkFactory`) tears down the
 *   previous pipeline, opens a brand-new worker MediaSource, posts `HANDLE`
 *   carrying its handle in the transfer list, and returns a `MseAdapter`
 *   (one `AppendSink` per load, each with its own append queue/load generation).
 * - `ensureSourceBuffer()` defers the SourceBuffer to the async `sourceopen`
 *   event (a worker MediaSource only opens once the host attaches the handle
 *   to a `<video>` element), setting the media duration and MIME, and kicks
 *   the pipe so appends queued before the SourceBuffer existed can drain.
 * - `deps` mirrors `WorkerMseSinkFactoryDeps`, so the pipe's EOS/eviction
 *   timing reads the live worker MSE state.
 *
 * Firefox and other runtimes that cannot construct MSE in a dedicated worker
 * never reach this module's `createSink`: the worker entry wires it only as
 * the `sinkFactory` when `supportsWorkerMse()` is true, so the main-thread
 * CHUNK posting fallback is preserved intact.
 */

import { MseAppendPipe } from '../mse-pipe.ts';
import { type RequestId, workerLogLevel, type WorkerLogLevel, WorkerToMainMessageType } from '../protocol.ts';
import { MseAdapter, type WorkerMseSinkFactoryDeps } from '../sink/mse-adapter.ts';
import type { AppendSink } from '../sink/append-sink.ts';
import type { PostMessage, SinkFactoryContext } from './session-coordinator.ts';

/**
 * The worker-side MSE root surface the composition root and worker entry
 * bind: live MediaSource getters for the sink factory, a per-load sink
 * builder that also transfers a fresh `MediaSourceHandle`, a playhead
 * reflector (eviction boundary), and permanent teardown.
 */
export interface WorkerMseRoot {
  /**
   * Builds one per-load MSE sink over a fresh worker MediaSource (new
   * `HANDLE`): each source load gets a fresh MSE pipeline.
   */
  createSink(context: SinkFactoryContext): AppendSink;
  /** Live worker MediaSource state the per-load sink factory binds to. */
  readonly deps: WorkerMseSinkFactoryDeps;
  /** Reflects the validated playhead on PLAYHEAD/SEEK. */
  setPlayhead(timeSeconds: number): void;
  /** Permanent teardown (DETACH/DESTROY); drops the MediaSource + SourceBuffer. */
  teardown(): void;
}

export interface WorkerMseRootOptions {
  /** Seconds of media kept buffered behind the playhead before eviction. */
  backBufferSeconds: number;
  /**
   * Creates the worker MediaSource (default `() => new MediaSource()`). Tests
   * inject a fake: a real detached MediaSource never fires `sourceopen`
   * (MSE opening events on attachment to a video element), so no real
   * `MediaSourceHandle` is constructible in a unit test page.
   */
  createMediaSource?: () => MediaSource;
  /**
   * Fatal MSE append failure reporter; the active load's request id is
   * supplied so the caller can post a request-scoped decode ERROR. Called at
   * most once per pipe lifetime (the pipe suppresses repeats).
   */
  onError?: (requestId: null | RequestId, error: unknown) => void;
  /**
   * Optional observability hook mirroring the `onError` option style: receives
   * worker MSE open facts as milestones — `session.mse-open` (info) once the
   * per-load MediaSource opens and its SourceBuffer is created successfully
   * (`{ mime, durationSeconds? }`), `session.mse-open-failed` (error) when
   * `addSourceBuffer` throws (`{ mime }`). The active load's request id is
   * supplied when one is bound, else null. Only scalar detail is passed; a
   * host that wires this into the composition's `emitLog` gets the HELLO
   * threshold + 256 cap for free. Undefined = zero change to the open path.
   */
  onLog?: (
    name: string,
    level: WorkerLogLevel,
    requestId: null | RequestId,
    detail: Readonly<Record<string, unknown>>,
  ) => void;
  /** Outbound protocol channel (HANDLE posting with the transferred handle). */
  post: PostMessage;
}

export function createWorkerMseRoot(options: WorkerMseRootOptions): WorkerMseRoot {
  const createMediaSource = options.createMediaSource ?? (() => new MediaSource());
  let durationSeconds: null | number = null;
  let mediaSource: MediaSource | null = null;
  let mime = '';
  let pipe: MseAppendPipe | null = null;
  let playheadSeconds = 0;
  let requestId: null | RequestId = null;
  let sourceBuffer: null | SourceBuffer = null;

  // A fatal MSE failure (append/`error` event, or a SourceBuffer that cannot be
  // created) leaves the pipeline dead. Surface it once to the host with the
  // request id still bound, then release the worker MediaSource + SourceBuffer
  // the dead pipeline held — same immediate teardown as an abandoned load, so
  // an errored pipeline never leaves a stale handle waiting for a later
  // DETACH/supersede to release it.
  function reportFatal(failureRequestId: null | RequestId, error: unknown): void {
    options.onError?.(failureRequestId, error);
    teardown();
  }

  // The pipe serializes every SourceBuffer mutation through these live getters
  // (the same shape `createWorkerMseSinkFactory` binds), so EOS waiting, quota
  // retry, and back-buffer eviction read the current worker state.
  const deps: WorkerMseSinkFactoryDeps = {
    backBufferSeconds: options.backBufferSeconds,
    getMediaSource: () => mediaSource,
    getPlayheadSeconds: () => playheadSeconds,
    getSourceBuffer: () => sourceBuffer,
    onError: (error) => reportFatal(requestId, error),
  };

  // Creates the worker-side SourceBuffer once the MediaSource opens, deferring
  // to the `sourceopen` event, then kicks the pipe so appends queued before
  // the SourceBuffer existed drain. A torn-down pipeline's listener may outlive
  // its MediaSource, so only the current source may proceed.
  function ensureSourceBuffer(): void {
    const current = mediaSource;
    if (!current) return;

    if (current.readyState !== 'open') {
      current.addEventListener(
        'sourceopen',
        () => {
          if (mediaSource === current) ensureSourceBuffer();
        },
        { once: true },
      );
      return;
    }

    try {
      if (durationSeconds !== null) current.duration = durationSeconds;
      const created = current.addSourceBuffer(mime);
      // The pipe awaits `updateend` internally; the kick here (and on the
      // event) only re-runs the pump for state the option getters observe —
      // above all the SourceBuffer appearing after bytes were already queued.
      created.addEventListener('updateend', () => pipe?.kick());
      sourceBuffer = created;
      pipe?.kick();
      // The MediaSource opened and its SourceBuffer was created: report the
      // applied MIME + duration (when one was set) at the active load.
      options.onLog?.(
        'session.mse-open',
        workerLogLevel.info,
        requestId,
        durationSeconds === null ? { mime } : { durationSeconds, mime },
      );
    } catch (error) {
      // A pipeline whose SourceBuffer cannot be created is dead too: report
      // the open failure (the MIME that was refused) first, then release the
      // freshly opened MediaSource (see `reportFatal`).
      options.onLog?.('session.mse-open-failed', workerLogLevel.error, requestId, { mime });
      reportFatal(requestId, error);
    }
  }

  // Drops MSE state belonging to a finished source/attachment. The next
  // SOURCE opens a brand-new MediaSource (and the host receives a new
  // HANDLE).
  function teardown(): void {
    pipe?.abort();
    pipe = null;
    if (mediaSource && sourceBuffer) {
      try {
        sourceBuffer.abort();
        mediaSource.removeSourceBuffer(sourceBuffer);
      } catch {
        // The pipeline is being discarded; a partial cleanup is harmless.
      }
    }
    sourceBuffer = null;
    mediaSource = null;
    durationSeconds = null;
    mime = '';
    requestId = null;
  }

  return {
    createSink(context) {
      teardown();
      requestId = context.requestId;
      durationSeconds = context.durationSeconds;
      mime = context.mime;

      const current = createMediaSource();
      mediaSource = current;
      const handle = mediaSourceHandleOf(current);
      options.post({ handle, requestId: context.requestId, type: WorkerToMainMessageType.HANDLE }, [handle]);

      // One MseAdapter (fresh MseAppendPipe) per load; the load-generation
      // scoping on resetParser/requestEndOfStream is exactly the
      // `createWorkerMseSinkFactory` contract, with the pipe reference kept so
      // the root can kick it when the SourceBuffer appears.
      const created = new MseAppendPipe(deps);
      pipe = created;
      ensureSourceBuffer();
      return new MseAdapter({ pipe: created });
    },

    deps,

    setPlayhead(timeSeconds) {
      playheadSeconds = timeSeconds;
    },

    teardown() {
      teardown();
    },
  };
}

/** The worker-owned MediaSource's transferable handle (MS Edge/Chromium/Safari). */
function mediaSourceHandleOf(mediaSource: MediaSource): MediaSourceHandle {
  return (mediaSource as unknown as { handle: MediaSourceHandle }).handle;
}
