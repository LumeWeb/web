/** Cancels one caller's wait without releasing holds that belong to other callers. */
export function withAbort<T>(
  work: Promise<T>,
  signal?: AbortSignal,
): Promise<T> {
  if (!signal) return work;
  return new Promise((resolve, reject) => {
    const aborted = () => {
      signal.removeEventListener("abort", aborted);
      reject(new DOMException("mock operation cancelled", "AbortError"));
    };
    signal.addEventListener("abort", aborted, { once: true });
    work.then(
      (value) => {
        signal.removeEventListener("abort", aborted);
        resolve(value);
      },
      (error: unknown) => {
        signal.removeEventListener("abort", aborted);
        reject(
          error instanceof Error
            ? error
            : new Error("mock operation failed", { cause: error }),
        );
      },
    );
    if (signal.aborted) aborted();
  });
}
