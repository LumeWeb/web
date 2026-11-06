/** Buffered collectors join producer cancellation without treating repeated reader errors as cleanup failures. */
export function ownReaderLifetime(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  signal: AbortSignal,
) {
  const closed = reader.closed.then(
    () => ({ failed: false as const }),
    (error: unknown) => ({ error, failed: true as const }),
  );
  let readFailure: undefined | { error: unknown };
  let cancellation: Promise<void> | undefined;
  const cancel = (reason: unknown = signal.reason) => {
    cancellation ??= reader.cancel(reason);
    void cancellation.catch(() => undefined);
  };
  const abort = () => cancel();
  signal.addEventListener("abort", abort, { once: true });
  return {
    async finish(
      complete: boolean,
      reason: unknown,
    ): Promise<{ error: unknown; failed: true } | { failed: false }> {
      signal.removeEventListener("abort", abort);
      if (!complete) cancel(reason);
      try {
        await cancellation;
        return { failed: false };
      } catch (error) {
        const state = await closed;
        // Producer cancellation closes the reader even when it rejects with the abort reason.
        // A previously errored reader instead repeats its error without invoking the producer.
        const repeatedReaderError =
          (readFailure !== undefined && Object.is(readFailure.error, error)) ||
          (state.failed && Object.is(state.error, error));
        return repeatedReaderError
          ? { failed: false }
          : { error, failed: true };
      } finally {
        reader.releaseLock();
      }
    },
    readFailed(error: unknown): void {
      readFailure = { error };
    },
  };
}
