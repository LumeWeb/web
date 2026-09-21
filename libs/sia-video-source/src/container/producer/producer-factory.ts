/**
 * Producer-factory contract: the composition-root registry that turns one
 * load's classification — container, codecs, index presence, and the
 * browser's playback capabilities — into the single `AppendableProducer` the
 * stream controller will feed.
 *
 * Selection is capability-aware and ordered: the codec check runs before any
 * strategy is consulted (a codec the browser cannot decode is rejected before
 * bulk media I/O), then strategies are tried in registration order and the
 * first match wins. Every producer stays behind the `AppendableProducer` seam
 * and every media-toolkit dependency stays behind its own adapter — no
 * toolkit type reaches this registry, and nothing here imports the Sia SDK.
 *
 * The default `createProducerFactory()` ladder registers fMP4 passthrough and
 * TS→fMP4 remux; the composition root appends the mediabunny progressive-MP4
 * and native-WebM strategies. Containers with no registered strategy reject
 * with a structured `ProducerUnavailableError` (`verdict:
 * producerVerdict.container`) instead of guessing a producer that does not
 * exist yet.
 */

import { capabilityVerdict, type CodecId } from '../../capabilities/codec-verdict.ts';
import type { PlaybackCapabilities } from '../../capabilities/browser-capabilities.ts';
import { type CodecDescriptor, containerKind, type ContainerKind, producerMode, type ProducerMode } from '../../media/legacy-types.ts';
import { DEFAULT_FMP4_MIME } from '../../protocol.ts';
import { webmMimeForCodecs } from '../webm/webm-codecs.ts';
import { WebmNativeProducer } from '../webm/webm-native-producer.ts';
import type { AppendableProducer } from './appendable-producer.ts';
import { PassthroughProducer } from './passthrough-producer.ts';
import { TsToFmp4Producer } from './ts-to-fmp4-producer.ts';

/**
 * Everything the factory needs to know about one load, independent of how the
 * bytes were produced (container + codecs + indexPresence + capabilities).
 * Fields are read-only so selection is a pure decision.
 */
export interface ProducerContext {
  /** Browser capability snapshot (MSE/MIME/codec verdicts) for this load. */
  readonly capabilities: PlaybackCapabilities;
  /** Codecs discovered on the object, in track order (video then audio). */
  readonly codecs: readonly CodecDescriptor[];
  /** Container family the classifier reported. */
  readonly container: ContainerKind;
  /**
   * True once a usable random-access index (sidx / stbl / Cues / …) exists.
   * Informational for passthrough fMP4 (playable sequentially without an
   * index); load-bearing for producers that key on index presence.
   */
  readonly indexAvailable: boolean;
  /**
   * A caller-declared type for the object, when one exists (e.g. the `type`
   * attribute on a `<source>` tag). Producers use it only when it genuinely
   * describes the append format (MP4-flavoured and codec-qualified).
   */
  readonly inputMime?: string;
}

/** The seam the stream controller / load pipeline depend on. */
export interface ProducerFactory {
  /**
   * Returns the producer for this load, or throws a structured
   * {@link ProducerUnavailableError} identifying the failed check.
   */
  create(context: ProducerContext): AppendableProducer;
}

/** Which eligibility check rejected a load (unsupported-reason vocabulary). */
export const producerVerdict = {
  codec: 'codec',
  container: 'container',
  layout: 'layout',
} as const;

export type ProducerVerdict = (typeof producerVerdict)[keyof typeof producerVerdict];

/** Stable strategy identifiers (see `ProducerStrategy.id` / `ProducerSelection.reason`). */
export const producerId = {
  passthrough: 'passthrough',
  progressiveMp4: 'progressive-mp4',
  tsToFmp4: 'ts-to-fmp4',
  webmNative: 'webm-native',
} as const;

export type ProducerId = (typeof producerId)[keyof typeof producerId];

/** Structured rejection of one strategy, for the registry's error synthesis. */
export interface ProducerRejection {
  readonly detail: string;
  readonly verdict: ProducerVerdict;
}

/** A winning strategy: the producer plus a stable diagnostic reason. */
export interface ProducerSelection {
  readonly producer: AppendableProducer;
  /** Stable diagnostic id, e.g. `producer:passthrough` (telemetry/debug). */
  readonly reason: string;
}

/**
 * One candidate producer family in the registry. Strategies are pure: `select`
 * either matches the load (returning a ready producer) or says why not. The
 * registry tries them in registration order and the first match wins.
 */
