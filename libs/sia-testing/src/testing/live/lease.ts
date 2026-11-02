/** A private lease file prevents a run and recovery from mutating the same journal concurrently. */
import { randomUUID } from "node:crypto";
import { constants } from "node:fs";
import { lstat, open, unlink } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { dirname } from "node:path";
import { privatePath } from "./private-files.js";
export interface JournalLease {
  release(): Promise<void>;
}
export async function acquireJournalLease(
  journalPath: string,
): Promise<JournalLease> {
  const path = await privatePath(journalPath + ".lease");
  const parent = await lstat(dirname(path));
  if (
    !parent.isDirectory() ||
    parent.uid !== process.getuid!() ||
    (parent.mode & 0o077) !== 0
  )
    throw failure("lease-invalid");
  let file: FileHandle | undefined;
  let code = "lease-invalid";
  try {
    file = await open(
      path,
      constants.O_WRONLY |
        constants.O_CREAT |
        constants.O_EXCL |
        constants.O_NOFOLLOW,
      0o600,
    );
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "EEXIST"
    )
      code = "lease-busy";
  }
  // Automatic stale-file removal can delete a new owner's lease during concurrent recovery.
  if (!file) throw failure(code);
  const owned = file;
  const identity = await owned.stat();
  try {
    await owned.writeFile(
      JSON.stringify({ pid: process.pid, token: randomUUID() }),
    );
    await owned.sync();
  } catch {
    await owned.close();
    throw failure("lease-invalid");
  }
  let release: Promise<void> | undefined;
  return Object.freeze({
    release(): Promise<void> {
      release ??= (async () => {
        try {
          const current = await lstat(path);
          if (
            current.dev !== identity.dev ||
            current.ino !== identity.ino ||
            current.nlink !== 1
          )
            throw failure("lease-uncertain");
          await unlink(path);
        } finally {
          await owned.close();
        }
      })();
      return release;
    },
  });
}
function failure(code: string) {
  return Object.assign(new Error("Sia journal lease operation failed"), {
    code,
    phase: "journal",
    uncertain: code === "lease-uncertain",
  });
}
