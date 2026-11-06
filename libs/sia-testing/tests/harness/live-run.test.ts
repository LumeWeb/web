/** Managed-run tests inspect persisted fixture state without treating the control fixture as a real Sia host. */
import { copyFile, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, it, vi } from "vitest";
import {
  emptyManagedMetadata,
  invalidManagedMetadata,
  managedMetadataInputs,
} from "./managed-metadata.js";
import { foreignMetadata } from "./foreign-metadata.js";
import { bytesFixture } from "../../src/testing/files.js";
import { recoverLiveRun } from "../../src/testing/live/recovery.js";
import { readJournal } from "../../src/testing/live/journal.js";
import {
  loadLiveProfile,
  profileDocument,
} from "../../src/testing/live/profile.js";
import {
  type LiveRunOptions,
  withLiveRun,
} from "../../src/testing/live/run.js";
interface FixtureState {
  calls: string[];
  objects: {
    id: string;
    metadata?: number[];
    payload?: number[];
    pinned: boolean;
  }[];
  shares: { id: string }[];
}
async function fixture(
  use: (
    options: LiveRunOptions,
    state: () => Promise<FixtureState>,
  ) => Promise<void>,
  maxLogicalUploadBytes = 100,
  maxObjects = 8,
) {
  const directory = await mkdtemp(join(tmpdir(), "sia-live-owned-"));
  try {
    const module = join(directory, "agent.mjs");
    await copyFile(
      new URL("../fixtures/live-resource-agent.mjs", import.meta.url),
      module,
    );
    const statePath = join(directory, "state.json");
    await writeFile(
      statePath,
      JSON.stringify({
        calls: [],
        objects: [{ id: "f".repeat(64), pinned: true }],
        shares: [],
      }),
      { mode: 0o600 },
    );
    const path = join(directory, "profile.json");
    const apiBaseUrl = "http://127.0.0.1:9980/";
    await writeFile(
      path,
      JSON.stringify({
        apiBaseUrl,
        app: {
          description: "Owned resource tests",
          id: "0".repeat(64),
          name: "Test",
          serviceUrl: "https://example.invalid",
        },
        auth: { appKeyHex: "07".repeat(32), kind: "app-key" },
        encoding: { dataShards: 1, maxBufferedSlabs: 1, parityShards: 0 },
        limits: {
          cleanupDeadlineMs: 1000,
          deadlineMs: 2000,
          maxLogicalUploadBytes,
          maxObjects,
        },
        version: 1,
      }),
      { mode: 0o600 },
    );
    const profile = await loadLiveProfile(path, {
      apiBaseUrl,
      mutations: true,
      transfers: true,
    });
    await use(
      {
        agentModule: pathToFileURL(module),
        journalFile: join(directory, "journal.jsonl"),
        profile,
      },
      async () => JSON.parse(await readFile(statePath, "utf8")) as FixtureState,
    );
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
}
it("live managed uploads accept omitted names without initializing the native SDK", () =>
  fixture(async (options, state) => {
    const result = await withLiveRun(options, async (run) => {
      const source = await bytesFixture({
        bytes: Uint8Array.of(1),
        name: "fixture",
      });
      let opens = 0;
      for (const name of ["", null, 1, false]) {
        const file = {
          ...source,
          open() {
            opens++;
            return source.open();
          },
        };
        await expect(
          run.objects.upload({
            file,
            metadata: new Uint8Array(),
            name: name as string,
          }),
        ).rejects.toMatchObject({ code: "invalid-input" });
        await expect(
          run.objects.upload({
            file: { ...file, name: name as string },
            metadata: new Uint8Array(),
          }),
        ).rejects.toMatchObject({ code: "invalid-input" });
      }
      expect(opens).toBe(0);
      expect((await state()).calls).toEqual(["authenticate"]);
      let reads = 0;
      const file = {
        ...source,
        get name() {
          reads++;
          return reads === 1 ? "fixture" : "";
        },
      };
      const object = await run.objects.upload({
        file,
        metadata: Uint8Array.of(9),
      });
      expect(await run.objects.inspect(object)).toBe("present");
      expect(reads).toBe(1);
      for (const descriptorName of ["", "é".repeat(513)]) {
        let reads = 0;
        const file = {
          ...source,
          get name() {
            reads++;
            return reads === 1 ? descriptorName : "changed";
          },
        };
        const metadata = Uint8Array.of(37, 50, 70);
        const object = await run.objects.upload({
          file,
          metadata,
          name: "override",
        });
        expect(reads).toBe(1);
        expect(await run.objects.inspect(object)).toBe("present");
        expect(
          (await state()).objects.find((row) => row.id === object.id),
        ).toMatchObject({ metadata: [37, 50, 70], payload: [1], pinned: true });
      }
    });
    expect(result.summary.logicalUploadedBytes).toBe(3);
    expect(result.summary.cleanup).toBe("clean");
    expect((await state()).calls.filter((call) => call === "upload")).toEqual([
      "upload",
      "upload",
      "upload",
    ]);
  }));
it.each([false, true])(
  "oversized metadata is rejected before copying it (byteLength override: %s)",
  (overrideSize) =>
    fixture(async (options, state) => {
      await withLiveRun(options, async (run) => {
        const file = await bytesFixture({
          bytes: Uint8Array.of(1),
          name: "clip",
        });
        const original = Uint8Array;
        const metadata = new original(16 * 1024 + 1);
        if (overrideSize)
          Object.defineProperty(metadata, "byteLength", { get: () => 0 });
        vi.stubGlobal(
          "Uint8Array",
          new Proxy(original, {
            construct(target, args, newTarget) {
              if (args[0] === metadata)
                throw new Error("Metadata snapshot allocation failed");
              return Reflect.construct(target, args, newTarget) as Uint8Array;
            },
          }),
        );
        try {
          await expect(
            run.objects.upload({ file, metadata, name: file.name }),
          ).rejects.toMatchObject({ code: "invalid-input" });
        } finally {
          vi.unstubAllGlobals();
        }
      });
      expect((await state()).calls).toEqual(["authenticate"]);
    }),
);
it("oversized live metadata is rejected before opening the source or calling the agent", () =>
  fixture(async (options, state) => {
    const result = await withLiveRun(options, async (run) => {
      const file = await bytesFixture({
        bytes: Uint8Array.of(1),
        name: "clip",
      });
      let opened = false;
      await expect(
        run.objects.upload({
          file: {
            ...file,
            open() {
              opened = true;
              return file.open();
            },
          },
          metadata: new Uint8Array(16 * 1024 + 1),
          name: file.name,
        }),
      ).rejects.toMatchObject({ code: "invalid-input" });
      expect(opened).toBe(false);
    });
    expect(result.summary.cleanup).toBe("clean");
    expect((await state()).calls).toEqual(["authenticate"]);
  }));
it(
  "journal exhaustion rejects the next upload before its agent creates an object",
  () =>
    fixture(async (options, state) => {
      const path = join(dirname(options.journalFile), "larger-profile.json");
      const document = profileDocument(options.profile);
      await writeFile(
        path,
        JSON.stringify({
          ...document,
          limits: { ...document.limits, cleanupDeadlineMs: 10000, deadlineMs: 10000, maxObjects: 64 },
        }),
        { mode: 0o600 },
      );
      const profile = await loadLiveProfile(path, {
        apiBaseUrl: document.apiBaseUrl,
        mutations: true,
        transfers: true,
      });
      await writeFile(
        join(dirname(options.journalFile), "state.json"),
        JSON.stringify({ ...(await state()), sealedBytes: 1024 * 1024 }),
        { mode: 0o600 },
      );
      const result = await withLiveRun({ ...options, profile }, async (run) => {
        const file = await bytesFixture({
          bytes: Uint8Array.of(1),
          name: "clip",
        });
        let accepted = 0;
        for (; accepted < 32; accepted++) {
          try {
            await run.objects.upload({
              file,
              metadata: new Uint8Array(),
              name: file.name,
            });
          } catch (error) {
            expect(error).toMatchObject({ code: "journal-limit" });
            break;
          }
        }
        expect(
          (await state()).calls.filter((call) => call === "upload"),
        ).toHaveLength(accepted);
        return accepted;
      });
      expect(result.summary.cleanup).toBe("clean");
      expect(result.value).toBe(15);
      expect((await state()).objects.map((object) => object.id)).toEqual([
        "f".repeat(64),
      ]);
    }),
  15000,
);
it.each(["delete", "revoke"])(
  "a failed %s does not prevent cleanup of other recorded resources",
  (operation) =>
    fixture(async (options, state) => {
      let failedId = "";
      await expect(
        withLiveRun(options, async (run) => {
          const file = await bytesFixture({
            bytes: Uint8Array.of(1),
            name: "clip",
          });
          for (let index = 0; index < 2; index++) {
            const object = await run.objects.upload({
              file,
              metadata: new Uint8Array(),
              name: file.name,
            });
            const share = await run.shares.create({ objects: [object] });
            failedId = operation === "delete" ? object.id : share.id;
          }
          await writeFile(
            join(dirname(options.journalFile), "state.json"),
            JSON.stringify({ ...(await state()), failIds: [failedId] }),
            { mode: 0o600 },
          );
        }),
      ).rejects.toMatchObject({ summary: { cleanup: "uncertain" } });
      const remaining = await state();
      expect(remaining.objects.map((object) => object.id)).toEqual(
        operation === "delete" ? ["f".repeat(64), failedId] : ["f".repeat(64)],
      );
      expect(remaining.shares.map((share) => share.id)).toEqual(
        operation === "revoke" ? [failedId] : [],
      );
    }),
);
it("cleanup removes acknowledged fixtures and leaves an unrelated object untouched", () =>
  fixture(async (options, state) => {
    let applicationClosed = false;
    const result = await withLiveRun(
      {
        ...options,
        beforeCleanup: () => {
          applicationClosed = true;
          return Promise.resolve();
        },
      },
      async (run) => {
        const file = await bytesFixture({
          bytes: new Uint8Array([1, 2, 3]),
          name: "clip.mp4",
        });
        const object = await run.objects.upload({
          file,
          metadata: new Uint8Array([9]),
          name: file.name,
        });
        expect(await run.objects.inspect(object)).toBe("present");
        await run.shares.create({ objects: [object] });
        expect(applicationClosed).toBe(false);
        return 42;
      },
    );
    expect(applicationClosed).toBe(true);
    expect(result).toMatchObject({
      summary: { backend: "live", cleanup: "clean", logicalUploadedBytes: 3 },
      value: 42,
    });
    expect(await state()).toMatchObject({
      objects: [{ id: "f".repeat(64) }],
      shares: [],
    });
    const records = (await readJournal(options.journalFile)).records;
    const uploadAck = records.findIndex(
      (record) =>
        record.kind === "ack" &&
        typeof record.result === "object" &&
        record.result !== null &&
        "sealed" in record.result,
    );
    const pinIntent = records.findIndex(
      (record) => record.kind === "intent" && record.operation === "pin",
    );
    expect(uploadAck).toBeGreaterThan(0);
    expect(pinIntent).toBeGreaterThan(uploadAck);
    expect(JSON.stringify(result.summary)).not.toContain("07".repeat(32));
  }));
it("a foreign mutation handle is rejected before any SDK request", () =>
  fixture(async (first) => {
    await withLiveRun(first, async (owner) => {
      const file = await bytesFixture({
        bytes: new Uint8Array([1]),
        name: "clip",
      });
      const object = await owner.objects.upload({
        file,
        metadata: new Uint8Array(),
        name: file.name,
      });
      await fixture(async (second, state) => {
        await withLiveRun(second, async (other) => {
          const calls = (await state()).calls.length;
          await expect(other.objects.delete(object)).rejects.toMatchObject({
            code: "foreign-handle",
          });
          expect((await state()).calls).toHaveLength(calls);
        });
      });
    });
  }));
it("an over-budget upload is rejected without opening its fixture", () =>
  fixture(async (options, state) => {
    let opens = 0;
    const file = await bytesFixture({
      bytes: new Uint8Array([1, 2, 3]),
      name: "clip",
    });
    await withLiveRun(options, async (run) => {
      await expect(
        run.objects.upload({
          file: {
            ...file,
            open() {
              opens++;
              return file.open();
            },
          },
          metadata: new Uint8Array(),
          name: file.name,
        }),
      ).rejects.toMatchObject({ code: "limit" });
    });
    expect(opens).toBe(0);
    expect((await state()).calls).not.toContain("upload");
  }, 2));
it("unacknowledged share creation fails the run even when its callback catches the SDK error", () =>
  fixture(async (options, state) => {
    const current = await state();
    await writeFile(
      join(dirname(options.journalFile), "state.json"),
      JSON.stringify({ ...current, crashAfter: "create-share" }),
      { mode: 0o600 },
    );
    await expect(
      withLiveRun(options, async (run) => {
        await expect(run.shares.create({ objects: [] })).rejects.toBeInstanceOf(
          Error,
        );
        return "callback caught it";
      }),
    ).rejects.toMatchObject({ summary: { cleanup: "uncertain" } });
    expect((await state()).shares).toHaveLength(1);
    expect((await readJournal(options.journalFile)).records).toContainEqual(
      expect.objectContaining({ kind: "intent", operation: "create-share" }),
    );
  }));
it("recovery finishes an exact deletion whose acknowledgement was lost", () =>
  fixture(async (options, state) => {
    await writeFile(
      join(dirname(options.journalFile), "state.json"),
      JSON.stringify({ ...(await state()), crashAfter: "delete" }),
      { mode: 0o600 },
    );
    await expect(
      withLiveRun(options, async (run) => {
        const file = await bytesFixture({
          bytes: new Uint8Array([4]),
          name: "clip",
        });
        await run.objects.upload({
          file,
          metadata: new Uint8Array(),
          name: file.name,
        });
      }),
    ).rejects.toMatchObject({ summary: { cleanup: "uncertain" } });
    const afterCrash = await state();
    await writeFile(
      join(dirname(options.journalFile), "state.json"),
      JSON.stringify({ ...afterCrash, crashAfter: undefined }),
      { mode: 0o600 },
    );
    await expect(recoverLiveRun(options)).resolves.toMatchObject({
      backend: "live",
      cleanup: "clean",
      logicalUploadedBytes: 1,
    });
    expect((await state()).objects).toEqual([
      { id: "f".repeat(64), pinned: true },
    ]);
    expect(
      (await readJournal(options.journalFile)).records.at(-1),
    ).toMatchObject({ cleanup: "clean", kind: "complete" });
  }));
it("recovery preserves an unknown share creation without account-wide cleanup", () =>
  fixture(async (options, state) => {
    await writeFile(
      join(dirname(options.journalFile), "state.json"),
      JSON.stringify({ ...(await state()), crashAfter: "create-share" }),
      { mode: 0o600 },
    );
    await expect(
      withLiveRun(options, async (run) => {
        await run.shares.create({ objects: [] });
      }),
    ).rejects.toBeInstanceOf(Error);
    await expect(recoverLiveRun(options)).rejects.toMatchObject({
      summary: { cleanup: "uncertain" },
    });
    expect((await state()).shares).toHaveLength(1);
    expect((await state()).calls).not.toContain("revoke");
  }));
it("recovery refuses an active run's lease before contacting the SDK", () =>
  fixture(async (options, state) => {
    await withLiveRun(options, async () => {
      const calls = (await state()).calls.length;
      await expect(recoverLiveRun(options)).rejects.toMatchObject({
        code: "lease-busy",
      });
      expect((await state()).calls).toHaveLength(calls);
    });
  }));
it("a stalled application close preserves storage instead of blocking cleanup forever", ({
  onTestFinished,
}) => {
  let release!: () => void;
  const blocked = new Promise<void>((resolve) => {
    release = resolve;
  });
  const testing = fixture(async (options, state) => {
    const document = profileDocument(options.profile);
    const path = join(dirname(options.journalFile), "short-profile.json");
    await writeFile(
      path,
      JSON.stringify({
        ...document,
        limits: { ...document.limits, cleanupDeadlineMs: 60 },
      }),
      { mode: 0o600 },
    );
    const profile = await loadLiveProfile(path, {
      apiBaseUrl: document.apiBaseUrl,
      mutations: true,
      transfers: true,
    });
    let closeStarted = false;
    let closeFinished = false;
    const closing = blocked.then(() => {
      closeFinished = true;
    });
    let stored!: FixtureState;
    const running = withLiveRun(
      {
        ...options,
        beforeCleanup: () => {
          closeStarted = true;
          return closing;
        },
        profile,
      },
      async (run) => {
        const file = await bytesFixture({
          bytes: new Uint8Array([4]),
          name: "clip",
        });
        const object = await run.objects.upload({
          file,
          metadata: new Uint8Array(),
          name: file.name,
        });
        stored = await state();
        expect(stored.objects).toEqual([
          { id: "f".repeat(64), pinned: true },
          { bytes: 1, id: object.id, metadata: [], payload: [4], pinned: true },
        ]);
      },
    );
    const settled = running.then(
      () => undefined,
      () => undefined,
    );
    try {
      await expect(running).rejects.toMatchObject({
        summary: { cleanup: "uncertain" },
      });
      await expect(running).rejects.toHaveProperty("errors", [
        expect.objectContaining({ name: "TimeoutError" }),
      ]);
      expect(closeStarted).toBe(true);
      expect(closeFinished).toBe(false);
      expect(await state()).toEqual(stored);
    } finally {
      release();
      await closing;
      await settled;
    }
    expect(await state()).toEqual(stored);
  });
  // Test timeouts do not cancel promises; release and join before fixture removal finishes.
  onTestFinished(async () => {
    release();
    await Promise.allSettled([testing]);
  });
  return testing;
});
it("a failed application callback still cleans its exact owned resources", () =>
  fixture(async (options, state) => {
    const primary = new Error("application failed");
    let failure: unknown;
    try {
      await withLiveRun(options, async (run) => {
        const file = await bytesFixture({
          bytes: new Uint8Array([4]),
          name: "clip",
        });
        await run.objects.upload({
          file,
          metadata: new Uint8Array(),
          name: file.name,
        });
        throw primary;
      });
    } catch (error) {
      failure = error;
    }
    expect(failure).toMatchObject({
      summary: { backend: "live", cleanup: "clean" },
    });
    expect((failure as AggregateError).errors).toContain(primary);
    expect((await state()).objects).toEqual([
      { id: "f".repeat(64), pinned: true },
    ]);
  }));

it.each(["foreign", "padding", "overwrite"])(
  "live collector sends only actual %s fixture bytes",
  (kind) =>
    fixture(async (options, state) => {
      const expected =
        kind === "padding"
          ? Uint8Array.of(1, 0)
          : kind === "overwrite"
            ? Uint8Array.of(1, 3)
            : Uint8Array.of(1, 2, 3);
      const descriptor = await bytesFixture({ bytes: expected, name: "bytes" });
      const chunk =
        kind === "foreign"
          ? foreignMetadata("Uint8Array.of(1, 2, 3)")
          : Uint8Array.from(kind === "padding" ? [1] : [1, 2]);
      if (kind !== "foreign")
        Object.defineProperty(chunk, "byteLength", {
          value: kind === "padding" ? 2 : 1,
        });
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(chunk);
          if (kind === "overwrite") controller.enqueue(Uint8Array.of(3));
          controller.close();
        },
      });
      const result = await withLiveRun(options, async (run) => {
        const uploading = run.objects.upload({
          file: { ...descriptor, open: () => stream },
          metadata: new Uint8Array(),
        });
        if (kind === "foreign") {
          const object = await uploading;
          expect(
            (await state()).objects.find((row) => row.id === object.id),
          ).toMatchObject({ payload: [1, 2, 3], pinned: true });
        } else {
          await expect(uploading).rejects.toMatchObject({
            code: "invalid-input",
          });
          expect((await state()).calls).toEqual(["authenticate"]);
          expect((await state()).objects).toHaveLength(1);
        }
        expect(stream.locked).toBe(false);
      });
      expect(result.summary.cleanup).toBe("clean");
    }),
);

