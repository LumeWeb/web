/**
 * Wire protocol between the main thread (`SiaVideoSource`) and the dedicated
 * Sia video worker.
 *
 * The worker resolves the pinned object, streams bytes, converts them with
 * the media library to fragmented MP4, and (where the browser supports it)
 * owns MSE itself. Every main→worker message that can fail or finish carries a
 * `requestId`; the worker echoes it on the corresponding reply, `CHUNK`,
 * `PROGRESS`, and `ERROR` messages, so a superseded load can be told apart
 * from the one that replaced it.
 */

import type { AppMetadata } from '@siafoundation/sia-storage';
import type { PlaybackTrack } from './media/types.ts';

/** Wire protocol version; 0 is the initial, unreleased protocol. */
export const PROTOCOL_VERSION = 0;

/**
 * Fallback MSE MIME the host applies when an accepted source does not carry
 * its own `info.mime` (`SOURCE_OK`). The worker's mediabunny conversion
 * always produces H.264 + AAC CMAF, so the fallback matches that output.
 */
export const DEFAULT_FMP4_MIME = 'video/mp4; codecs="avc1.640028,mp4a.40.2"';

/**
 * Main → worker message discriminators; each member's value is the wire
 * string it replaced, so the on-the-wire protocol is byte-identical.
 */
export enum MainToWorkerMessageType {
  APP_KEY = 'APP_KEY',
  ATTACH = 'ATTACH',
  DESTROY = 'DESTROY',
  DETACH = 'DETACH',
  HELLO = 'HELLO',
  PLAY = 'PLAY',
  PLAYHEAD = 'PLAYHEAD',
  SEEK = 'SEEK',
  SOURCE = 'SOURCE',
}

/**
 * Worker → main message discriminators; each member's value is the wire
 * string it replaced, so the on-the-wire protocol is byte-identical.
 */
export enum WorkerToMainMessageType {
  ATTACH_OK = 'ATTACH_OK',
  CHUNK = 'CHUNK',
  ENDED = 'ENDED',
  ERROR = 'ERROR',
  HANDLE = 'HANDLE',
  HELLO_OK = 'HELLO_OK',
  PROGRESS = 'PROGRESS',
  SOURCE_OK = 'SOURCE_OK',
}

export type RequestId = number;

let requestIdCounter = 0;

/**
 * The ciphertext envelope carried by the `APP_KEY` message: the 32-byte Sia
 * credential seed (app-key or sharing-key), AES-GCM-encrypted by the host
 * under an HKDF key derived from a per-handshake ephemeral X25519 public key
 * and the worker's public key (see `app-key-handshake.ts`). Only ciphertext,
 * ephemeral material, and the plaintext `keyType` tag ever cross the wire;
 * the plaintext seed does not.
 */
export interface AppKeyEnvelope {
  /** AEAD output over the seed; authenticated together with `PROTOCOL_AAD`. */
  readonly ciphertext: Uint8Array;
  /** Raw 32-byte X25519 public half of the encrypting (sender) key pair. */
  readonly ephemeralPublicKey: Uint8Array;
  /** 96-bit AES-GCM nonce, single-use per envelope. */
  readonly iv: Uint8Array;
  /**
   * Which credential class the ciphertext holds: `'app'` (the Sia app-key
   * seed, ADR 0006) or `'sharing'` (a sharing-key seed for keyless playback,
   * ADR 0008). Plaintext metadata — never secret, it only tells the worker
   * which seed slot to decrypt into. Absent = `'app'` for backward
   * compatibility with the original handshake.
   */
  readonly keyType?: 'app' | 'sharing';
}

/** A buffered media window in seconds, as a TimeRanges pair. */
export interface BufferWindow {
  readonly end: number;
  readonly start: number;
}

