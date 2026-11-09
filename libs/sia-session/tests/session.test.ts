/** Managed SDK lifetimes are exercised with local clients, without network connections. */
import { describe, expect, it, vi } from "vitest";
import {
  createSessionFromClient,
  createSiaSdkSession,
  SdkState,
} from "../src/index.ts";

describe("SDK lifetime", () => {
  it("short work receives only retirement context and cannot end its own lease", async () => {
    const session = createSessionFromClient({ free: vi.fn() });
    await session.source.withSdk((_sdk, context) => {
      expect(Object.keys(context).sort()).toEqual([
        "id",
        "isCurrent",
        "onRetire",
      ]);
      expect(Object.isFrozen(context)).toBe(true);
    });
    const lease = session.source.acquire();
    expect(Object.isFrozen(lease)).toBe(true);
    lease.release();
    await session.close();
  });
  it("frees an SDK after closure without a caller cleanup callback", async () => {
    const client = { free: vi.fn(), name: "first" };
    const session = createSessionFromClient(client);
    expect(session.source.getSnapshot().state).toBe(SdkState.Available);
    await session.close();
    expect(client.free).toHaveBeenCalledExactlyOnceWith();
  });

  it("accepts an SDK after construction and keeps it alive for a lease", async () => {
    const session = createSiaSdkSession<{ readonly name: string }>();
    expect(session.source.getSnapshot()).toEqual({
      id: null,
      state: SdkState.Empty,
    });
    const client = { free: vi.fn(), name: "later" };
    session.set(client);
    const lease = session.source.acquire();
    const closing = session.close();
    expect(client.free).not.toHaveBeenCalled();
    expect(lease.value.name).toBe("later");
    lease.release();
    await closing;
    expect(client.free).toHaveBeenCalledOnce();
  });
});
