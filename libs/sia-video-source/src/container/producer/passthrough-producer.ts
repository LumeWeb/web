/**
 * fMP4 passthrough producer: an `AppendableProducer` over bytes that already
 * speak the MSE append format, handed through unchanged (same reference).
 *
 * The init/media split is informational: the first chunk of a load carries
 * `ftyp`(+`moov`) and is classified `init`; every later chunk is `media`. The
 * classification is per producer lifetime, NOT per `reset()` — a seek within a
 * load never re-delivers init because the SourceBuffer keeps the
 * initialization from the load's first window.
 */
import { producerMode, type ProducerMode, segmentKind, type SegmentKind } from '../../media/types.ts';
import type { AppendableProducer, ProducedSegment } from './appendable-producer.ts';

export interface PassthroughProducerOptions {
  /**
   * Codec-qualified MIME the passed-through bytes actually are. Defaults to
   * the generic ISO BMFF type; the composition root supplies the codec-qualified
   * string derived from the object's init segment.
   */
  outputMime?: string;
}

export class PassthroughProducer implements AppendableProducer {
  readonly mode: ProducerMode = producerMode.passthrough;
  readonly outputMime: string;

  #epoch = 0;
  #failed = false;
  #initDelivered = false;
  readonly #onError = new Set<(error: unknown) => void>();
  readonly #onSegment = new Set<(segment: ProducedSegment) => void>();

  constructor(options: PassthroughProducerOptions = {}) {
    this.outputMime = options.outputMime ?? 'video/mp4';
  }

  flush(epoch: number): void {
    if (this.#failed || epoch < this.#epoch) return;
    // Passthrough buffers nothing; there are no final samples to drain.
  }

  /** Unsubscribes the passed listener from fatal-error delivery. */
  onError(listener: (error: unknown) => void): () => void {
    this.#onError.add(listener);
    return () => {
      this.#onError.delete(listener);
    };
  }

  /** Unsubscribes the passed listener from produced-segment delivery. */
  onSegment(listener: (segment: ProducedSegment) => void): () => void {
    this.#onSegment.add(listener);
    return () => {
      this.#onSegment.delete(listener);
    };
  }

  /** Classifies and forwards exactly one init, then media per push. */
  push(bytes: Uint8Array, _absoluteOffset: number, epoch: number): void {
    if (this.#failed || epoch < this.#epoch) return;
    const kind: SegmentKind = this.#initDelivered ? segmentKind.media : segmentKind.init;
    this.#initDelivered = true;
    for (const listener of this.#onSegment) listener({ bytes, kind });
  }

  reportError(error: unknown): void {
    this.#fail(error);
  }

  /**
   * Switches to `epoch`, dropping stale pushes. The one-init classification
   * deliberately survives so a seek never re-delivers init for the same load.
   */
  reset(epoch: number): void {
    this.#epoch = Math.max(this.#epoch, epoch);
  }

  #fail(error: unknown): void {
    if (this.#failed) return;
    this.#failed = true;
    for (const listener of this.#onError) listener(error);
  }
}
