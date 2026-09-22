/**
 * Leveled, dependency-free logging for `@lumeweb/sia-video-source`.
 *
 * Consumers opt into verbosity: every internal call site goes through a
 * `Logger`, and the library gates its own output on the configured level.
 * Defaults keep development builds informative (lifecycle milestones, with no
 * per-read debug noise) and production quiet without any application
 * configuration, and nothing in this module can throw or touch globals that
 * browsers lack.
 */

/** Log severities in severity order, least to most severe. */
export const LOG_LEVELS = ['trace', 'debug', 'info', 'warn', 'error'] as const;

/**
 * Structured fields for one log line. Kept opaque (`unknown` values) so a
 * logger never has to coerce or serialize them before forwarding.
 */
export type LogFields = Readonly<Record<string, unknown>>;

/**
 * Leveled logging seam.
 *
 * Implementations must never receive credential material: the library keeps
 * keys and secrets out of every message and `fields` object it logs, so a
 * logger cannot observe them and must not expect them.
 */
export interface Logger {
  /** Derives a logger that tags output with `scope`, dot-joined when nested. */
  child(scope: string): Logger;
  debug(msg: string, fields?: LogFields): void;
  error(msg: string, fields?: LogFields): void;
  info(msg: string, fields?: LogFields): void;
  /** Minimum severity this logger emits; `'silent'` when muted. */
  readonly level: LogLevelFilter;
  trace(msg: string, fields?: LogFields): void;
  warn(msg: string, fields?: LogFields): void;
}

/** Log severity; derived from `LOG_LEVELS` so the order can never drift. */
export type LogLevel = (typeof LOG_LEVELS)[number];

/** Minimum severity to emit; `'silent'` disables all output. */
export type LogLevelFilter = 'silent' | LogLevel;

/** Shared no-op body for `nullLogger`'s methods. */
function noop(_msg: string, _fields?: LogFields): void {
  return undefined;
}

/**
 * Logger that drops everything: `level` is `'silent'`, every method is a
 * no-op, and `child()` returns itself. The default where no output is wanted.
 */
export const nullLogger: Logger = {
  child: (): Logger => nullLogger,
  debug: noop,
  error: noop,
  info: noop,
  level: 'silent',
  trace: noop,
  warn: noop,
};

/** Default prefix stamped on every header. */
const DEFAULT_PREFIX = 'sia-video-source';

/** Console sink each level writes through (trace shares debug's sink). */
const CONSOLE_METHOD: Readonly<Record<LogLevel, 'debug' | 'error' | 'info' | 'warn'>> = {
  debug: 'debug',
  error: 'error',
  info: 'info',
  trace: 'debug',
  warn: 'warn',
};

/**
 * Console-backed logger. Root lines render `[prefix] msg`; child scopes are
 * dot-joined inside the header (`[prefix:scope.sub] msg`). `fields` is passed
 * through as the final console argument so DevTools renders it live. Guards
 * every console access with a `typeof console` check; never throws.
 */
export function createConsoleLogger(
  options: { level?: LogLevelFilter; prefix?: string } = {},
): Logger {
  const filter = options.level ?? defaultLogLevel();
  const prefix = options.prefix ?? DEFAULT_PREFIX;

  const build = (scope: string): Logger => {
    const log =
      (methodLevel: LogLevel) =>
      (msg: string, fields?: LogFields): void => {
        if (filter === 'silent') return;
        if (logLevelRank(methodLevel) < logLevelRank(filter)) return;
        if (typeof console === 'undefined') return;
        const header = `[${prefix}${scope === '' ? '' : `:${scope}`}] ${msg}`;
        const method = CONSOLE_METHOD[methodLevel];
        if (fields === undefined) console[method](header);
        else console[method](header, fields);
      };

    return {
      child: (childScope: string): Logger => build(scope === '' ? childScope : `${scope}.${childScope}`),
      debug: log('debug'),
      error: log('error'),
      info: log('info'),
      level: filter,
      trace: log('trace'),
      warn: log('warn'),
    };
  };

  return build('');
}

/**
 * Numeric severity, strictly increasing from `'trace'` (0) to `'error'` (4).
 * `'silent'` ranks below `'trace'` (-1) so it is the bottom of every ordering.
 * Emit gating is a single `>=` comparison of a level's rank against the
 * filter's; `'silent'` is short-circuited separately because its below-trace
 * rank would otherwise pass every level through the gate.
 */
export function logLevelRank(level: LogLevelFilter): number {
  return level === 'silent' ? -1 : LOG_LEVELS.indexOf(level);
}

/**
 * Production emits only `'warn'` (a shipping app should not be spammed by
 * library internals); everything else gets `'info'`. `'info'` keeps lifecycle
 * milestones in the dev console — attach, sdk.built, object.resolved, stream
 * events — while swallowing the chatty debug-level per-read milestones
 * (`bytes.read` every MiB, `read.window-*`) whose audience is a developer
 * actively investigating a load. The check is fully optional-chained because
 * bundlers statically replace `process.env.NODE_ENV` and browsers have no
 * `process` at all — neither may throw here.
 */
function defaultLogLevel(): LogLevelFilter {
  return typeof process !== 'undefined' && process.env?.NODE_ENV === 'production' ? 'warn' : 'info';
}
