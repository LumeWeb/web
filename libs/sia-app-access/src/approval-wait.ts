/** Approval waiting handles long browser deadlines and clears the timer after settlement. */
type ApprovalWaitResult = "approved" | "cancelled" | "timed-out";

export function waitForApproval(
  approval: Promise<void>,
  cancelled: Promise<unknown>,
  timeoutMs: number,
): Promise<ApprovalWaitResult> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<"timed-out">((resolve) => {
    // Native timers overflow above the signed 32-bit delay limit.
    let remaining = timeoutMs;
    const schedule = () => {
      const delay = Math.min(remaining, 2147483647);
      timer = setTimeout(() => {
        remaining -= delay;
        if (remaining > 0) schedule();
        else resolve("timed-out");
      }, delay);
    };
    schedule();
  });
  return Promise.race([
    approval.then(() => "approved" as const),
    cancelled.then(() => "cancelled" as const),
    deadline,
  ]).finally(() => {
    if (timer !== undefined) clearTimeout(timer);
  });
}
