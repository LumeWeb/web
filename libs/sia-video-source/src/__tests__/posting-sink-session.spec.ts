/** Request-scoped flow-control coverage for the main-mode posting sink. */
import { describe, expect, it } from 'vitest';
import { createPostingSinkSession } from '../session/session-coordinator.ts';

const buffered = (end: number) => [{ end, start: 0 }];

describe('createPostingSinkSession', () => {
  it('holds at the ahead target and releases below it for the current request', async () => {
    const session = createPostingSinkSession({ aheadTargetSeconds: 30, requestId: 7 });
    session.setBufferedState({ buffered: buffered(30), pendingBytes: 0, playhead: 0, requestId: 7 });

    let released = false;
    const waiting = session.waitForBufferedAhead().then(() => {
      released = true;
    });
    await Promise.resolve();
    expect(released).toBe(false);

    session.setBufferedState({ buffered: buffered(29), pendingBytes: 0, playhead: 0, requestId: 7 });
    await waiting;
    expect(released).toBe(true);
  });

  it('ignores a stale request report', async () => {
    const session = createPostingSinkSession({ aheadTargetSeconds: 30, requestId: 7 });
    session.setBufferedState({ buffered: buffered(30), pendingBytes: 0, playhead: 0, requestId: 7 });

    let released = false;
    const waiting = session.waitForBufferedAhead().then(() => {
      released = true;
    });
    session.setBufferedState({ buffered: buffered(0), pendingBytes: 0, playhead: 0, requestId: 8 });

    await Promise.resolve();
    expect(released).toBe(false);

    session.setBufferedState({ buffered: buffered(0), pendingBytes: 0, playhead: 0, requestId: 7 });
    await waiting;
  });

  it('holds at capacity and releases when the host drains pending bytes', async () => {
    const session = createPostingSinkSession({ capacityBytes: 48, requestId: 7 });
    session.setBufferedState({ buffered: [], pendingBytes: 48, playhead: 0, requestId: 7 });

    let released = false;
    const waiting = session.waitForCapacity().then(() => {
      released = true;
    });
    await Promise.resolve();
    expect(released).toBe(false);

    session.setBufferedState({ buffered: [], pendingBytes: 0, playhead: 0, requestId: 7 });
    await waiting;
    expect(released).toBe(true);
  });
});
