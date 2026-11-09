/** Peers keep their own leases without taking SDK disposal ownership. */
import { describe, expect, it, vi } from "vitest";
import {
  createSessionFromClient,
  createSiaSdkSession,
  RetireReason,
  SdkSessionErrorCode,
  SdkState,
} from "../src/index.ts";

function client(name: string) {
  return { free: vi.fn<() => void>(), name };
}

describe("replacement and ownership", () => {
  it("cannot wrap a current SDK in another handle while a peer retains it", async () => {
    const sdk = client("shared");
    const session = createSessionFromClient(sdk);
    const lease = session.source.acquire();
    const before = session.source.getSnapshot();
    const dispose = vi.fn(() => sdk.free());
    try {
      expect(() => session.setHandle({ dispose, value: sdk })).toThrowError(
        expect.objectContaining({ code: SdkSessionErrorCode.AlreadyUsed }),
      );
      expect(session.source.getSnapshot()).toBe(before);
      expect(lease.isCurrent()).toBe(true);
      expect(sdk.free).not.toHaveBeenCalled();
      expect(dispose).not.toHaveBeenCalled();
    } finally {
      lease.release();
      await session.close();
    }
    expect(sdk.free).toHaveBeenCalledOnce();
  });

  it.each(["client", "handle"] as const)(
    "a %s owner prevents a second handle from adopting its SDK",
    async (kind) => {
      const sdk = client("shared");
      const owner = createSiaSdkSession<{ name: string }>();
      const peer = createSiaSdkSession<{ name: string }>();
      if (kind === "client") owner.set(sdk);
      else owner.setHandle({ dispose: () => sdk.free(), value: sdk });
      try {
        expect(() =>
          peer.setHandle({ dispose: () => sdk.free(), value: sdk }),
        ).toThrowError(
          expect.objectContaining({ code: SdkSessionErrorCode.AlreadyUsed }),
        );
        expect(peer.source.getSnapshot().state).toBe(SdkState.Empty);
        expect(sdk.free).not.toHaveBeenCalled();
      } finally {
        await peer.close();
        await owner.close();
      }
      expect(sdk.free).toHaveBeenCalledOnce();
    },
  );

  it("a handle owner prevents managed adoption of its SDK before and after disposal", async () => {
    const sdk = client("custom");
    const owner = createSiaSdkSession<{ name: string }>();
    owner.setHandle({ dispose: () => sdk.free(), value: sdk });
    try {
      expect(() => createSessionFromClient(sdk)).toThrowError(
        expect.objectContaining({ code: SdkSessionErrorCode.AlreadyUsed }),
      );
      expect(sdk.free).not.toHaveBeenCalled();
    } finally {
      await owner.close();
    }
    expect(() => createSessionFromClient(sdk)).toThrowError(
      expect.objectContaining({ code: SdkSessionErrorCode.AlreadyUsed }),
    );
    const peer = createSiaSdkSession<{ name: string }>();
    expect(() =>
      peer.setHandle({ dispose: () => sdk.free(), value: sdk }),
    ).toThrowError(
      expect.objectContaining({ code: SdkSessionErrorCode.AlreadyUsed }),
    );
    await peer.close();
    expect(sdk.free).toHaveBeenCalledOnce();
  });

  it("keeps an old SDK alive until all of its users release it", async () => {
    const first = client("first"),
      second = client("second");
    const session = createSessionFromClient(first);
    const left = session.source.acquire(),
      right = session.source.acquire();
    const retired = vi.fn();
    left.onRetire(retired);
    const oldId = left.id;
    const id = session.set(second);
    expect(id).not.toBe(oldId);
    expect(retired).toHaveBeenCalledExactlyOnceWith(RetireReason.Replaced);
    expect(left.isCurrent()).toBe(false);
    expect(left.value.name).toBe("first");
    const nextLease = session.source.acquire({ expectedId: id });
    expect(nextLease.value.name).toBe("second");
    left.release();
    expect(first.free).not.toHaveBeenCalled();
    right.release();
    expect(first.free).toHaveBeenCalledOnce();
    nextLease.release();
    await session.close();
  });

  it("setting a handle-owned current client keeps its original disposer and identity", async () => {
    const sdk = client("custom");
    const session = createSiaSdkSession<{ name: string }>();
    const dispose = vi.fn(() => sdk.free());
    const id = session.setHandle({ dispose, value: sdk });
    const before = session.source.getSnapshot();
    expect(session.set(sdk)).toBe(id);
    expect(session.source.getSnapshot()).toBe(before);
    expect(dispose).not.toHaveBeenCalled();
    expect(sdk.free).not.toHaveBeenCalled();
    await session.close();
    expect(dispose).toHaveBeenCalledOnce();
    expect(sdk.free).toHaveBeenCalledOnce();
  });

  it("setting the current client again does not free it or create another identity", async () => {
    const sdk = client("same");
    const session = createSessionFromClient(sdk);
    const before = session.source.getSnapshot();
    expect(session.set(sdk)).toBe(before.id);
    expect(session.source.getSnapshot()).toBe(before);
    expect(sdk.free).not.toHaveBeenCalled();
    await session.close();
    expect(sdk.free).toHaveBeenCalledOnce();
  });

  it("rejects a client owned by another session without freeing that client", async () => {
    const sdk = client("shared");
    const owner = createSessionFromClient(sdk);
    expect(() => createSessionFromClient(sdk)).toThrowError(
      expect.objectContaining({ code: SdkSessionErrorCode.AlreadyUsed }),
    );
    expect(sdk.free).not.toHaveBeenCalled();
    await owner.close();
  });

  it("cannot revive a retired client while an old lease still holds it", async () => {
    const sdk = client("old");
    const session = createSessionFromClient(sdk);
    const lease = session.source.acquire();
    const clearing = session.clear();
    expect(() => session.set(sdk)).toThrowError(
      expect.objectContaining({ code: SdkSessionErrorCode.AlreadyUsed }),
    );
    expect(sdk.free).not.toHaveBeenCalled();
    lease.release();
    await clearing;
    expect(() => session.set(sdk)).toThrowError(
      expect.objectContaining({ code: SdkSessionErrorCode.AlreadyUsed }),
    );
    await session.close();
  });

  it("releasing twice does not free the SDK before another peer finishes", async () => {
    const sdk = client("first");
    const session = createSessionFromClient(sdk);
    const a = session.source.acquire(),
      b = session.source.acquire();
    const closing = session.close();
    a.release();
    a.release();
    expect(sdk.free).not.toHaveBeenCalled();
    expect(() => a.value).toThrowError(
      expect.objectContaining({ code: SdkSessionErrorCode.Released }),
    );
    b.release();
    await closing;
    expect(sdk.free).toHaveBeenCalledOnce();
    expect(session.close()).toBe(closing);
  });

  it("calls free on the client receiver without also invoking its symbol disposer", async () => {
    const symbolDispose = vi.fn();
    const sdk = {
      closed: false,
      free() {
        this.closed = true;
      },
      [Symbol.dispose]: symbolDispose,
    };
    const session = createSessionFromClient(sdk);
    await session.close();
    expect(sdk.closed).toBe(true);
    expect(symbolDispose).not.toHaveBeenCalled();
  });

  it("retired callbacks can still finish while new work is rejected", async () => {
    const sdk = client("ready");
    const session = createSessionFromClient(sdk);
    let finish: () => void = () => undefined;
    const done = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const operation = session.source.withSdk(async (value, context) => {
      await done;
      return [value.name, context.isCurrent()];
    });
    const closing = session.close();
    await expect(session.source.withSdk(() => 1)).rejects.toMatchObject({
      code: SdkSessionErrorCode.Closed,
    });
    expect(sdk.free).not.toHaveBeenCalled();
    finish();
    await expect(operation).resolves.toEqual(["ready", false]);
    await closing;
  });

  it("drains retired SDKs without waiting for the active SDK", async () => {
    const next = client("new"),
      sdk = client("old");
    const session = createSessionFromClient(sdk);
    const a = session.source.acquire();
    session.set(next);
    const b = session.source.acquire();
    const drained = session.drain();
    a.release();
    await drained;
    expect(sdk.free).toHaveBeenCalledOnce();
    expect(next.free).not.toHaveBeenCalled();
    b.release();
    await session.close();
  });
});

