/**
 * `@lumeweb/sia-video-source` — a video.js v10 custom media element that plays
 * video stored on the Sia network: a dedicated worker fetches ranged bytes
 * through the Sia WASM SDK, probes/remuxes them to fragmented MP4, and feeds
 * MSE (inside the worker where supported, on the main thread otherwise).
 *
 * Main-thread entry: the `SiaVideoSource` host element and the shared wire
 * types. The worker entry lives behind the `/worker` subpath; a React wrapper
 * behind `/react`.
 */

export { type ContainerKind, sniffContainer } from './container-probe.ts';
export { DEFAULT_ERROR_MESSAGES, MEDIA_ERROR_CODES, mediaErrorEvent, mediaErrorFromWorkerMessage } from './errors.ts';
export {
  type BufferWindow,
  isWorkerToMainMessage,
  type MainToWorkerMessage,
  nextRequestId,
  PROTOCOL_VERSION,
  type RequestId,
  type SiaVideoMessage,
  type SourceInfo,
  WORKER_TO_MAIN_TYPES,
  type WorkerConfig,
  type WorkerErrorCode,
  type WorkerMode,
  type WorkerToMainMessage,
} from './protocol.ts';
export { LruChunkCache, objectSize, RangedReader, type ShardProgress, type SiaObjectLike, type SiaSdkLike } from './ranged-reader.ts';
export { siaVideoDefaultProps, SiaVideoSource, type SiaVideoSourceOptions } from './sia-video-source.ts';
