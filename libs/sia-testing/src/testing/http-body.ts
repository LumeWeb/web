/** Incoming request cancellation ignores only the socket reset already caused by its disconnect. */
import type { IncomingMessage } from "node:http";
import { Readable } from "node:stream";
export function incomingBody(
  incoming: IncomingMessage,
  signal: AbortSignal,
): ReadableStream<Uint8Array> {
  const reader = (
    Readable.toWeb(incoming) as ReadableStream<Uint8Array>
  ).getReader();
  let cancelled = false;
  return new ReadableStream<Uint8Array>({
    async cancel(reason) {
      cancelled = true;
      const disconnected =
        signal.aborted &&
        incoming.destroyed &&
        (incoming.aborted || incoming.readableAborted);
      try {
        await reader.cancel(reason);
      } catch (error) {
        if (
          !disconnected ||
          error instanceof AggregateError ||
          !error ||
          typeof error !== "object" ||
          !("code" in error) ||
          !["ECONNRESET", "ERR_STREAM_PREMATURE_CLOSE"].includes(
            String(error.code),
          )
        )
          throw error;
      } finally {
        reader.releaseLock();
      }
    },
    async pull(controller) {
      try {
        const next = await reader.read();
        if (cancelled) return;
        if (next.done) controller.close();
        else controller.enqueue(next.value);
      } catch (error) {
        if (!cancelled) controller.error(error);
      }
    },
  });
}
