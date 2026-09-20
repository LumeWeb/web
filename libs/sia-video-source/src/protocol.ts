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
import type { IndexGranularity, PlaybackMode, TrackSummary } from './media/types.ts';

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

/**
 * The ciphertext envelope carried by the `APP_KEY` message: the 32-byte Sia
 * app-key seed, AES-GCM-encrypted by the host under an HKDF key derived from
 * a per-handshake ephemeral X25519 public key and the worker's public key
 * (see `app-key-handshake.ts`). Only ciphertext and ephemeral material ever
 * cross the wire; the plaintext seed does not.
 */
export interface AppKeyEnvelope {
  /** AEAD output over the seed; authenticated together with `PROTOCOL_AAD`. */
  readonly ciphertext: Uint8Array;
  /** Raw 32-byte X25519 public half of the encrypting (sender) key pair. */
  readonly ephemeralPublicKey: Uint8Array;
  /** 96-bit AES-GCM nonce, single-use per envelope. */
  readonly iv: Uint8Array;
}

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
      /**
       * The object locator: either the hex object key of an object pinned
       * under the configured indexer account, or a full Sia share URL
       * (`/objects/<key>/shared#encryption_key=…`, see `share-url.ts`) that
       * is self-describing. Both travel as this one string — a share URL is
       * opaque wire content, so no message-shape distinction exists.
       */
      readonly src: string;
      readonly type: 'SOURCE';
    }
  | {
      readonly envelope: AppKeyEnvelope;
      readonly requestId: RequestId;
      readonly type: 'APP_KEY';
    }
  /** Current media playhead; drives bounded finite-VOD scheduling and eviction. */
  | { readonly requestId: RequestId; readonly time: number; readonly type: 'PLAYHEAD'; }
  | { readonly requestId: RequestId; readonly time: number; readonly type: 'SEEK'; }
  | { readonly requestId: RequestId; readonly type: 'ATTACH'; }
  | { readonly requestId: RequestId; readonly type: 'PLAY'; }
  | { readonly type: 'DESTROY' }
  | { readonly type: 'DETACH' };

export type SiaVideoMessage = MainToWorkerMessage | WorkerToMainMessage;

/**
 * What the worker knows about the accepted source after probing.
 *
 * The capability fields — `playback`, `indexGranularity`, `tracks` — are
 * optional extras: every worker built against the current protocol populates
 * them, but a host that predates them can ignore the extra JSON fields. The
 * wire guard accepts any `info` object for `SOURCE_OK`, so future fields keep
 * landing without a version bump.
 */
export interface SourceInfo {
  readonly container: string;
  /** Media duration in seconds when it can vouch for one, else `null`. */
  readonly durationSeconds: null | number;
  /** How precisely this object can answer time→byte seeks right now. */
  readonly indexGranularity?: IndexGranularity;
  /** MSE-ready MIME type the worker will append with (or hands the host for fallback appends). */
  readonly mime: string;
  /** MSE construction site for this play session. */
  readonly mode: WorkerMode;
  /** Container/codec-decided playback mode the worker will actually use. */
  readonly playback?: PlaybackMode;
  /** Track codecs in track order, for UI/debug; empty when unknown. */
  readonly tracks?: readonly TrackSummary[];
}

/**
 * Connection metadata handed over in `HELLO` when the default worker-local SDK
 * factory is used. The app key seed itself never crosses the wire here: it is
 * delivered separately inside the encrypted `APP_KEY` envelope, so this
 * interface structurally cannot carry key material (compile-time no
 * `appKeySeed` field).
 */
export interface WorkerConfig {
  /** `Builder`'s `app` parameter, identifying the app to the indexer. */
  app: AppMetadata;
  indexerUrl: string;
  /**
   * Host-side worker-MSE preference carried on `HELLO` (absent = `'auto'`).
   * `'main'` forces the main-thread MSE fallback (CHUNK posting) even on
   * runtimes that can construct MSE in a dedicated worker; `'auto'` lets the
   * worker select from its own runtime capability check. Workers that predate
   * the field ignore it; `workerConfigsEqual` ignores it (it is a mode
   * preference, not connection identity).
   */
  workerMse?: WorkerMsePreference;
}

