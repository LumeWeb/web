/**
 * TS→fMP4 producer: mux.js's `mp4.Transmuxer` performs the MPEG-TS → fMP4
 * remux behind the `AppendableProducer` seam.
 *
 * Calling convention: `push(chunk)` then `flush()` per chunk (mux.js tolerates
 * the repeated flush), and an init segment is emitted once per transmuxer
 * instance. `reset(epoch)` discards the transmuxer so stale GOP/timestamp
 * bookkeeping can never interpret bytes from the new position — the next push
 * builds a fresh transmuxer that re-emits init.
 */
import muxJs from 'mux.js';
import { producerMode, type ProducerMode, segmentKind } from '../../media/types.ts';
import { DEFAULT_FMP4_MIME } from '../../protocol.ts';
import type { AppendableProducer, ProducedSegment } from './appendable-producer.ts';

type Transmuxer = import('mux.js').Mp4Transmuxer;

const muxMp4 = muxJs.mp4;

export interface TsToFmp4ProducerOptions {
  /**
   * Codec-qualified MIME the remuxed bytes actually are. Defaults to the
   * pipeline's known H.264+AAC fMP4 type, the only MIME that can describe
   * what mux.js emits.
   */
  outputMime?: string;
}

export class TsToFmp4Producer implements AppendableProducer {
  readonly mode: ProducerMode = producerMode.normalized;
  readonly outputMime: string;

  #epoch = 0;
  #failed = false;
  #initEmitted = false;
  readonly #onError = new Set<(error: unknown) => void>();
  readonly #onSegment = new Set<(segment: ProducedSegment) => void>();
  #transmuxer: null | Transmuxer = null;

  constructor(options: TsToFmp4ProducerOptions = {}) {
    this.outputMime = options.outputMime ?? DEFAULT_FMP4_MIME;
  }

  flush(epoch: number): void {
    if (this.#failed || epoch < this.#epoch || !this.#transmuxer) return;
    try {
      this.#transmuxer.flush();
    } catch (error) {
      this.#fail(error);
    }
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

  /** Remuxes one TS chunk, flushing per push exactly like the worker's `#remux`. */
  push(bytes: Uint8Array, _absoluteOffset: number, epoch: number): void {
    if (this.#failed || epoch < this.#epoch) return;
    this.#transmuxer ??= this.#createTransmuxer();
    try {
      this.#transmuxer.push(bytes);
      this.#transmuxer.flush();
    } catch (error) {
      this.#fail(error);
    }
  }

  reportError(error: unknown): void {
    this.#fail(error);
  }

  /**
   * Switches to `epoch` and drops cross-segment remux state: the transmuxer
   * (and its init emission + timestamp bookkeeping) dies, and the next push
   * builds a fresh one.
   */
  reset(epoch: number): void {
    if (epoch < this.#epoch) return;
    this.#epoch = epoch;
    // A fresh transmuxer re-emits init on its first data event, so the flag
    // must follow the transmuxer, not the producer lifetime.
    this.#initEmitted = false;
    this.#transmuxer = null;
  }

  #createTransmuxer(): Transmuxer {
    const transmuxer = new muxMp4.Transmuxer({ baseMediaDecodeTime: 0 });
    transmuxer.on('data', (event) => this.#onTransmuxerData(event));
    return transmuxer;
  }

  #fail(error: unknown): void {
    if (this.#failed) return;
    this.#failed = true;
    for (const listener of this.#onError) listener(error);
  }

  #onTransmuxerData(event: unknown): void {
    if (this.#failed) return;
    const data = event as { data?: Uint8Array; initSegment?: Uint8Array };
    // mux.js re-attaches the init segment to every data event; only the first
    // one per transmuxer instance may reach the SourceBuffer.
    if (data.initSegment?.byteLength && !this.#initEmitted) {
      this.#initEmitted = true;
      for (const listener of this.#onSegment) listener({ bytes: data.initSegment, kind: segmentKind.init });
    }
    if (data.data?.byteLength) {
      for (const listener of this.#onSegment) listener({ bytes: data.data, kind: segmentKind.media });
    }
  }
}
