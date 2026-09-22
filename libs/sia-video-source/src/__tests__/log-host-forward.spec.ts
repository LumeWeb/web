/**
 * Host-element logging plug-in contract: the exported `logThresholdFor` HELLO
 * threshold mapper and `forwardWorkerLog` worker-event forwarder that wire
 * the host logger (`SiaVideoSource.logger`) to the worker `LOG` seam, plus
 * the cheap non-browser host-surface checks (getter/setter, option default —
 * the full host state machine stays browser-only in `sia-video-source.spec.ts`).
 *
 * Pure functions and construction only — no DOM, no MediaSource — so these
 * run under the node vitest environment (`SIA_TEST_ENV=node`).
 */

import { describe, expect, it } from 'vitest';
import { forwardWorkerLog, logThresholdFor, SiaVideoSource } from '../sia-video-source.ts';
import {
  createConsoleLogger,
  type LogFields,
  type Logger,
  type LogLevelFilter,
  nullLogger,
} from '../log/logger.ts';
import {
  type WorkerLogLevel,
  workerLogLevel,
  type WorkerToMainMessage,
  WorkerToMainMessageType,
} from '../protocol.ts';

type LogMessage = Extract<WorkerToMainMessage, { type: WorkerToMainMessageType.LOG }>;

/** Logger methods `forwardWorkerLog` may dispatch to. */
type LogMethod = 'debug' | 'error' | 'info' | 'warn';

interface RecordedCall {
  fields: unknown;
  level: LogMethod;
  msg: string;
}

/** Builds a well-formed LOG message; every case overrides only what it changes. */
function logMessage(overrides: Partial<LogMessage> = {}): LogMessage {
  return {
    detail: { bytes: 4096, position: 0 },
    level: workerLogLevel.info,
    name: 'read.window-complete',
    requestId: 7,
    type: WorkerToMainMessageType.LOG,
    ...overrides,
  };
}

/**
 * A Logger whose every emit method records `(msg, fields)` instead of emitting
 * and whose `child()` records which scope was requested (and returns itself so
 * the forwarded line lands back on the same recorder).
 */
function recordingLogger(): { calls: RecordedCall[]; childScopes: string[]; logger: Logger } {
  const calls: RecordedCall[] = [];
  const childScopes: string[] = [];
  const emit =
    (level: LogMethod) =>
    (msg: string, fields?: LogFields): void => {
      calls.push({ fields, level, msg });
    };
  const sink: Logger = {
    child: (scope: string): Logger => {
      childScopes.push(scope);
      return sink;
    },
    debug: emit('debug'),
    error: emit('error'),
    info: emit('info'),
    level: 'debug',
    trace: emit('debug'),
    warn: emit('warn'),
  };
  return { calls, childScopes, logger: sink };
}

// ---- forwardWorkerLog: severity → logger method --------------------------------

