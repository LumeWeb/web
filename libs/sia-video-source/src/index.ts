/**
 * `@lumeweb/sia-video-source` — a video.js v10 custom media element that plays
 * video stored on the Sia network: a dedicated worker fetches ranged bytes
 * through the Sia WASM SDK, converts them with mediabunny to fragmented MP4,
 * and feeds MSE (inside the worker where supported, on the main thread
 * otherwise).
 *
 * Main-thread entry: the `SiaVideoSource` host element, the shared wire
 * types, and the Video.js v10 recovery, load-acceptance and source-info
 * player features (`siaRecoveryFeature` / `siaLoadFeature` /
 * `siaSourceInfoFeature`) that mirror the host's typed
 * `sia-recovery-change` / `sia-load-change` / `sia-source-info-change` events
 * into a player store (read via `selectSiaRecovery` / `selectSiaLoad` /
 * `selectSiaSourceInfo`, or the React `useSiaRecovery` / `useSiaLoad` /
 * `useSiaSourceInfo` hooks behind `/react`). `siaFeatures` is the shared
 * mutable tuple of all three features
 * (`[siaRecoveryFeature, siaLoadFeature, siaSourceInfoFeature]`) for consumer
 * composition — the same tuple feeds non-React `combine(...)` and React
 * `createPlayer({ features: siaFeatures })`. The worker entry lives behind
 * the `/worker` subpath; a React wrapper behind `/react`.
 *
 * Logging is pluggable through the dependency-free `Logger` interface: pass a
 * `logger` to the host (or the React wrapper's `logger` prop) and re-level it
 * at runtime, and opt in to coarse worker milestone `LOG` events over the
 * `/worker` wire via the host's HELLO log threshold.
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
  createConsoleLogger,
  LOG_LEVELS,
  type LogFields,
  type Logger,
  type LogLevel,
  type LogLevelFilter,
  logLevelRank,
  nullLogger,
} from './log/logger.ts';
export { type LoglevelLike, wrapLoglevel } from './log/loglevel.ts';
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
  WORKER_LOG_EVENT_NAMES,
  WORKER_PUBLIC_KEY_LENGTH,
  WORKER_TO_MAIN_TYPES,
  type WorkerConfig,
  type WorkerErrorCode,
  type WorkerLogEventName,
  workerLogLevel,
  type WorkerLogLevel,
  type WorkerMode,
  type WorkerMsePreference,
  type WorkerToMainMessage,
  WorkerToMainMessageType,
} from './protocol.ts';
export { DEFAULT_SDK_READ_CONCURRENCY, isTransportReadError, LruChunkCache, objectSize, RangedReader, ReadBudget, ReadTransportError, type ShardProgress, type SiaObjectLike, type SiaSdkLike } from './ranged-reader.ts';
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
export { type SiaFeatures, siaFeatures } from './sia-features.ts';
export {
  selectSiaLoad,
  siaLoadFeature,
  type SiaLoadState,
} from './sia-load-feature.ts';
export {
  selectSiaProgress,
  siaProgressFeature,
  type SiaProgressState,
} from './sia-progress-feature.ts';
export {
  selectSiaRecovery,
  siaRecoveryFeature,
  type SiaRecoveryState,
} from './sia-recovery-feature.ts';
export {
  selectSiaSourceInfo,
  siaSourceInfoFeature,
  type SiaSourceInfoState,
} from './sia-source-info-feature.ts';
export {
  forwardWorkerLog,
  logThresholdFor,
  type RecoveryChangeDetail,
  siaLoadChange,
  type SiaLoadChangeDetail,
  siaRecoveryChange,
  siaSourceInfoChange,
  type SiaSourceInfoChangeDetail,
  siaVideoDefaultProps,
  SiaVideoSource,
  type SiaVideoSourceOptions,
  siaWorkerMilestoneChange,
  type SiaWorkerMilestoneDetail,
} from './sia-video-source.ts';
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
