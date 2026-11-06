/** Controlled SDK calls prove local acknowledgement ordering, never native transfer or disposal. */
/* oxlint-disable typescript/prefer-promise-reject-errors, typescript/only-throw-error -- Primitive failures must reach the fixture unchanged. */
import { expect, it } from "vitest";
import {
  PackedFinalizeError,
  type PackedObject,
  type PackedSdk,
  type ReadPort,
} from "../../src/mock.js";
import { singleWriteCase } from "./application-write-contract.js";
import { packedWriteFixture } from "./application-write-packed-fixture.js";

async function consume(source: ReadableStream<Uint8Array>) {
  const reader = source.getReader();
  try {
    while (!(await reader.read()).done) {
      /* Consume the controlled input. */
    }
  } finally {
    reader.releaseLock();
  }
  return 1n;
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function object(id: string, fail?: () => void): PackedObject {
  // Controlled references carry no remote provenance and are never offered to a real SDK.
  return {
    id() {
      fail?.();
      return id;
    },
    seal() {
      return undefined;
    },
    updateMetadata() {
      return undefined;
    },
  } as unknown as PackedObject;
}
function reader(
  close: () => Promise<void> = () => Promise.resolve(),
): ReadPort {
  return {
    close,
    download: () =>
      Promise.resolve(
        new ReadableStream<Uint8Array>({
          start(c) {
            c.enqueue(Uint8Array.of(1));
            c.close();
          },
        }),
      ),
    object: (id) =>
      Promise.resolve({ id, metadata: Uint8Array.of(2), sizeBytes: 1 }),
    objects: () => Promise.resolve({ done: true, nextOffset: 0, objects: [] }),
  };
}
function sdk(
  objects: readonly PackedObject[],
  overrides: Partial<PackedSdk<"node">> = {},
): PackedSdk<"node"> {
  return {
    appKey: () => ({}) as ReturnType<PackedSdk<"node">["appKey"]>,
    close: () => Promise.resolve(),
    pinObject: () => Promise.resolve(),
    updateObjectMetadata: () => Promise.resolve(),
    uploadPacked: () => ({
      add: consume,
      cancel() {
        return undefined;
      },
      dispose: () => Promise.resolve(),
      finalize: () => Promise.resolve([...objects]),
    }),
    ...overrides,
  };
}
it.each(["getter", "metadata", "pin"] as const)(
  "the whole acknowledgement batch survives a later %s failure",
  async (stage) => {
    const failure = new Error(stage);
    const first = object(
      "first",
      stage === "getter"
        ? () => {
            throw failure;
          }
        : undefined,
    );
    const second = object("second");
    const fixture = packedWriteFixture(
      sdk([first, second], {
        pinObject: () =>
          stage === "pin" ? Promise.reject(failure) : Promise.resolve(),
        updateObjectMetadata: () =>
          stage === "metadata" ? Promise.reject(failure) : Promise.resolve(),
      }),
      reader(),
    );
    const failures = await singleWriteCase({
      expected: Uint8Array.of(1),
      fixture,
      metadata: Uint8Array.of(2),
    });
    expect(fixture.acknowledged()).toEqual([first, second]);
    expect(
      failures
        .filter((item) => item.phase === "operation")
        .map((item) => item.error),
    ).toEqual([failure]);
  },
);
it("only the known mock partial error supplies acknowledged original references", async () => {
  const first = object("partial");
  const partial = new PackedFinalizeError(undefined, [first]);
  const fixture = packedWriteFixture(
    sdk([], {
      uploadPacked: () => ({
        add: consume,
        cancel() {
          return undefined;
        },
        dispose: () => Promise.resolve(),
        finalize: () => Promise.reject(partial),
      }),
    }),
    reader(),
  );
  const failures = await singleWriteCase({
    expected: Uint8Array.of(1),
    fixture,
    metadata: Uint8Array.of(2),
  });
  expect(fixture.acknowledged()).toEqual([first]);
  expect(failures.find((item) => item.phase === "operation")?.error).toBe(
    partial,
  );
});
it("unknown rejection objects do not become acknowledged authority", async () => {
  const untrusted = { objects: [object("foreign")] };
  const fixture = packedWriteFixture(
    sdk([], {
      uploadPacked: () => ({
        add: consume,
        cancel() {
          return undefined;
        },
        dispose: () => Promise.resolve(),
        finalize: () => Promise.reject(untrusted),
      }),
    }),
    reader(),
  );
  const failures = await singleWriteCase({
    expected: Uint8Array.of(1),
    fixture,
    metadata: Uint8Array.of(2),
  });
  expect(fixture.acknowledged()).toEqual([]);
  expect(failures.find((item) => item.phase === "operation")?.error).toBe(
    untrusted,
  );
});
it("an unexpected extra acknowledgement stays owned when the one-destination assertion fails", async () => {
  const originals = [object("first"), object("second")];
  const fixture = packedWriteFixture(sdk(originals), reader());
  const failures = await singleWriteCase({
    expected: Uint8Array.of(1),
    fixture,
    metadata: Uint8Array.of(2),
  });
  expect(failures.some((item) => item.phase === "readback")).toBe(true);
  expect(fixture.acknowledged()).toEqual(originals);
});
it("a reader close failure does not skip the independent SDK close", async () => {
  const cleanup = NaN;
  let sdkClosed = false;
  const fixture = packedWriteFixture(
    sdk([object("first")], {
      close() {
        sdkClosed = true;
        return Promise.resolve();
      },
    }),
    reader(() => Promise.reject(cleanup)),
  );
  const failures = await singleWriteCase({
    expected: Uint8Array.of(1),
    fixture,
    metadata: Uint8Array.of(2),
  });
  expect(sdkClosed).toBe(true);
  expect(
    failures.some(
      (item) => item.phase === "cleanup" && Object.is(item.error, cleanup),
    ),
  ).toBe(true);
});
it("late acknowledgement after caller abort is joined before reader and SDK shutdown", async () => {
  const entered = deferred<void>();
  const finalized = deferred<PackedObject[]>();
  const settling = deferred<void>();
  const readerClosing = deferred<void>();
  const readerClosed = deferred<void>();
  const sdkClosing = deferred<void>();
  const sdkClosed = deferred<void>();
  const abort = new AbortController();
  const reason = new Error("caller stopped observing");
  const original = object("late");
  let reset = false;
  const fixture = packedWriteFixture(
    sdk([], {
      close() {
        sdkClosing.resolve();
        return sdkClosed.promise;
      },
      uploadPacked: () => ({
        add: consume,
        cancel() {
          return undefined;
        },
        dispose: () => Promise.resolve(),
        finalize() {
          entered.resolve();
          return finalized.promise;
        },
      }),
    }),
    reader(() => {
      readerClosing.resolve();
      return readerClosed.promise;
    }),
    abort.signal,
  );
  const settle = fixture.settleOwnedWork.bind(fixture);
  fixture.settleOwnedWork = () => {
    settling.resolve();
    return settle();
  };
  const checking = singleWriteCase({
    expected: Uint8Array.of(1),
    fixture,
    metadata: Uint8Array.of(2),
  }).then((result) => {
    reset = true;
    return result;
  });
  try {
    await entered.promise;
    abort.abort(reason);
    await settling.promise;
    expect(reset).toBe(false);
    expect(fixture.acknowledged()).toEqual([]);
    finalized.resolve([original]);
    await readerClosing.promise;
    expect(fixture.acknowledged()).toEqual([original]);
    expect(reset).toBe(false);
    readerClosed.resolve();
    await sdkClosing.promise;
    expect(reset).toBe(false);
    sdkClosed.resolve();
    const failures = await checking;
    expect(failures.find((item) => item.phase === "operation")?.error).toBe(
      reason,
    );
  } finally {
    finalized.resolve([original]);
    readerClosed.resolve();
    sdkClosed.resolve();
    await checking;
  }
});

it("aborted observation joins source finalization and keeps late producer and cleanup errors distinct", async () => {
  const reading = deferred<void>();
  const finalizeSource = deferred<void>();
  const settling = deferred<void>();
  const abort = new AbortController();
  const stopped = new Error("caller abort");
  const producer = NaN;
  let source: ReadableStream<Uint8Array> | undefined;
  let sdkClosed = false;
  const fixture = packedWriteFixture(
    sdk([], {
      close() {
        sdkClosed = true;
        return Promise.resolve();
      },
      uploadPacked: () => ({
        async add(input) {
          source = input;
          const ownedReader = input.getReader();
          try {
            await ownedReader.read();
            reading.resolve();
            await finalizeSource.promise;
            throw producer;
          } finally {
            ownedReader.releaseLock();
          }
        },
        cancel() {
          return undefined;
        },
        dispose: () => Promise.resolve(),
        finalize: () => Promise.resolve([]),
      }),
    }),
    reader(() => Promise.reject(undefined)),
    abort.signal,
  );
  const settle = fixture.settleOwnedWork.bind(fixture);
  fixture.settleOwnedWork = () => {
    settling.resolve();
    return settle();
  };
  const checking = singleWriteCase({
    expected: Uint8Array.of(1),
    fixture,
    metadata: Uint8Array.of(2),
  });
  try {
    await reading.promise;
    abort.abort(stopped);
    await settling.promise;
    expect(source!.locked).toBe(true);
    expect(sdkClosed).toBe(false);
    finalizeSource.resolve();
    const failures = await checking;
    expect(source!.locked).toBe(false);
    expect(sdkClosed).toBe(true);
    expect(fixture.creationUncertain()).toBe(true);
    expect(fixture.acknowledged()).toEqual([]);
    expect(failures).toHaveLength(3);
    expect(failures[0]).toEqual({ error: stopped, phase: "operation" });
    expect(failures[1]!.phase).toBe("settle");
    expect(Object.is(failures[1]!.error, producer)).toBe(true);
    expect(failures[2]).toEqual({ error: undefined, phase: "cleanup" });
  } finally {
    finalizeSource.resolve();
    await checking;
  }
});
