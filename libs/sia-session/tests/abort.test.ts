/** Cancellation notifies SDK work without releasing its resource underneath it. */
import { expect, it, vi } from "vitest";
import type { SdkLease, SdkWork } from "../src/index.ts";
import {
  acquireSdkWhenAvailable,
  createLeaseAbortSignal,
} from "../src/abort.ts";
import {
  createSessionFromClient,
  createSiaSdkSession,
  RetireReason,
  SdkSessionError,
  SdkSessionErrorCode,
  SdkState,
} from "../src/index.ts";

it.each([false, true])(
  "a failed current check releases its lease and keeps its error (release throws: %s)",
  async (releaseFails) => {
    const sdk = { free: vi.fn() };
    const session = createSessionFromClient(sdk);
    const failure = { reason: "current check failed" };
    const releaseFailure = new Error("release failed");
    let held: SdkLease<Omit<typeof sdk, "free" | symbol>> | undefined;
    const release = vi.fn(() => {
      held?.release();
      if (releaseFails) throw releaseFailure;
    });
    const source = {
      ...session.source,
      acquire() {
        held = session.source.acquire();
        return {
          ...held,
          isCurrent(): boolean {
            throw failure;
          },
          release,
        };
      },
    };
    try {
      await expect(acquireSdkWhenAvailable(source)).rejects.toBe(failure);
      expect(release).toHaveBeenCalledOnce();
      const acquired = held;
      expect(() => acquired?.value).toThrowError(
        expect.objectContaining({ code: SdkSessionErrorCode.Released }),
      );
    } finally {
      held?.release();
      await session.close();
    }
    expect(sdk.free).toHaveBeenCalledOnce();
  },
);

it("a failed retirement unsubscribe still detaches caller cancellation", async () => {
  const sdk = { free: vi.fn() };
  const session = createSessionFromClient(sdk);
  const lease = session.source.acquire();
  const caller = new AbortController();
  const remove = vi.spyOn(caller.signal, "removeEventListener");
  const failure = new Error("retirement unsubscribe failed");
  const context = {
    id: lease.id,
    isCurrent: lease.isCurrent,
    onRetire(listener: Parameters<typeof lease.onRetire>[0]) {
      const off = lease.onRetire(listener);
      return () => {
        off();
        throw failure;
      };
    },
  };
  const link = createLeaseAbortSignal(context, { signal: caller.signal });
  try {
    expect(() => link.dispose()).toThrow(failure);
    expect(remove).toHaveBeenCalledWith("abort", expect.any(Function));
    caller.abort("later cancellation");
    expect(link.signal.aborted).toBe(false);
    expect(lease.isCurrent()).toBe(true);
    expect(sdk.free).not.toHaveBeenCalled();
  } finally {
    lease.release();
    await session.close();
  }
  expect(sdk.free).toHaveBeenCalledOnce();
});

it.each(["deferred", "immediate"])(
  "a %s subscription cleanup failure rejects acquisition and releases its lease",
  async (timing) => {
    const sdk = { free: vi.fn() };
    const session = createSessionFromClient(sdk);
    const failure = new Error("unsubscribe failed");
    const controller = new AbortController();
    const remove = vi.spyOn(controller.signal, "removeEventListener");
    let held: SdkLease<Omit<typeof sdk, "free" | symbol>> | undefined;
    const source = {
      ...session.source,
      acquire() {
        held = session.source.acquire();
        return held;
      },
      subscribe(listener: () => unknown) {
        const off = session.source.subscribe(listener);
        if (timing === "immediate") listener();
        return () => {
          off();
          throw failure;
        };
      },
    };
    let outcome = "pending";
    let rejected: unknown;
    void acquireSdkWhenAvailable(source, { signal: controller.signal }).then(
      () => {
        outcome = "resolved";
      },
      (error) => {
        outcome = "rejected";
        rejected = error;
      },
    );
    try {
      await Promise.resolve();
      await Promise.resolve();
      expect(outcome).toBe("rejected");
      expect(rejected).toBe(failure);
      expect(held).toBeDefined();
      const acquired = held;
      expect(() => acquired?.value).toThrowError(
        expect.objectContaining({ code: SdkSessionErrorCode.Released }),
      );
      expect(remove).toHaveBeenCalledWith("abort", expect.any(Function));
    } finally {
      held?.release();
      await session.close();
    }
    expect(sdk.free).toHaveBeenCalledOnce();
  },
);