it("live managed client snapshots selected metadata bytes before opening the source", () =>
  fixture(async (options, state) => {
    const result = await withLiveRun(options, async (run) => {
      const descriptor = await bytesFixture({
        bytes: Uint8Array.of(1, 2, 3),
        name: "payload",
      });
      for (const metadata of managedMetadataInputs()) {
        let reads = 0;
        const object = await run.objects.upload({
          file: {
            ...descriptor,
            open() {
              metadata[0] = 90;
              return descriptor.open();
            },
          },
          get metadata() {
            reads++;
            return metadata;
          },
          name: "explicit",
        });
        expect(reads).toBe(1);
        metadata[1] = 80;
        const first = (await state()).objects.find(
          (row) => row.id === object.id,
        )!;
        expect(first).toMatchObject({
          metadata: [10, 20],
          payload: [1, 2, 3],
          pinned: true,
        });
        first.metadata!.fill(0);
        expect(
          (await state()).objects.find((row) => row.id === object.id)!.metadata,
        ).toEqual([10, 20]);
      }
    });
    expect(result.summary.cleanup).toBe("clean");
    expect((await state()).objects).toEqual([
      { id: "f".repeat(64), pinned: true },
    ]);
  }));

it.each(["maximum", "empty"])(
  "live managed client accepts %s metadata",
  (kind) =>
    fixture(async (options, state) => {
      const result = await withLiveRun(options, async (run) => {
        const file = await bytesFixture({
          bytes: Uint8Array.of(1),
          name: "payload",
        });
        const maximum = new Uint8Array(16384);
        Object.defineProperty(maximum, "byteLength", { value: 1000000 });
        for (const metadata of kind === "maximum"
          ? [maximum]
          : emptyManagedMetadata()) {
          const expected = Array.from(metadata);
          const object = await run.objects.upload({ file, metadata });
          expect(
            (await state()).objects.find((row) => row.id === object.id),
          ).toMatchObject({ metadata: expected, pinned: true });
        }
      });
      expect(result.summary.cleanup).toBe("clean");
      expect((await state()).objects).toHaveLength(1);
    }),
);

