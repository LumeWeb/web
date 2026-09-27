import { describe, expect, it } from 'vitest';
import { MediaError } from '@videojs/media';
import { DEFAULT_ERROR_MESSAGES, MEDIA_ERROR_CODES, mediaErrorEvent, mediaErrorFromWorkerMessage } from '../errors.ts';

describe('MEDIA_ERROR_CODES', () => {
  it('maps worker kinds onto the HTMLMediaError codes', () => {
    expect(MEDIA_ERROR_CODES.unsupported).toBe(MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED);
    expect(MEDIA_ERROR_CODES.unsupported).toBe(4);
    expect(MEDIA_ERROR_CODES.device).toBe(MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED);
    expect(MEDIA_ERROR_CODES.device).toBe(4);
    expect(MEDIA_ERROR_CODES.decode).toBe(MediaError.MEDIA_ERR_DECODE);
    expect(MEDIA_ERROR_CODES.decode).toBe(3);
    expect(MEDIA_ERROR_CODES.network).toBe(MediaError.MEDIA_ERR_NETWORK);
    expect(MEDIA_ERROR_CODES.network).toBe(2);
  });
});

describe('browser mapping stability', () => {
  it('keeps every existing worker-kind → MediaError mapping intact', () => {
    // The established five kinds map exactly as they always have (including
    // quota's backward-compatible decode code and per-kind default messages);
    // the new reserved kind does not alter any of them.
    expect(MEDIA_ERROR_CODES.decode).toBe(MediaError.MEDIA_ERR_DECODE); // 3
    expect(MEDIA_ERROR_CODES.device).toBe(MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED); // 4
    expect(MEDIA_ERROR_CODES.network).toBe(MediaError.MEDIA_ERR_NETWORK); // 2
    expect(MEDIA_ERROR_CODES.quota).toBe(MediaError.MEDIA_ERR_DECODE); // 3
    expect(MEDIA_ERROR_CODES.unsupported).toBe(MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED); // 4
    for (const kind of ['decode', 'device', 'network', 'quota', 'unsupported'] as const) {
      expect(DEFAULT_ERROR_MESSAGES[kind], kind).toBeTruthy();
    }
  });

  it('leaves the reserved unavailable kind unmapped until its host routing arrives', () => {
    // No MediaError code or default message exists yet for the reserved
    // `unavailable` wire kind: until its host routing arrives, a
    // seek-target data-unavailable report degrades like any unrecognized kind,
    // mapping to MEDIA_ERR_CUSTOM (100) plus the generic fallback.
    expect(MEDIA_ERROR_CODES.unavailable).toBeUndefined();
    expect(DEFAULT_ERROR_MESSAGES.unavailable).toBeUndefined();

    const error = mediaErrorFromWorkerMessage({ context: 'seek-target:data-unavailable', kind: 'unavailable' });
    expect(error.code).toBe(MediaError.MEDIA_ERR_CUSTOM);
    expect(error.fatal).toBe(true);
    expect(error.message).toBe('seek-target:data-unavailable');

    const fallback = mediaErrorFromWorkerMessage({ kind: 'unavailable' });
    expect(fallback.code).toBe(MediaError.MEDIA_ERR_CUSTOM);
    expect(fallback.message).toBe('Playback failed.');
  });
});

describe('mediaErrorFromWorkerMessage', () => {
  it('maps an unsupported-container report to MEDIA_ERR_SRC_NOT_SUPPORTED', () => {
    const error = mediaErrorFromWorkerMessage({ context: 'container: unknown', kind: 'unsupported' });
    expect(error.code).toBe(4);
    expect(error.fatal).toBe(true);
    expect(error.message).toBe('container: unknown');
  });

  it('falls back to a default message when the worker sends none', () => {
    const error = mediaErrorFromWorkerMessage({ kind: 'network' });
    expect(error.code).toBe(2);
    expect(error.message).toBe(DEFAULT_ERROR_MESSAGES.network);
  });

  it('maps a device-too-old report to MEDIA_ERR_SRC_NOT_SUPPORTED with the too-old message', () => {
    const error = mediaErrorFromWorkerMessage({ context: 'no-mse', kind: 'device' });
    expect(error.code).toBe(MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED);
    expect(error.fatal).toBe(true);
    expect(error.message).toBe('no-mse');

    const fallback = mediaErrorFromWorkerMessage({ kind: 'device' });
    expect(fallback.message).toBe(DEFAULT_ERROR_MESSAGES.device);
    expect(DEFAULT_ERROR_MESSAGES.device).toMatch(/iOS 17\.1/);
  });

  it('reports SourceBuffer failures as MEDIA_ERR_DECODE', () => {
    const error = mediaErrorFromWorkerMessage({ context: 'addSourceBuffer', kind: 'decode' });
    expect(error.code).toBe(3);
  });

  it('degrades an unrecognized kind to MEDIA_ERR_CUSTOM instead of throwing', () => {
    const error = mediaErrorFromWorkerMessage({ kind: 'quantum-flux' as never });
    expect(error.code).toBe(MediaError.MEDIA_ERR_CUSTOM);
    expect(error.fatal).toBe(true);
  });
});

describe('mediaErrorEvent', () => {
  it.skipIf(typeof ErrorEvent === 'undefined')('wraps a MediaError into a DOM-facing error event', () => {
    const mediaError = mediaErrorFromWorkerMessage({ kind: 'unsupported' });
    const event = mediaErrorEvent(mediaError);
    expect(event.type).toBe('error');
    expect(event.error).toBe(mediaError);
    expect(event.message).toBe(mediaError.message);
  });
});