/** Failure kinds the worker reports; see `errors.ts` for the MediaError mapping. */
export const workerErrorCode = {
  decode: 'decode',
  network: 'network',
  unsupported: 'unsupported',
} as const;

export type WorkerErrorCode = (typeof workerErrorCode)[keyof typeof workerErrorCode];

/** Identifies how the player element is being fed an MSE source. */
export const workerMode = {
  main: 'main',
  worker: 'worker',
} as const;

export type WorkerMode = (typeof workerMode)[keyof typeof workerMode];

/** Host preference for which MSE construction site a session may use. */
export const workerMsePreference = {
  auto: 'auto',
  main: 'main',
} as const;

export type WorkerMsePreference = (typeof workerMsePreference)[keyof typeof workerMsePreference];

/** Worker → main. */
export type WorkerToMainMessage =
  | {
      /**
       * End-of-stream: the object's bytes have been fully delivered and the
       * worker has nothing left to append. In main mode the host responds by
       * calling `MediaSource.endOfStream()` once its append queue drains; in
       * worker mode the worker ends its own MediaSource and never posts this.
       */
      readonly requestId: RequestId;
      readonly type: 'ENDED';
    }
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
      /**
       * Raw 32-byte X25519 public key the worker generated for the app-key
       * handshake; the worker's private counterpart never leaves the isolate.
       */
      readonly publicKey: Uint8Array;
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
    case 'APP_KEY':
      return typeof typed.requestId === 'number' && isAppKeyEnvelope(typed.envelope);
    case 'ATTACH':
    case 'HELLO':
    case 'PLAY':
      return typeof typed.requestId === 'number';
    case 'PLAYHEAD':
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
    case 'ENDED':
      return typeof typed.requestId === 'number';
    case 'ERROR':
      return typeof typed.kind === 'string';
    case 'HANDLE':
      return typeof typed.requestId === 'number' && typeof typed.handle !== 'undefined';
    case 'HELLO_OK':
      return (
        typeof typed.version === 'number' &&
        typeof typed.requestId === 'number' &&
        typed.publicKey instanceof Uint8Array &&
        typed.publicKey.byteLength === WORKER_PUBLIC_KEY_LENGTH
      );
    case 'PROGRESS':
      return typeof typed.requestId === 'number' && typeof typed.received === 'number';
    case 'SOURCE_OK':
      return typeof typed.requestId === 'number' && typeof typed.info === 'object' && typed.info !== null;
    default:
      return true;
  }
}

/**
 * Raw byte length of an X25519 public key on the wire (`HELLO_OK.publicKey`
 * and `AppKeyEnvelope.ephemeralPublicKey`).
 */
export const WORKER_PUBLIC_KEY_LENGTH = 32;

/** Narrows a raw value to the `APP_KEY` ciphertext envelope shape. */
export function isAppKeyEnvelope(value: unknown): value is AppKeyEnvelope {
  if (typeof value !== 'object' || value === null) return false;
  const { ciphertext, ephemeralPublicKey, iv } = value as Partial<AppKeyEnvelope>;
  return (
    ciphertext instanceof Uint8Array &&
    ciphertext.byteLength > 0 &&
    iv instanceof Uint8Array &&
    iv.byteLength === GCM_IV_LENGTH &&
    ephemeralPublicKey instanceof Uint8Array &&
    ephemeralPublicKey.byteLength === WORKER_PUBLIC_KEY_LENGTH
  );
}

function isTypedMessage(message: unknown): message is { type: string; } {
  return (
    typeof message === 'object' &&
    message !== null &&
    'type' in message &&
    typeof message.type === 'string'
  );
}

/**
 * 96-bit AES-GCM nonce length; the envelope guard rejects any other size.
 * Lives here (next to the wire shape both peers validate) rather than only in
 * the crypto module, so the guard cannot drift from the crypto constants.
 */
export const GCM_IV_LENGTH = 12;

/** All `MainToWorkerMessage` discriminator values, shared by the guard. */
export const MAIN_TO_WORKER_TYPES: ReadonlySet<string> = new Set([
  'APP_KEY',
  'ATTACH',
  'DESTROY',
  'DETACH',
  'HELLO',
  'PLAY',
  'PLAYHEAD',
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
  'ENDED',
  'ERROR',
  'HANDLE',
  'HELLO_OK',
  'PROGRESS',
  'SOURCE_OK',
]);
