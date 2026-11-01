/** Counts SDK-reported decoded bytes; encrypted host traffic can exceed this allowance. */
export function createTransferBudget(limit: number, stop: () => void) {
  let transferred = 0;
  let stopped = false;
  return {
    progress() {
      let previous = 0;
      return (received: number) => {
        if (stopped) return;
        const invalid = !Number.isSafeInteger(received) || received < previous;
        transferred += received - previous;
        previous = received;
        if (invalid || transferred > limit) {
          stopped = true;
          stop();
        }
      };
    },
  };
}
