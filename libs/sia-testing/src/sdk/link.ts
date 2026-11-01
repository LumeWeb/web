/** Serializes transfer chunks so concurrent clients share bandwidth and cancellation releases queued work. */
interface Transfer {
  abort: () => void;
  bytes: number;
  reject(error: unknown): void;
  resolve(): void;
  signal?: AbortSignal;
}

export function createTransferLink(rate: () => number) {
  const queue: Transfer[] = [];
  let active: Transfer | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;

  function finish(transfer: Transfer, error?: unknown): void {
    transfer.signal?.removeEventListener("abort", transfer.abort);
    if (active === transfer) {
      if (timer !== undefined) clearTimeout(timer);
      timer = undefined;
      active = undefined;
    } else {
      const index = queue.indexOf(transfer);
      if (index >= 0) queue.splice(index, 1);
    }
    if (error !== undefined) transfer.reject(error);
    else transfer.resolve();
    start();
  }

  function start(): void {
    if (active) return;
    const transfer = queue.shift();
    if (!transfer) return;
    active = transfer;
    const bytesPerSecond = rate();
    function wait(remaining: number): void {
      // Node clamps overflowing delays to 1ms, which would turn a slow link into an immediate transfer.
      const delay = Math.min(remaining, 2_147_483_647);
      timer = setTimeout(() => {
        if (remaining > delay) wait(remaining - delay);
        else finish(transfer!);
      }, delay);
    }
    if (bytesPerSecond === 0 || transfer.bytes === 0) finish(transfer);
    else wait(Math.ceil((transfer.bytes / bytesPerSecond) * 1000));
  }

  return (bytes: number, signal?: AbortSignal): Promise<void> =>
    new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(new DOMException("transfer cancelled", "AbortError"));
        return;
      }
      const transfer: Transfer = {
        abort: () =>
          finish(transfer, signal?.reason ?? new Error("transfer cancelled")),
        bytes,
        reject,
        resolve,
        ...(signal ? { signal } : {}),
      };
      queue.push(transfer);
      signal?.addEventListener("abort", transfer.abort, { once: true });
      start();
    });
}
