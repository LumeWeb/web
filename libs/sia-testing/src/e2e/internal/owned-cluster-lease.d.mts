/** Linux process supervision and kernel lease proofs for runners and admin mutations. */
/** Participating writers must use the same path to exclude one another. */
export const clusterLockPath: string;
/** Requires consent plus an inherited lock or verified ancestry to its guardian. */
export function assertMutationAllowed(): Promise<void>;
/**
 * Retains the acquired or inherited lock until descendant teardown finishes.
 * A private log is capped at 8 MiB; overflow or capture failure makes the run fail.
 */
export function runWithGuardian(
  command: string,
  args: string[],
  env: NodeJS.ProcessEnv,
  acquire: boolean,
  lockPath: string,
  deadlineMs: number,
  graceMs: number,
  cwd?: string,
  privateLogPath?: string,
): Promise<number>;
/** Checks the inherited descriptor's kernel lock and inode, not its environment claim. */
export function verifyNativeLease(
  descriptor: string | undefined,
  lockPath: string,
): Promise<boolean>;
/** Verifies stable ancestry to the exact guardian and its still-locked inode. */
export function verifyOwnedGuardian(lockPath: string): Promise<boolean>;
