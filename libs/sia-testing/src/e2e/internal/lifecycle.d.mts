/** Node-side failure collection shared by the maintained fixture lifecycles. */
export function settlePhases(
  phases: { phase: string; run: () => Promise<void> }[],
): Promise<{ error: unknown; phase: string }[]>;
export function withOwnedCleanup(
  operation: () => Promise<void>,
  cleanup: (() => Promise<void>)[],
): Promise<void>;
