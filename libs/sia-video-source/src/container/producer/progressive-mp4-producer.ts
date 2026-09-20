/**
 * Mediabunny-backed progressive-MP4 producer — the producer
 * `ProgressiveMp4ProducerStrategy` selects for container `'mp4'`. An
 * index-less progressive MP4 has no sidx, so the stream controller reads the
 * whole object sequentially (one terminal whole-object read), the producer
 * accumulates those bytes and drives the mediabunny fragment engine
 * (`mediabunnyFragmentFromBytes`) to emit one `init` segment followed by
 * ordered keyframe-aligned `media` segments — the exact MSE SourceBuffer
 * contract.
 *
 * The job is asynchronous (the engine lazily resolves the mediabunny module),
 * so the producer exposes `isPending()`: the stream controller defers its own
 * end-of-stream request while a refragment is in flight, and the LAST media
 * segment carries `terminal: true`, which drives `endOfStream` through the
 * sink (its MSE adapter requests EOS on a producer-declared terminal) once the
 * final fragment drains — a producer-declared terminal can never fire before
 * the media that precedes it.
 *
 * Mediabunny is the only engine: no fallback ladder, no engine selection —
 * this module never imports mediabunny itself; the engine stays behind the
 * fragment seam so tests inject a fake for pure shell logic.
 */
import { producerMode, type ProducerMode, segmentKind } from '../../media/types.ts';
import { type FragmentedMp4Output, mediabunnyFragmentFromBytes } from '../engine/mediabunny-fragment.ts';
import type { AppendableProducer, ProducedSegment } from './appendable-producer.ts';

/** Bytes → {init, media[]} refragment capability injected for tests. */
export type Mp4FragmentFn = (bytes: Uint8Array) => Promise<FragmentedMp4Output>;

/** Constructor bag for the progressive-MP4 producer. */
export interface ProgressiveMp4ProducerOptions {
  /**
   * Refragments a full progressive-MP4 object into one init + ordered media
   * segments. Defaults to the mediabunny fragment engine
   * (`mediabunnyFragmentFromBytes`); tests inject a fake for pure logic.
   */
  readonly fragment?: Mp4FragmentFn;
  /** Codec-qualified fMP4 MIME the refragmented bytes actually are. */
  readonly outputMime: string;
}

export class ProgressiveMp4Producer implements AppendableProducer {
  readonly mode: ProducerMode = producerMode.normalized;
  readonly outputMime: string;

  /** Whole-object progressive-MP4 bytes pushed so far (reset per epoch). */
  #accumulated: Uint8Array[] = [];
  #accumulatedBytes = 0;
  #epoch = 0;
  #failed = false;
  readonly #fragment: Mp4FragmentFn;
  #jobStartedAtEpoch: null | number = null;
  readonly #onError = new Set<(error: unknown) => void>();
  readonly #onSegment = new Set<(segment: ProducedSegment) => void>();

  constructor(options: ProgressiveMp4ProducerOptions) {
    this.outputMime = options.outputMime;
    this.#fragment = options.fragment ?? mediabunnyFragmentFromBytes;
  }

  /**
   * Starts the refragment job over the fully-accumulated object. The stream
   * controller only flushes after the terminal whole-object read delivered
   * every chunk, so this is the single point where the complete object is
   * known. EOS is driven by the terminal media segment the job emits (and the
   * controller defers EOS while pending). Idempotent within one epoch.
   */
  flush(epoch: number): void {
    if (this.#failed || epoch < this.#epoch || this.#jobStartedAtEpoch !== null) return;
    if (this.#accumulatedBytes === 0) return;
    this.#jobStartedAtEpoch = epoch;
    void this.#run(epoch);
  }

  /**
   * True while an async refragment is in flight. The stream controller
   * consults this before requesting end-of-stream so it never ends a
   * MediaSource whose media segments have not been emitted yet.
   */
  isPending(): boolean {
    return this.#jobStartedAtEpoch !== null;
  }

  onError(listener: (error: unknown) => void): () => void {
    this.#onError.add(listener);
    return () => {
      this.#onError.delete(listener);
    };
  }

  onSegment(listener: (segment: ProducedSegment) => void): () => void {
    this.#onSegment.add(listener);
    return () => {
      this.#onSegment.delete(listener);
    };
  }

  /**
   * Accumulates one chunk of the whole-object sequential read. The refragment
   * job starts on `flush(epoch)` — the controller only flushes after the
   * terminal read delivered the complete object, so segmentation never sees a
   * partial snapshot.
   */
  push(bytes: Uint8Array, _absoluteOffset: number, epoch: number): void {
    if (this.#failed || epoch < this.#epoch) return;
    this.#accumulated.push(bytes);
    this.#accumulatedBytes += bytes.byteLength;
  }

  reportError(error: unknown): void {
    if (this.#failed) return;
    this.#failed = true;
    this.#jobStartedAtEpoch = null;
    for (const listener of this.#onError) listener(error);
  }

  /**
   * Switches to `epoch`, dropping the accumulated object and any in-flight
   * refragment result. A superseded run's emissions are epoch-scoped so a
   * stale job can never append segments from the previous position.
   */
  reset(epoch: number): void {
    if (epoch < this.#epoch) return;
    this.#epoch = epoch;
    this.#accumulated = [];
    this.#accumulatedBytes = 0;
    this.#jobStartedAtEpoch = null;
  }

  #emit(output: FragmentedMp4Output): void {
    if (this.#failed) return;
    for (const listener of this.#onSegment) listener({ bytes: output.init, kind: segmentKind.init });
    const last = output.media.length - 1;
    output.media.forEach((bytes, index) => {
      for (const listener of this.#onSegment) {
        listener({ bytes, kind: segmentKind.media, terminal: index === last });
      }
    });
  }

  async #run(epoch: number): Promise<void> {
    const bytes = this.#snapshotBytes();
    // The accumulation is consumed here and the shared accumulator is emptied
    // at run START, not in a finally: bytes pushed before this run belong to
    // this snapshot, and a superseded run must never clear bytes a NEWER epoch
    // is still pushing (its finally would wipe a reset()'s fresh pushes).
    this.#accumulated = [];
    this.#accumulatedBytes = 0;
    try {
      const output = await this.#fragment(bytes);
      // A seek/supersede landed while the engine was working: drop the result.
      if (this.#failed || epoch !== this.#epoch || this.#jobStartedAtEpoch !== epoch) return;
      this.#emit(output);
    } catch (error) {
      if (this.#failed || epoch !== this.#epoch) return;
      this.reportError(error);
    } finally {
      if (this.#jobStartedAtEpoch === epoch) this.#jobStartedAtEpoch = null;
    }
  }

  /** Concats the accumulated chunks into one standalone progressive-MP4 object. */
  #snapshotBytes(): Uint8Array {
    const out = new Uint8Array(this.#accumulatedBytes);
    let at = 0;
    for (const chunk of this.#accumulated) {
      out.set(chunk, at);
      at += chunk.byteLength;
    }
    return out;
  }
}
