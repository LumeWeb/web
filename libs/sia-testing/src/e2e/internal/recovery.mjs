/// <reference types="node" />
// @ts-check
/**
 * Retains exact recovery identities when provisioning or cleanup is interrupted.
 * Records can contain connect credentials, so replacement must not follow links
 * or write into a shared directory. File and directory sync acknowledge an
 * update before the caller proceeds with further mutations.
 */
import { randomBytes } from "node:crypto";
import { constants } from "node:fs";
import {
  lstat,
  mkdtemp,
  open,
  realpath,
  rename,
  unlink,
  writeFile,
} from "node:fs/promises";
import { dirname, join } from "node:path";
import { withCleanup } from "./lifecycle.mjs";

/**
 * Reserves a private record before provisioning, without admin passwords or owner seeds.
 * A separate directory prevents uncertain registrations from overwriting another run's record.
 */
export async function createRecoveryRecord() {
  const directory = await mkdtemp("/tmp/sia-native-cutoff-run-");
  const path = join(directory, "recovery.json");
  await writeFile(path, "{}", { flag: "wx", mode: 0o600 });
  return path;
}

/**
 * Replaces the record atomically; failure before rename keeps the previous identities.
 * After the original file opens, write and release failures are reported together
 * in AggregateError.errors. A committed rename is never rolled back after a
 * directory-sync failure.
 *
 * @param {string} path
 * @param {Record<string, unknown>} value
 */
export async function writeRecoveryRecord(path, value) {
  if (!/^\/tmp\/sia-native-cutoff-run-[^/]+\/recovery\.json$/.test(path))
    throw new Error("Invalid recovery manifest");
  const directory = dirname(path);
  const parent = await lstat(directory);
  if (
    !parent.isDirectory() ||
    parent.uid !== process.getuid?.() ||
    (parent.mode & 0o777) !== 0o700 ||
    (await realpath(directory)) !== directory
  )
    throw new Error("Invalid recovery manifest");
  let file;
  try {
    file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  } catch {
    throw new Error("Invalid recovery manifest");
  }
  const temporary = join(
    directory,
    `.recovery-${randomBytes(16).toString("hex")}.tmp`,
  );
  /** @type {import('node:fs/promises').FileHandle | undefined} */
  let directoryHandle;
  /** @type {import('node:fs/promises').FileHandle | undefined} */
  let replacement;
  let committed = false,
    created = false;
  const originalFile = file;
  await withCleanup(async () => {
    const original = await originalFile.stat();
    if (
      !original.isFile() ||
      original.uid !== process.getuid?.() ||
      (original.mode & 0o777) !== 0o600
    )
      throw new Error("Invalid recovery manifest");
    const text = JSON.stringify(value);
    replacement = await open(
      temporary,
      constants.O_WRONLY |
        constants.O_CREAT |
        constants.O_EXCL |
        constants.O_NOFOLLOW,
      0o600,
    );
    created = true;
    await replacement.writeFile(text);
    await replacement.sync();
    await replacement.close();
    replacement = undefined;
    directoryHandle = await open(
      directory,
      constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW,
    );
    // Reject a replaced file or directory before rename can overwrite a different record.
    const [currentParent, heldParent, current] = await Promise.all([
      lstat(directory),
      directoryHandle.stat(),
      lstat(path),
    ]);
    if (
      currentParent.dev !== parent.dev ||
      currentParent.ino !== parent.ino ||
      heldParent.dev !== parent.dev ||
      heldParent.ino !== parent.ino ||
      currentParent.uid !== process.getuid?.() ||
      (currentParent.mode & 0o777) !== 0o700 ||
      (await realpath(directory)) !== directory ||
      !current.isFile() ||
      current.dev !== original.dev ||
      current.ino !== original.ino ||
      current.uid !== process.getuid?.() ||
      (current.mode & 0o777) !== 0o600
    )
      throw new Error("Invalid recovery manifest");
    await rename(temporary, path);
    committed = true;
    // A directory-sync failure is after commit: report it without rolling back the new record.
    await directoryHandle.sync();
  }, [
    async () => {
      await replacement?.close();
    },
    async () => {
      await directoryHandle?.close();
    },
    () => originalFile.close(),
    async () => {
      if (created && !committed) await unlink(temporary);
    },
  ]);
}