export interface ProducerStrategy {
  /** Stable identifier used in `ProducerSelection.reason` and tests. */
  readonly id: string;
  /** The `ProducerMode` the selected producer reports. */
  readonly mode: ProducerMode;
  /** Matches the load, or returns the reason this strategy cannot serve it. */
  select(context: ProducerContext): ProducerRejection | ProducerSelection;
}

/** Constructor bag for {@link ProducerUnavailableError}. */
export interface ProducerUnavailableErrorOptions {
  readonly codecs: readonly CodecDescriptor[];
  readonly container: ContainerKind;
  readonly detail: string;
  readonly verdict: ProducerVerdict;
}

/**
 * fMP4 passthrough strategy: the object already speaks the MSE append format,
 * so bytes flow through unchanged; the strategy only checks the browser can
 * MSE-append the producer's codec-qualified output MIME.
 */
export class PassthroughProducerStrategy implements ProducerStrategy {
  readonly id = producerId.passthrough;
  readonly mode: ProducerMode = producerMode.passthrough;

  select(context: ProducerContext): ProducerRejection | ProducerSelection {
    if (context.container !== containerKind.fmp4) {
      return { detail: `container:${context.container}`, verdict: producerVerdict.container };
    }
    const outputMime = passthroughMime(context);
    if (!context.capabilities.mseSupported(outputMime)) {
      // The container is right but this browser cannot append the MIME —
      // an MSE/codec check rejection, not a container one.
      return { detail: `mime-not-supported:${outputMime}`, verdict: producerVerdict.codec };
    }
    return { producer: new PassthroughProducer({ outputMime }), reason: `producer:${producerId.passthrough}` };
  }
}

/**
 * Ordered producer registry: the composition root registers concrete
 * strategies; `select`/`create` run the codec check first, then try
 * strategies in registration order. When nothing
 * matches, the registry synthesizes the most specific structured rejection —
 * a strategy's `codec` rejection beats its `container` one, and a bare
 * unknown container degrades to `container:<name>`.
 */
export class ProducerFactoryRegistry implements ProducerFactory {
  /** Registered strategies in best-effort order (first match wins). */
  readonly strategies: readonly ProducerStrategy[];

  constructor(strategies: readonly ProducerStrategy[]) {
    if (strategies.length === 0) {
      throw new Error('ProducerFactoryRegistry requires at least one producer strategy');
    }
    this.strategies = strategies;
  }

  create(context: ProducerContext): AppendableProducer {
    return this.select(context).producer;
  }

  /**
   * Selects the producer for this load, throwing
   * {@link ProducerUnavailableError} when none can serve it. Kept on the
   * concrete registry (not the interface) as the richer variant `create`
   * delegates to, so the load pipeline can expose the winning reason for
   * `SOURCE_OK` telemetry.
   */
  select(context: ProducerContext): ProducerSelection {
    // Codec check precedes strategy selection: a codec the
    // browser explicitly cannot decode is a hard `codec` rejection before any
    // producer family is considered. `unknown-codec` verdicts stay permissive
    // so an unprobed object still reaches the MSE-append check.
    const undecodable = context.codecs.find((codec) => context.capabilities.mayDecode(codec.mimeCodec as CodecId) === capabilityVerdict['not-decodable']);
    if (undecodable) {
      throw new ProducerUnavailableError({
        codecs: context.codecs,
        container: context.container,
        detail: `codec:${undecodable.mimeCodec}`,
        verdict: producerVerdict.codec,
      });
    }

    const rejections: ProducerRejection[] = [];
    for (const strategy of this.strategies) {
      const result = strategy.select(context);
      if ('producer' in result) return result;
      rejections.push(result);
    }

    const codecRejection = rejections.find((rejection) => rejection.verdict === producerVerdict.codec);
    const failure =
      codecRejection ??
      rejections[0] ??
      ({ detail: `container:${context.container}`, verdict: producerVerdict.container } satisfies ProducerRejection);

    throw new ProducerUnavailableError({
      codecs: context.codecs,
      container: context.container,
      detail: failure.detail,
      verdict: failure.verdict,
    });
  }
}

/**
 * Structured "no producer for this load" failure. Carries the verdict plus the
 * context needed to build the host's unsupported error (`container`,
 * `codecs`), so the load pipeline can report `container:<name>` or
 * `codec:<name>` accurately — never a generic playback failure.
 */
