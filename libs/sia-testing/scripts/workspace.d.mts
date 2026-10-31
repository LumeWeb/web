/** Filesystem contracts for script-owned temporary workspaces and shared dependency directories. */

/** Package directory containing the scripts, independent of the caller's working directory. */
export const packageRoot: string;
/**
 * Links an existing directory at an unused destination, creating its parents.
 * Writes through the link affect the source; mutated code must be copied instead.
 */
export function linkDirectory(
  source: string,
  destination: string,
): Promise<void>;
/**
 * Awaits the callback and attempts cleanup whether it returns or throws.
 * The returned value must not require files in the temporary directory to survive.
 */
export function withTemporaryDirectory<T>(
  prefix: string,
  run: (directory: string) => Promise<T> | T,
): Promise<T>;