/** Main → worker. */
export type MainToWorkerMessage =
  | {
      /**
       * Declares whether this HELLO's host will supply an app-key seed over a
       * subsequent `APP_KEY` message (`true`), definitively will not (`false`),
       * or makes no claim (absent — an old-protocol host). **Presence metadata
       * only — never the seed itself**, which still travels exclusively inside
       * the encrypted `APP_KEY` envelope. A `false` flag lets the worker scrub
       * a held seed slot whose provider the host dropped while re-attaching an
       * otherwise identical `config` (the worker otherwise cannot tell
       * "provider removed" from "envelope not yet arrived").
       */
      readonly appSeed?: boolean;
      /** Required with the default worker SDK factory; ignored when the app injected its own. */
      readonly config?: WorkerConfig;
      readonly requestId: RequestId;
      /** Mirror of `appSeed` for the sharing-key seed slot (`APP_KEY` tagged `keyType: 'sharing'`). */
      readonly sharingSeed?: boolean;
      readonly type: MainToWorkerMessageType.HELLO;
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
      readonly type: MainToWorkerMessageType.SOURCE;
    }
  | {
      // The ciphertext envelope carries the seed plus its plaintext `keyType`
      // routing tag ('app' app-key seed, 'sharing' sharing-key seed — see
      // `AppKeyEnvelope`). One APP_KEY per credential class per handshake;
      // never a new message type, never a plaintext seed on the wire.
      readonly envelope: AppKeyEnvelope;
      readonly requestId: RequestId;
      readonly type: MainToWorkerMessageType.APP_KEY;
    }
  /** Current media playhead; drives buffered-timeline scheduling and back-buffer eviction. */
  | { readonly requestId: RequestId; readonly time: number; readonly type: MainToWorkerMessageType.PLAYHEAD; }
  | { readonly requestId: RequestId; readonly time: number; readonly type: MainToWorkerMessageType.SEEK; }
  | { readonly requestId: RequestId; readonly type: MainToWorkerMessageType.ATTACH; }
  | { readonly requestId: RequestId; readonly type: MainToWorkerMessageType.PLAY; }
  | { readonly type: MainToWorkerMessageType.DESTROY }
  | { readonly type: MainToWorkerMessageType.DETACH };

export type SiaVideoMessage = MainToWorkerMessage | WorkerToMainMessage;

/**
 * What the worker vouches for about an accepted source: the container family,
 * the duration when it can name one (else null), the MSE-ready MIME it will
 * append with, the MSE construction site for this session, and the discovered
 * track codecs in track order. The wire guard accepts any `info` object for
 * `SOURCE_OK`, so future fields keep landing without a version bump.
 */
export interface SourceInfo {
  readonly container: string;
  /** Media duration in seconds when it can vouch for one, else `null`. */
  readonly durationSeconds: null | number;
  /** MSE-ready MIME type the worker will append with (or hands the host for fallback appends). */
  readonly mime: string;
  /** MSE construction site for this play session. */
  readonly mode: WorkerMode;
  /** Track codecs in track order, for UI/debug; empty when unknown. */
  readonly tracks: readonly PlaybackTrack[];
}

/**
 * Connection metadata handed over in `HELLO` when the default worker-local SDK
 * factory is used. No credential seed ever crosses the wire here: both the
 * app-key seed and the sharing-key seed travel separately inside encrypted
 * `APP_KEY` envelopes (tagged `keyType: 'app'` / `'sharing'`), so this
 * interface structurally cannot carry key material (compile-time no
 * `appKeySeed` / `sharingKeySeed` field).
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
      readonly type: WorkerToMainMessageType.ENDED;
    }
  | {
      readonly buffered: readonly BufferWindow[];
      /** Total bytes delivered to the decoder pipeline so far. */
      readonly received: number;
      readonly requestId: RequestId;
      readonly type: WorkerToMainMessageType.PROGRESS;
    }
  | {
      readonly bytes: Uint8Array;
      readonly kind: 'init' | 'media';
      readonly requestId: RequestId;
      readonly type: WorkerToMainMessageType.CHUNK;
    }
  | {
      readonly context?: string;
      readonly kind: WorkerErrorCode;
      /** `RequestId | null` for errors that belong to no single request. */
      readonly requestId: null | RequestId;
      readonly type: WorkerToMainMessageType.ERROR;
    }
  | {
      readonly features: { readonly workerMse: boolean };
      /**
       * Raw 32-byte X25519 public key the worker generated for the app-key
       * handshake; the worker's private counterpart never leaves the isolate.
       */
      readonly publicKey: Uint8Array;
      readonly requestId: RequestId;
      readonly type: WorkerToMainMessageType.HELLO_OK;
      readonly version: number;
    }
  | { readonly handle: MediaSourceHandle; readonly requestId: RequestId; readonly type: WorkerToMainMessageType.HANDLE; }
  | { readonly info: SourceInfo; readonly requestId: RequestId; readonly type: WorkerToMainMessageType.SOURCE_OK; }
  | { readonly mode: WorkerMode; readonly requestId: RequestId; readonly type: WorkerToMainMessageType.ATTACH_OK };