it.each(["cancellation", "closure"])(
  "unsubscribe failure cannot hide %s from a pending waiter",
  async (ending) => {
    const onError = vi.fn();
    const session = createSiaSdkSession<object>({ onError });
    const controller = new AbortController();
    const remove = vi.spyOn(controller.signal, "removeEventListener");
    const reason = { reason: "cancelled" };
    const source = {
      ...session.source,
      subscribe(listener: () => unknown) {
        const off = session.source.subscribe(listener);
        return () => {
          off();
          throw new Error("unsubscribe failed");
        };
      },
    };
    let outcome = "pending";
    let rejected: unknown;
    void acquireSdkWhenAvailable(source, { signal: controller.signal }).then(
      () => {
        outcome = "resolved";
      },
      (error) => {
        outcome = "rejected";
        rejected = error;
      },
    );
    try {
      if (ending === "cancellation") controller.abort(reason);
      else await session.close();
      await Promise.resolve();
      await Promise.resolve();
      expect(outcome).toBe("rejected");
      if (ending === "cancellation") expect(rejected).toBe(reason);
      else expect(rejected).toMatchObject({ code: SdkSessionErrorCode.Closed });
      expect(remove).toHaveBeenCalledWith("abort", expect.any(Function));
      expect(onError).not.toHaveBeenCalled();
    } finally {
      await session.close();
    }
  },
);

it("retirement aborts linked work but retains the SDK until its lease releases", async () => {
  const sdk = { free: vi.fn() };
  const session = createSessionFromClient(sdk);
  const lease = session.source.acquire();
  const link = createLeaseAbortSignal(lease);
  const closing = session.close();
  expect(link.signal.aborted).toBe(true);
  expect(link.signal.reason).toBe(RetireReason.Closed);
  expect(sdk.free).not.toHaveBeenCalled();
  link.dispose();
  lease.release();
  await closing;
  expect(sdk.free).toHaveBeenCalledOnce();
});

it("caller cancellation preserves its reason without retiring the SDK", async () => {
  const session = createSessionFromClient({ free: vi.fn() });
  const lease = session.source.acquire();
  const controller = new AbortController();
  const link = createLeaseAbortSignal(lease, { signal: controller.signal });
  const reason = new Error("request cancelled");
  controller.abort(reason);
  expect(link.signal.reason).toBe(reason);
  expect(lease.isCurrent()).toBe(true);
  link.dispose();
  lease.release();
  await session.close();
});

it("link cleanup removes both subscriptions and does not release the lease", async () => {
  const session = createSessionFromClient({ free: vi.fn() });
  const lease = session.source.acquire();
  const controller = new AbortController();
  const link = createLeaseAbortSignal(lease, { signal: controller.signal });
  link.dispose();
  link.dispose();
  controller.abort();
  const closing = session.close();
  expect(link.signal.aborted).toBe(false);
  expect(lease.value).toBeDefined();
  lease.release();
  await closing;
});

it("linking already retired work produces an aborted signal", async () => {
  const session = createSessionFromClient({ free: vi.fn() });
  const lease = session.source.acquire();
  const clearing = session.clear();
  const link = createLeaseAbortSignal(lease);
  expect(link.signal.reason).toBe(RetireReason.Cleared);
  link.dispose();
  lease.release();
  await clearing;
  await session.close();
});

