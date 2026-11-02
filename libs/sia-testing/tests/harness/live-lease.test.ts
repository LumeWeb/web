/** Lease tests keep a replacement file intact when an earlier owner releases its descriptor. */
import { mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import { acquireJournalLease } from "../../src/testing/live/lease.js";
async function fixture(use: (path: string) => Promise<void>) {
  const directory = await mkdtemp(join(tmpdir(), "sia-journal-lease-"));
  try {
    await use(join(directory, "run.jsonl"));
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
}
it("another owner cannot acquire a journal until its lease is released", () =>
  fixture(async (path) => {
    const first = await acquireJournalLease(path);
    try {
      await expect(acquireJournalLease(path)).rejects.toMatchObject({
        code: "lease-busy",
      });
    } finally {
      await first.release();
    }
    await first.release();
    const next = await acquireJournalLease(path);
    await next.release();
  }));
it("an existing lease is never treated as stale based on its PID", () =>
  fixture(async (path) => {
    const contents = JSON.stringify({
      pid: 2147483647,
      token: "operator-lease",
    });
    await writeFile(path + ".lease", contents, { mode: 0o600 });
    await expect(acquireJournalLease(path)).rejects.toMatchObject({
      code: "lease-busy",
    });
    expect(await readFile(path + ".lease", "utf8")).toBe(contents);
  }));
it("releasing an old lease never removes a replacement lease", () =>
  fixture(async (path) => {
    const first = await acquireJournalLease(path);
    await rename(path + ".lease", path + ".old-lease");
    await writeFile(path + ".lease", "replacement-owner", { mode: 0o600 });
    await expect(first.release()).rejects.toMatchObject({
      code: "lease-uncertain",
    });
    expect(await readFile(path + ".lease", "utf8")).toBe("replacement-owner");
  }));