export class ProducerUnavailableError extends Error {
  readonly codecs: readonly CodecDescriptor[];
  readonly container: ContainerKind;
  readonly detail: string;
  readonly name = 'ProducerUnavailableError';
  readonly verdict: ProducerVerdict;

  constructor(options: ProducerUnavailableErrorOptions) {
    super(options.detail);
    this.codecs = options.codecs;
    this.container = options.container;
    this.detail = options.detail;
    this.verdict = options.verdict;
  }
}

/**
 * TS→fMP4 remux strategy (mux.js). The remux vouches for the H.264+AAC
 * output, so the only capability check is whether the browser can MSE-append
 * the pipeline fMP4 MIME. The mux.js dependency stays internal to
 * `TsToFmp4Producer`.
 */
export class TsToFmp4ProducerStrategy implements ProducerStrategy {
  readonly id = producerId.tsToFmp4;
  readonly mode: ProducerMode = producerMode.normalized;

  select(context: ProducerContext): ProducerRejection | ProducerSelection {
    if (context.container !== containerKind.ts) {
      return { detail: `container:${context.container}`, verdict: producerVerdict.container };
    }
    if (!context.capabilities.mseSupported(DEFAULT_FMP4_MIME)) {
      return { detail: `mime-not-supported:${DEFAULT_FMP4_MIME}`, verdict: producerVerdict.codec };
    }
    return { producer: new TsToFmp4Producer(), reason: `producer:${producerId.tsToFmp4}` };
  }
}

/**
 * Native-WebM strategy: WebM appends as-is in browsers whose MSE supports its
 * codecs (`ProducerMode 'native'`), so this strategy only checks the browser
 * can MSE-append the codec-qualified `video/webm` MIME derived from the
 * object's Tracks element, then hands the bytes through unchanged via
 * `WebmNativeProducer`. Registered at composition roots (the session
 * coordinator ships it) rather than in the default `createProducerFactory()`
 * ladder, which keeps the default fMP4/TS mappings unchanged.
 */
export class WebmNativeProducerStrategy implements ProducerStrategy {
  readonly id = producerId.webmNative;
  readonly mode: ProducerMode = producerMode.native;

  select(context: ProducerContext): ProducerRejection | ProducerSelection {
    if (context.container !== containerKind.webm) {
      return { detail: `container:${context.container}`, verdict: producerVerdict.container };
    }
    const outputMime = webmMimeForCodecs(context.codecs);
    if (!context.capabilities.mseSupported(outputMime)) {
      // The container is right but this browser cannot append WebM with these
      // codecs — an MSE/codec check rejection, not a container one.
      return { detail: `mime-not-supported:${outputMime}`, verdict: producerVerdict.codec };
    }
    return { producer: new WebmNativeProducer({ outputMime }), reason: `producer:${producerId.webmNative}` };
  }
}

/**
 * Composition-root convenience for the default ladder (passthrough before TS
 * remux). The composition root may pass its own strategy list instead to
 * register the mediabunny progressive-MP4 and native-WebM strategies it
 * serves.
 */
export function createProducerFactory(
  strategies: readonly ProducerStrategy[] = [new PassthroughProducerStrategy(), new TsToFmp4ProducerStrategy()],
): ProducerFactory {
  return new ProducerFactoryRegistry(strategies);
}

/** `video/mp4; codecs="…"` from RFC 6381 codecs, or bare `video/mp4` when absent. */
export function fmp4MimeForCodecs(codecs: readonly CodecDescriptor[]): string {
  const joined = codecs.map((codec) => codec.mimeCodec).join(',');
  return joined ? `video/mp4; codecs="${joined}"` : 'video/mp4';
}

/**
 * Output MIME for the passthrough case, mirroring the worker's
 * `muxMimeForContainer`: a caller-declared MP4-flavoured, codec-qualified type
 * wins; otherwise the codecs sniffed from the object's own init segment; and
 * finally the bare container type. Never a TS/WebM-flavoured declared type,
 * which cannot describe the actual append format.
 */
function passthroughMime(context: ProducerContext): string {
  const { inputMime } = context;
  if (inputMime && /mp4/i.test(inputMime) && inputMime.includes('codecs=')) return inputMime;
  if (context.codecs.length > 0) return fmp4MimeForCodecs(context.codecs);
  return 'video/mp4';
}
