import { afterEach, describe, expect, it, vi } from 'vitest';
import { createConsoleLogger, LOG_LEVELS, logLevelRank, nullLogger } from '../log/logger.ts';
import type { LogLevelFilter } from '../log/logger.ts';

// ---- fixture helpers ---------------------------------------------------------

/** Console methods the logger can write through, in alphabetical order. */
const CONSOLE_METHODS = ['debug', 'error', 'info', 'warn'] as const;

type ConsoleMethod = (typeof CONSOLE_METHODS)[number];

function calledMethods(): ConsoleMethod[] {
  return CONSOLE_METHODS.filter((method) => vi.mocked(console[method]).mock.calls.length > 0);
}

/** Every spy, silenced so passing tests do not spray the test runner output. */
function spyConsole(): void {
  for (const method of CONSOLE_METHODS) vi.spyOn(console, method).mockImplementation(() => undefined);
}

/** Node-only: the default level reads `process.env.NODE_ENV`; browsers have
 * no `process` global (and Vite hardcodes `process.env.NODE_ENV` to
 * `'production'` in the browser bundle), so the env-derived default-level
 * block below only runs under `SIA_TEST_ENV=node`. */
const IN_NODE = typeof process !== 'undefined';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

// ---- level gating --------------------------------------------------------------

describe('level gating', () => {
  const EXPECTED: Record<LogLevelFilter, ConsoleMethod[]> = {
    debug: ['debug', 'error', 'info', 'warn'],
    error: ['error'],
    info: ['error', 'info', 'warn'],
    silent: [],
    trace: ['debug', 'error', 'info', 'warn'],
    warn: ['error', 'warn'],
  };
  const FILTERS: readonly LogLevelFilter[] = ['trace', 'debug', 'info', 'warn', 'error', 'silent'];

  for (const filter of FILTERS) {
    it(`level "${filter}" gates which severities reach the console`, () => {
      spyConsole();
      const logger = createConsoleLogger({ level: filter });
      logger.trace('trace');
      logger.debug('debug');
      logger.info('info');
      logger.warn('warn');
      logger.error('error');
      expect(calledMethods()).toEqual(EXPECTED[filter]);
    });
  }

  it('routes trace and debug through console.debug', () => {
    spyConsole();
    const logger = createConsoleLogger({ level: 'trace' });
    logger.trace('a');
    logger.debug('b');
    expect(console.debug).toHaveBeenCalledTimes(2);
    expect(console.debug).toHaveBeenNthCalledWith(1, '[sia-video-source] a');
    expect(console.debug).toHaveBeenNthCalledWith(2, '[sia-video-source] b');
  });

  it('routes info, warn and error to their own named console methods', () => {
    spyConsole();
    const logger = createConsoleLogger({ level: 'info' });
    logger.info('i');
    logger.warn('w');
    logger.error('e');
    expect(console.info).toHaveBeenCalledWith('[sia-video-source] i');
    expect(console.warn).toHaveBeenCalledWith('[sia-video-source] w');
    expect(console.error).toHaveBeenCalledWith('[sia-video-source] e');
    expect(console.debug).not.toHaveBeenCalled();
  });
});

// ---- rank ordering --------------------------------------------------------------

describe('logLevelRank', () => {
  it('maps severity to strictly increasing ranks', () => {
    expect(LOG_LEVELS).toEqual(['trace', 'debug', 'info', 'warn', 'error']);
    const ranks = LOG_LEVELS.map((level) => logLevelRank(level));
    expect(ranks).toEqual([0, 1, 2, 3, 4]);
    for (let i = 1; i < ranks.length; i++) {
      expect(ranks[i]).toBeGreaterThan(ranks[i - 1]);
    }
  });

  it('ranks silent below every real level', () => {
    expect(logLevelRank('silent')).toBe(-1);
    for (const level of LOG_LEVELS) expect(logLevelRank(level)).toBeGreaterThan(logLevelRank('silent'));
  });
});

// ---- nullLogger ------------------------------------------------------------------

