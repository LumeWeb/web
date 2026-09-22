/**
 * `loglevel` adapter: exposes an external loglevel-style logger behind the
 * library's dependency-free `Logger` seam.
 *
 * Every internal call site only ever speaks `Logger` (`createConsoleLogger`,
 * `nullLogger`, or a wrapped third-party logger). `wrapLoglevel` is the bridge
 * for embedding contexts that already own a `loglevel` instance — or any object
 * with the same method shape, including a plain `console`. It forwards each
 * line straight through to that instance's own methods, so level gating,
 * formatting, and transport all stay the wrapped instance's business; the
 * adapter never re-implements them.
 */

import type { LogFields, Logger, LogLevelFilter } from './logger.ts';

/**
 * Minimal structural shape of a loglevel-style logger.
 *
 * Deliberately mirrors the `loglevel` package's `Logger` surface (every method
 * takes a payload plus varargs) without importing that package, so this module
 * carries no dependency on it: any real `loglevel` instance or any
 * console-like object qualifies. `trace` is optional because console-like
 * objects do not always distinguish it from `debug`.
 */
export interface LoglevelLike {
  debug(payload: unknown, ...rest: unknown[]): void;
  error(payload: unknown, ...rest: unknown[]): void;
  info(payload: unknown, ...rest: unknown[]): void;
  trace?(payload: unknown, ...rest: unknown[]): void;
  warn(payload: unknown, ...rest: unknown[]): void;
}

/** Minimum level recorded when `options.level` is omitted. */
const DEFAULT_LEVEL: LogLevelFilter = 'debug';

/**
 * Adapts a loglevel-style instance into the library's `Logger`.
 *
 * All five levels forward through to `underlying`, passing the message and the
 * structured fields through unmodified as the payload plus one trailing
 * argument: `debug`/`info`/`warn`/`error` call the same-named method, and
 * `trace` calls `underlying.trace` when present, falling back to
 * `underlying.debug` otherwise. Loglevel already gates on its own internal
 * level, so the wrapper always calls through and never filters itself; the
 * returned `level` merely records `options.level` (default `'debug'`) for the
 * caller.
 *
 * `options.prefix` starts the recorded scope chain and `child(scope)` returns a
 * **new** wrapper with `scope` appended — the wrapped instance is never
 * mutated. Because the adapter forwards raw messages, that recorded scope only
 * shows up if the wrapped instance renders prefixes itself (for example a
 * `loglevel` instance configured with a prefix-writing method factory); when
 * the wrapped logger does no such rendering, prefer `createConsoleLogger` for
 * visible, dot-joined `[prefix] msg` headers.
 */
export function wrapLoglevel(
  underlying: LoglevelLike,
  options: { level?: LogLevelFilter; prefix?: string } = {},
): Logger {
  const level: LogLevelFilter = options.level ?? DEFAULT_LEVEL;
  const rootScopes: readonly string[] = options.prefix === undefined ? [] : [options.prefix];

  const build = (scopes: readonly string[]): Logger => {
    const emit =
      (method: 'debug' | 'error' | 'info' | 'trace' | 'warn') =>
      (msg: string, fields?: LogFields): void => {
        if (method === 'trace' && underlying.trace !== undefined) {
          underlying.trace(msg, fields);
        } else {
          underlying[method === 'trace' ? 'debug' : method](msg, fields);
        }
      };

    return {
      child: (scope: string): Logger => build([...scopes, scope]),
      debug: emit('debug'),
      error: emit('error'),
      info: emit('info'),
      level,
      trace: emit('trace'),
      warn: emit('warn'),
    };
  };

  return build(rootScopes);
}
