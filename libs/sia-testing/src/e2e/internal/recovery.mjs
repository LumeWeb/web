/// <reference types="node" />
// @ts-check
/** Private recovery records retain exact identities when resource ownership is uncertain. */
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

/** Creates recovery storage before provisioning, without copying admin or owner secrets. */
export async function createRecoveryRecord() {
  const directory = await mkdtemp("/tmp/sia-native-cutoff-run-");
  const path = join(directory, "recovery.json");
  await writeFile(path, "{}", { flag: "wx", mode: 0o600 });
  return path;
}

/** Atomically replace a private recovery record; a failed pre-rename update keeps its identities.
 * @param {string} path @param {Record<string, unknown>} value
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