describe("admission and failures", () => {
  it("cannot acquire an SDK retired while reading the expected ID", async () => {
    const first = client("first"),
      second = client("second");
    const session = createSessionFromClient(first);
    const initial = session.source.acquire();
    const id = initial.id;
    initial.release();
    const read = vi.fn(() => {
      session.set(second);
      return id;
    });
    const options = {
      get expectedId() {
        return read();
      },
    };
    expect(() => session.source.acquire(options)).toThrowError(
      expect.objectContaining({ code: SdkSessionErrorCode.Stale }),
    );
    expect(read).toHaveBeenCalledOnce();
    expect(first.free).toHaveBeenCalledOnce();
    await session.close();
    expect(second.free).toHaveBeenCalledOnce();
  });
  it("withSdk rejects rather than throwing when no SDK is available", async () => {
    const session = createSiaSdkSession<object>();
    let call: Promise<number> | undefined;
    expect(() => {
      call = session.source.withSdk(() => 7);
    }).not.toThrow();
    await expect(call).rejects.toMatchObject({
      code: SdkSessionErrorCode.Unavailable,
    });
    await session.close();
  });

  it("preserves synchronous and asynchronous application failures", async () => {
    const sdk = client("first");
    const session = createSessionFromClient(sdk);
    const failure = { message: "caller value" };
    await expect(
      session.source.withSdk(() => {
        throw failure;
      }),
    ).rejects.toBe(failure);
    await expect(
      session.source.withSdk(() => Promise.reject(failure)),
    ).rejects.toBe(failure);
    await session.close();
    expect(sdk.free).toHaveBeenCalledOnce();
  });

  it("rejects stale expectations even when setting the same current client", async () => {
    const session = createSiaSdkSession<{ name: string }>();
    const before = session.source.getSnapshot();
    const sdk = client("new");
    session.set(sdk);
    expect(() => session.set(sdk, { expectedSnapshot: before })).toThrowError(
      expect.objectContaining({ code: SdkSessionErrorCode.Conflict }),
    );
    expect(sdk.free).not.toHaveBeenCalled();
    await session.close();
  });

  it("clearing an empty session invalidates a pending creator's snapshot", async () => {
    const session = createSiaSdkSession<{ name: string }>();
    const before = session.source.getSnapshot();
    await session.clear();
    const sdk = client("late");
    expect(() => session.set(sdk, { expectedSnapshot: before })).toThrowError(
      expect.objectContaining({ code: SdkSessionErrorCode.Conflict }),
    );
    expect(sdk.free).not.toHaveBeenCalled();
    expect(session.source.getSnapshot().state).toBe(SdkState.Empty);
    sdk.free();
    await session.close();
  });

  it("rejects a malformed handle without retiring the current SDK", async () => {
    const sdk = client("good");
    const session = createSessionFromClient(sdk);
    const before = session.source.getSnapshot();
    expect(() =>
      session.setHandle({ dispose: 0, value: sdk } as never),
    ).toThrowError(
      expect.objectContaining({ code: SdkSessionErrorCode.InvalidHandle }),
    );
    expect(session.source.getSnapshot()).toBe(before);
    expect(sdk.free).not.toHaveBeenCalled();
    await session.close();
  });

  it("does not invoke a getter's obsolete cleanup after validation reenters close", async () => {
    const session = createSiaSdkSession<{ name: string }>();
    const dispose = vi.fn();
    const closed: Promise<void>[] = [];
    const handle = {
      dispose,
      get value() {
        closed.push(session.close());
        return { name: "late" };
      },
    };
    expect(() => session.setHandle(handle)).toThrowError(
      expect.objectContaining({ code: SdkSessionErrorCode.Closed }),
    );
    await Promise.all(closed);
    expect(dispose).not.toHaveBeenCalled();
    expect(session.source.getSnapshot().state).toBe(SdkState.Closed);
  });

  it("rejects reuse of a handle already accepted by another session", async () => {
    const handle = { dispose: vi.fn(), value: { name: "one" } };
    const a = createSiaSdkSession<{ name: string }>(),
      b = createSiaSdkSession<{ name: string }>();
    a.setHandle(handle);
    expect(() => b.setHandle(handle)).toThrowError(
      expect.objectContaining({ code: SdkSessionErrorCode.AlreadyUsed }),
    );
    await a.close();
    await b.close();
    expect(handle.dispose).toHaveBeenCalledOnce();
  });
});
