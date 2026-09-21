/**
 * Progressive-MP4 normalized-producer strategy: the producer-factory strategy
 * the composition root registers so container `'mp4'` is served through the
 * mediabunny fragment producer instead of the structured container rejection.
 * There is no capability check to fall through — mediabunny is the only engine — so the
 * selection only checks the container and the MSE-append capability of the
 * codec-qualified fMP4 output MIME (design convention: capability checks run
 * before bulk I/O; a browser that cannot append the output MIME is a codec
 * rejection, not a container one).
 *
 * Registered at composition roots (the session coordinator ships it) rather
 * than in the default `createProducerFactory()` ladder, which keeps the
 * default mapping (`passthrough`, `ts-to-fmp4`) unchanged for existing
 * fMP4/TS loads.
 */
import { containerKind, producerMode } from '../../media/legacy-types.ts';
import { fmp4MimeForCodecs, type ProducerContext, producerId, type ProducerRejection, type ProducerSelection, type ProducerStrategy, producerVerdict } from './producer-factory.ts';
import { ProgressiveMp4Producer } from './progressive-mp4-producer.ts';

export class ProgressiveMp4ProducerStrategy implements ProducerStrategy {
  readonly id = producerId.progressiveMp4;
  readonly mode = producerMode.normalized;

  select(context: ProducerContext): ProducerRejection | ProducerSelection {
    if (context.container !== containerKind.mp4) {
      return { detail: `container:${context.container}`, verdict: producerVerdict.container };
    }
    const mime = fmp4MimeForCodecs(context.codecs);
    if (!context.capabilities.mseSupported(mime)) {
      return { detail: `mime-not-supported:${mime}`, verdict: producerVerdict.codec };
    }
    return {
      producer: new ProgressiveMp4Producer({ outputMime: mime }),
      reason: `producer:${producerId.progressiveMp4}`,
    };
  }
}
