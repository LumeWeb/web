import { describe, expect, it, vi } from 'vitest';
import { detectBrowserCapabilities } from '../capabilities/browser-capabilities.ts';
import {
  constructMseMediaSource,
  detectMseRuntime,
  type MseCtorLike,
  mseImplementation,
  type MseRuntimeHost,
  prepareMediaElementForMse,
  resolveMseCtor,
} from '../capabilities/mse-runtime.ts';

/** A real callable constructor shaped like an MSE constructor, with statics. */
function mseCtor(overrides: {
  canConstructInDedicatedWorker?: boolean;
  isTypeSupported?: (mime: string) => boolean;
} = {}): MseCtorLike {
  const ctor = class {} as unknown as MseCtorLike;
  return Object.assign(ctor, overrides);
}

describe('resolveMseCtor', () => {
  it('prefers standard MediaSource over ManagedMediaSource when both exist', () => {
    const standard = mseCtor({ canConstructInDedicatedWorker: true });
    const managed = mseCtor();
    const runtime: MseRuntimeHost = { ManagedMediaSource: managed, MediaSource: standard };

    const resolved = resolveMseCtor(runtime);
    expect(resolved?.impl).toBe(mseImplementation.standard);
    expect(resolved?.managed).toBe(false);
    expect(resolved?.ctor).toBe(standard);
  });
});

describe('detectMseRuntime', () => {
  it('detects a standard runtime and reports the ctor worker flag', () => {
    const runtime: MseRuntimeHost = {
      MediaSource: mseCtor({ canConstructInDedicatedWorker: true }),
    };

    const snapshot = detectMseRuntime(runtime);
    expect(snapshot.impl).toBe(mseImplementation.standard);
    expect(snapshot.managed).toBe(false);
    expect(snapshot.canConstructInDedicatedWorker).toBe(true);
  });

  it('detects an MMS-only runtime and probes MIME support through ManagedMediaSource.isTypeSupported', () => {
    const mms = mseCtor({
      canConstructInDedicatedWorker: true,
      isTypeSupported: (mime: string) => mime === 'video/mp4; codecs="avc1.640028"',
    });
    const runtime: MseRuntimeHost = { ManagedMediaSource: mms };

    const snapshot = detectMseRuntime(runtime);
    expect(snapshot.impl).toBe(mseImplementation.managed);
    expect(snapshot.managed).toBe(true);
    expect(snapshot.canConstructInDedicatedWorker).toBe(true);

    // `detectBrowserCapabilities` must consult the RESOLVED impl's
    // isTypeSupported, so an MMS-only runtime reports its real MIME support.
    const capabilities = detectBrowserCapabilities(runtime);
    expect(capabilities.mseSupported('video/mp4; codecs="avc1.640028"')).toBe(true);
    expect(capabilities.mseSupported('video/webm; codecs="vp09.00.10.08"')).toBe(false);
    expect(capabilities.mseImpl().impl).toBe(mseImplementation.managed);
  });

  it('treats a WebKit-prefixed-only runtime as legacy', () => {
    const runtime: MseRuntimeHost = {
      WebKitMediaSource: mseCtor({ canConstructInDedicatedWorker: false }),
    };

    const snapshot = detectMseRuntime(runtime);
    expect(snapshot.impl).toBe(mseImplementation.webkitLegacy);
    expect(snapshot.managed).toBe(false);
  });

  it('reports none for a runtime with no MSE surface', () => {
    const snapshot = detectMseRuntime({});
    expect(snapshot).toEqual({
      canConstructInDedicatedWorker: false,
      impl: mseImplementation.none,
      managed: false,
    });
  });
});

describe('constructMseMediaSource', () => {
  it('constructs from the resolved impl', () => {
    const FakeMse = class FakeMse {};
    const runtime: MseRuntimeHost = { MediaSource: FakeMse as unknown as MseCtorLike };
    expect(constructMseMediaSource(runtime) as unknown).toBeInstanceOf(FakeMse);
  });

  it('throws a descriptive error when no implementation exists', () => {
    expect(() => constructMseMediaSource({})).toThrow(/no usable MSE/i);
  });
});

describe('prepareMediaElementForMse', () => {
  it('sets disableRemotePlayback and forwards stream events on a managed impl', () => {
    const onDiag = vi.fn();
    const listeners = new Map<string, () => void>();
    const element = {
      addEventListener(type: string, listener: () => void): void {
        listeners.set(type, listener);
      },
      disableRemotePlayback: false,
    };

    prepareMediaElementForMse(element, mseImplementation.managed, onDiag);

    expect(element.disableRemotePlayback).toBe(true);
    listeners.get('startstreaming')?.();
    listeners.get('endstreaming')?.();
    expect(onDiag).toHaveBeenNthCalledWith(1, 'mms.startstreaming');
    expect(onDiag).toHaveBeenNthCalledWith(2, 'mms.endstreaming');
  });

  it('is a no-op for a standard impl', () => {
    const onDiag = vi.fn();
    const element = { disableRemotePlayback: false };

    prepareMediaElementForMse(element, mseImplementation.standard, onDiag);

    expect(element.disableRemotePlayback).toBe(false);
    expect(onDiag).not.toHaveBeenCalled();
  });

  it('is a no-op when the element is null', () => {
    const onDiag = vi.fn();
    prepareMediaElementForMse(null, mseImplementation.managed, onDiag);
    expect(onDiag).not.toHaveBeenCalled();
  });
});
