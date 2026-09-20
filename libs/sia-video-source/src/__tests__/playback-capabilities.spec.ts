import { describe, expect, it } from 'vitest';
import { detectBrowserCapabilities } from '../capabilities/browser-capabilities.ts';
import { capabilityVerdict, capabilityVerdictForCodec, type CodecId } from '../capabilities/codec-verdict.ts';

describe('browser playback capabilities', () => {
  it('reports MSE and worker-MSE features from the supplied runtime', () => {
    const capabilities = detectBrowserCapabilities({
      AudioDecoder: class AudioDecoder {},
      MediaSource: {
        canConstructInDedicatedWorker: true,
        isTypeSupported: (mime: string) => mime === 'video/mp4; codecs="avc1.640028"',
      },
      MediaSourceHandle: class MediaSourceHandle {},
      VideoDecoder: class VideoDecoder {},
    });

    expect(capabilities.mseSupported('video/mp4; codecs="avc1.640028"')).toBe(true);
    expect(capabilities.mseSupported('video/webm; codecs="vp09.00.10.08"')).toBe(false);
    expect(capabilities.canConstructWorkerMse()).toBe(true);
    expect(capabilities.workerHandleAvailable()).toBe(true);
    expect(capabilities.webCodecsAvailable()).toBe(true);
  });

  it('does not claim WebCodecs support when either decoder is absent', () => {
    const capabilities = detectBrowserCapabilities({
      AudioDecoder: undefined,
      MediaSourceHandle: undefined,
      VideoDecoder: class VideoDecoder {},
    });

    expect(capabilities.webCodecsAvailable()).toBe(false);
  });
});

describe('codec capability verdict', () => {
  it('distinguishes appendable, normalizable, and unsupported codecs', () => {
    const appendable = new Set<CodecId>(['avc1.640028']);
    const normalizable = new Set<CodecId>(['vp09.00.10.08']);

    expect(capabilityVerdictForCodec('avc1.640028', appendable, normalizable)).toBe(capabilityVerdict['decodable-and-appendable']);
    expect(capabilityVerdictForCodec('vp09.00.10.08', appendable, normalizable)).toBe(capabilityVerdict['decodable-not-appendable']);
    expect(capabilityVerdictForCodec('hev1.1.6.L93.B0', appendable, normalizable)).toBe(capabilityVerdict['not-decodable']);
    expect(capabilityVerdictForCodec('', appendable, normalizable)).toBe(capabilityVerdict['unknown-codec']);
  });
});
