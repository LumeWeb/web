/** Each load owns its MIME probes; abort removes their waiters and timers before the channel serves a replacement. */
import {
  type MainToWorkerMessage,
  type RequestId,
  type WorkerToMainMessage,
  WorkerToMainMessageType,
} from "../protocol.ts";

type Reply = Extract<MainToWorkerMessage, { type: "MSE_RESULT" }>;

export function createHostMseProbe(
  post: (message: WorkerToMainMessage) => void,
) {
  const pending = new Map<
    number,
    { accept: (supported: boolean) => void; requestId: RequestId }
  >();
  let sequence = 0;
  return {
    receive(reply: Reply): void {
      const probe = pending.get(reply.queryId);
      if (probe?.requestId === reply.requestId) probe.accept(reply.supported);
    },
    supported(
      mime: string,
      requestId: RequestId,
      signal: AbortSignal,
    ): Promise<boolean> {
      signal.throwIfAborted();
      const queryId = ++sequence;
      return new Promise((resolve, reject) => {
        const cleanup = () => {
          pending.delete(queryId);
          clearTimeout(timer);
          signal.removeEventListener("abort", abort);
        };
        const fail = (error: Error) => {
          cleanup();
          reject(error);
        };
        const abort = () =>
          fail(new DOMException("MSE probe cancelled", "AbortError"));
        const timer = setTimeout(
          () => fail(new Error("Host MSE probe timed out")),
          5000,
        );
        pending.set(queryId, {
          accept: (supported) => {
            cleanup();
            resolve(supported);
          },
          requestId,
        });
        signal.addEventListener("abort", abort, { once: true });
        try {
          post({
            mime,
            queryId,
            requestId,
            type: WorkerToMainMessageType.MSE_QUERY,
          });
        } catch (error) {
          fail(
            error instanceof Error
              ? error
              : new Error("Host MSE query failed", { cause: error }),
          );
        }
      });
    },
  };
}
