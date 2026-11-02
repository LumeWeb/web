/** Failed download observation must cancel and unlock the SDK's input stream. */
import { expect, it } from "vitest";
import { createRequestControls } from "../../src/testing/controls.js";
import { createMockSia } from "../../src/testing/mock.js";
it("an offline observer cancels its unfinished input before reporting failure", async () => {
  const mock = createMockSia();
  try {
    const controls = createRequestControls();
    const actor = mock.actor("reader");
    const receipt = await controls.begin(
      actor,
      "download",
      undefined,
      new AbortController().signal,
    );
    let cancelStarted!: () => void;
    const started = new Promise<void>((resolve) => {
      cancelStarted = resolve;
    });
    let finishCancel!: () => void;
    const cancellation = new Promise<void>((resolve) => {
      finishCancel = resolve;
    });
    const source = new ReadableStream<Uint8Array>({
      cancel() {
        cancelStarted();
        return cancellation;
      },
      pull(controller) {
        controller.enqueue(Uint8Array.of(7));
        controls.control.setLink(actor, { online: false });
      },
    });
    const reader = controls
      .observe(receipt, source, new AbortController().signal)
      .getReader();
    let settled = false;
    const read = reader.read().finally(() => {
      settled = true;
    });
    const rejected = expect(read).rejects.toMatchObject({
      code: "unavailable",
    });
    try {
      await Promise.race([
        started,
        new Promise<void>((resolve) => setTimeout(resolve, 30)),
      ]);
      expect(settled).toBe(false);
      finishCancel();
      await rejected;
      expect(source.locked).toBe(false);
      expect(receipt.status).toBe("failed");
    } finally {
      finishCancel();
      await rejected;
      reader.releaseLock();
    }
  } finally {
    await mock.close();
  }
});