it("a pending acquisition starts when a client is provided", async () => {
  const session = createSiaSdkSession<{ name: string }>();
  const pending = acquireSdkWhenAvailable(session.source);
  session.set({ free: vi.fn(), name: "later" });
  const lease = await pending;
  expect(lease.value.name).toBe("later");
  lease.release();
  await session.close();
});

it("pending acquisition rejects when an empty source closes", async () => {
  const session = createSiaSdkSession<object>();
  const pending = acquireSdkWhenAvailable(session.source);
  const rejected = expect(pending).rejects.toMatchObject({
    code: SdkSessionErrorCode.Closed,
  });
  await session.close();
  await rejected;
});

it("a cancelled waiter does not acquire a later client", async () => {
  const session = createSiaSdkSession<object>();
  const controller = new AbortController();
  const pending = acquireSdkWhenAvailable(session.source, {
    signal: controller.signal,
  });
  const reason = new Error("stop waiting");
  controller.abort(reason);
  await expect(pending).rejects.toBe(reason);
  const sdk = { free: vi.fn() };
  session.set(sdk);
  await session.close();
  expect(sdk.free).toHaveBeenCalledOnce();
});

it("an already cancelled waiter does not touch an available SDK", async () => {
  const sdk = { free: vi.fn() };
  const session = createSessionFromClient(sdk);
  const controller = new AbortController();
  controller.abort();
  await expect(
    acquireSdkWhenAvailable(session.source, { signal: controller.signal }),
  ).rejects.toBe(controller.signal.reason);
  await session.close();
  expect(sdk.free).toHaveBeenCalledOnce();
});

it("immediate subscription callbacks are unbound after successful acquisition", async () => {
  const session = createSessionFromClient({ free: vi.fn() });
  const off = vi.fn();
  const source = {
    ...session.source,
    subscribe(listener: () => void) {
      listener();
      return off;
    },
  };
  const lease = await acquireSdkWhenAvailable(source);
  expect(off).toHaveBeenCalledOnce();
  lease.release();
  await session.close();
});

it("cancellation during acquisition releases the lease before rejecting", async () => {
  const sdk = { free: vi.fn() };
  const session = createSessionFromClient(sdk);
  const controller = new AbortController();
  const source = {
    ...session.source,
    acquire() {
      const lease = session.source.acquire();
      controller.abort();
      return lease;
    },
  };
  await expect(
    acquireSdkWhenAvailable(source, { signal: controller.signal }),
  ).rejects.toBe(controller.signal.reason);
  await session.close();
  expect(sdk.free).toHaveBeenCalledOnce();
});

it.each([false, true])(
  "a failed diagnostic snapshot read preserves the original acquisition error (stale: %s)",
  async (stale) => {
    const session = createSessionFromClient({ free: vi.fn() });
    const failure = stale
      ? { code: SdkSessionErrorCode.Stale }
      : { reason: "acquire failed" };
    const diagnosticFailure = new Error("snapshot read failed");
    let reads = 0;
    const off = vi.fn();
    const source = {
      ...session.source,
      acquire() {
        throw failure;
      },
      getSnapshot() {
        if (++reads === 2) throw diagnosticFailure;
        return session.source.getSnapshot();
      },
      subscribe() {
        return off;
      },
    };
    try {
      await expect(acquireSdkWhenAvailable(source)).rejects.toBe(failure);
      expect(reads).toBe(stale ? 2 : 1);
      expect(off).toHaveBeenCalledOnce();
    } finally {
      await session.close();
    }
  },
);

