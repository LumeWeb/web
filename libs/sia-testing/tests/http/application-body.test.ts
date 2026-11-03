/** Cancel failures are injected only at Node's stream conversion boundary. */
import { Readable } from "node:stream";
import type { IncomingMessage } from "node:http";
import { expect, it, vi } from "vitest";
import { incomingBody } from "../../src/testing/http-body.js";
const reset = Object.assign(new Error("socket reset"), { code: "ECONNRESET" });
for (const scenario of [
  {
    aborted: true,
    destroyed: false,
    failure: reset,
    name: "a live incoming stream retains cancellation resets",
    suppressed: false,
  },
  {
    aborted: false,
    destroyed: true,
    failure: reset,
    name: "an uncancelled request retains cancellation resets",
    suppressed: false,
  },
  {
    aborted: true,
    destroyed: true,
    failure: reset,
    name: "a disconnected cancelled request accepts its socket reset",
    suppressed: true,
  },
  {
    aborted: true,
    destroyed: true,
    failure: Object.assign(
      new AggregateError([reset, new Error("additional failure")]),
      { code: "ECONNRESET" },
    ),
    name: "a disconnected request retains additional cancellation failures",
    suppressed: false,
  },
  {
    aborted: true,
    destroyed: true,
    failure: Object.assign(new Error("denied"), { code: "EACCES" }),
    name: "a disconnected request retains unrelated I/O failures",
    suppressed: false,
  },
]) {
  it(scenario.name, async () => {
    const incoming = Object.assign(
      new Readable({
        read() {
          return undefined;
        },
      }),
      { aborted: false },
    ) as IncomingMessage;
    if (scenario.destroyed) incoming.destroy();
    const abort = new AbortController();
    if (scenario.aborted) abort.abort();
    vi.spyOn(Readable, "toWeb").mockReturnValue(
      new ReadableStream<Uint8Array>({
        cancel() {
          throw scenario.failure;
        },
      }) as ReturnType<typeof Readable.toWeb>,
    );
    try {
      const cancellation = incomingBody(incoming, abort.signal).cancel();
      if (scenario.suppressed)
        await expect(cancellation).resolves.toBeUndefined();
      else await expect(cancellation).rejects.toBe(scenario.failure);
    } finally {
      vi.restoreAllMocks();
      incoming.destroy();
    }
  });
}
