/** Failure-handling contracts for sequential teardown and sanitized diagnostics. */
/** Retains step labels for diagnostics while allowing later callbacks to run after failures. */
export function settlePhases(
  phases: { phase: string; run: () => Promise<void> }[],
): Promise<{ error: unknown; phase: string }[]>;
/** Always attempts cleanup and throws AggregateError containing every rejection, even a single one. */
export function withCleanup(
  operation: () => Promise<void>,
  cleanup: (() => Promise<void>)[],
): Promise<void>;
