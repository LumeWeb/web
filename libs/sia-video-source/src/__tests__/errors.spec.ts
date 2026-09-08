import { describe, expect, it } from 'vitest';
import { MediaError } from '@videojs/media';
import { DEFAULT_ERROR_MESSAGES, MEDIA_ERROR_CODES, mediaErrorEvent, mediaErrorFromWorkerMessage } from '../errors.ts';

describe('MEDIA_ERROR_CODES', () => {
  it('maps worker kinds onto the HTMLMediaError codes', () => {
    expect(MEDIA_ERROR_CODES.unsupported).toBe(MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED);
    expect(MEDIA_ERROR_CODES.unsupported).toBe(4);
    expect(MEDIA_ERROR_CODES.decode).toBe(MediaError.MEDIA_ERR_DECODE);
    expect(MEDIA_ERROR_CODES.decode).toBe(3);
    expect(MEDIA_ERROR_CODES.network).toBe(MediaError.MEDIA_ERR_NETWORK);
    expect(MEDIA_ERROR_CODES.network).toBe(2);
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
