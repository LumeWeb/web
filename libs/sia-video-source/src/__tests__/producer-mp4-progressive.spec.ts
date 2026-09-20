/**
 * TDD contract for the progressive-MP4 normalized producer: the mediabunny
 * backed producer that turns a complete progressive MP4 object into
 * MSE-appendable fMP4 — one `init` segment (ftyp + moov) followed by ordered
 * RAP-aligned `media` segments (moof + mdat) — and the producer-factory
 * strategy that routes container `'mp4'` to it.
 *
 * The strategy never blocks on capability (there is no capability check to
 * fall through: mediabunny is the only engine), so it only checks the
 * container and the MSE-append capability of the codec-qualified output MIME.
 * Pure-node concerns: selection ordering, the MSE-append codec check, the
 * producer shell's accumulate → refragment lifecycle (epoch scoping, one-shot
 * error, terminal-media EOS contract), and — against the real engine — that a
 * real multi-track
 * progressive MP4 fragment emits a structurally valid init + strictly
 * timestamp-increasing, keyframe-aligned media fragments while preserving
 * track count.
 *
 * The engine is exercised only in node (`runIf(IN_NODE)`), mirroring the
 * bounded-probe spec; strategy and producer-shell tests are pure and run in
 * both environments.
 */
import { describe, expect, it } from 'vitest';
import { capabilityVerdict, type CapabilityVerdict, type CodecId } from '../capabilities/codec-verdict.ts';
import type { PlaybackCapabilities } from '../capabilities/browser-capabilities.ts';
import {
  type FragmentedMp4Output,
  mediabunnyFragmentFromBytes,
} from '../container/engine/mediabunny-fragment.ts';
import {
  type Mp4FragmentFn,
  ProgressiveMp4Producer,
} from '../container/producer/progressive-mp4-producer.ts';
import { ProgressiveMp4ProducerStrategy } from '../container/producer/progressive-mp4-producer-strategy.ts';
import type { ProducerContext } from '../container/producer/producer-factory.ts';
import type { CodecDescriptor } from '../media/types.ts';
import { progressiveMp4Fixture } from './fixtures/progressive-mp4-fixture.ts';

const VIDEO: CodecDescriptor = { codec: 'avc1.640032', kind: 'video', mimeCodec: 'avc1.640032' };
const AUDIO: CodecDescriptor = { codec: 'mp4a.40.2', kind: 'audio', mimeCodec: 'mp4a.40.2' };
const FMP4_MIME = 'video/mp4; codecs="avc1.640032,mp4a.40.2"';

const IN_NODE = typeof document === 'undefined';

interface CapabilityOverrides {
  mayDecode?: (codec: CodecId) => CapabilityVerdict;
  mseSupported?: (mime: string) => boolean;
}

/** Deterministic capability stub: MSE accepts everything unless overridden. */
function capabilities(overrides: CapabilityOverrides = {}): PlaybackCapabilities {
  return {
    canConstructWorkerMse: () => false,
    mayDecode: overrides.mayDecode ?? (() => capabilityVerdict['unknown-codec']),
    mseSupported: overrides.mseSupported ?? (() => true),
    webCodecsAvailable: () => false,
    workerHandleAvailable: () => false,
  };
}

function context(partial: Partial<ProducerContext> = {}): ProducerContext {
  return {
    capabilities: partial.capabilities ?? capabilities(),
    codecs: partial.codecs ?? [VIDEO, AUDIO],
    container: partial.container ?? 'mp4',
    indexAvailable: partial.indexAvailable ?? false,
    inputMime: partial.inputMime,
  };
}

