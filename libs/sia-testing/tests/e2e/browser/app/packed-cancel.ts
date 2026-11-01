/** Checks cancellation of empty or buffered packed input without creating a host slab. */
import type { Sdk } from "@siafoundation/sia-storage";
import { byteSource } from "../../support/byte-streams.js";

export async function browserPackedCancel(sdk: Sdk, bytes: number[]) {
  const packed = sdk.uploadPacked();
  const optimal = packed.optimalDataSize();
  const snapshot = () => ({
    length: packed.length(),
    remaining: packed.remaining(),
    slabs: packed.slabs(),
  });
  let finalized = false;
  let sourceStarted = false;
  let sourceCanceled = false;
  let release!: () => void;
  // Closing the source early would let add finish before cancellation.
  const blocked = new Promise<void>((resolve) => {
    release = resolve;
  });
  // A pull must come from add, not stream-constructor prefetch.
  const source = new ReadableStream<Uint8Array>(
    {
      cancel() {
        sourceCanceled = true;
        release();
      },
      async pull(controller) {
        sourceStarted = true;
        await blocked;
        if (!sourceCanceled) controller.close();
      },
    },
    { highWaterMark: 0 },
  );
  let status: "pending" | "rejected" | "resolved" = "pending";
  const current = (): "pending" | "rejected" | "resolved" => status;
  let addError = "";
  let adding: Promise<void> | undefined;
  try {
    const added = bytes.length ? await packed.add(byteSource(bytes)) : 0;
    const before = snapshot();
    adding = packed.add(source).then(
      () => {
        status = "resolved";
      },
      (error) => {
        status = "rejected";
        addError = String(error);
      },
    );
    const startDeadline = Date.now() + 5000;
    while (
      !sourceStarted &&
      current() === "pending" &&
      Date.now() < startDeadline
    )
      await new Promise((resolve) => setTimeout(resolve, 10));
    const active = current() === "pending" && sourceStarted;
    packed.cancel();
    const stopDeadline = Date.now() + 5000;
    while (current() === "pending" && Date.now() < stopDeadline)
      await new Promise((resolve) => setTimeout(resolve, 10));
    // The getters retain completed-add counters after cancel; they do not report pinned storage.
    const after = snapshot();
    let lateReads = 0;
    let lateRejected = false;
    let finalizeRejected = false;
    let finalizeError: string | undefined;
    const addRejected = current() === "rejected";
    if (addRejected) {
      const late = new ReadableStream<Uint8Array>(
        {
          pull(controller) {
            lateReads++;
            controller.close();
          },
        },
        { highWaterMark: 0 },
      );
      try {
        await packed.add(late);
      } catch (error) {
        if (!String(error).includes("upload closed")) throw error;
        lateRejected = true;
      }
      // WASM finalize consumes the handle even when its promise rejects.
      finalized = true;
      try {
        for (const object of await packed.finalize()) object.free();
      } catch (error) {
        if (!String(error).includes("upload closed")) throw error;
        finalizeRejected = true;
        finalizeError = error instanceof Error ? error.message : String(error);
      }
    }
    return {
      added,
      addError,
      addRejected,
      after,
      before,
      finalizeError,
      finalizeRejected,
      lateReads,
      lateRejected,
      optimal,
      sourceStarted: active,
    };
  } finally {
    if (!finalized) packed.cancel();
    release();
    await adding;
    if (!finalized) packed.free();
  }
}
