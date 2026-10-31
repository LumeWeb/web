// @ts-check
/** Attempts every owned teardown phase without overwriting an earlier business failure. */
/** @param {{phase: string, run: () => Promise<void>}[]} phases */
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

/** @param {() => Promise<void>} operation @param {(() => Promise<void>)[]} cleanup */
export async function withOwnedCleanup(operation, cleanup) {
  const failures = await settlePhases([
    { phase: "business", run: operation },
    ...cleanup.map((run, index) => ({ phase: `cleanup-${index}`, run })),
  ]);
  if (failures.length)
    throw new AggregateError(
      failures.map((failure) => failure.error),
      "Test or owned cleanup failed",
    );
}
