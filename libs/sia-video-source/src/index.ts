/**
 * `@lumeweb/sia-video-source` — a video.js v10 custom media element that plays
 * video stored on the Sia network: a dedicated worker fetches ranged bytes
 * through the Sia WASM SDK, converts them with mediabunny to fragmented MP4,
 * and feeds MSE (inside the worker where supported, on the main thread
 * otherwise).
 *
 * Main-thread entry: the `SiaVideoSource` host element and the shared wire
 * types. The worker entry lives behind the `/worker` subpath; a React wrapper
 * behind `/react`.
 */

export {
  type AppKeySeedProvider,
  decryptAppKeyEnvelope,
  encryptToWorker,
  exportWorkerPublicKey,
  generateWorkerKeyPair,
  scrub,
} from './app-key-handshake.ts';
export { type BrowserRuntime, detectBrowserCapabilities, type PlaybackCapabilities } from './capabilities/browser-capabilities.ts';
export {
  type CapabilityVerdict,
  capabilityVerdictForCodec,
  type CodecId,
} from './capabilities/codec-verdict.ts';
export { DEFAULT_ERROR_MESSAGES, MEDIA_ERROR_CODES, mediaErrorEvent, mediaErrorFromWorkerMessage } from './errors.ts';
export {
  type CancelledMediaLoad,
  inspectMediaLibrary,
  type InspectMediaLibraryOptions,
  type MediaLoadResult,
  type MediaPlayback,
  type ReadyMediaLoad,
  type UnsupportedMediaLoad,
  type UnsupportedReason,
} from './media/library-load.ts';
export {
  type ContainerKind,
  type MediaKind,
  type PlaybackTrack,
} from './media/types.ts';
export {
  type AppKeyEnvelope,
  type BufferWindow,
  GCM_IV_LENGTH,
  isAppKeyEnvelope,
  isWorkerToMainMessage,
  type MainToWorkerMessage,
  MainToWorkerMessageType,
  nextRequestId,
  PROTOCOL_VERSION,
  type RequestId,
  type SiaVideoMessage,
  type SourceInfo,
  WORKER_PUBLIC_KEY_LENGTH,
  WORKER_TO_MAIN_TYPES,
  type WorkerConfig,
  type WorkerErrorCode,
  type WorkerMode,
  type WorkerMsePreference,
  type WorkerToMainMessage,
  WorkerToMainMessageType,
} from './protocol.ts';
export { LruChunkCache, objectSize, RangedReader, ReadBudget, type ShardProgress, type SiaObjectLike, type SiaSdkLike } from './ranged-reader.ts';
export { type Clock, ManualClock, wallClock } from './session/clock.ts';
export {
  createErrorReporter,
  type ErrorReporter,
  type PlaybackFailure,
  workerErrorForFailure,
  type WorkerErrorReport,
} from './session/error-reporter.ts';
export {
  createLoadPipeline,
  type LoadPipeline,
  type LoadPipelineDeps,
  type LoadRequest,
  type LoadResult,
} from './session/load-pipeline.ts';
export {
  createSessionCoordinator,
  createSessionHandshake,
  defaultSupportsWorkerMse,
  type SessionCoordinator,
  type SessionCoordinatorDeps,
  type SessionHandshake,
  type PostMessage as SessionPostMessage,
  type SinkFactoryContext,
  WorkerComposition,
} from './session/session-coordinator.ts';
export {
  createSiaWorkerComposition,
  type SiaWorkerCompositionDeps,
} from './session/sia-composition.ts';
export {
  type SourceCapabilityFacts,
  sourceInfoFor,
} from './session/source-capabilities.ts';
export {
  createStreamController,
  type StreamController,
  type StreamControllerOptions,
  type StreamLoad,
  type StreamState,
} from './session/stream-controller.ts';
export {
  createWorkerMseRoot,
  type WorkerMseRoot,
  type WorkerMseRootOptions,
} from './session/worker-mse-root.ts';
export { isSiaShareUrl, parseSiaShareUrl, type SiaShareUrl } from './share-url.ts';
export { siaVideoDefaultProps, SiaVideoSource, type SiaVideoSourceOptions } from './sia-video-source.ts';
export { type AppendSink } from './sink/append-sink.ts';
export {
  createWorkerMseSinkFactory,
  MseAdapter,
  type MseAdapterOptions,
  type WorkerMseSinkFactoryDeps,
} from './sink/mse-adapter.ts';
export {
  type ByteRange,
  type ByteSource,
  ByteSourceSupersededError,
  emptyByteStream,
  LoadGenerationState,
  type ReadOptions,
  supersededStream,
  toSupersededError,
} from './transport/byte-source.ts';
export { MemoryByteSource } from './transport/memory-byte-source.ts';
export {
  createSiaByteSourceFactory,
  SiaByteSource,
  type SiaByteSourceFactoryOptions,
  type SiaByteSourceOptions,
  type SiaByteSourceSdk,
} from './transport/sia-byte-source.ts';
