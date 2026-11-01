/** Private identity records retained across uncertain provisioning and cleanup responses. */
/** Reserves a 0600 record in a separate 0700 directory before any admin mutation. */
export function createRecoveryRecord(): Promise<string>;
/**
 * Atomically replaces the record and acknowledges file/directory sync.
 * Post-open write and release failures are aggregated; a renamed record is not rolled back.
 */
export function writeRecoveryRecord(
  path: string,
  value: Record<string, unknown>,
): Promise<void>;
