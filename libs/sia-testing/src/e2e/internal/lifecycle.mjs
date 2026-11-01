// @ts-check
/** Retains operation failures without letting them prevent later teardown callbacks. */

/**
 * Collects failures from sequential labeled operations without throwing early.
 * Returned labels let callers report failed steps without publishing error contents.
 *
 * @param {{phase: string, run: () => Promise<void>}[]} phases
 */
export async function settlePhases(phases) {
  /** @type {{phase: string, error: unknown}[]} */
  const failures = [];
  for (const { phase, run } of phases) {
    try {
      await run();
    } catch (error) {
      failures.push({ error, phase });
    }
  }
  return failures;
}

/**
 * Attempts every cleanup callback after the operation, including when it rejects.
 * A single failure also becomes an AggregateError. Primitive rejection values
 * remain failures, even when the value is undefined or null.
 *
 * @param {() => Promise<void>} operation
 * @param {(() => Promise<void>)[]} cleanup
 */
export async function withCleanup(operation, cleanup) {
  const failures = await settlePhases([
    { phase: "business", run: operation },
    ...cleanup.map((run, index) => ({ phase: `cleanup-${index}`, run })),
  ]);
  if (failures.length)
    throw new AggregateError(
      failures.map((failure) => failure.error),
      "Operation or cleanup failed",
    );
}
