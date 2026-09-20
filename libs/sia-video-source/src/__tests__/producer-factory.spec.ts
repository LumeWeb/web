/**
 * TDD contract for the producer-factory registry: the composition root turns
 * one load's classification (container + codecs + index presence + browser
 * capabilities) into the single `AppendableProducer` the stream controller
 * will feed.
 *
 * The factory is capability-aware: it keeps media-toolkit selection behind
 * interfaces — no toolkit types reach this registry. The default ladder
 * registers fMP4 → passthrough and TS → fMP4 remux; containers without a
 * registered producer (progressive mp4, webm, mkv) reject with a structured
 * `ProducerUnavailableError` (`verdict: producerVerdict.container`), never a
 * wild guess at a producer.
 *
 * Behaviors under test: ordered first-match-wins selection, codec check before
 * producer selection, MSE-append check for the producer's own codec-qualified
 * output MIME, structured rejection that identifies the failed check for the
 * host's unsupported-error mapping, and an injectable strategy list so
 * composition roots can register additional producers.
 */
import { describe, expect, it } from 'vitest';
import { detectBrowserCapabilities } from '../capabilities/browser-capabilities.ts';
import { capabilityVerdict, type CapabilityVerdict, type CodecId } from '../capabilities/codec-verdict.ts';
import type { AppendableProducer, ProducedSegment } from '../container/producer/appendable-producer.ts';
import { PassthroughProducer } from '../container/producer/passthrough-producer.ts';
import {
  createProducerFactory,
  PassthroughProducerStrategy,
  type ProducerContext,
  ProducerFactoryRegistry,
  producerId,
  type ProducerRejection,
  type ProducerSelection,
  type ProducerStrategy,
  ProducerUnavailableError,
  producerVerdict,
  TsToFmp4ProducerStrategy,
} from '../container/producer/producer-factory.ts';
import { TsToFmp4Producer } from '../container/producer/ts-to-fmp4-producer.ts';
import {
  type CodecDescriptor,
  containerKind,
  mediaKind,
  producerMode,
} from '../media/types.ts';
import { DEFAULT_FMP4_MIME } from '../protocol.ts';

const VIDEO: CodecDescriptor = { codec: 'avc1.640028', kind: mediaKind.video, mimeCodec: 'avc1.640028' };
const AUDIO: CodecDescriptor = { codec: 'mp4a.40.2', kind: mediaKind.audio, mimeCodec: 'mp4a.40.2' };
const FMP4_CODECS = [VIDEO, AUDIO] as const;
const FMP4_MIME = 'video/mp4; codecs="avc1.640028,mp4a.40.2"';

interface CapabilityOverrides {
  canConstructWorkerMse?: boolean;
  mayDecode?: (codec: CodecId) => CapabilityVerdict;
  mseSupported?: (mime: string) => boolean;
  webCodecsAvailable?: boolean;
  workerHandleAvailable?: boolean;
}

/** Deterministic capability stub: MSE accepts everything unless overridden. */
function capabilities(overrides: CapabilityOverrides = {}) {
  return {
    canConstructWorkerMse: () => overrides.canConstructWorkerMse ?? false,
    mayDecode: overrides.mayDecode ?? (() => capabilityVerdict['unknown-codec']),
    mseSupported: overrides.mseSupported ?? (() => true),
    webCodecsAvailable: () => overrides.webCodecsAvailable ?? false,
    workerHandleAvailable: () => overrides.workerHandleAvailable ?? false,
  };
}

/** Runs `fn` and returns what it throws; fails the test when nothing throws. */
function capture(fn: () => unknown): unknown {
  try {
    fn();
  } catch (error) {
    return error;
  }
  throw new Error('expected the factory to reject this load');
}

function context(partial: Partial<ProducerContext> = {}): ProducerContext {
  return {
    capabilities: partial.capabilities ?? capabilities(),
    codecs: partial.codecs ?? FMP4_CODECS,
    container: partial.container ?? containerKind.fmp4,
    indexAvailable: partial.indexAvailable ?? true,
    inputMime: partial.inputMime,
  };
}

