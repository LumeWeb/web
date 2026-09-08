/**
 * Wire protocol between the main thread (`SiaVideoSource`) and the dedicated
 * Sia video worker.
 *
 * The worker resolves the pinned object, streams bytes, probes the container,
 * remuxes to fragmented MP4 when needed, and (where the browser supports it)
 * owns MSE itself. Every main→worker message that can fail or finish carries a
 * `requestId`; the worker echoes it on the corresponding reply, `CHUNK`,
 * `PROGRESS`, and `ERROR` messages, so a superseded load can be told apart
 * from the one that replaced it.
 */

import type { AppMetadata } from '@siafoundation/sia-storage';

/** Wire protocol version; 0 is the initial, unreleased protocol. */
export const PROTOCOL_VERSION = 0;

/**
 * Codec set produced by the mux.js TS→fMP4 pipeline (H.264 + AAC). Shared by
 * the worker (which appends with it) and the host (whose main-thread MSE
 * fallback needs the same MIME), so the wire contract cannot drift apart.
 */
export const DEFAULT_FMP4_MIME = 'video/mp4; codecs="avc1.640028,mp4a.40.2"';

export type RequestId = number;

let requestIdCounter = 0;

/** A buffered media window in seconds, as a TimeRanges pair. */
export interface BufferWindow {
  readonly end: number;
  readonly start: number;
}

/** Main → worker. */
export type MainToWorkerMessage =
  | {
      /** Required with the default worker SDK factory; ignored when the app injected its own. */
      readonly config?: WorkerConfig;
      readonly requestId: RequestId;
      readonly type: 'HELLO';
    }
  | {
      /** The `type` field from the v10 `MediaSourceCapability` source contract; named to avoid the discriminator. */
      readonly mimeType?: string;
      /** Whether full-stream delivery may start immediately; see `preload` on the native element. */
      readonly preload?: 'auto' | 'metadata' | 'none';
      readonly requestId: RequestId;
      readonly src: string;
      readonly type: 'SOURCE';
    }
  | { readonly requestId: RequestId; readonly time: number; readonly type: 'SEEK'; }
  | { readonly requestId: RequestId; readonly type: 'ATTACH'; }
  | { readonly requestId: RequestId; readonly type: 'PLAY'; }
  | { readonly type: 'DESTROY' }
  | { readonly type: 'DETACH' };

export type SiaVideoMessage = MainToWorkerMessage | WorkerToMainMessage;

/** What the worker knows about the accepted source after probing. */
export interface SourceInfo {
  readonly container: string;
  /** Media duration in seconds when it can vouch for one, else `null`. */
  readonly durationSeconds: null | number;
  /** MSE-ready MIME type the worker will append with (or hands the host for fallback appends). */
  readonly mime: string;
  /** MSE construction site for this play session. */
  readonly mode: WorkerMode;
}

/**
 * Connection material handed over in `HELLO` when the default worker-local
 * SDK factory is used. The app keeps registration (Builder/AppKey) on the main
 * thread; the worker only needs the resolved seed and indexer endpoint.
 */
export interface WorkerConfig {
  /** `Builder`'s `app` parameter, identifying the app to the indexer. */
  app: AppMetadata;
  /** 32-byte AppKey seed exported from the registered app key. */
  appKeySeed: Uint8Array;
  indexerUrl: string;
}

/** Failure kinds the worker reports; see `errors.ts` for the MediaError mapping. */
export type WorkerErrorCode = 'decode' | 'network' | 'unsupported';

/** Identifies how the player element is being fed an MSE source. */
export type WorkerMode = 'main' | 'worker';

