/** Indexd's first failed-funding retries wait 2 and 4 minutes; allow both before setup fails. */
export async function waitForFundingReady(
  readReady: () => Promise<boolean>,
  timeoutMs = 7 * 60_000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!(await readReady())) {
    if (Date.now() >= deadline)
      throw new Error("Account funding did not reach readiness");
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}
