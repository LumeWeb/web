import { capabilityVerdict, type CapabilityVerdict, type CodecId } from './codec-verdict.ts';

export interface BrowserRuntime {
  AudioDecoder?: unknown;
  MediaSource?: {
    canConstructInDedicatedWorker?: boolean;
    isTypeSupported?: (mime: string) => boolean;
  };
  MediaSourceHandle?: unknown;
  VideoDecoder?: unknown;
}

export interface PlaybackCapabilities {
  canConstructWorkerMse(): boolean;
  mayDecode(codec: CodecId): CapabilityVerdict;
  mseSupported(mime: string): boolean;
  webCodecsAvailable(): boolean;
  workerHandleAvailable(): boolean;
}

/** Creates a synchronous, side-effect-free capability snapshot for one runtime. */
export function detectBrowserCapabilities(runtime: BrowserRuntime = globalThis): PlaybackCapabilities {
  const mediaSource = runtime.MediaSource;

  return {
    canConstructWorkerMse() {
      return mediaSource?.canConstructInDedicatedWorker === true;
    },
    mayDecode() {
      return capabilityVerdict['unknown-codec'];
    },
    mseSupported(mime) {
      try {
        return mediaSource?.isTypeSupported?.(mime) === true;
      } catch {
        return false;
      }
    },
    webCodecsAvailable() {
      return runtime.AudioDecoder !== undefined && runtime.VideoDecoder !== undefined;
    },
    workerHandleAvailable() {
      return runtime.MediaSourceHandle !== undefined;
    },
  };
}