it("a non-current lease waits for a changed snapshot and then acquires it", async () => {
  const first = { free: vi.fn(), name: "first" };
  const session = createSessionFromClient(first);
  const original = session.source.acquire();
  let attempts = 0;
  const release = vi.fn(() => original.release());
  const source = {
    ...session.source,
    acquire(options?: Parameters<typeof session.source.acquire>[0]) {
      attempts++;
      if (attempts === 1)
        return { ...original, isCurrent: () => false, release };
      return session.source.acquire(options);
    },
  };
  const pending = acquireSdkWhenAvailable(source);
  expect(attempts).toBe(1);
  expect(release).toHaveBeenCalledOnce();
  const second = { free: vi.fn(), name: "second" };
  try {
    session.set(second);
    const lease = await pending;
    expect(attempts).toBe(2);
    expect(lease.value.name).toBe("second");
    lease.release();
  } finally {
    original.release();
    await session.close();
  }
  expect(first.free).toHaveBeenCalledOnce();
  expect(second.free).toHaveBeenCalledOnce();
});

it("repeated non-current leases remain cancellable without recursive retries", async () => {
  const session = createSessionFromClient({ free: vi.fn() });
  const controller = new AbortController();
  const reason = { cancelled: true };
  let attempts = 0;
  const release = vi.fn();
  const source = {
    ...session.source,
    acquire() {
      attempts++;
      return {
        id: session.source.getSnapshot().id!,
        isCurrent: () => false,
        onRetire: () => () => undefined,
        release,
        value: {},
      };
    },
  };
  try {
    const pending = acquireSdkWhenAvailable(source, {
      signal: controller.signal,
    });
    expect(attempts).toBe(1);
    expect(release).toHaveBeenCalledOnce();
    controller.abort(reason);
    await expect(pending).rejects.toBe(reason);
    expect(attempts).toBe(1);
  } finally {
    await session.close();
  }
});

it.each(["stale", "non-current"] as const)(
  "repeated %s acquisition changes reach the current lease without recursion",
  async (outcome) => {
    const limit = 6000;
    let attempts = 0;
    let released = 0;
    let changed: (() => unknown) | undefined;
    let snapshot = { id: Symbol("first"), state: SdkState.Available as const };
    const source = {
      acquire(options?: { expectedId?: symbol }) {
        if (options?.expectedId !== snapshot.id)
          throw new SdkSessionError(SdkSessionErrorCode.Stale);
        attempts++;
        if (attempts < limit) {
          const obsolete = snapshot.id;
          snapshot = { id: Symbol("next"), state: SdkState.Available };
          changed?.();
          if (outcome === "stale")
            throw new SdkSessionError(SdkSessionErrorCode.Stale);
          return {
            id: obsolete,
            isCurrent: () => false,
            onRetire: () => () => undefined,
            release: () => {
              released++;
            },
            value: {},
          };
        }
        return {
          id: snapshot.id,
          isCurrent: () => true,
          onRetire: () => () => undefined,
          release: () => {
            released++;
          },
          value: {},
        };
      },
      getSnapshot: () => snapshot,
      subscribe(listener: () => unknown) {
        changed = listener;
        return () => {
          changed = undefined;
        };
      },
      async withSdk<R>(work: SdkWork<object, R>): Promise<R> {
        const lease = this.acquire();
        try {
          return await work(lease.value, lease);
        } finally {
          lease.release();
        }
      },
    };
    const lease = await acquireSdkWhenAvailable(source);
    expect(attempts).toBe(limit);
    expect(released).toBe(outcome === "stale" ? 0 : limit - 1);
    expect(lease.id).toBe(snapshot.id);
    lease.release();
    expect(released).toBe(outcome === "stale" ? 1 : limit);
  },
);

it("replacement during acquisition cannot leak the obsolete lease", async () => {
  const first = { free: vi.fn(), name: "first" },
    second = { free: vi.fn(), name: "second" };
  const session = createSessionFromClient(first);
  let replacing = false;
  const source = {
    ...session.source,
    acquire() {
      const lease = session.source.acquire();
      if (!replacing) {
        replacing = true;
        session.set(second);
      }
      return lease;
    },
  };
  const lease = await acquireSdkWhenAvailable(source);
  expect(lease.value.name).toBe("second");
  expect(first.free).toHaveBeenCalledOnce();
  lease.release();
  await session.close();
  expect(second.free).toHaveBeenCalledOnce();
});
