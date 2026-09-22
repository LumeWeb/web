/**
 * Wire-protocol contract for the revived worker "debug event" seam: the HELLO
 * `log` forwarding threshold that opts a host in, the worker → main `LOG`
 * messages it gates on, and the typed milestone catalog those messages draw
 * their `name` from. Pure wire-shape checks — no worker or MediaSource — so
 * these run under the node vitest environment (`SIA_TEST_ENV=node`).
 */

import { describe, expect, it } from 'vitest';
import {
  isMainToWorkerMessage,
  isWorkerToMainMessage,
  MainToWorkerMessageType,
  WORKER_LOG_EVENT_NAMES,
  type WorkerLogEventName,
  workerLogLevel,
  WorkerToMainMessageType,
} from '../protocol.ts';

/** Builds a well-formed LOG message, the happy path every rejection is tested against. */
function logMessage(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    detail: { bytes: 4096, position: 0 },
    level: workerLogLevel.info,
    name: 'read.window-complete',
    requestId: 7,
    type: WorkerToMainMessageType.LOG,
    ...overrides,
  };
}

describe('isWorkerToMainMessage: LOG messages', () => {
  it('accepts a well-formed LOG message with scalar detail and an owning requestId', () => {
    expect(isWorkerToMainMessage(logMessage())).toBe(true);
  });

  it('accepts a requestId of null for connection-level events and an omitted detail', () => {
    expect(isWorkerToMainMessage(logMessage({ requestId: null }))).toBe(true);
    expect(isWorkerToMainMessage(logMessage({ detail: undefined }))).toBe(true);
  });

  it('accepts every severity advertised by workerLogLevel', () => {
    // The four wire severities are the only valid `level` values; each one
    // must clear the guard so gated hosts never see their own threshold echo.
    for (const level of Object.values(workerLogLevel)) {
      expect(isWorkerToMainMessage(logMessage({ level })), level).toBe(true);
    }
  });

  it('rejects a LOG message with a missing or non-string name', () => {
    expect(isWorkerToMainMessage(logMessage({ name: undefined }))).toBe(false);
    expect(isWorkerToMainMessage(logMessage({ name: 42 }))).toBe(false);
  });

  it('rejects a LOG message whose level is not one of the four wire severities', () => {
    // trace is deliberately not forwardable over the wire, and a foreign level
    // string is a malformed message — a reject, never a silent downgrade.
    expect(isWorkerToMainMessage(logMessage({ level: 'trace' }))).toBe(false);
    expect(isWorkerToMainMessage(logMessage({ level: 'verbose' }))).toBe(false);
  });

  it('rejects a LOG message with an undefined or wrong-typed requestId', () => {
    expect(isWorkerToMainMessage(logMessage({ requestId: undefined }))).toBe(false);
    expect(isWorkerToMainMessage(logMessage({ requestId: '7' }))).toBe(false);
  });

  it('rejects a LOG message whose detail is a string instead of an object', () => {
    expect(isWorkerToMainMessage(logMessage({ detail: 'read.window-complete' }))).toBe(false);
  });
});

describe('isMainToWorkerMessage: HELLO log threshold', () => {
  /** Builds a HELLO with a valid requestId; only the `log` field changes per case. */
  function hello(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return { requestId: 1, type: MainToWorkerMessageType.HELLO, ...overrides };
  }

  it('accepts a HELLO whose log threshold is one of the four forwardable severities', () => {
    expect(isMainToWorkerMessage(hello({ log: workerLogLevel.debug }))).toBe(true);
    expect(isMainToWorkerMessage(hello({ log: 'error' }))).toBe(true);
  });

  it('rejects a HELLO whose log threshold is trace or a non-string', () => {
    expect(isMainToWorkerMessage(hello({ log: 'trace' }))).toBe(false);
    expect(isMainToWorkerMessage(hello({ log: 1 }))).toBe(false);
  });

  it('accepts a HELLO without a log field (backward compat: old hosts never opt in)', () => {
    expect(isMainToWorkerMessage(hello())).toBe(true);
  });
});

describe('WORKER_LOG_EVENT_NAMES milestone catalog', () => {
  it('is non-empty and holds only strings', () => {
    expect(WORKER_LOG_EVENT_NAMES.length).toBeGreaterThan(0);
    for (const name of WORKER_LOG_EVENT_NAMES) {
      expect(typeof name, name).toBe('string');
    }
  });

  it('exposes exactly the four forwardable severities — trace is deliberately excluded', () => {
    // The wire excludes chatty trace by construction; the constant cannot
    // drift to accidentally carry it after this contract is relied on by gated
    // hosts and the LOG guard.
    expect(Object.values(workerLogLevel).sort()).toEqual(['debug', 'error', 'info', 'warn']);
    expect(workerLogLevel).not.toHaveProperty('trace');
  });

  it('is usable as the WorkerLogEventName union type', () => {
    // The catalog doubles as a literal union type: a known member is both a
    // valid compile-time name and a found runtime membership.
    for (const name of ['session.attach', 'sdk.built', 'sdk.build-failed', 'read.stalled', 'read.error', 'bytes.read'] as const) {
      const known: WorkerLogEventName = name;
      expect(WORKER_LOG_EVENT_NAMES).toContain(known);
    }
  });

  it('holds exactly the live milestone names: dead entries are removed, failure events added', () => {
    // The catalog is the single source of truth for emitted milestones, so it
    // cannot drift from the emitters: the never-emitted `session.source-start`
    // and `session.source-ok` are gone (no worker derives them), and the new
    // failure events (`sdk.build-failed`, `read.stalled`, `read.error`) are
    // present.
    expect(WORKER_LOG_EVENT_NAMES).toEqual([
      'session.attach',
      'session.detach',
      'session.error',
      'sdk.built',
      'sdk.build-failed',
      'object.resolved',
      'stream.started',
      'stream.ended',
      'read.window-start',
      'read.window-complete',
      'read.stalled',
      'read.error',
      'bytes.read',
    ]);
  });
});