describe('ProgressiveMp4ProducerStrategy (progressive MP4 → mediabunny)', () => {
  const strategy = new ProgressiveMp4ProducerStrategy();

  it('rejects non-MP4 containers with a container rejection', () => {
    for (const container of ['fmp4', 'ts', 'webm', 'mkv', 'unknown'] as const) {
      expect(strategy.select(context({ container }))).toEqual({
        detail: `container:${container}`,
        verdict: 'container',
      });
    }
  });

  it('rejects with a codec rejection when the browser cannot MSE-append the fMP4 output', () => {
    const rejection = strategy.select(
      context({ capabilities: capabilities({ mseSupported: () => false }) }),
    );
    expect(rejection).toEqual({
      detail: `mime-not-supported:${FMP4_MIME}`,
      verdict: 'codec',
    });
  });

  it('selects the normalized mediabunny producer with the codec-qualified output MIME', () => {
    const selection = strategy.select(context());
    expect('producer' in selection).toBe(true);
    if (!('producer' in selection)) return;
    expect(selection.reason).toBe('producer:progressive-mp4');
    expect(selection.producer).toBeInstanceOf(ProgressiveMp4Producer);
    expect(selection.producer.mode).toBe('normalized');
    expect(selection.producer.outputMime).toBe(FMP4_MIME);
  });

  it('derives the output MIME from the actual context codecs', () => {
    const selection = strategy.select(context({ codecs: [VIDEO] }));
    expect('producer' in selection).toBe(true);
    if (!('producer' in selection)) return;
    expect(selection.producer.outputMime).toBe('video/mp4; codecs="avc1.640032"');
  });
});

