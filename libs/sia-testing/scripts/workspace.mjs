/**
 * Shares package paths and disposable filesystem operations for repository scripts.
 * Each temporary directory belongs to one callback, with cleanup attempted
 * after its work finishes.
 *
 * Directory links reuse already-installed dependencies without an installation
 * step. Callers must copy code they intend to modify; writes through a link
 * would change the shared source directory instead of an isolated copy.
 */
import { mkdir, mkdtemp, realpath, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** Package directory derived from this module, independent of the caller's working directory. */
export const packageRoot = fileURLToPath(new URL("../", import.meta.url));

/**
 * Resolving the source first rejects a missing dependency before creating the
 * destination's parents and gives the link an absolute target. The destination
 * must be unused; an existing path is never replaced by this helper.
 * @param {string} source Existing directory to share with the workspace.
 * @param {string} destination Link to create inside the caller-owned workspace.
 */
export async function linkDirectory(source, destination) {
  const target = await realpath(source);
  await mkdir(dirname(destination), { recursive: true });
  await symlink(target, destination, "dir");
}

/**
 * Gives the callback a fresh directory until its work finishes, including any
 * promise it returns. Cleanup is attempted on success and failure; the result must
 * not depend on temporary files remaining available after this call returns.
 * @template T
 * @param {string} prefix Name prefix under the operating system's temporary directory.
 * @param {(directory: string) => Promise<T> | T} run Work that must finish before cleanup.
 * @returns {Promise<T>} The callback's result after cleanup completes.
 */
export async function withTemporaryDirectory(prefix, run) {
  const directory = await mkdtemp(join(tmpdir(), prefix));
  try {
    return await run(directory);
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
}