/** Worker → main. */
export type WorkerToMainMessage =
  | {
      readonly buffered: readonly BufferWindow[];
      /** Total bytes delivered to the decoder pipeline so far. */
      readonly received: number;
      readonly requestId: RequestId;
      readonly type: 'PROGRESS';
    }
  | {
      readonly bytes: Uint8Array;
      readonly kind: 'init' | 'media';
      readonly requestId: RequestId;
      readonly type: 'CHUNK';
    }
  | {
      readonly context?: string;
      readonly kind: WorkerErrorCode;
      /** `RequestId | null` for errors that belong to no single request. */
      readonly requestId: null | RequestId;
      readonly type: 'ERROR';
    }
  | {
      readonly features: { readonly workerMse: boolean };
      readonly requestId: RequestId;
      readonly type: 'HELLO_OK';
      readonly version: number;
    }
  | { readonly handle: MediaSourceHandle; readonly requestId: RequestId; readonly type: 'HANDLE'; }
  | { readonly info: SourceInfo; readonly requestId: RequestId; readonly type: 'SOURCE_OK'; }
  | { readonly mode: WorkerMode; readonly requestId: RequestId; readonly type: 'ATTACH_OK' };

/** Narrows a raw postMessage payload to the main → worker half of the protocol. */
export function isMainToWorkerMessage(message: unknown): message is MainToWorkerMessage {
  if (!isTypedMessage(message) || !MAIN_TO_WORKER_TYPES.has(message.type)) return false;
  const typed = message as MainToWorkerMessage;
  switch (typed.type) {
    case 'ATTACH':
    case 'HELLO':
    case 'PLAY':
      return typeof typed.requestId === 'number';
    case 'SEEK':
      return typeof typed.requestId === 'number' && Number.isFinite(typed.time);
    case 'SOURCE':
      return (
        typeof typed.requestId === 'number' &&
        typeof typed.src === 'string' &&
        (typeof typed.mimeType === 'undefined' || typeof typed.mimeType === 'string')
      );
    default:
      return true;
  }
}

/** Narrows a raw postMessage payload to the worker → main half of the protocol. */
export function isWorkerToMainMessage(message: unknown): message is WorkerToMainMessage {
  if (!isTypedMessage(message) || !WORKER_TO_MAIN_TYPES.has(message.type)) return false;
  const typed = message as WorkerToMainMessage;
  switch (typed.type) {
    case 'ATTACH_OK':
      return typeof typed.requestId === 'number' && typeof typed.mode === 'string';
    case 'CHUNK':
      return typeof typed.requestId === 'number' && typed.bytes instanceof Uint8Array;
    case 'ERROR':
      return typeof typed.kind === 'string';
    case 'HANDLE':
      return typeof typed.requestId === 'number' && typeof typed.handle !== 'undefined';
    case 'HELLO_OK':
      return typeof typed.version === 'number' && typeof typed.requestId === 'number';
    case 'PROGRESS':
      return typeof typed.requestId === 'number' && typeof typed.received === 'number';
    case 'SOURCE_OK':
      return typeof typed.requestId === 'number' && typeof typed.info === 'object' && typed.info !== null;
    default:
      return true;
  }
}

function isTypedMessage(message: unknown): message is { type: string; } {
  return (
    typeof message === 'object' &&
    message !== null &&
    'type' in message &&
    typeof message.type === 'string'
  );
}

/** All `MainToWorkerMessage` discriminator values, shared by the guard. */
export const MAIN_TO_WORKER_TYPES: ReadonlySet<string> = new Set([
  'ATTACH',
  'DESTROY',
  'DETACH',
  'HELLO',
  'PLAY',
  'SEEK',
  'SOURCE',
]);

/**
 * Allocates a fresh request id on the calling (main) thread. The worker never
 * allocates ids; it echoes the one it received.
 */
export function nextRequestId(): RequestId {
  return ++requestIdCounter;
}

/** All `WorkerToMainMessage` discriminator values, shared by the guard. */
export const WORKER_TO_MAIN_TYPES: ReadonlySet<string> = new Set([
  'ATTACH_OK',
  'CHUNK',
  'ERROR',
  'HANDLE',
  'HELLO_OK',
  'PROGRESS',
  'SOURCE_OK',
]);