describe('producer factory registry', () => {
  it('ships a default factory that registers passthrough before TS remux', () => {
    const factory = createProducerFactory();
    expect(factory).toBeInstanceOf(ProducerFactoryRegistry);
    expect((factory as ProducerFactoryRegistry).strategies.map((s) => s.id)).toEqual([producerId.passthrough, producerId.tsToFmp4]);
  });

  it('selects a passthrough producer for indexed fMP4 with codec-qualified MIME', () => {
    const factory = createProducerFactory();
    const selection = (factory as ProducerFactoryRegistry).select(context());

    expect(selection.reason).toBe(`producer:${producerId.passthrough}`);
    const producer = selection.producer;
    expect(producer).toBeInstanceOf(PassthroughProducer);
    expect(producer.mode).toBe(producerMode.passthrough);
    expect(producer.outputMime).toBe(FMP4_MIME);
  });

  it('create() returns the same producer the registry selected', () => {
    const factory = createProducerFactory();
    const producer = factory.create(context());
    expect(producer).toBeInstanceOf(PassthroughProducer);
    expect(producer.outputMime).toBe(FMP4_MIME);
  });

  it('selects a TS remux producer (normalized) with the pipeline fMP4 MIME', () => {
    const factory = createProducerFactory();
    const selection = (factory as ProducerFactoryRegistry).select(context({ codecs: [], container: containerKind.ts }));

    expect(selection.reason).toBe(`producer:${producerId.tsToFmp4}`);
    const producer = selection.producer;
    expect(producer).toBeInstanceOf(TsToFmp4Producer);
    expect(producer.mode).toBe(producerMode.normalized);
    expect(producer.outputMime).toBe(DEFAULT_FMP4_MIME);
  });

  it('prefers a caller input MIME for passthrough when it is MP4-flavoured and codec-qualified', () => {
    const declared = 'video/mp4; codecs="avc1.640032,mp4a.40.2"';
    const factory = createProducerFactory();
    const producer = factory.create(context({ inputMime: declared }));

    expect(producer).toBeInstanceOf(PassthroughProducer);
    expect(producer.outputMime).toBe(declared);
  });

  it('does not require index availability for passthrough (sequential fMP4 still passes through)', () => {
    const factory = createProducerFactory();
    const sequential = factory.create(context({ indexAvailable: false }));
    const indexed = factory.create(context({ indexAvailable: true }));
    expect(sequential).toBeInstanceOf(PassthroughProducer);
    expect(sequential.outputMime).toBe(indexed.outputMime);
  });

  it('exposes the winning producer through create() even for the second strategy', () => {
    const factory = createProducerFactory();
    const producer = factory.create(context({ codecs: [], container: containerKind.ts }));
    expect(producer).toBeInstanceOf(TsToFmp4Producer);
    expect(producer.mode).toBe(producerMode.normalized);
  });

  describe('capability-aware codec check (before producer selection)', () => {
    it('rejects a load whose codec the browser cannot decode', () => {
      const factory = createProducerFactory();
      const hevc: CodecDescriptor = { codec: 'hev1.1.6.L93.B0', kind: mediaKind.video, mimeCodec: 'hev1.1.6.L93.B0' };
      const error = capture(() =>
        factory.create(
          context({
            capabilities: capabilities({ mayDecode: (codec) => (codec === hevc.mimeCodec ? capabilityVerdict['not-decodable'] : capabilityVerdict['unknown-codec']) }),
            codecs: [hevc, AUDIO],
          }),
        ),
      );

      expect(error).toBeInstanceOf(ProducerUnavailableError);
      const e = error as ProducerUnavailableError;
      expect(e.verdict).toBe(producerVerdict.codec);
      expect(e.detail).toBe('codec:hev1.1.6.L93.B0');
      expect(e.container).toBe(containerKind.fmp4);
      expect(e.codecs.map((c) => c.mimeCodec)).toEqual(['hev1.1.6.L93.B0', 'mp4a.40.2']);
      expect(e.message).toContain('codec:hev1.1.6.L93.B0');
    });

    it('lets an unknown-codec verdict pass through (permissive default, like the worker)', () => {
      const factory = createProducerFactory();
      const producer = factory.create(context({ capabilities: capabilities({ mayDecode: () => capabilityVerdict['unknown-codec'] }) }));
      expect(producer).toBeInstanceOf(PassthroughProducer);
    });

    it('rejects when the browser cannot MSE-append the producer output MIME', () => {
      const factory = createProducerFactory();
      const error = capture(() =>
        factory.create(context({ capabilities: capabilities({ mseSupported: (mime) => mime !== FMP4_MIME }) })),
      );

      expect(error).toBeInstanceOf(ProducerUnavailableError);
      const e = error as ProducerUnavailableError;
      expect(e.verdict).toBe(producerVerdict.codec);
      expect(e.detail).toBe(`mime-not-supported:${FMP4_MIME}`);
    });

    it('rejects TS when the browser cannot MSE-append the fMP4 remux output', () => {
      const factory = createProducerFactory();
      const error = capture(() =>
        factory.create(context({ capabilities: capabilities({ mseSupported: () => false }), codecs: [], container: containerKind.ts })),
      );

      expect(error).toBeInstanceOf(ProducerUnavailableError);
      const e = error as ProducerUnavailableError;
      expect(e.verdict).toBe(producerVerdict.codec);
      expect(e.detail).toBe(`mime-not-supported:${DEFAULT_FMP4_MIME}`);
    });
  });

  describe('structured container rejection (containers outside the default ladder)', () => {
    for (const container of [containerKind.mp4, containerKind.webm, containerKind.mkv, containerKind.unknown] as const) {
      it(`rejects ${container} with a structured container rejection`, () => {
        const factory = createProducerFactory();
        const error = capture(() => factory.create(context({ codecs: FMP4_CODECS, container })));

        expect(error).toBeInstanceOf(ProducerUnavailableError);
        const e = error as ProducerUnavailableError;
        expect(e.verdict).toBe(producerVerdict.container);
        expect(e.detail).toBe(`container:${container}`);
        expect(e.container).toBe(container);
      });
    }
  });

  describe('ordered first-match-wins strategy selection', () => {
    it('lets an earlier registered strategy win over a later one', () => {
      const sentinel = () => {
        const seen: ProducedSegment[] = [];
        return {
          flush: () => undefined,
          mode: producerMode.normalized,
          onError: () => () => undefined,
          onSegment: (_listener: (segment: ProducedSegment) => void) => () => undefined,
          outputMime: 'video/mp4; codecs="custom"',
          push: () => undefined,
          reportError: () => undefined,
          reset: () => undefined,
          segments: seen,
        } as unknown as AppendableProducer;
      };
      const custom: ProducerStrategy = {
        id: 'custom-mp4',
        mode: producerMode.normalized,
        // Wins for progressive mp4 (the mediabunny refragmenter).
        select: (ctx: ProducerContext): ProducerRejection | ProducerSelection => {
          if (ctx.container !== containerKind.mp4) return { detail: `container:${ctx.container}`, verdict: producerVerdict.container };
          return { producer: sentinel(), reason: 'producer:custom-mp4' };
        },
      };
      const factory = new ProducerFactoryRegistry([custom, new PassthroughProducerStrategy(), new TsToFmp4ProducerStrategy()]);

      // First match wins for mp4, while fmp4/ts still fall through to the defaults.
      expect(factory.select(context({ container: containerKind.mp4 })).reason).toBe('producer:custom-mp4');
      expect(factory.select(context()).reason).toBe(`producer:${producerId.passthrough}`);
      expect(factory.select(context({ codecs: [], container: containerKind.ts })).reason).toBe(`producer:${producerId.tsToFmp4}`);
    });

    it('surfaces the first strategy rejection when none can serve (codec check wins over container)', () => {
      const codecOnly: ProducerStrategy = {
        id: 'codec-only',
        mode: producerMode.native,
        select: (ctx: ProducerContext): ProducerRejection | ProducerSelection => {
          if (ctx.container !== containerKind.webm) return { detail: `container:${ctx.container}`, verdict: producerVerdict.container };
          if (ctx.codecs.length === 0) return { detail: 'codec:missing', verdict: producerVerdict.codec };
          return { producer: new PassthroughProducer(), reason: 'producer:codec-only' };
        },
      };
      // webm with zero codecs: the only matching strategy rejects on codec, so
      // the registry reports the codec check instead of a bare container rejection.
      const factory = new ProducerFactoryRegistry([codecOnly]);
      const error = capture(() => factory.create(context({ codecs: [], container: containerKind.webm })));

      expect(error).toBeInstanceOf(ProducerUnavailableError);
      expect((error as ProducerUnavailableError).verdict).toBe(producerVerdict.codec);
      expect((error as ProducerUnavailableError).detail).toBe('codec:missing');
    });

    it('rejects an empty strategy list at construction (composition-root guard)', () => {
      expect(() => new ProducerFactoryRegistry([])).toThrow(/at least one/i);
    });
  });

  describe('default strategy seams', () => {
    it('passthrough strategy reports its id and mode', () => {
      const strategy = new PassthroughProducerStrategy();
      expect(strategy.id).toBe(producerId.passthrough);
      expect(strategy.mode).toBe(producerMode.passthrough);
    });

    it('ts strategy reports its id and mode', () => {
      const strategy = new TsToFmp4ProducerStrategy();
      expect(strategy.id).toBe(producerId.tsToFmp4);
      expect(strategy.mode).toBe(producerMode.normalized);
    });

    it('degrades to a structured MSE rejection when capabilities report no MSE', () => {
      // A real `PlaybackCapabilities` snapshot built from an empty runtime has
      // no `MediaSource`, so `mseSupported` is false for every candidate MIME
      // — deterministically, in both node and browser tests. That is exactly
      // the capability-aware path the factory must take: a structured `codec`
      // (MIME) rejection, never a vaguely worded container error.
      const detected = detectBrowserCapabilities({});
      const factory = createProducerFactory();
      const error = capture(() => factory.create(context({ capabilities: detected })));

      expect(error).toBeInstanceOf(ProducerUnavailableError);
      expect((error as ProducerUnavailableError).verdict).toBe(producerVerdict.codec);
      expect((error as ProducerUnavailableError).detail).toContain('mime-not-supported:');
    });
  });
});