describe('nullLogger', () => {
  it('is silent, returns itself from child(), and never touches console', () => {
    spyConsole();
    expect(nullLogger.level).toBe('silent');
    expect(nullLogger.child('worker')).toBe(nullLogger);
    expect(nullLogger.child('worker').child('load')).toBe(nullLogger);

    nullLogger.trace('t');
    nullLogger.debug('d');
    nullLogger.info('i');
    nullLogger.warn('w');
    nullLogger.error('e');
    expect(calledMethods()).toEqual([]);
    for (const method of CONSOLE_METHODS) expect(console[method]).not.toHaveBeenCalled();
  });
});

// ---- console formatting -----------------------------------------------------------

describe('console formatting', () => {
  it('renders a root header with the default prefix', () => {
    spyConsole();
    createConsoleLogger({ level: 'debug' }).info('hello');
    expect(console.info).toHaveBeenCalledWith('[sia-video-source] hello');
  });

  it('renders a custom prefix when provided', () => {
    spyConsole();
    createConsoleLogger({ level: 'warn', prefix: 'app' }).warn('low space');
    expect(console.warn).toHaveBeenCalledWith('[app] low space');
  });

  it('passes fields through as the final argument (same object reference)', () => {
    const delivered: unknown[] = [];
    vi.spyOn(console, 'warn').mockImplementation((message?: unknown, ...rest: unknown[]) => {
      delivered.push(message, ...rest);
    });
    const fields = { bytes: 1024, source: 'x' };
    createConsoleLogger({ level: 'warn' }).warn('low', fields);
    expect(delivered).toEqual(['[sia-video-source] low', fields]);
    expect(delivered[1]).toBe(fields);
  });

  it('omits the fields argument when none are given', () => {
    spyConsole();
    createConsoleLogger({ level: 'debug' }).info('bare');
    expect(console.info).toHaveBeenCalledTimes(1);
    expect(vi.mocked(console.info).mock.calls[0]).toHaveLength(1);
  });

  it('dot-joins nested child scopes into the header', () => {
    spyConsole();
    const logger = createConsoleLogger({ level: 'debug' }).child('worker').child('load');
    logger.info('ready');
    expect(console.info).toHaveBeenCalledWith('[sia-video-source:worker.load] ready');
  });

  it('keeps the root prefix for a single-level child scope', () => {
    spyConsole();
    createConsoleLogger({ level: 'debug' }).child('worker').debug('spun up');
    expect(console.debug).toHaveBeenCalledWith('[sia-video-source:worker] spun up');
  });
});

// ---- default level -----------------------------------------------------------------

// The default level is derived from a real `process.env.NODE_ENV` read (see
// `defaultLogLevel` in log/logger.ts). Its value cannot be stubbed in the
// browser, where there is no `process` global and the bundler hardcodes
// `process.env.NODE_ENV` to 'production'; these env-stub tests only make
// sense under the node environment.
describe.runIf(IN_NODE)('default level', () => {
  it('defaults to "warn" in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(createConsoleLogger().level).toBe('warn');
  });

  it('defaults to "info" when NODE_ENV is absent', () => {
    vi.unstubAllEnvs();
    delete process.env.NODE_ENV;
    expect(createConsoleLogger().level).toBe('info');
  });

  it('defaults to "info" when NODE_ENV is "development"', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(createConsoleLogger().level).toBe('info');
  });

  it('still honors an explicit level override in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(createConsoleLogger({ level: 'trace' }).level).toBe('trace');
    expect(createConsoleLogger({ level: 'silent' }).level).toBe('silent');
  });
});

// ---- custom options ----------------------------------------------------------------

describe('custom options', () => {
  it('reflects the configured level and prefix', () => {
    spyConsole();
    const logger = createConsoleLogger({ level: 'info', prefix: 'my-app' });
    expect(logger.level).toBe('info');
    logger.trace('t');
    expect(console.debug).not.toHaveBeenCalled();
    logger.warn('w');
    expect(console.warn).toHaveBeenCalledWith('[my-app] w');
  });
});