it("live managed client rejects invalid metadata before source opening or dispatch without consuming allowance", () =>
  fixture(
    async (options, state) => {
      const result = await withLiveRun(options, async (run) => {
        const descriptor = await bytesFixture({
          bytes: Uint8Array.of(1),
          name: "payload",
        });
        let opens = 0;
        const file = {
          ...descriptor,
          open() {
            opens++;
            return descriptor.open();
          },
        };
        const callerError = new Error("metadata getter failed");
        await expect(
          run.objects.upload({
            file,
            get metadata(): Uint8Array {
              throw callerError;
            },
          }),
        ).rejects.toBe(callerError);
        const oversized = foreignMetadata("new Uint8Array(16385)");
        Object.defineProperty(oversized, "byteLength", { value: 0 });
        for (const metadata of [oversized, ...invalidManagedMetadata()]) {
          await expect(
            run.objects.upload({
              file,
              // @ts-expect-error Invalid caller values must reject at the upload boundary.
              metadata,
            }),
          ).rejects.toMatchObject({ code: "invalid-input" });
        }
        expect(opens).toBe(0);
        expect((await state()).calls).toEqual(["authenticate"]);
        const object = await run.objects.upload({
          file,
          metadata: new Uint8Array(),
        });
        expect(opens).toBe(1);
        expect(
          (await state()).objects.find((row) => row.id === object.id)!.pinned,
        ).toBe(true);
      });
      expect(result.summary.cleanup).toBe("clean");
      expect((await state()).objects).toHaveLength(1);
    },
    100,
    1,
  ));
