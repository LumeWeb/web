/** Private durable records for exact-owned resource cleanup. */
export function createRecoveryRecord(): Promise<string>;
export function writeRecoveryRecord(
  path: string,
  value: Record<string, unknown>,
): Promise<void>;
