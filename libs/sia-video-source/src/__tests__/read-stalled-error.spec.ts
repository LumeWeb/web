/** Protects stalled-read classification when another layer wraps its cause. */
import { expect, test } from 'vitest';
import { isReadStalledError, ReadStalledError } from '../ranged-reader.ts';

function stalledError(): ReadStalledError {
  return new ReadStalledError('read watchdog expired', { position: 0, stallTimeoutMs: 100 });
}

test('stalled reads remain recognizable through nested causes', () => {
  const stalled = stalledError();
  const wrapped = new Error('reader failed', { cause: stalled });
  expect(isReadStalledError(stalled)).toBe(true);
  expect(isReadStalledError(wrapped)).toBe(true);
  expect(isReadStalledError(new Error('inspection failed', { cause: wrapped }))).toBe(true);
});

test.each([null, undefined, 'ReadStalledError', new Error('ReadStalledError'), { name: 'ReadStalledError' }])(
  'unrelated errors and values do not become stalled reads: %j', (error) => {
    expect(isReadStalledError(error)).toBe(false);
  },
);

test('a cyclic cause chain without a stalled read terminates', () => {
  const error = new Error('cycle');
  error.cause = error;
  expect(isReadStalledError(error)).toBe(false);
});

test('a stalled read within a cyclic cause chain is recognized', () => {
  const stalled = stalledError();
  const wrapped = new Error('reader failed', { cause: stalled });
  stalled.cause = wrapped;
  expect(isReadStalledError(wrapped)).toBe(true);
});
