/** Nanoevents notifications cannot undo ownership changes or interfere with other borrowers. */
import { describe, expect, it, vi } from "vitest";
import {
  createSessionFromClient,
  createSiaSdkSession,
  RetireReason,
  SdkIssueKind,
  SdkState,
} from "../src/index.ts";

function client(name: string) {
  return { free: vi.fn(), name };
}

describe("session notifications", () => {
  it("an old lease keeps its retirement reason after a replacement clears", async () => {
    const session = createSessionFromClient(client("old"));
    const old = session.source.acquire();
    session.set(client("replacement"));
    await session.clear();
    const retired = vi.fn();
    old.onRetire(retired);
    expect(retired).toHaveBeenCalledExactlyOnceWith(RetireReason.Replaced);
    old.release();
    await session.close();
  });

  it("does not notify an obsolete replacement after a retirement callback sets another SDK", async () => {
    const session = createSessionFromClient(client("first"));
    const lease = session.source.acquire();
    const final = client("final");
    const seen: string[] = [];
    session.source.subscribe(() => {
      const use = session.source.acquire();
      seen.push(use.value.name);
      use.release();
    });
    lease.onRetire(() => {
      session.set(final);
    });
    session.set(client("middle"));
    expect(seen).toEqual(["final"]);
    lease.release();
    await session.close();
  });

  it("skips old change callbacks after a nested clear", async () => {
    const session = createSiaSdkSession<{ name: string }>();
    let clear: Promise<void> | undefined;
    session.source.subscribe(() => {
      if (session.source.getSnapshot().state === SdkState.Available)
        clear = session.clear();
    });
    const states: SdkState[] = [];
    session.source.subscribe(() => {
      states.push(session.source.getSnapshot().state);
    });
    session.set(client("temporary"));
    expect(states).toEqual([SdkState.Empty]);
    await clear;
    await session.close();
  });

  it("a newly subscribed callback starts with a later update", async () => {
    const session = createSiaSdkSession<{ name: string }>();
    const listener = vi.fn();
    let off: () => void = () => undefined;
    let registered = false;
    session.source.subscribe(() => {
      if (!registered) {
        registered = true;
        off = session.source.subscribe(listener);
      }
    });
    session.set(client("first"));
    expect(listener).not.toHaveBeenCalled();
    await session.clear();
    expect(listener).toHaveBeenCalledOnce();
    off();
    await session.close();
  });

  it("does not call a listener removed during the current nanoevents emission", async () => {
    const session = createSiaSdkSession<{ name: string }>();
    const listener = vi.fn();
    let off: () => void = () => undefined;
    session.source.subscribe(() => off());
    off = session.source.subscribe(listener);
    session.set(client("ready"));
    expect(listener).not.toHaveBeenCalled();
    await session.close();
  });

  it("listener errors do not reject an accepted SDK or prevent another listener", async () => {
    const failure = new Error("observer");
    const onError = vi.fn();
    const session = createSiaSdkSession<{ name: string }>({ onError });
    const listener = vi.fn();
    session.source.subscribe(() => {
      throw failure;
    });
    session.source.subscribe(listener);
    expect(() => session.set(client("valid"))).not.toThrow();
    expect(listener).toHaveBeenCalledOnce();
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ error: failure, kind: SdkIssueKind.Listener }),
    );
    await session.close();
  });

  it("a throwing retirement callback does not skip another lease or SDK cleanup", async () => {
    const sdk = client("first");
    const onError = vi.fn();
    const session = createSessionFromClient(sdk, { onError });
    const a = session.source.acquire(),
      b = session.source.acquire();
    const retired = vi.fn();
    a.onRetire(() => {
      throw new Error("borrower");
    });
    b.onRetire(retired);
    let clearing: Promise<void> | undefined;
    expect(() => {
      clearing = session.clear();
    }).not.toThrow();
    expect(retired).toHaveBeenCalledExactlyOnceWith(RetireReason.Cleared);
    a.release();
    b.release();
    await clearing;
    expect(sdk.free).toHaveBeenCalledOnce();
    expect(onError).toHaveBeenCalledOnce();
    await session.close();
  });

  it("late retirement listeners observe the reason without waiting for another event", async () => {
    const session = createSessionFromClient(client("old"));
    const lease = session.source.acquire();
    const clearing = session.clear();
    const listener = vi.fn();
    const off = lease.onRetire(listener);
    expect(listener).toHaveBeenCalledExactlyOnceWith(RetireReason.Cleared);
    off();
    off();
    lease.release();
    await clearing;
    await session.close();
  });

  it("released leases remove their retirement subscriptions", async () => {
    const session = createSessionFromClient(client("ready"));
    const lease = session.source.acquire();
    const listener = vi.fn();
    lease.onRetire(listener);
    lease.release();
    await session.close();
    expect(listener).not.toHaveBeenCalled();
  });

  it("public methods keep their receiver when extracted", async () => {
    const sdk = client("bound");
    const session = createSessionFromClient(sdk);
    const { acquire, getSnapshot, subscribe, withSdk } = session.source;
    const { clear, close, set } = session;
    const listener = vi.fn();
    const off = subscribe(listener);
    expect(getSnapshot().state).toBe(SdkState.Available);
    const lease = acquire();
    expect(lease.value.name).toBe("bound");
    lease.release();
    await expect(withSdk((value) => value.name)).resolves.toBe("bound");
    await clear();
    set(client("next"));
    off();
    await close();
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("disposal notification follows file work and SDK free, without exposing the SDK", async () => {
    const order: string[] = [];
    const sdk = {
      free() {
        order.push("free");
      },
      name: "one",
    };
    const onDispose = vi.fn(() => {
      order.push("disposed");
    });
    const session = createSessionFromClient(sdk, { onDispose });
    const lease = session.source.acquire();
    const id = lease.id;
    const closing = session.close();
    expect(order).toEqual([]);
    order.push("file closed");
    lease.release();
    await closing;
    expect(order).toEqual(["file closed", "free", "disposed"]);
    expect(onDispose).toHaveBeenCalledExactlyOnceWith({
      id,
      reason: RetireReason.Closed,
    });
    expect(Object.keys(session.source.getSnapshot())).toEqual(["id", "state"]);
  });

  it("subscriptions after closure are ignored", async () => {
    const session = createSiaSdkSession<object>();
    await session.close();
    const listener = vi.fn();
    const off = session.source.subscribe(listener);
    off();
    off();
    await session.clear();
    expect(listener).not.toHaveBeenCalled();
  });
});
