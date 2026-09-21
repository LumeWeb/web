/**
 * Appendable-producer contract: the byte→segments seam between transport
 * and MSE.
 *
 * Every producer — fMP4 passthrough, TS→fMP4 remux, mediabunny
 * progressive-MP4, and native WebM — implements one surface so the MSE sink
 * never cares which container logic produced the bytes. Producers are
 * epoch-aware: `reset(epoch)` drops cross-segment (GOP/timestamp) state and
 * makes pushes under any older epoch dead on arrival, matching the stale-read
 * discipline already enforced by `ByteSource`/`MseAppendPipe`.
 *
 * The container/import rules still apply: `producer/*` must not import the
 * Sia SDK, and producers may depend on the container engine they wrap (only
 * composition roots may instantiate SDK-specific objects).
 */

import type { ProducerMode, SegmentKind } from '../../media/legacy-types.ts';

/**
 * The byte→segment producer seam. All calls are synchronous and ordered; a
 * listener registered later never sees bytes pushed earlier.
 *
 * `mode` is the producer's own `ProducerMode` (never `sequential`, which is a
 * scheduling mode, not a producer mode — the design doc carries the same
 * field as `producerMode`).
 */
export interface AppendableProducer {
  /**
   * Drains final samples (TS flush). Idempotent for producers that flush per
   * push (passthrough emits nothing; mux.js tolerates a repeated flush).
   */
  flush(epoch: number): void;
  /**
   * Optional: true while the producer still has asynchronous segment work in
   * flight (e.g. the mediabunny refragmenter resolving the engine + emitting
   * segments). The stream controller consults it before requesting
   * end-of-stream so it never ends a MediaSource whose media segments have
   * not been emitted yet; absent sync producers are treated as never pending.
   */
  isPending?(): boolean;
  /** How the producer transforms its input: `passthrough` | `normalized` | … */
  readonly mode: ProducerMode;
  /** Subscribes to the single fatal error; returns an unsubscribe function. */
  onError(listener: (error: unknown) => void): () => void;
  /** Subscribes to produced segments; returns an unsubscribe function. */
  onSegment(listener: (segment: ProducedSegment) => void): () => void;
  /**
   * Codec-qualified MIME the produced bytes actually are: fMP4
   * producers emit `video/mp4; codecs="…"`, WebM producers `video/webm;
   * codecs="…"`. This is what the sink uses for `SourceBuffer` creation, so
   * it must describe the true append format, not the transport type.
   */
  readonly outputMime: string;
  /** Feeds one input chunk at its absolute byte offset in the object. */
  push(bytes: Uint8Array, absoluteOffset: number, epoch: number): void;
  /** Reports a fatal producer-side error to `onError` listeners exactly once. */
  reportError(error: unknown): void;
  /**
   * Switches to `epoch`, dropping all cross-segment state (a passthrough
   * keeps its one init classification; a remuxer discards its transmuxer and
   * re-emits init on the next push). Pushes under an older epoch are ignored.
   */
  reset(epoch: number): void;
}

/**
 * One independently appendable media unit produced from input bytes: either
 * the container initialization (a fresh SourceBuffer must see it before any
 * media) or one media segment (`moof`+`mdat`, Cluster, or remuxed fragment).
 *
 * `kind` is the only required field beyond bytes; the optional time/`rap`/
 * `terminal` metadata mirrors `SegmentMeta` for producers that know it (an
 * indexed passthrough or a refragmenter) — sequential producers may leave it
 * unset and the sink still behaves correctly.
 */
export interface ProducedSegment {
  readonly bytes: Uint8Array;
  readonly endSeconds?: number;
  readonly kind: SegmentKind;
  readonly rap?: boolean;
  readonly startSeconds?: number;
  readonly terminal?: boolean;
}
