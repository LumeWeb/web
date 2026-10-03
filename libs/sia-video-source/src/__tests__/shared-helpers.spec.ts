/**
 * Direct tests for the shared internal helpers in `shared-helpers.ts` (byte
 * seed equality, HELLO worker-config equality, and the one-line error
 * description) that `session-coordinator.ts`, `sia-composition.ts`, and
 * `media/library-load.ts` all use. These pin the exact semantics the
 * duplicated private copies carried, so the extraction cannot change behavior:
 *
 * - `appKeySeedsEqual` is byte equality over two decapsulated seeds (or
 *   nulls); a scrubbed buffer (zero-filled in place) reads as "changed".
 * - `workerConfigsEqual` compares ONLY the indexer endpoint: app metadata is
 *   descriptive (not part of SDK auth) and `workerMse` is a mode preference,
 *   so neither participates in connection identity.
 * - `describeError` is `error.message` for `Error` instances and `String()`
 *   for anything else — the exact copy the worker posts as `ERROR` context
 *   and the load pipeline stores as an `unsupported` detail.
 */

import { describe, expect, it } from 'vitest';
import type { AppMetadata } from '@siafoundation/sia-storage';
import { appKeySeedsEqual, describeError, workerConfigsEqual } from '../shared-helpers.ts';
import type { WorkerConfig } from '../protocol.ts';

/** Minimal app metadata so `WorkerConfig` fixtures typecheck. */
function appMetadata(name: string): AppMetadata {
  return { appId: name, callbackUrl: '', description: '', logoUrl: '', name, serviceUrl: 'https://app.example' };
}

/** A HELLO `WorkerConfig` with the given indexer URL and app name. */
function workerConfig(indexerUrl: string, name = 'app'): WorkerConfig {
  return { app: appMetadata(name), indexerUrl };
}

describe('appKeySeedsEqual', () => {
  it('treats two nulls and a shared reference as equal', () => {
    expect(appKeySeedsEqual(null, null)).toBe(true);
    const seed = new Uint8Array([1, 2, 3]);
    expect(appKeySeedsEqual(seed, seed)).toBe(true);
  });

  it('treats a null versus any seed (in either slot) as not equal', () => {
    const seed = new Uint8Array([1, 2, 3]);
    expect(appKeySeedsEqual(null, seed)).toBe(false);
    expect(appKeySeedsEqual(seed, null)).toBe(false);
  });

  it('rejects differing lengths before comparing bytes', () => {
    expect(appKeySeedsEqual(new Uint8Array([1, 2]), new Uint8Array([1, 2, 3]))).toBe(false);
  });

  it('is true for byte-identical seeds in distinct buffers', () => {
    expect(appKeySeedsEqual(new Uint8Array([1, 2, 3]), new Uint8Array([1, 2, 3]))).toBe(true);
  });

  it('is false when any byte differs', () => {
    expect(appKeySeedsEqual(new Uint8Array([1, 2, 3]), new Uint8Array([1, 2, 4]))).toBe(false);
  });

  it('reads a scrubbed (zero-filled in place) buffer as changed', () => {
    const seed = new Uint8Array([1, 2, 3]);
    const copy = new Uint8Array(seed);
    seed.fill(0);
    expect(appKeySeedsEqual(seed, copy)).toBe(false);
  });
});

describe('workerConfigsEqual', () => {
  it('treats two undefineds and a shared reference as equal', () => {
    expect(workerConfigsEqual(undefined, undefined)).toBe(true);
    const config = workerConfig('https://indexer.example');
    expect(workerConfigsEqual(config, config)).toBe(true);
  });

  it('treats undefined versus any config (in either slot) as not equal', () => {
    const config = workerConfig('https://indexer.example');
    expect(workerConfigsEqual(undefined, config)).toBe(false);
    expect(workerConfigsEqual(config, undefined)).toBe(false);
  });

  it('is true for distinct configs sharing the indexer URL', () => {
    expect(
      workerConfigsEqual(workerConfig('https://indexer.example'), workerConfig('https://indexer.example')),
    ).toBe(true);
  });

  it('ignores app metadata: descriptive-only, not part of connection identity', () => {
    expect(workerConfigsEqual(workerConfig('https://indexer.example', 'app-a'), workerConfig('https://indexer.example', 'app-b'))).toBe(true);
  });

  it('ignores the workerMse preference: a mode, not connection identity', () => {
    expect(
      workerConfigsEqual(
        { ...workerConfig('https://indexer.example'), workerMse: 'main' },
        { ...workerConfig('https://indexer.example'), workerMse: 'auto' },
      ),
    ).toBe(true);
  });

  it('is false when the indexer URLs differ', () => {
    expect(workerConfigsEqual(workerConfig('https://indexer.example'), workerConfig('https://other.example'))).toBe(false);
  });
});

describe('describeError', () => {
  it('returns the message of an Error', () => {
    expect(describeError(new Error('boom'))).toBe('boom');
  });

  it('returns an empty string for an Error with an empty message', () => {
    expect(describeError(new Error(''))).toBe('');
  });

  it('passes strings through unchanged', () => {
    expect(describeError('plain failure')).toBe('plain failure');
  });

  it('stringifies non-Error values', () => {
    expect(describeError(42)).toBe('42');
    expect(describeError(null)).toBe('null');
    expect(describeError(undefined)).toBe('undefined');
    expect(describeError({ code: 500 })).toBe('[object Object]');
  });
});
