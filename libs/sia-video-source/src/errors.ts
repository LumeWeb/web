/**
 * Maps worker failure reports onto the HTMLMediaElement `MediaError` contract
 * the video.js v10 host classes (and by extension the `errorFeature` /
 * `ErrorDialog`) speak.
 *
 * Modeled on the `HlsJsErrorsMixin` in video.js v10's hls-js media: the engine
 * reports structured failures, the host stores a single fatal `MediaError` and
 * surfaces it through the `error` getter plus an `error` event, and the stored
 * error is dropped on the next load.
 */

import { MediaError } from '@videojs/media';
import type { WorkerErrorCode } from './protocol.ts';

export interface WorkerErrorMessage {
  readonly context?: string;
  readonly kind: WorkerErrorCode;
}

/**
 * Worker failure kinds → `MediaError` codes.
 *
 * - `unsupported` → `MEDIA_ERR_SRC_NOT_SUPPORTED` (4): unknown container, a
 *   container the pipeline cannot transmux to fMP4, or a codec/MIME the
 *   platform's MSE does not accept.
 * - `decode` → `MEDIA_ERR_DECODE` (3): remux failure, or SourceBuffer
 *   creation/append failure.
 * - `network` → `MEDIA_ERR_NETWORK` (2): SDK/WebTransport/stream failures.
 * - Anything unrecognized falls back to `MEDIA_ERR_CUSTOM` (100).
 */
export const MEDIA_ERROR_CODES: Readonly<Record<WorkerErrorCode, number>> = {
  decode: MediaError.MEDIA_ERR_DECODE,
  network: MediaError.MEDIA_ERR_NETWORK,
  unsupported: MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED,
};

export const DEFAULT_ERROR_MESSAGES: Readonly<Record<WorkerErrorCode, string>> = {
  decode: 'Playback failed while preparing Sia data for rendering.',
  network: 'The Sia network connection failed.',
  unsupported: 'This Sia object is not playable in this browser.',
};

/**
 * Builds the DOM-facing `error` event for a `MediaError`, matching the shape
 * the v10 error feature and native `HTMLMediaElement` error handling expect.
 */
export function mediaErrorEvent(error: MediaError): ErrorEvent {
  return new ErrorEvent('error', { error, message: error.message });
}

/**
 * Builds a fatal `MediaError` from a worker failure report. Unrecognized kinds
 * degrade to `MEDIA_ERR_CUSTOM` (100) rather than throwing.
 */
export function mediaErrorFromWorkerMessage(message: WorkerErrorMessage): MediaError {
  const code = MEDIA_ERROR_CODES[message.kind] ?? MediaError.MEDIA_ERR_CUSTOM;
  const fallback = DEFAULT_ERROR_MESSAGES[message.kind];
  return new MediaError(message.context ?? fallback ?? 'Playback failed.', code, true, message.context);
}
