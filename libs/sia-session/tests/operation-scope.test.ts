/** A dependent operation scope drains its work without claiming SDK cleanup ownership. */
import { describe, expect, it, vi } from "vitest";
import {
  createSiaSdkSession,
  openSiaSdkOperationScope,
  RetireReason,
  SdkSessionErrorCode,
} from "../src/index.ts";

describe("operation scopes", () => {
  it("local closure denies new work and releases its parent after admitted work settles", async () => {
    const dispose = vi.fn();
    const owner = createSiaSdkSession<{ read(): string }>();
    owner.setHandle({ dispose, value: { read: () => "old" } });
    const scope = openSiaSdkOperationScope(owner.source);
    let finish: () => void = () => undefined;
    const pending = scope.run(
      (sdk) =>
        new Promise<string>((resolve) => {
          finish = () => resolve(sdk.read());
        }),
    );
    const closed = scope.close();
    expect(scope.close()).toBe(closed);
    await expect(scope.run(() => "new")).rejects.toMatchObject({
      code: SdkSessionErrorCode.Closed,
    });
    const retirement = owner.clear();
    expect(dispose).not.toHaveBeenCalled();
    finish();
    await expect(pending).resolves.toBe("old");
    await closed;
    await retirement;
    expect(dispose).toHaveBeenCalledOnce();
  });

  it("parent replacement retires the child without borrowing the replacement", async () => {
    const oldDispose = vi.fn();
    const owner = createSiaSdkSession<{ name: string }>();
    owner.setHandle({ dispose: oldDispose, value: { name: "old" } });
    const scope = openSiaSdkOperationScope(owner.source);
    let finish: () => void = () => undefined;
    const pending = scope.run(async (sdk) => {
      await new Promise<void>((resolve) => {
        finish = resolve;
      });
      return sdk.name;
    });
    owner.setHandle({ dispose: vi.fn(), value: { name: "new" } });
    await expect(scope.run((sdk) => sdk.name)).rejects.toMatchObject({
      code: SdkSessionErrorCode.Closed,
    });
    expect(oldDispose).not.toHaveBeenCalled();
    finish();
    await expect(pending).resolves.toBe("old");
    await scope.closed;
    expect(oldDispose).toHaveBeenCalledOnce();
    await owner.close();
  });

  it("retires during subscription without retaining an obsolete unsubscribe", async () => {
    const dispose = vi.fn();
    const owner = createSiaSdkSession<{ name: string }>();
    owner.setHandle({ dispose, value: { name: "old" } });
    const source = {
      ...owner.source,
      acquire: () => {
        const lease = owner.source.acquire();
        return {
          ...lease,
          onRetire: (listener: Parameters<typeof lease.onRetire>[0]) => {
            const stop = lease.onRetire(listener);
            listener(RetireReason.Cleared);
            return stop;
          },
        };
      },
    };
    const scope = openSiaSdkOperationScope(source);
    await expect(scope.run(() => "late")).rejects.toMatchObject({
      code: SdkSessionErrorCode.Closed,
    });
    await scope.closed;
    await owner.close();
    expect(dispose).toHaveBeenCalledOnce();
  });

  it("releases its parent borrow when retirement registration fails", async () => {
    const failure = new Error("subscription failed");
    const dispose = vi.fn();
    const owner = createSiaSdkSession<{ name: string }>();
    owner.setHandle({ dispose, value: { name: "old" } });
    const source = {
      ...owner.source,
      acquire: () => {
        const lease = owner.source.acquire();
        return {
          ...lease,
          onRetire: () => {
            throw failure;
          },
        };
      },
    };
    expect(() => openSiaSdkOperationScope(source)).toThrow(failure);
    await owner.close();
    expect(dispose).toHaveBeenCalledOnce();
  });

  it("releases its parent when retirement unsubscription throws", async () => {
    const failure = new Error("unsubscribe failed");
    const dispose = vi.fn();
    const owner = createSiaSdkSession<{ name: string }>();
    owner.setHandle({ dispose, value: { name: "old" } });
    const source = {
      ...owner.source,
      acquire: () => {
        const lease = owner.source.acquire();
        return {
          ...lease,
          onRetire: (listener: Parameters<typeof lease.onRetire>[0]) => {
            const stop = lease.onRetire(listener);
            return () => {
              stop();
              throw failure;
            };
          },
        };
      },
    };
    const scope = openSiaSdkOperationScope(source);
    const closed = scope.close();
    await expect(closed).rejects.toBe(failure);
    await owner.close();
    expect(dispose).toHaveBeenCalledOnce();
  });

  it("preserves an application failure and lets the owner report disposal failure", async () => {
    const failure = { reason: "read failed" };
    const cleanup = new Error("cleanup failed");
    const onError = vi.fn();
    const owner = createSiaSdkSession<{ name: string }>({ onError });
    owner.setHandle({
      dispose: () => {
        throw cleanup;
      },
      value: { name: "old" },
    });
    const scope = openSiaSdkOperationScope(owner.source);
    await expect(
      scope.run(() => {
        throw failure;
      }),
    ).rejects.toBe(failure);
    await scope.close();
    await expect(owner.close()).rejects.toMatchObject({ errors: [cleanup] });
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ error: cleanup }),
    );
  });
});