describe('forwardWorkerLog', () => {
  it('maps each wire severity to the matching logger method (debug/info/warn/error)', () => {
    const expected: Record<WorkerLogLevel, LogMethod> = {
      debug: 'debug',
      error: 'error',
      info: 'info',
      warn: 'warn',
    };
    for (const level of Object.values(workerLogLevel)) {
      const { calls, logger } = recordingLogger();
      forwardWorkerLog(logger, logMessage({ level }));
      expect(calls[0], level).toMatchObject({
        level: expected[level],
        msg: 'worker read.window-complete',
      });
    }
  });

  it("forwards onto the logger's 'worker' child scope", () => {
    const { calls, childScopes, logger } = recordingLogger();
    forwardWorkerLog(logger, logMessage({ level: workerLogLevel.info }));
    expect(childScopes).toEqual(['worker']);
    expect(calls).toHaveLength(1);
  });

  it('spreads detail fields alongside the owning requestId', () => {
    const { calls, logger } = recordingLogger();
    forwardWorkerLog(logger, logMessage({ level: workerLogLevel.debug, requestId: 42 }));
    expect(calls[0].fields).toEqual({ bytes: 4096, position: 0, requestId: 42 });
  });

  it('retains a null requestId for connection-level events', () => {
    const { calls, logger } = recordingLogger();
    forwardWorkerLog(logger, logMessage({ level: workerLogLevel.warn, requestId: null }));
    expect((calls[0].fields as Record<string, unknown>).requestId).toBeNull();
  });

  it('merges nested detail without mutating the original message object', () => {
    const message = logMessage({ detail: { bytes: 4096, position: 0 }, level: workerLogLevel.info });
    const { calls, logger } = recordingLogger();
    forwardWorkerLog(logger, message);
    // The forwarded fields are a spread — a fresh object — so mutating them
    // cannot leak back, and the source message keeps exactly its own keys.
    (calls[0].fields as Record<string, unknown>).extra = 'injected';
    expect(message.detail).toEqual({ bytes: 4096, position: 0 });
    expect(Object.keys(message.detail as Record<string, unknown>).sort()).toEqual(['bytes', 'position']);
    expect(message).toEqual(
      logMessage({ detail: { bytes: 4096, position: 0 }, level: workerLogLevel.info }),
    );
  });

  it('drops an unknown severity silently — no throw, no emitted line', () => {
    // `'trace'` is the library's finest level but never forwardable on the
    // wire; a foreign/draft worker posting it (or any other junk) must be
    // ignored: nothing is emitted and nothing throws.
    const trace = logMessage({ level: 'trace' as unknown as WorkerLogLevel, requestId: null });
    const { calls, logger } = recordingLogger();
    expect(() => forwardWorkerLog(logger, trace)).not.toThrow();
    expect(calls).toEqual([]);
  });

  it('is a silent no-op when handed a nullLogger', () => {
    expect(() => forwardWorkerLog(nullLogger, logMessage())).not.toThrow();
    // nullLogger.child returns nullLogger and every emit is a no-op — nothing
    // can observe it, but the call must at least not throw.
  });
});

// ---- logThresholdFor: host console level → HELLO wire threshold -----------------

describe('logThresholdFor', () => {
  it("maps trace/debug onto the wire's full 'debug' threshold", () => {
    expect(logThresholdFor('trace')).toBe(workerLogLevel.debug);
    expect(logThresholdFor('debug')).toBe(workerLogLevel.debug);
  });

  it("maps info onto the wire's 'info' threshold — lifecycle milestones only, no debug reader noise", () => {
    expect(logThresholdFor('info')).toBe(workerLogLevel.info);
  });

  it('raises the worker threshold to match warn/error console filters', () => {
    expect(logThresholdFor('warn')).toBe(workerLogLevel.warn);
    expect(logThresholdFor('error')).toBe(workerLogLevel.error);
  });

  it('omits the threshold for a silent logger (undefined = no LOG on the wire)', () => {
    expect(logThresholdFor('silent')).toBeUndefined();
  });

  it('always maps to a forwardable wire severity or undefined, for every filter value', () => {
    const filters: readonly LogLevelFilter[] = ['trace', 'debug', 'info', 'warn', 'error', 'silent'];
    for (const filter of filters) {
      const threshold = logThresholdFor(filter);
      if (threshold === undefined) {
        expect(filter).toBe('silent');
      } else {
        expect(Object.values(workerLogLevel)).toContain(threshold);
        expect(threshold).not.toBe('trace');
      }
    }
  });
});

// ---- cheap host surface (constructor + logger getter/setter) --------------------

describe('SiaVideoSource logger surface', () => {
  it('defaults to a console logger matching createConsoleLogger() level', () => {
    const host = new SiaVideoSource();
    expect(host.logger.level).toBe(createConsoleLogger().level);
    host.destroy();
  });

  it('honors the logger option', () => {
    const host = new SiaVideoSource({ logger: nullLogger });
    expect(host.logger).toBe(nullLogger);
    host.destroy();
  });

  it('per-render setter stores the reference and the getter re-reads it', () => {
    const host = new SiaVideoSource();
    const customLogger: Logger = {
      child: (): Logger => nullLogger,
      debug: (): void => undefined,
      error: (): void => undefined,
      info: (): void => undefined,
      level: 'warn' as const,
      trace: (): void => undefined,
      warn: (): void => undefined,
    };
    host.logger = customLogger;
    expect(host.logger).toBe(customLogger);
    host.destroy();
  });
});
