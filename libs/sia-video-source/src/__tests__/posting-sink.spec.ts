/** Main-mode posting sink coverage: CHUNK posting and producer wait release. */
import { describe, expect, it } from 'vitest';
import { type WorkerToMainMessage, WorkerToMainMessageType } from '../protocol.ts';
import { createPostingSink } from '../session/session-coordinator.ts';

const currentBuffer = [{ end: 60, start: 0 }];

describe('createPostingSink', () => {
  it('posts chunks and releases buffered-ahead waiters when playback advances', async () => {
    const messages: WorkerToMainMessage[] = [];
    const sink = createPostingSink((message) => messages.push(message), 7);

    sink.append({ bytes: new Uint8Array([1, 2]), kind: 'media' });
    expect(messages).toEqual([
      {
        bytes: new Uint8Array([1, 2]),
        kind: 'media',
        requestId: 7,
        type: WorkerToMainMessageType.CHUNK,
      },
    ]);

    sink.setBufferedState({ buffered: currentBuffer, pendingBytes: 0, playhead: 0, requestId: 7 });
    let resolved = false;
    const waiting = sink.waitForBufferedAhead().then(() => {
      resolved = true;
    });
    await Promise.resolve();
    expect(resolved).toBe(false);

    sink.setBufferedState({ buffered: currentBuffer, pendingBytes: 0, playhead: 40, requestId: 7 });
    await waiting;
    expect(resolved).toBe(true);
  });

  it('transfers a full chunk buffer without copying it', () => {
    const posts: { message: WorkerToMainMessage; transfer?: Transferable[] }[] = [];
    const sink = createPostingSink((message, transfer) => posts.push({ message, transfer }), 7);
    const bytes = new Uint8Array([1, 2, 3, 4]);

    sink.append({ bytes, kind: 'init' });

    expect(posts).toHaveLength(1);
    const chunk = posts[0].message;
    expect(chunk.type).toBe(WorkerToMainMessageType.CHUNK);
    if (chunk.type !== WorkerToMainMessageType.CHUNK) throw new Error('expected CHUNK');
    expect(chunk.bytes).toBe(bytes);
    expect(posts[0].transfer).toEqual([bytes.buffer]);
  });

  it('copies a chunk subview before transferring it', () => {
    const posts: { message: WorkerToMainMessage; transfer?: Transferable[] }[] = [];
    const sink = createPostingSink((message, transfer) => posts.push({ message, transfer }), 7);
    const backing = new Uint8Array([0, 0, 5, 6, 7, 8, 0, 0]);

    sink.append({ bytes: backing.subarray(2, 6), kind: 'media' });

    expect(posts).toHaveLength(1);
    const chunk = posts[0].message;
    expect(chunk.type).toBe(WorkerToMainMessageType.CHUNK);
    if (chunk.type !== WorkerToMainMessageType.CHUNK) throw new Error('expected CHUNK');
    expect(Array.from(chunk.bytes)).toEqual([5, 6, 7, 8]);
    expect(posts[0].transfer).toEqual([chunk.bytes.buffer]);
    expect(chunk.bytes.buffer).not.toBe(backing.buffer);
    expect(Array.from(backing)).toEqual([0, 0, 5, 6, 7, 8, 0, 0]);
  });

  it('releases buffered-ahead waiters when reset', async () => {
    const sink = createPostingSink(() => undefined, 7);
    sink.setBufferedState({ buffered: currentBuffer, pendingBytes: 0, playhead: 0, requestId: 7 });

    const waiting = sink.waitForBufferedAhead();
    sink.resetParser(1);

    await expect(waiting).resolves.toBeUndefined();
  });

  it('releases buffered-ahead waiters when aborted', async () => {
    const sink = createPostingSink(() => undefined, 7);
    sink.setBufferedState({ buffered: currentBuffer, pendingBytes: 0, playhead: 0, requestId: 7 });

    const waiting = sink.waitForBufferedAhead();
    sink.abort();

    await expect(waiting).resolves.toBeUndefined();
  });
});
