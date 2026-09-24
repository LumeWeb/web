import { capabilityVerdict, type CapabilityVerdict, type CodecId } from './codec-verdict.ts';
import {
  detectMseRuntime,
  type MseCtorLike,
  type MseRuntimeSnapshot,
  resolveMseCtor,
} from './mse-runtime.ts';

export interface BrowserRuntime {
  AudioDecoder?: unknown;
  ManagedMediaSource?: MseCtorLike;
  MediaSource?: MseCtorLike;
  MediaSourceHandle?: unknown;
  VideoDecoder?: unknown;
  WebKitMediaSource?: MseCtorLike;
}

export interface PlaybackCapabilities {
  canConstructWorkerMse(): boolean;
  mayDecode(codec: CodecId): CapabilityVerdict;
  mseImpl(): MseRuntimeSnapshot;
  mseSupported(mime: string): boolean;
  webCodecsAvailable(): boolean;
  workerHandleAvailable(): boolean;
}

/** Creates a synchronous, side-effect-free capability snapshot for one runtime. */
export function detectBrowserCapabilities(runtime: BrowserRuntime = globalThis): PlaybackCapabilities {
  // Resolve the strongest MSE constructor once so MIME probing and the worker
  // capability read the SAME impl — on iPhone Safari 17.1+ that is
  // `ManagedMediaSource`, which is the only surface with an `isTypeSupported`.
  const resolved = resolveMseCtor(runtime);

  return {
    canConstructWorkerMse() {
      return resolved?.ctor.canConstructInDedicatedWorker === true;
    },
    mayDecode() {
      return capabilityVerdict['unknown-codec'];
    },
    mseImpl() {
      return detectMseRuntime(runtime);
    },
    mseSupported(mime) {
      try {
        return resolved?.ctor.isTypeSupported?.(mime) === true;
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