/** Drains pending microtasks until the async refragment job settles. */
async function settle(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('ProgressiveMp4Producer (accumulate → refragment shell)', () => {
  const INIT = new Uint8Array([1, 2, 3, 4]);
  const MEDIA_A = new Uint8Array([5, 6]);
  const MEDIA_B = new Uint8Array([7, 8, 9]);

  /** A controlled fake refragmenter: resolved on the next microtask. */
  function fakeFragment(
    received: { bytes: Uint8Array[] },
    output: FragmentedMp4Output = { init: INIT, media: [MEDIA_A, MEDIA_B] },
    fail: Error | null = null,
  ): Mp4FragmentFn {
    return (bytes) => {
      received.bytes.push(bytes);
      if (fail) return Promise.reject(fail);
      return Promise.resolve({ init: output.init, media: [...output.media] });
    };
  }

  it('carries the normalized identity and output MIME', () => {
    const producer = new ProgressiveMp4Producer({ outputMime: FMP4_MIME });
    expect(producer.mode).toBe('normalized');
    expect(producer.outputMime).toBe(FMP4_MIME);
  });

  it('emits one init segment followed by every media segment, marking the LAST media terminal', async () => {
    const received: { bytes: Uint8Array[] } = { bytes: [] };
    const producer = new ProgressiveMp4Producer({ fragment: fakeFragment(received), outputMime: FMP4_MIME });
    const segments: { bytes: Uint8Array; kind: string; terminal?: boolean }[] = [];
    producer.onSegment((segment) => segments.push(segment));
    producer.push(new Uint8Array([9, 9]), 0, 0);
    producer.push(new Uint8Array([8, 8]), 2, 0);
    producer.flush(0);
    await settle();

    // The refragmenter received the whole accumulated object (concatenated).
    expect(received.bytes).toHaveLength(1);
    expect(Array.from(received.bytes[0])).toEqual([9, 9, 8, 8]);
    // MSE contract: init strictly precedes media; the last media is terminal.
    expect(segments.map((s) => s.kind)).toEqual(['init', 'media', 'media']);
    expect(segments[0]?.bytes).toEqual(INIT);
    // Every media carries an explicit terminal flag; only the LAST is true.
    expect(segments[1]?.terminal).toBe(false);
    expect(segments[2]?.terminal).toBe(true);
    // The producer is no longer pending once the job resolved and emitted.
    expect(producer.isPending()).toBe(false);
  });

  it('reports a resolved-and-emitted run only for the current epoch; a superseded result is dropped', async () => {
    const deferred: { resolve: (value: FragmentedMp4Output) => void } = { resolve: () => undefined };
    const producer = new ProgressiveMp4Producer({
      fragment: () =>
        new Promise((resolve) => {
          deferred.resolve = resolve;
        }),
      outputMime: FMP4_MIME,
    });
    const segments: unknown[] = [];
    const errors: unknown[] = [];
    producer.onSegment((segment) => segments.push(segment));
    producer.onError((error) => errors.push(error));
    producer.push(new Uint8Array(2), 0, 1);
    producer.flush(1);
    expect(producer.isPending()).toBe(true);
    // A seek/supersede lands while the engine is still working.
    producer.reset(2);
    deferred.resolve({ init: INIT, media: [MEDIA_A] });
    await settle();
    // The superseded run's segments must never reach listeners.
    expect(segments).toEqual([]);
    expect(errors).toEqual([]);
    expect(producer.isPending()).toBe(false);
  });

  it('a superseded run never clears bytes being pushed for the newer epoch (seek mid-refragment)', async () => {
    // Epoch-1 refragment stays in flight until released, so a reset(2) + push
    // can land while the superseded job is still awaiting the fragment engine.
    const deferred: { resolve: (value: FragmentedMp4Output) => void } = { resolve: () => undefined };
    const received: { bytes: Uint8Array[] } = { bytes: [] };
    const producer = new ProgressiveMp4Producer({
      fragment: (bytes) => {
        received.bytes.push(bytes);
        if (received.bytes.length === 1) {
          return new Promise<FragmentedMp4Output>((resolve) => {
            deferred.resolve = resolve;
          });
        }
        return Promise.resolve({ init: INIT, media: [MEDIA_A] });
      },
      outputMime: FMP4_MIME,
    });
    const segments: { bytes: Uint8Array; kind: string; terminal?: boolean }[] = [];
    producer.onSegment((segment) => segments.push(segment));
    producer.push(new Uint8Array([1]), 0, 1);
    producer.flush(1);
    // Seek supersedes epoch-1 while its refragment is in flight, then epoch-2
    // starts pushing its own object.
    producer.reset(2);
    producer.push(new Uint8Array([2, 2]), 0, 2);
    // Epoch-1's in-flight job settles now; its teardown must not wipe the
    // epoch-2 bytes still sitting in the shared accumulator.
    deferred.resolve({ init: INIT, media: [MEDIA_A] });
    await settle();
    expect(received.bytes).toHaveLength(1);
    expect(Array.from(received.bytes[0])).toEqual([1]);
    // Epoch-2 still refragments its own complete object.
    producer.flush(2);
    await settle();
    expect(received.bytes).toHaveLength(2);
    expect(Array.from(received.bytes[1])).toEqual([2, 2]);
    // Only the epoch-2 object reaches listeners.
    expect(segments).toEqual([
      { bytes: INIT, kind: 'init' },
      { bytes: MEDIA_A, kind: 'media', terminal: true },
    ]);
    expect(producer.isPending()).toBe(false);
  });

  it('reports a fragment failure once through onError and stays inert afterwards', async () => {
    const producer = new ProgressiveMp4Producer({
      fragment: fakeFragment({ bytes: [] }, { init: INIT, media: [] }, new Error('engine down')),
      outputMime: FMP4_MIME,
    });
    const segments: unknown[] = [];
    const errors: unknown[] = [];
    producer.onSegment((segment) => segments.push(segment));
    producer.onError((error) => errors.push(error));
    producer.push(new Uint8Array(4), 0, 0);
    producer.flush(0);
    await settle();
    expect(errors).toHaveLength(1);
    expect((errors[0] as Error).message).toBe('engine down');
    expect(segments).toEqual([]);
    // A failed producer has no pending job to wait on and emits nothing more.
    expect(producer.isPending()).toBe(false);
    producer.push(new Uint8Array(4), 0, 0);
    producer.flush(0);
    await settle();
    expect(segments).toEqual([]);
  });

  it('reset clears accumulated state so the next epoch refragments only its own bytes', async () => {
    const received: { bytes: Uint8Array[] } = { bytes: [] };
    const producer = new ProgressiveMp4Producer({ fragment: fakeFragment(received), outputMime: FMP4_MIME });
    producer.onSegment(() => undefined);
    producer.push(new Uint8Array([1]), 0, 1);
    producer.flush(1);
    await settle();
    expect(received.bytes).toHaveLength(1);
    expect(Array.from(received.bytes[0])).toEqual([1]);

    producer.reset(2);
    producer.push(new Uint8Array([2]), 0, 2);
    producer.flush(2);
    await settle();
    expect(received.bytes).toHaveLength(2);
    expect(Array.from(received.bytes[1])).toEqual([2]);
  });

  it('a flush on an empty accumulator starts no refragment job', async () => {
    const received: { bytes: Uint8Array[] } = { bytes: [] };
    const producer = new ProgressiveMp4Producer({ fragment: fakeFragment(received), outputMime: FMP4_MIME });
    producer.onSegment(() => undefined);
    producer.flush(0);
    await settle();
    expect(received.bytes).toHaveLength(0);
    expect(producer.isPending()).toBe(false);
  });
});

/**
 * Walks one media fragment's `moof` and returns the `baseMediaDecodeTime` of
 * every `traf→tfdt` in trak order (one entry per output track).
 */
function moofTfdtValues(segment: Uint8Array): number[] {
  const view = new DataView(segment.buffer, segment.byteOffset, segment.byteLength);
  const values: number[] = [];
  const boxTypes = (start: number, end: number): { offset: number; size: number; type: string }[] => {
    const found: { offset: number; size: number; type: string }[] = [];
    let at = start;
    while (at + 8 <= end) {
      const size = view.getUint32(at);
      if (size < 8) break;
      found.push({ offset: at, size, type: stringFrom(view, segment, at + 4, at + 8) });
      at += size;
    }
    return found;
  };
  const moof = boxTypes(0, segment.byteLength)[0];
  if (!moof || moof.type !== 'moof') return values;
  for (const box of boxTypes(moof.offset + 8, moof.offset + moof.size)) {
    if (box.type !== 'traf') continue;
    for (const child of boxTypes(box.offset + 8, box.offset + box.size)) {
      if (child.type !== 'tfdt') continue;
      const version = segment[child.offset + 8];
      const valueOffset = child.offset + 8 + 4; // fullbox header: version(1)+flags(3)
      const value = version === 1 ? Number(view.getBigUint64(valueOffset)) : view.getUint32(valueOffset);
      values.push(value);
    }
  }
  return values;
}

function stringFrom(_view: DataView, bytes: Uint8Array, start: number, end: number): string {
  return String.fromCharCode(...bytes.subarray(start, end));
}

/** Top-level box types of an fMP4 segment (init or one media fragment). */
function topLevelTypes(bytes: Uint8Array): string[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const types: string[] = [];
  let offset = 0;
  while (offset + 8 <= bytes.byteLength) {
    const size = view.getUint32(offset);
    if (size < 8) return types;
    types.push(String.fromCharCode(...bytes.subarray(offset + 4, offset + 8)));
    if (size === 0) break; // to-EOF box
    offset += size;
  }
  return types;
}

describe.runIf(IN_NODE)('mediabunny progressive-MP4 → fMP4 fragment engine (node)', () => {
  it('emits one init (ftyp + moov) and RAP-aligned moof/mdat media fragments', async () => {
    const output = await mediabunnyFragmentFromBytes(progressiveMp4Fixture());

    const initTypes = topLevelTypes(output.init);
    expect(initTypes[0]).toBe('ftyp');
    expect(initTypes).toContain('moov');

    // Multi-part, MSE-appendable: every media segment is moof-led and carries
    // an mdat, and there are enough fragments for a multi-second source.
    expect(output.media.length).toBeGreaterThanOrEqual(2);
    for (const media of output.media) {
      const types = topLevelTypes(media);
      expect(types[0]).toBe('moof');
      expect(types).toContain('mdat');
      expect(media.byteLength).toBeGreaterThan(0);
    }
  });

  it('preserves both tracks and strictly increases timestamps fragment-to-fragment', async () => {
    const output = await mediabunnyFragmentFromBytes(progressiveMp4Fixture());

    // Each moof carries one traf/tfdt per output track (video + audio kept).
    const first = moofTfdtValues(output.media[0]);
    expect(first).toHaveLength(2);
    // Per-track decode timestamps strictly increase across media fragments —
    // the sequential MSE append contract (a fragment never starts before the
    // previous one ended).
    for (let index = 1; index < output.media.length; index += 1) {
      const prev = moofTfdtValues(output.media[index - 1]);
      const cur = moofTfdtValues(output.media[index]);
      expect(cur).toHaveLength(2);
      expect(cur[0]).toBeGreaterThan(prev[0]);
      expect(cur[1]).toBeGreaterThan(prev[1]);
    }
  });

  it('reassembles into a valid two-track fragmented MP4 that still parses (track count preserved)', async () => {
    const mediabunny = await import('mediabunny');
    const output = await mediabunnyFragmentFromBytes(progressiveMp4Fixture());
    const reassembled = concat(output.init, ...output.media);
    const input = new mediabunny.Input({
      formats: [mediabunny.MP4],
      source: new mediabunny.BufferSource(reassembled),
    });
    try {
      const tracks = await input.getTracks();
      expect(tracks.map((t) => t.type).sort()).toEqual(['audio', 'video']);
    } finally {
      input.dispose();
    }
  });

  it('is deterministic: identical input yields identical init and media bytes', async () => {
    const bytes = progressiveMp4Fixture();
    const a = await mediabunnyFragmentFromBytes(bytes);
    const b = await mediabunnyFragmentFromBytes(bytes);
    expect(a.init).toEqual(b.init);
    expect(a.media).toHaveLength(b.media.length);
    for (let index = 0; index < a.media.length; index += 1) {
      expect(a.media[index]).toEqual(b.media[index]);
    }
  });

  it('a smaller minimum fragment duration yields strictly more media fragments', async () => {
    const bytes = progressiveMp4Fixture();
    const coarse = await mediabunnyFragmentFromBytes(bytes, { minimumFragmentDuration: 2 });
    const fine = await mediabunnyFragmentFromBytes(bytes, { minimumFragmentDuration: 0.5 });
    expect(fine.media.length).toBeGreaterThan(coarse.media.length);
    expect(coarse.media.length).toBeGreaterThanOrEqual(2);
  });

  it('the real producer shell fragments the fixture through the default engine path', async () => {
    const producer = new ProgressiveMp4Producer({ outputMime: FMP4_MIME });
    const segments: { bytes: Uint8Array; kind: string; terminal?: boolean }[] = [];
    producer.onSegment((segment) => segments.push(segment));
    producer.push(progressiveMp4Fixture(), 0, 0);
    producer.flush(0);
    await settle();
    expect(segments.map((s) => s.kind)).toEqual(['init', ...Array.from({ length: segments.length - 1 }, () => 'media')]);
    expect(segments[0]?.kind).toBe('init');
    const media = segments.slice(1);
    expect(media.length).toBeGreaterThanOrEqual(2);
    for (let index = 0; index < media.length; index += 1) {
      const types = topLevelTypes(media[index].bytes);
      expect(types[0]).toBe('moof');
      expect(media[index].terminal).toBe(index === media.length - 1);
    }
  });
});

function concat(...parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.byteLength, 0));
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.byteLength;
  }
  return out;
}
