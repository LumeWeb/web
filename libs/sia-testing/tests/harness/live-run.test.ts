/** Managed-run tests inspect persisted fixture state without treating the control fixture as a real Sia host. */
import { copyFile, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, it } from "vitest";
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
  objects: { id: string; pinned: boolean }[];
  shares: { id: string }[];
}
async function fixture(
  use: (
    options: LiveRunOptions,
    state: () => Promise<FixtureState>,
  ) => Promise<void>,
  maxLogicalUploadBytes = 100,
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
          limits: { ...document.limits, deadlineMs: 10000, maxObjects: 64 },
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
it("a stalled application close preserves storage instead of blocking cleanup forever", () =>
  fixture(async (options, state) => {
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
    let release!: () => void;
    const blocked = new Promise<void>((resolve) => {
      release = resolve;
    });
    let fallbackReleased = false;
    const fallback = setTimeout(() => {
      fallbackReleased = true;
      release();
    }, 300);
    try {
      await expect(
        withLiveRun(
          { ...options, beforeCleanup: () => blocked, profile },
          async (run) => {
            const file = await bytesFixture({
              bytes: new Uint8Array([4]),
              name: "clip",
            });
            await run.objects.upload({
              file,
              metadata: new Uint8Array(),
              name: file.name,
            });
          },
        ),
      ).rejects.toMatchObject({ summary: { cleanup: "uncertain" } });
      expect(fallbackReleased).toBe(false);
      expect((await state()).objects).toHaveLength(2);
    } finally {
      clearTimeout(fallback);
      release();
    }
  }));
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