/** Narrows a raw postMessage payload to the main → worker half of the protocol. */
export function isMainToWorkerMessage(message: unknown): message is MainToWorkerMessage {
  if (!isTypedMessage(message) || !MAIN_TO_WORKER_TYPES.has(message.type)) return false;
  const typed = message as MainToWorkerMessage;
  switch (typed.type) {
    case MainToWorkerMessageType.APP_KEY:
      return typeof typed.requestId === 'number' && isAppKeyEnvelope(typed.envelope);
    case MainToWorkerMessageType.ATTACH:
    case MainToWorkerMessageType.PLAY:
      return typeof typed.requestId === 'number';
    case MainToWorkerMessageType.HELLO:
      // The additive seed-presence flags are optional booleans (wire metadata;
      // a non-boolean value is a malformed HELLO, never a silent default).
      return (
        typeof typed.requestId === 'number' &&
        (typeof typed.appSeed === 'undefined' || typeof typed.appSeed === 'boolean') &&
        (typeof typed.sharingSeed === 'undefined' || typeof typed.sharingSeed === 'boolean')
      );
    case MainToWorkerMessageType.PLAYHEAD:
    case MainToWorkerMessageType.SEEK:
      return typeof typed.requestId === 'number' && Number.isFinite(typed.time);
    case MainToWorkerMessageType.SOURCE:
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
    case WorkerToMainMessageType.ATTACH_OK:
      return typeof typed.requestId === 'number' && typeof typed.mode === 'string';
    case WorkerToMainMessageType.CHUNK:
      return typeof typed.requestId === 'number' && typed.bytes instanceof Uint8Array;
    case WorkerToMainMessageType.ENDED:
      return typeof typed.requestId === 'number';
    case WorkerToMainMessageType.ERROR:
      return typeof typed.kind === 'string';
    case WorkerToMainMessageType.HANDLE:
      return typeof typed.requestId === 'number' && typeof typed.handle !== 'undefined';
    case WorkerToMainMessageType.HELLO_OK:
      return (
        typeof typed.version === 'number' &&
        typeof typed.requestId === 'number' &&
        typed.publicKey instanceof Uint8Array &&
        typed.publicKey.byteLength === WORKER_PUBLIC_KEY_LENGTH
      );
    case WorkerToMainMessageType.PROGRESS:
      return typeof typed.requestId === 'number' && typeof typed.received === 'number';
    case WorkerToMainMessageType.SOURCE_OK:
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
  const { ciphertext, ephemeralPublicKey, iv, keyType } = value as Partial<AppKeyEnvelope>;
  return (
    ciphertext instanceof Uint8Array &&
    ciphertext.byteLength > 0 &&
    iv instanceof Uint8Array &&
    iv.byteLength === GCM_IV_LENGTH &&
    ephemeralPublicKey instanceof Uint8Array &&
    ephemeralPublicKey.byteLength === WORKER_PUBLIC_KEY_LENGTH &&
    // Optional by design (defaults to 'app'); when present it must be one of
    // the two known credential classes, so a foreign tag is a malformed
    // envelope — a reject, never a silent 'app' fallback.
    (keyType === undefined || keyType === 'app' || keyType === 'sharing')
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
export const MAIN_TO_WORKER_TYPES: ReadonlySet<string> = new Set(
  Object.values(MainToWorkerMessageType),
);

/**
 * Allocates a fresh request id on the calling (main) thread. The worker never
 * allocates ids; it echoes the one it received.
 */
export function nextRequestId(): RequestId {
  return ++requestIdCounter;
}

/** All `WorkerToMainMessage` discriminator values, shared by the guard. */
export const WORKER_TO_MAIN_TYPES: ReadonlySet<string> = new Set(
  Object.values(WorkerToMainMessageType),
);
