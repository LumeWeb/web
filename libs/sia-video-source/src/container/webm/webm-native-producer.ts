/**
 * Native WebM producer: the `AppendableProducer` for browsers whose MSE
 * appends WebM as-is (`ProducerMode 'native'`).
 *
 * WebM is already the MSE append format where the browser supports its
 * codecs, so bytes flow through unchanged — the same init/media classification
 * the fMP4 passthrough producer performs. The first chunk of a load carries
 * the EBML/WebM initialization (EBML header + Segment + Info + Tracks + the
 * carried first Cluster) and is classified `init`; every later chunk is a
 * `media` Cluster. The classification is per producer lifetime, NOT per
 * `reset()` — a seek within a load never re-delivers init because the
 * SourceBuffer keeps the initialization from the load's first window.
 *
 * Only the mode (`native` vs `passthrough`) and the output MIME
 * (`video/webm; codecs="…"`) distinguish this producer from the fMP4
 * passthrough; the production surface is deliberately identical so the stream
 * controller and MSE sink never branch on container.
 */
import { producerMode, type ProducerMode, segmentKind, type SegmentKind } from '../../media/types.ts';
import type { AppendableProducer, ProducedSegment } from '../producer/appendable-producer.ts';

export interface WebmNativeProducerOptions {
  /**
   * Codec-qualified MIME the passed-through WebM bytes actually are. Defaults
   * to the generic `video/webm` type; the composition root supplies the
   * codec-qualified string derived from the object's Tracks element.
   */
  outputMime?: string;
}

export class WebmNativeProducer implements AppendableProducer {
  readonly mode: ProducerMode = producerMode.native;
  readonly outputMime: string;

  #epoch = 0;
  #failed = false;
  #initDelivered = false;
  readonly #onError = new Set<(error: unknown) => void>();
  readonly #onSegment = new Set<(segment: ProducedSegment) => void>();

  constructor(options: WebmNativeProducerOptions = {}) {
    this.outputMime = options.outputMime ?? 'video/webm';
  }

  flush(epoch: number): void {
    if (this.#failed || epoch < this.#epoch) return;
    // Native WebM buffers nothing; there are no final samples to drain.
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
