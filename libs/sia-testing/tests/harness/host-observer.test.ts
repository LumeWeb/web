/** Synthetic file fixtures check byte-interval evidence without running an SDK or host. */
import {
  appendFile,
  mkdtemp,
  readdir,
  readlink,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  observeHostPayload,
  observeHostPayloadSettled,
} from "../e2e/support/host-observer.js";

function rejected(value: unknown): Promise<never> {
  return vi.fn<() => Promise<never>>().mockRejectedValue(value)();
}

const directories: string[] = [];
async function fixture(initial = '{"rpc":"WriteSector"}\n') {
  const directory = await mkdtemp(join(tmpdir(), "host-observer-"));
  directories.push(directory);
  const path = join(directory, "cluster.log");
  await writeFile(path, initial);
  return path;
}

afterEach(async () => {
  await Promise.all(
    directories
      .splice(0)
      .map((path) => rm(path, { force: true, recursive: true })),
  );
});

describe("host payload observation", () => {
  it("keeps rejected-operation RPC evidence and the original error", async () => {
    const path = await fixture();
    const error = new Error("fixture read failed");
    let calls = 0;
    const observed = await observeHostPayloadSettled(path, async () => {
      calls++;
      await appendFile(
        path,
        '{"rpc":"ReadSector"}\n{"rpc":"AccountBalance"}\n',
      );
      return rejected(error);
    });
    await appendFile(path, '{"rpc":"WriteSector"}\n');
    expect(observed).toEqual({
      error,
      payloadRPCs: ['"rpc":"ReadSector"'],
      status: "rejected",
    });
    if (observed.status !== "rejected") throw new Error("expected rejection");
    expect(observed.error).toBe(error);
    expect(calls).toBe(1);
  });

  it("keeps the fulfilled result and only payload RPCs in the interval", async () => {
    const path = await fixture();
    const result = { bytes: [3, 1, 4] };
    let calls = 0;
    const observed = await observeHostPayloadSettled(path, async () => {
      calls++;
      await appendFile(
        path,
        '{"rpc": "ReadSector"}\n{"rpc":"Settings"}\n{"rpc":"WriteSector"}\n',
      );
      return result;
    });
    await appendFile(path, '{"rpc":"ReadSector"}\n');
    expect(observed).toEqual({
      payloadRPCs: ['"rpc": "ReadSector"', '"rpc":"WriteSector"'],
      result,
      status: "fulfilled",
    });
    if (observed.status !== "fulfilled")
      throw new Error("expected fulfillment");
    expect(observed.result).toBe(result);
    expect(calls).toBe(1);
  });

  it.each([undefined, null, false, 0, "fixture rejection"])(
    "preserves unusual rejection value %s",
    async (error) => {
      const path = await fixture();
      const observed = await observeHostPayloadSettled(path, () =>
        rejected(error),
      );
      expect(observed).toEqual({ error, payloadRPCs: [], status: "rejected" });
      await expect(
        observeHostPayload(path, () => rejected(error)),
      ).rejects.toBe(error);
    },
  );

  it("preserves the legacy successful return shape", async () => {
    const path = await fixture();
    const observed = await observeHostPayload(path, async () => {
      await appendFile(path, '{"rpc":"ReadSector"}\n');
      return 17;
    });
    expect(observed).toEqual({
      payloadRPCs: ['"rpc":"ReadSector"'],
      result: 17,
    });
  });

  it("does not invoke the operation without a readable log path", async () => {
    let calls = 0;
    const operation = () => {
      calls++;
      return Promise.resolve();
    };
    await expect(
      observeHostPayloadSettled(undefined, operation),
    ).rejects.toThrow("SIA_TEST_CLUSTER_LOG");
    await expect(
      observeHostPayloadSettled(
        join(tmpdir(), "absent-host-observer", "cluster.log"),
        operation,
      ),
    ).rejects.toThrow();
    expect(calls).toBe(0);
  });

  it("refuses a truncated interval instead of reporting zero RPCs", async () => {
    const path = await fixture();
    await expect(
      observeHostPayloadSettled(path, () => writeFile(path, "")),
    ).rejects.toThrow(/truncated|changed/i);
  });

  it("refuses a replaced log even when the old file remains open", async () => {
    const path = await fixture();
    await expect(
      observeHostPayloadSettled(path, async () => {
        await rename(path, `${path}.old`);
        await writeFile(path, '{"rpc":"ReadSector"}\n');
      }),
    ).rejects.toThrow(/replaced|changed/i);
  });

  it("refuses a truncated log that regrows with different historical bytes", async () => {
    const path = await fixture("historical fixture text\n");
    await expect(
      observeHostPayloadSettled(path, () =>
        writeFile(path, 'replacement fixture text\n{"rpc":"ReadSector"}\n'),
      ),
    ).rejects.toThrow(/changed/i);
  });

  it("rejects an oversized interval without reading historical log contents", async () => {
    const path = await fixture("x".repeat(9 * 1024 * 1024));
    expect(
      await observeHostPayloadSettled(path, () => Promise.resolve(2)),
    ).toEqual({ payloadRPCs: [], result: 2, status: "fulfilled" });
    await expect(
      observeHostPayloadSettled(path, () =>
        appendFile(path, "x".repeat(9 * 1024 * 1024)),
      ),
    ).rejects.toThrow(/limit|large/i);
  });

  it("reports observation failure after a fulfilled operation", async () => {
    const path = await fixture();
    await expect(
      observeHostPayloadSettled(path, () => rm(path)),
    ).rejects.toThrow();
  });

  it.each([
    new Error("fixture failure"),
    undefined,
    null,
    false,
    0,
    "rejection",
  ])("reports both failures in order for rejected value %s", async (error) => {
    const path = await fixture();
    const failure = await observeHostPayloadSettled(path, async () => {
      await rm(path);
      return rejected(error);
    }).then(
      () => undefined,
      (caught: unknown) => caught,
    );
    expect(failure).toBeInstanceOf(AggregateError);
    if (!(failure instanceof AggregateError))
      throw new Error("expected both failures");
    expect(failure.errors).toHaveLength(2);
    expect(failure.errors[0]).toBe(error);
    expect(failure.errors[1]).toBeInstanceOf(Error);
  });

  it.each([
    new Error("legacy fixture failure"),
    undefined,
    null,
    0,
    "legacy rejection",
  ])(
    "reports the operation rejection and missing log to throwing callers: %s",
    async (error) => {
      const path = await fixture();
      const failure: unknown = await observeHostPayload(path, async () => {
        await rm(path);
        return rejected(error);
      }).catch((caught: unknown) => caught);
      expect(failure).toBeInstanceOf(AggregateError);
      if (!(failure instanceof AggregateError))
        throw new Error("Expected both failures");
      expect(failure.errors).toHaveLength(2);
      expect(failure.errors[0]).toBe(error);
      expect(failure.errors[1]).toBeInstanceOf(Error);
    },
  );

  it.skipIf(process.platform !== "linux")(
    "closes the log descriptor after success and failures",
    async () => {
      const path = await fixture();
      async function openLogDescriptors() {
        const descriptors = await readdir("/proc/self/fd");
        const targets = await Promise.all(
          descriptors.map(async (fd) => {
            try {
              return await readlink(`/proc/self/fd/${fd}`);
            } catch {
              return "";
            }
          }),
        );
        return targets.filter(
          (target) => target === path || target === `${path} (deleted)`,
        );
      }
      expect(await openLogDescriptors()).toEqual([]);
      await observeHostPayloadSettled(path, () => Promise.resolve(1));
      expect(await openLogDescriptors()).toEqual([]);
      await observeHostPayloadSettled(path, () => rejected("fixture error"));
      expect(await openLogDescriptors()).toEqual([]);
      await expect(
        observeHostPayload(path, () => rejected("legacy error")),
      ).rejects.toBe("legacy error");
      expect(await openLogDescriptors()).toEqual([]);
      await expect(
        observeHostPayloadSettled(path, () => writeFile(path, "")),
      ).rejects.toThrow();
      expect(await openLogDescriptors()).toEqual([]);
      await expect(
        observeHostPayloadSettled(path, async () => {
          await rm(path);
          throw new Error("fixture operation failed while log disappeared");
        }),
      ).rejects.toBeInstanceOf(AggregateError);
      expect(await openLogDescriptors()).toEqual([]);
    },
  );

  it("rejects non-file paths before invoking the operation", async () => {
    const path = await fixture();
    let calls = 0;
    await expect(
      observeHostPayloadSettled(join(path, ".."), () => {
        calls++;
        return Promise.resolve();
      }),
    ).rejects.toThrow(/regular file/i);
    expect(calls).toBe(0);
  });

  it("captures synchronous operation throws as rejected settlements", async () => {
    const path = await fixture();
    const error = new Error("synchronous fixture rejection");
    expect(
      await observeHostPayloadSettled(path, () => {
        throw error;
      }),
    ).toEqual({
      error,
      payloadRPCs: [],
      status: "rejected",
    });
  });
});
