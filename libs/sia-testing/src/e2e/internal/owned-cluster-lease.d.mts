/** Kernel lease checks shared by guarded runners and provisioning. */
export const clusterLockPath: string;
export function assertMutationAllowed(): Promise<void>;
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
export function verifyNativeLease(
  descriptor: string | undefined,
  lockPath: string,
): Promise<boolean>;
export function verifyOwnedGuardian(lockPath: string): Promise<boolean>;
