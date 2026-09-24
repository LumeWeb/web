/**
 * Test fake for the piece of the video.js `Media` surface the recovery
 * feature depends on: an EventTarget-like subscription honoring an abort
 * `signal` plus a typed emit helper for the `sia-recovery-change` event. Not
 * a mock — it implements the real contract the host exposes, so the feature
 * code is exercised unmodified.
 */
import type { Media } from '@videojs/media';
import {
  type RecoveryChangeDetail,
  siaLoadChange,
  type SiaLoadChangeDetail,
  siaRecoveryChange,
} from '../../sia-video-source.ts';

export class FakeSiaMedia {
  readonly listeners = new Map<string, Set<(event: unknown) => void>>();

  addEventListener(
    type: string,
    listener: (event: unknown) => void,
    options?: { signal?: AbortSignal },
  ): void {
    let set = this.listeners.get(type);
    if (!set) {
      set = new Set();
      this.listeners.set(type, set);
    }
    set.add(listener);
    options?.signal?.addEventListener(
      'abort',
      () => this.removeEventListener(type, listener),
      { once: true },
    );
  }

  emitLoad(detail: SiaLoadChangeDetail): void {
    for (const listener of this.listeners.get(siaLoadChange) ?? []) {
      listener({ detail, type: siaLoadChange });
    }
  }

  emitRecovery(detail: RecoveryChangeDetail): void {
    for (const listener of this.listeners.get(siaRecoveryChange) ?? []) {
      listener({ detail, type: siaRecoveryChange });
    }
  }

  removeEventListener(type: string, listener: (event: unknown) => void): void {
    this.listeners.get(type)?.delete(listener);
  }
}

/** A `PlayerTarget.media`-shaped target; the feature only reads the listener surface. */
export function mediaTarget(media: FakeSiaMedia): { container: null; media: Media } {
  return { container: null, media: media as unknown as Media };
}
