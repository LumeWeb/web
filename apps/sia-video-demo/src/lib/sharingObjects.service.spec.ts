import { expect, it, vi } from "vitest";
import { useEventLogStore } from "../stores/eventLog";
import { loadSharedObjects } from "./sharingObjects";

const SEED = "d778398e336858ddc1a7de0c78ca22bbe9c821e2786d7b5a941c729e1e5ceb1f";

function pending<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

it("frees a sharing SDK that connects after the listing is cancelled", async () => {
  const connection = pending<never>();
  const sdk = { free: vi.fn(), objectSummaries: vi.fn() };
  const controller = new AbortController();
  const result = loadSharedObjects(
    "https://indexer.test",
    SEED,
    {
      signal: controller.signal,
    },
    () => connection.promise,
  );
  controller.abort();
  connection.resolve(sdk as never);

  await expect(result).rejects.toMatchObject({ name: "AbortError" });
  expect(sdk.free).toHaveBeenCalledTimes(1);
  expect(sdk.objectSummaries).not.toHaveBeenCalled();
});

it("frees the sharing SDK after a listing read fails", async () => {
  const failure = new Error("read failed");
  const sdk = {
    free: vi.fn(),
    objectSummaries: vi.fn(() => Promise.reject(failure)),
  };
  const result = loadSharedObjects(
    "https://indexer.test",
    SEED,
    {
      retries: 0,
    },
    () => Promise.resolve(sdk as never),
  );

  await expect(result).rejects.toMatchObject({ cause: failure });
  expect(sdk.free).toHaveBeenCalledTimes(1);
});

it("keeps the listing error when sharing SDK cleanup also fails", async () => {
  useEventLogStore.setState({ lines: [] });
  const readFailure = new Error("read failed");
  const sdk = {
    free: vi.fn(() => {
      throw new Error("cleanup failed");
    }),
    objectSummaries: vi.fn(() => Promise.reject(readFailure)),
  };

  await expect(
    loadSharedObjects("https://indexer.test", SEED, { retries: 0 }, () =>
      Promise.resolve(sdk as never),
    ),
  ).rejects.toMatchObject({ cause: readFailure });
  expect(sdk.free).toHaveBeenCalledTimes(1);
  expect(useEventLogStore.getState().lines[0]?.message).toBe(
    "Shared object SDK cleanup failed",
  );
});

it("reports a failing sharing SDK cleanup without exposing its seed", async () => {
  useEventLogStore.setState({ lines: [] });
  const sdk = {
    free: vi.fn(() => {
      throw new Error(SEED);
    }),
    objectSummaries: vi.fn(() => Promise.resolve([])),
  };
  const result = await loadSharedObjects(
    "https://indexer.test",
    SEED,
    {
      pageSize: 1,
    },
    () => Promise.resolve(sdk as never),
  );

  expect(result).toEqual({ ended: true, pagesRead: 1, rows: [] });
  expect(sdk.free).toHaveBeenCalledTimes(1);
  expect(useEventLogStore.getState().lines[0]?.message).toBe(
    "Shared object SDK cleanup failed",
  );
  expect(JSON.stringify(useEventLogStore.getState().lines)).not.toContain(SEED);
});
