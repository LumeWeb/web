/** Cleanup failures are reported without changing SDK work results or ownership. */
import { describe, expect, it, vi } from "vitest";
import {
  createSessionFromClient,
  createSiaSdkSession,
  RetireReason,
  SdkIssueKind,
  SdkState,
} from "../src/index.ts";

describe("cleanup completion", () => {
  it("drain excludes a completed failure before its error callback runs", async () => {
    const failure = new Error("cleanup");
    let drained: Promise<void> | undefined;
    const session = createSessionFromClient(
      {
        free() {
          throw failure;
        },
      },
      {
        onError(issue) {
          if (issue.kind === SdkIssueKind.Disposal) drained = session.drain();
        },
      },
    );
    await expect(session.clear()).rejects.toMatchObject({ errors: [failure] });
    expect(drained).toBeDefined();
    await expect(drained).resolves.toBeUndefined();
    await session.close();
  });

  it("a synchronous cleanup failure rejects closure without throwing from close", async () => {
    const failure = new Error("cleanup");
    const onDispose = vi.fn(),
      onError = vi.fn();
    const session = createSessionFromClient(
      {
        free() {
          throw failure;
        },
      },
      { onDispose, onError },
    );
    let closing: Promise<void> | undefined;
    expect(() => {
      closing = session.close();
    }).not.toThrow();
    await expect(closing).rejects.toMatchObject({ errors: [failure] });
    expect(onError).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ error: failure, kind: SdkIssueKind.Disposal }),
    );
    expect(onDispose).not.toHaveBeenCalled();
    expect(session.source.getSnapshot().state).toBe(SdkState.Closed);
  });

  it("a rejected cleanup is observed and reported before closure rejects", async () => {
    const failure = { reason: "native cleanup" };
    const onDispose = vi.fn(),
      onError = vi.fn();
    const session = createSiaSdkSession<object>({ onDispose, onError });
    session.setHandle({ dispose: () => Promise.reject(failure), value: {} });
    const closing = session.close();
    await Promise.resolve();
    await Promise.resolve();
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ error: failure, kind: SdkIssueKind.Disposal }),
    );
    await expect(closing).rejects.toMatchObject({ errors: [failure] });
    expect(onDispose).not.toHaveBeenCalled();
  });

  it("closure waits for every captured cleanup and returns all of their failures", async () => {
    const failures = [new Error("first"), new Error("second")];
    const session = createSiaSdkSession<{ name: string }>();
    const a = {
      dispose() {
        throw failures[0];
      },
      value: { name: "first" },
    };
    const b = {
      dispose() {
        throw failures[1];
      },
      value: { name: "second" },
    };
    session.setHandle(a);
    const first = session.source.acquire();
    session.setHandle(b);
    const second = session.source.acquire();
    const closing = session.close();
    expect(() => {
      first.release();
      second.release();
    }).not.toThrow();
    await expect(closing).rejects.toMatchObject({ errors: failures });
  });

  it("asynchronous cleanup delays disposal notification and closure", async () => {
    let finish: () => void = () => undefined;
    const done = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const onDispose = vi.fn();
    const session = createSiaSdkSession<object>({ onDispose });
    const id = session.setHandle({ dispose: () => done, value: {} });
    const closing = session.close();
    expect(onDispose).not.toHaveBeenCalled();
    finish();
    await closing;
    expect(onDispose).toHaveBeenCalledExactlyOnceWith({
      id,
      reason: RetireReason.Closed,
    });
  });

  it("throwing disposal notifications do not prevent cleanup completion", async () => {
    const failure = new Error("notification");
    const onError = vi.fn();
    const sdk = { free: vi.fn() };
    const session = createSessionFromClient(sdk, {
      onDispose() {
        throw failure;
      },
      onError,
    });
    await session.close();
    expect(sdk.free).toHaveBeenCalledOnce();
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ error: failure, kind: SdkIssueKind.Listener }),
    );
  });

  it("rejected listeners and a failing error reporter do not affect other listeners", async () => {
    const listener = vi.fn();
    const onError = vi.fn(() => Promise.reject(new Error("reporter")));
    const session = createSiaSdkSession<object>({ onError });
    session.source.subscribe(() => Promise.reject(new Error("observer")));
    session.source.subscribe(listener);
    session.set({ free: vi.fn() });
    await Promise.resolve();
    await Promise.resolve();
    expect(onError).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledOnce();
    await session.close();
  });

  it("cleanup failure does not replace an application callback's original error", async () => {
    const failure = { reason: "application" };
    const cleanupFailure = new Error("cleanup");
    const session = createSessionFromClient({
      free() {
        throw cleanupFailure;
      },
    });
    let closing: Promise<void> | undefined;
    await expect(
      session.source.withSdk(() => {
        closing = session.close();
        throw failure;
      }),
    ).rejects.toBe(failure);
    await expect(closing).rejects.toMatchObject({ errors: [cleanupFailure] });
  });

  it("clear waits only for the SDK it removes, not a later replacement", async () => {
    const first = { free: vi.fn(), name: "old" },
      second = { free: vi.fn(), name: "new" };
    const session = createSessionFromClient(first);
    const a = session.source.acquire();
    const clearing = session.clear();
    session.set(second);
    const b = session.source.acquire();
    a.release();
    await clearing;
    expect(second.free).not.toHaveBeenCalled();
    expect(b.isCurrent()).toBe(true);
    b.release();
    await session.close();
  });

  it("keeps disposal notifications after closure until outstanding leases finish", async () => {
    const onDispose = vi.fn();
    const session = createSessionFromClient({ free: vi.fn() }, { onDispose });
    const lease = session.source.acquire();
    const closing = session.close();
    expect(onDispose).not.toHaveBeenCalled();
    lease.release();
    await closing;
    expect(onDispose).toHaveBeenCalledOnce();
  });

  it("captures a handle cleanup method with the original receiver", async () => {
    const handle = {
      closed: false,
      dispose() {
        this.closed = true;
      },
      value: { name: "wrapped" },
    };
    const session = createSiaSdkSession<{ name: string }>();
    session.setHandle(handle);
    await session.close();
    expect(handle.closed).toBe(true);
  });
});
