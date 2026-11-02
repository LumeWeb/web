/** Credential-bearing files stay outside the checkout and are opened without following final symlinks. */
import { constants } from "node:fs";
import { access, type FileHandle, open, realpath } from "node:fs/promises";
import {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from "node:path";
export async function privatePath(
  path: string,
  workspaceRoot?: string,
): Promise<string> {
  if (!isAbsolute(path) || !process.getuid)
    throw new Error("Invalid private file path");
  const actual = join(await realpath(dirname(path)), basename(path));
  if (await checkoutRoot(dirname(actual)))
    throw new Error("Private file is inside a checkout");
  const checkout =
    workspaceRoot === undefined
      ? await checkoutRoot(process.cwd())
      : await realpath(workspaceRoot);
  if (checkout) {
    const child = relative(checkout, actual);
    if (
      child === "" ||
      (!isAbsolute(child) && child !== ".." && !child.startsWith(`..${sep}`))
    )
      throw new Error("Private file is inside the checkout");
  }
  return actual;
}
export async function readPrivateBytes(
  path: string,
  maximum: number,
  workspaceRoot?: string,
): Promise<Buffer> {
  const actual = await privatePath(path, workspaceRoot);
  // O_NONBLOCK lets fstat reject a named pipe without waiting for its writer.
  const file = await open(
    actual,
    constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK,
  );
  try {
    return await readPrivateHandle(file, maximum);
  } finally {
    await file.close();
  }
}
export async function readPrivateHandle(
  file: FileHandle,
  maximum: number,
): Promise<Buffer> {
  const stat = await file.stat();
  if (
    !stat.isFile() ||
    stat.uid !== process.getuid!() ||
    stat.nlink !== 1 ||
    (stat.mode & 0o077) !== 0 ||
    stat.size > maximum
  )
    throw new Error("Invalid private file ownership or size");
  const buffer = Buffer.alloc(maximum + 1);
  let length = 0;
  while (length < buffer.length) {
    const result = await file.read(
      buffer,
      length,
      buffer.length - length,
      null,
    );
    if (!result.bytesRead) break;
    length += result.bytesRead;
  }
  if (length > maximum) throw new Error("Private file exceeds its size limit");
  return buffer.subarray(0, length);
}
async function checkoutRoot(directory: string): Promise<string | undefined> {
  let current = resolve(directory);
  for (;;) {
    if (
      await access(join(current, ".git")).then(
        () => true,
        () => false,
      )
    )
      return await realpath(current);
    const parent = dirname(current);
    if (parent === current) return undefined;
    current = parent;
  }
}
