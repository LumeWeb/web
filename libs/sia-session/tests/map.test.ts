/** A narrow SDK view shares the original source's leases and snapshots. */
import { expect, it, vi } from "vitest";
import type { SdkLease } from "../src/index.ts";
import {
  createSessionFromClient,
  mapSiaSdkSession,
  SdkSessionErrorCode,
} from "../src/index.ts";

it("mapped peers share retention without becoming SDK owners", async () => {
  const sdk = { free: vi.fn(), read: () => "document", write: vi.fn() };
  const session = createSessionFromClient(sdk);
  const source = mapSiaSdkSession(session.source, (value) => ({
    read: () => value.read(),
  }));
  expect(source.getSnapshot()).toBe(session.source.getSnapshot());
  const lease = source.acquire();
  expect(lease.id).toBe(session.source.getSnapshot().id);
  expect(lease.value.read()).toBe("document");
  const closing = session.close();
  expect(sdk.free).not.toHaveBeenCalled();
  expect(lease.isCurrent()).toBe(false);
  lease.release();
  lease.release();
  await closing;
  expect(sdk.free).toHaveBeenCalledOnce();
  expect(() => lease.value).toThrowError(
    expect.objectContaining({ code: SdkSessionErrorCode.Released }),
  );
});

it("a failed projection releases the underlying lease and preserves its error", async () => {
  const sdk = { free: vi.fn() };
  const session = createSessionFromClient(sdk);
  const failure = new Error("projection");
  const source = mapSiaSdkSession(session.source, () => {
    throw failure;
  });
  expect(() => source.acquire()).toThrow(failure);
  await expect(source.withSdk(() => 1)).rejects.toBe(failure);
  await session.close();
  expect(sdk.free).toHaveBeenCalledOnce();
});

it.each([false, true])(
  "a failed mapped ID read releases its parent and keeps its error (release throws: %s)",
  async (releaseFails) => {
    const sdk = { free: vi.fn() };
    const session = createSessionFromClient(sdk);
    const failure = { reason: "ID read failed" };
    const releaseFailure = new Error("release failed");
    let held: SdkLease<Omit<typeof sdk, "free" | symbol>> | undefined;
    const release = vi.fn(() => {
      held?.release();
      if (releaseFails) throw releaseFailure;
    });
    const parent = {
      ...session.source,
      acquire() {
        held = session.source.acquire();
        return {
          ...held,
          get id(): symbol {
            throw failure;
          },
          release,
        };
      },
    };
    const source = mapSiaSdkSession(parent, (value) => value);
    let caught: unknown;
    try {
      try {
        source.acquire();
      } catch (error) {
        caught = error;
      }
      expect(caught).toBe(failure);
      expect(release).toHaveBeenCalledOnce();
      expect(() => held?.value).toThrowError(
        expect.objectContaining({ code: SdkSessionErrorCode.Released }),
      );
      await session.close();
      expect(sdk.free).toHaveBeenCalledOnce();
    } finally {
      held?.release();
      await session.close();
    }
  },
);

it.each([false, true])(
  "a failed selector releases its parent and keeps its error (release throws: %s)",
  async (releaseFails) => {
    const sdk = { free: vi.fn() };
    const session = createSessionFromClient(sdk);
    const failure = { reason: "selection failed" };
    const releaseFailure = new Error("release failed");
    let held: SdkLease<Omit<typeof sdk, "free" | symbol>> | undefined;
    const release = vi.fn();
    const parent = {
      ...session.source,
      acquire() {
        held = session.source.acquire();
        const acquired = held;
        return {
          ...acquired,
          release() {
            release();
            acquired.release();
            if (releaseFails) throw releaseFailure;
          },
        };
      },
    };
    const source = mapSiaSdkSession(parent, () => {
      throw failure;
    });
    let caught: unknown;
    try {
      source.acquire();
    } catch (error) {
      caught = error;
    }
    try {
      expect(caught).toBe(failure);
      expect(release).toHaveBeenCalledOnce();
      expect(() => held?.value).toThrowError(
        expect.objectContaining({ code: SdkSessionErrorCode.Released }),
      );
      await session.close();
      expect(sdk.free).toHaveBeenCalledOnce();
    } finally {
      held?.release();
      await session.close();
    }
  },
);

it("mapped methods preserve the parent source receiver and retirement notification", async () => {
  const sdk = { free: vi.fn(), name: "original" };
  const session = createSessionFromClient(sdk);
  const parent = {
    ...session.source,
    getSnapshot() {
      expect(this).toBe(parent);
      return session.source.getSnapshot();
    },
    subscribe(listener: () => void) {
      expect(this).toBe(parent);
      return session.source.subscribe(listener);
    },
  };
  const source = mapSiaSdkSession(parent, (value) => ({ name: value.name }));
  const { acquire, getSnapshot, subscribe, withSdk } = source;
  expect(getSnapshot()).toBe(session.source.getSnapshot());
  const changed = vi.fn();
  const off = subscribe(changed);
  await expect(withSdk((value) => value.name)).resolves.toBe("original");
  const lease = acquire();
  const retired = vi.fn();
  lease.onRetire(retired);
  const closing = session.close();
  expect(retired).toHaveBeenCalledOnce();
  expect(changed).toHaveBeenCalledOnce();
  lease.release();
  off();
  await closing;
});
