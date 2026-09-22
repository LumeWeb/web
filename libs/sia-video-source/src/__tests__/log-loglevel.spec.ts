/**
 * Contract for `wrapLoglevel`, the bridge between an external loglevel-style
 * logger and the library's `Logger` seam. Plain `vi.fn()` stubs stand in for
 * the wrapped instance so every call the adapter forwards is observable, with
 * one console-like stub covering the non-mock path.
 */

import { describe, expect, it, vi } from 'vitest';
import type { LogFields } from '../log/logger.ts';
import { type LoglevelLike, wrapLoglevel } from '../log/loglevel.ts';

/** The loglevel method shape the stubs must be callable as. */
type LoglevelMethod = (payload: unknown, ...rest: unknown[]) => void;

/** A loglevel-style stub whose methods are all recorded mocks. */
interface StubLogger extends LoglevelLike {
  debug: StubMethod;
  error: StubMethod;
  info: StubMethod;
  trace?: StubMethod;
  warn: StubMethod;
}

/** A `vi.fn()`-backed stub method, typed to satisfy `LoglevelLike`. */
type StubMethod = ReturnType<typeof vi.fn<LoglevelMethod>>;

/** Builds a fresh `LoglevelLike` stub, optionally with a `trace` method. */
function makeStubLog(includeTrace = true): StubLogger {
  const stub: StubLogger = {
    debug: vi.fn<LoglevelMethod>(),
    error: vi.fn<LoglevelMethod>(),
    info: vi.fn<LoglevelMethod>(),
    warn: vi.fn<LoglevelMethod>(),
  };
  if (includeTrace) stub.trace = vi.fn<LoglevelMethod>();
  return stub;
}

describe('wrapLoglevel', () => {
  it('forwards msg and fields unmodified to the matching method at each level', () => {
    const underlying = makeStubLog(false);
    const log = wrapLoglevel(underlying);

    log.trace('a trace line', { attempt: 0 });
    log.debug('a debug line', { attempt: 1 });
    log.info('an info line', { attempt: 2 });
    log.warn('a warn line', { attempt: 3 });
    log.error('an error line', { attempt: 4 });

    expect(underlying.debug).toHaveBeenCalledWith('a debug line', { attempt: 1 });
    expect(underlying.info).toHaveBeenCalledWith('an info line', { attempt: 2 });
    expect(underlying.warn).toHaveBeenCalledWith('a warn line', { attempt: 3 });
    expect(underlying.error).toHaveBeenCalledWith('an error line', { attempt: 4 });
    // No trace method on the stub: the trace line must reach debug.
    expect(underlying.debug).toHaveBeenCalledWith('a trace line', { attempt: 0 });
    expect(underlying.debug).toHaveBeenCalledTimes(2);
  });

  it('passes fields straight through and a bare msg when fields are omitted', () => {
    const underlying = makeStubLog(false);
    const log = wrapLoglevel(underlying);

    log.debug('no fields');
    log.info('with fields', { one: 1, two: 2 } satisfies LogFields);

    expect(underlying.debug.mock.calls[0]).toEqual(['no fields', undefined]);
    expect(underlying.info).toHaveBeenCalledWith('with fields', { one: 1, two: 2 });
  });

  it('uses trace when the wrapped instance provides it and falls back to debug otherwise', () => {
    const withTrace = makeStubLog(true);
    wrapLoglevel(withTrace).trace('t', { n: 1 });
    expect(withTrace.trace).toHaveBeenCalledWith('t', { n: 1 });
    expect(withTrace.debug).not.toHaveBeenCalled();

    const withoutTrace = makeStubLog(false);
    wrapLoglevel(withoutTrace).trace('t', { n: 2 });
    expect(withoutTrace.trace).toBeUndefined();
    expect(withoutTrace.debug).toHaveBeenCalledWith('t', { n: 2 });
  });

  it('defaults level to debug and honors an options.level override', () => {
    expect(wrapLoglevel(makeStubLog(false)).level).toBe('debug');
    expect(wrapLoglevel(makeStubLog(false), { level: 'warn' }).level).toBe('warn');
    expect(wrapLoglevel(makeStubLog(false), { level: 'silent' }).level).toBe('silent');
  });

  it('calls through regardless of the recorded level, leaving gating to the wrapped instance', () => {
    const underlying = makeStubLog(false);
    const log = wrapLoglevel(underlying, { level: 'error' });

    log.debug('still forwarded');

    expect(log.level).toBe('error');
    expect(underlying.debug.mock.calls[0]).toEqual(['still forwarded', undefined]);
  });

  it('child returns a fresh wrapper without mutating the wrapped instance', () => {
    const underlying = makeStubLog(false);
    const log = wrapLoglevel(underlying, { prefix: 'app' });
    const child = log.child('net');

    // The wrapped instance gained no child/prefix surface and lost no calls.
    expect(underlying).not.toHaveProperty('child');
    expect(underlying.debug).not.toHaveBeenCalled();

    // The child is a distinct wrapper with the recorded level, still calling
    // through to the same underlying methods.
    expect(child).not.toBe(log);
    expect(child.level).toBe('debug');
    child.debug('deep', { hop: 2 });
    expect(underlying.debug.mock.calls).toEqual([['deep', { hop: 2 }]]);

    // Descendant scopes thread through the original wrapper's instance too.
    const grandchild = child.child('media');
    grandchild.warn('w');
    expect(underlying.warn.mock.calls[0]).toEqual(['w', undefined]);

    // The parent wrapper still talks to the same underlying instance.
    log.error('from parent');
    expect(underlying.error).toHaveBeenCalledWith('from parent', undefined);
  });

  it('works against a console-like stub object', () => {
    const seen: Record<'debug' | 'error' | 'info' | 'warn', string[]> = {
      debug: [],
      error: [],
      info: [],
      warn: [],
    };
    const consoleLike: LoglevelLike = {
      debug: (payload: unknown) => seen.debug.push(String(payload)),
      error: (payload: unknown) => seen.error.push(String(payload)),
      info: (payload: unknown) => seen.info.push(String(payload)),
      warn: (payload: unknown) => seen.warn.push(String(payload)),
    };

    const log = wrapLoglevel(consoleLike);
    log.debug('d');
    log.info('i');
    log.warn('w');
    log.error('e');
    log.trace('t'); // no console-like trace: falls back to debug

    expect(seen.debug).toEqual(['d', 't']);
    expect(seen.info).toEqual(['i']);
    expect(seen.warn).toEqual(['w']);
    expect(seen.error).toEqual(['e']);
  });
});
