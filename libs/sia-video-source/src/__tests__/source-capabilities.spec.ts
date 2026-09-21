/**
 * Contract for the session capability-report module: the pure mapping from one
 * ready load's facts — container, duration, MIME, and track codecs — plus the
 * session's MSE construction site into the `SOURCE_OK.info` wire shape.
 *
 * The module carries no Sia SDK, no MSE internals, and no worker routing, so
 * the mapping is tested here once instead of inline.
 */

import { describe, expect, it } from 'vitest';
import type { PlaybackTrack } from '../media/types.ts';
import { DEFAULT_FMP4_MIME, workerMode } from '../protocol.ts';
import { type SourceCapabilityFacts, sourceInfoFor } from '../session/source-capabilities.ts';

function facts(overrides: Partial<SourceCapabilityFacts> = {}): SourceCapabilityFacts {
  return {
    container: 'mp4',
    durationSeconds: null,
    mime: 'video/mp4',
    tracks: [],
    ...overrides,
  };
}

describe('sourceInfoFor', () => {
  it('maps ready metadata plus session mode into SOURCE_OK.info', () => {
    const tracks: readonly PlaybackTrack[] = [
      { codec: 'avc1.640028', kind: 'video' },
      { codec: 'mp4a.40.2', kind: 'audio' },
    ];
    const info = sourceInfoFor(
      facts({ container: 'mp4', durationSeconds: 90, mime: DEFAULT_FMP4_MIME, tracks }),
      workerMode.worker,
    );
    expect(info).toEqual({
      container: 'mp4',
      durationSeconds: 90,
      mime: DEFAULT_FMP4_MIME,
      mode: workerMode.worker,
      tracks,
    });
  });

  it('passes a null duration through when the load cannot name one', () => {
    const info = sourceInfoFor(facts({ durationSeconds: null }), workerMode.main);
    expect(info.durationSeconds).toBeNull();
    expect(info.mode).toBe(workerMode.main);
    expect(info.mime).toBe('video/mp4');
    expect(info.container).toBe('mp4');
  });

  it('carries an empty track list when no codecs were discovered', () => {
    const info = sourceInfoFor(facts({ tracks: [] }), workerMode.main);
    expect(info.tracks).toEqual([]);
  });
});
