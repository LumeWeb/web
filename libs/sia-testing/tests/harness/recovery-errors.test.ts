/** Real private files expose whether failed releases hide recovery errors or leave later resources open. */
import fs, { type FileHandle, readdir, readFile, rm } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { dirname } from "node:path";
import { expect, it, vi } from "vitest";
import {
  createRecoveryRecord,
  writeRecoveryRecord,
} from "../../src/e2e/internal/recovery.mjs";

/** Faults affect only handles opened during this call; every remaining descriptor is reclaimed afterward. */
async function withFileHandleFaults(
  inject: (handle: FileHandle, path: string) => void,
  run: () => Promise<void>,
) {
  const handles: FileHandle[] = [];
  const open = fs.open;
  const stub = vi
    .spyOn(fs, "open")
    .mockImplementation(async (path, flags, mode) => {
      const handle = await open(path, flags, mode);
      handles.push(handle);
      inject(handle, String(path));
      return handle;
    });
  syncBuiltinESMExports();
  try {
    await run();
  } finally {
    stub.mockRestore();
    syncBuiltinESMExports();
    for (const handle of handles) if (handle.fd >= 0) await handle.close();
  }
}

it("reports a single write failure after releasing the recovery handles", async () => {
  const path = await createRecoveryRecord();
  const directory = dirname(path);
  const primary = new Error("replacement sync failed");
  let originalFile: FileHandle | undefined;
  try {
    await withFileHandleFaults(
      (handle, opened) => {
        if (opened === path) originalFile = handle;
        else if (opened.endsWith(".tmp"))
          vi.spyOn(handle, "sync").mockRejectedValueOnce(primary);
      },
      async () => {
        const failure: unknown = await writeRecoveryRecord(path, {
          accountKey: "owned-account",
        }).catch((error: unknown) => error);
        expect(failure).toBeInstanceOf(AggregateError);
        if (!(failure instanceof AggregateError))
          throw new Error("Expected collected failure");
        expect(failure.errors).toEqual([primary]);
        expect(originalFile?.fd).toBe(-1);
        expect(await readdir(directory)).toEqual(["recovery.json"]);
        expect(await readFile(path, "utf8")).toBe("{}");
      },
    );
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
});

it("keeps the write failure and releases later resources after replacement close fails", async () => {
  const path = await createRecoveryRecord();
  const directory = dirname(path);
  const original = { accountKey: "owned-account" };
  const writeFailure = new Error("replacement sync failed");
  const closeFailure = new Error("replacement close failed");
  let originalFile: FileHandle | undefined;
  try {
    await writeRecoveryRecord(path, original);
    await withFileHandleFaults(
      (handle, opened) => {
        if (opened === path) originalFile = handle;
        else if (opened.endsWith(".tmp")) {
          vi.spyOn(handle, "sync").mockRejectedValueOnce(writeFailure);
          vi.spyOn(handle, "close").mockRejectedValueOnce(closeFailure);
        }
      },
      async () => {
        const failure: unknown = await writeRecoveryRecord(path, {
          accountKey: "replacement",
        }).catch((error: unknown) => error);
        expect(failure).toBeInstanceOf(AggregateError);
        if (!(failure instanceof AggregateError))
          throw new Error("Expected both failures");
        expect(failure.errors).toEqual([writeFailure, closeFailure]);
        expect(originalFile?.fd).toBe(-1);
        expect(await readdir(directory)).toEqual(["recovery.json"]);
        expect(JSON.parse(await readFile(path, "utf8"))).toEqual(original);
      },
    );
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
});

it("keeps an acknowledged rename after directory sync and close fail", async () => {
  const path = await createRecoveryRecord();
  const directory = dirname(path);
  const replacement = { accountKey: "owned-account" };
  const writeFailure = new Error("directory sync failed");
  const closeFailure = new Error("directory close failed");
  let originalFile: FileHandle | undefined;
  try {
    await withFileHandleFaults(
      (handle, opened) => {
        if (opened === path) originalFile = handle;
        else if (opened === directory) {
          vi.spyOn(handle, "sync").mockRejectedValueOnce(writeFailure);
          vi.spyOn(handle, "close").mockRejectedValueOnce(closeFailure);
        }
      },
      async () => {
        const failure: unknown = await writeRecoveryRecord(
          path,
          replacement,
        ).catch((error: unknown) => error);
        expect(failure).toBeInstanceOf(AggregateError);
        if (!(failure instanceof AggregateError))
          throw new Error("Expected both failures");
        expect(failure.errors).toEqual([writeFailure, closeFailure]);
        expect(originalFile?.fd).toBe(-1);
        expect(await readdir(directory)).toEqual(["recovery.json"]);
        expect(JSON.parse(await readFile(path, "utf8"))).toEqual(replacement);
      },
    );
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
});
