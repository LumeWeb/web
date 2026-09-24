/**
 * MSE implementation detection for the current runtime, on top of
 * `browser-capabilities.ts`. Some runtimes — iPhone Safari in particular —
 * expose no global `MediaSource` at all: before iOS 17.1 iPhone Safari has no
 * MSE in any form, and from 17.1 it ships only the `ManagedMediaSource`
 * subclass (WebKit's low-power/time-shifted MSE), never the standard
 * `MediaSource`. The library must therefore resolve WHICH MSE surface exists
 * before it can probe MIME support, construct a MediaSource, or decide the
 * device is too old.
 */

export const mseImplementation = {
  managed: 'managed',
  none: 'none',
  standard: 'standard',
  webkitLegacy: 'webkit-legacy',
} as const;

/**
 * Structural MSE constructor shape shared by `MediaSource` and
 * `ManagedMediaSource`. Structural because `ManagedMediaSource` is not a
 * TS DOM lib type in all supported TS versions — never reference it (or a
 * `SourceBuffer`/`WebKitMediaSource` global) as a type, only through this
 * shape.
 */
export interface MseCtorLike {
  new (): MediaSource;
  canConstructInDedicatedWorker?: boolean;
  isTypeSupported?: (mime: string) => boolean;
}

/**
 * Structural media element shape `prepareMediaElementForMse` writes/reads.
 * Kept structural so the host can feed any video.js element contract without
 * importing DOM element types.
 */
export interface MseElementLike {
  addEventListener?(type: string, listener: () => void): void;
  disableRemotePlayback?: boolean;
}

export type MseImplementation = (typeof mseImplementation)[keyof typeof mseImplementation];

export interface MseRuntimeHost {
  ManagedMediaSource?: MseCtorLike;
  MediaSource?: MseCtorLike;
  WebKitMediaSource?: MseCtorLike;
}

export interface MseRuntimeSnapshot {
  readonly canConstructInDedicatedWorker: boolean;
  readonly impl: MseImplementation;
  /** implies the element needs disableRemotePlayback = true before attach (ManagedMediaSource). */
  readonly managed: boolean;
}

/** Constructs a MediaSource from the runtime's resolved MSE implementation. */
export function constructMseMediaSource(runtime: MseRuntimeHost = globalThis): MediaSource {
  const resolved = resolveMseCtor(runtime);
  if (resolved === null) {
    throw new Error('No usable MSE implementation on this runtime (device too old).');
  }
  return new resolved.ctor();
}

/** Sync, side-effect-free MSE implementation snapshot for one runtime. */
export function detectMseRuntime(runtime: MseRuntimeHost = globalThis): MseRuntimeSnapshot {
  const resolved = resolveMseCtor(runtime);
  if (resolved === null) {
    return { canConstructInDedicatedWorker: false, impl: mseImplementation.none, managed: false };
  }
  return {
    canConstructInDedicatedWorker: resolved.ctor.canConstructInDedicatedWorker === true,
    impl: resolved.impl,
    managed: resolved.managed,
  };
}

/**
 * Element-side prep required before an MSE source is attached. Only the
 * `managed` impl is meaningful: `ManagedMediaSource` refuses to fire
 * `sourceopen` unless `disableRemotePlayback = true` is set BEFORE the source
 * is attached (MDN; WebKit blog, Oct 25 2023), so this must run before
 * `target.src`/`srcObject` assignment. `startstreaming`/`endstreaming` ask the
 * page to fetch/stop fetching; treat them as diagnostics only — the append
 * pipe keeps running. No-op for every other impl.
 */
export function prepareMediaElementForMse(
  element: null | object,
  impl: MseImplementation,
  onDiag?: (name: string) => void,
): void {
  if (impl !== mseImplementation.managed || !element) return;
  const target = element as MseElementLike;
  target.disableRemotePlayback = true;
  target.addEventListener?.('startstreaming', () => onDiag?.('mms.startstreaming'));
  target.addEventListener?.('endstreaming', () => onDiag?.('mms.endstreaming'));
}

/**
 * Probes a runtime for the strongest usable MSE constructor. Standard
 * `MediaSource` is preferred whenever both it and `ManagedMediaSource` exist
 * (Safari 17+ on desktop/iPad) because the standard surface is the
 * battle-tested path (videojs/v10 issue #838); `ManagedMediaSource` is the
 * only MSE on iPhone Safari 17.1+; the legacy prefixed `WebKitMediaSource` is
 * detect-only and maps to "too old".
 */
export function resolveMseCtor(
  runtime: MseRuntimeHost,
): null | { ctor: MseCtorLike; impl: MseImplementation; managed: boolean } {
  if (typeof runtime.MediaSource !== 'undefined') {
    return { ctor: runtime.MediaSource, impl: mseImplementation.standard, managed: false };
  }
  if (typeof runtime.ManagedMediaSource !== 'undefined') {
    return { ctor: runtime.ManagedMediaSource, impl: mseImplementation.managed, managed: true };
  }
  if (typeof runtime.WebKitMediaSource !== 'undefined') {
    return { ctor: runtime.WebKitMediaSource, impl: mseImplementation.webkitLegacy, managed: false };
  }
  return null;
}
