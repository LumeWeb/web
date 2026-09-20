/**
 * TDD contract for the appendable-producer seam: every producer — fMP4
 * passthrough, TS→fMP4 remux, mediabunny progressive-MP4, and native WebM —
 * speaks one `AppendableProducer` surface so MSE does not care which container
 * logic ran.
 *
 * Covered behaviors: init-before-media, ordered media, reset drops stale
 * output, flush semantics, and one-shot error delivery.
 *
 * The primary contract is exercised against `PassthroughProducer` (the
 * deterministic fMP4 case), with `TsToFmp4Producer` covered for its structural
 * guarantees (mode/MIME, epoch scoping, flush idempotence, one-shot error) — a
 * real TS fixture is out of scope here, and the remux output is covered
 * separately through mux.js.
 */
import { describe, expect, it } from 'vitest';
import type { AppendableProducer, ProducedSegment } from '../container/producer/appendable-producer.ts';
import { PassthroughProducer } from '../container/producer/passthrough-producer.ts';
import { TsToFmp4Producer } from '../container/producer/ts-to-fmp4-producer.ts';
import { DEFAULT_FMP4_MIME } from '../protocol.ts';

const bytes = (marker: number, length = 16) => new Uint8Array(length).fill(marker);

function collect(producer: AppendableProducer): { errors: unknown[]; segments: ProducedSegment[] } {
  const errors: unknown[] = [];
  const segments: ProducedSegment[] = [];
  producer.onSegment((segment) => segments.push(segment));
  producer.onError((error) => errors.push(error));
  return { errors, segments };
}

describe('AppendableProducer contract', () => {
  describe('PassthroughProducer', () => {
    it('emits init before media on ordered pushes', () => {
      const producer = new PassthroughProducer();
      const { segments } = collect(producer);

      producer.push(bytes(1), 0, 0);
      producer.push(bytes(2), 16, 0);
      producer.push(bytes(3), 32, 0);

      expect(segments.map((s) => s.kind)).toEqual(['init', 'media', 'media']);
      expect(segments.map((s) => s.bytes[0])).toEqual([1, 2, 3]);
    });

    it('classifies exactly one init segment per producer lifetime', () => {
      const producer = new PassthroughProducer();
      const { segments } = collect(producer);

      for (let index = 0; index < 5; index++) producer.push(bytes(index), index * 16, 0);

      expect(segments.filter((s) => s.kind === 'init')).toHaveLength(1);
    });

    it('passes the pushed byte views through unchanged (parity with #deliverPassthrough)', () => {
      const producer = new PassthroughProducer();
      const { segments } = collect(producer);
      const chunk = bytes(7);

      producer.push(chunk, 0, 0);

      expect(segments[0]?.bytes).toBe(chunk);
    });

    it('drops pushes for a stale (old) epoch and keeps delivering for the new one', () => {
      const producer = new PassthroughProducer();
      const { segments } = collect(producer);

      producer.push(bytes(1), 0, 0);
      producer.reset(1);
      // Stale epoch: must not emit.
      producer.push(bytes(2), 16, 0);
      // Current epoch: must emit (as media; init persists across a seek).
      producer.push(bytes(3), 32, 1);

      expect(segments.map((s) => [s.kind, s.bytes[0]])).toEqual([
        ['init', 1],
        ['media', 3],
      ]);
    });

    it('ignores a reset that is older than the current epoch', () => {
      const producer = new PassthroughProducer();
      const { segments } = collect(producer);

      producer.push(bytes(1), 0, 2);
      producer.reset(1); // stale reset: no-op
      producer.push(bytes(4), 16, 2);

      expect(segments.map((s) => s.bytes[0])).toEqual([1, 4]);
    });

    it('flush is a no-op for passthrough (no buffered samples) and never emits', () => {
      const producer = new PassthroughProducer();
      const { segments } = collect(producer);

      producer.push(bytes(1), 0, 0);
      producer.flush(0);
      producer.flush(0);
      producer.flush(99); // stale flush ignored

      expect(segments.map((s) => s.kind)).toEqual(['init']);
    });

    it('reports a fatal error exactly once and stops emitting afterwards', () => {
      const producer = new PassthroughProducer();
      const { errors, segments } = collect(producer);

      producer.reportError(new Error('boom'));
      producer.reportError(new Error('boom again'));
      producer.push(bytes(1), 0, 0);

      expect(errors).toHaveLength(1);
      expect((errors[0] as Error).message).toBe('boom');
      expect(segments).toEqual([]);
    });

    it('onSegment unsubscribe stops future delivery for that listener', () => {
      const producer = new PassthroughProducer();
      const seen: number[] = [];
      const off = producer.onSegment((segment) => seen.push(segment.bytes[0]));

      producer.push(bytes(1), 0, 0);
      off();
      producer.push(bytes(2), 16, 0);

      expect(seen).toEqual([1]);
    });

    it('defaults to passthrough mode and a generic MP4 output MIME, overridable', () => {
      const defaults = new PassthroughProducer();
      expect(defaults.mode).toBe('passthrough');
      expect(defaults.outputMime).toBe('video/mp4');

      const qualified = new PassthroughProducer({ outputMime: 'video/mp4; codecs="avc1.640028"' });
      expect(qualified.outputMime).toBe('video/mp4; codecs="avc1.640028"');
    });
  });

  describe('TsToFmp4Producer', () => {
    it('reports normalized mode with the fMP4 output MIME', () => {
      const producer = new TsToFmp4Producer();
      expect(producer.mode).toBe('normalized');
      expect(producer.outputMime).toBe(DEFAULT_FMP4_MIME);
    });

    it('flush is idempotent and never throws on non-TS garbage', () => {
      const producer = new TsToFmp4Producer();
      collect(producer);

      // mux.js tolerates push+flush cycles; the worker does the same per chunk.
      producer.push(bytes(1), 0, 0);
      producer.flush(0);
      producer.flush(0);
    });

    it('drops stale-epoch pushes after a reset (transmuxer rebuild)', () => {
      const producer = new TsToFmp4Producer();
      const { errors } = collect(producer);

      producer.push(bytes(1), 0, 0);
      producer.reset(1);
      producer.push(bytes(2), 16, 0); // stale: must not reach mux.js
      producer.push(bytes(3), 32, 1); // current: rebuilt transmuxer

      expect(errors).toEqual([]);
    });

    it('reports a fatal error exactly once and stops processing afterwards', () => {
      const producer = new TsToFmp4Producer();
      const { errors, segments } = collect(producer);

      producer.reportError(new Error('decode'));
      producer.reportError(new Error('decode again'));
      producer.push(bytes(1), 0, 0);

      expect(errors).toHaveLength(1);
      expect(segments).toEqual([]);
    });
  });

  describe('type-level contract', () => {
    it('PassthroughProducer and TsToFmp4Producer both satisfy AppendableProducer', () => {
      // The array only type-checks if both concrete producers implement the
      // `AppendableProducer` seam; the runtime assertions are incidental.
      const producers: AppendableProducer[] = [new PassthroughProducer(), new TsToFmp4Producer()];
      expect(producers.map((producer) => producer.mode)).toEqual(['passthrough', 'normalized']);
    });
  });
});
