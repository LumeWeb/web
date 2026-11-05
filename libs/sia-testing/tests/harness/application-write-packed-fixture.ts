/** Mock-only packed fixture retains original acknowledgements; the existing run owns backend deletion. */
import {
  PackedFinalizeError,
  type PackedObject,
  type PackedSdk,
  type ReadPort,
} from "../../src/mock.js";
import type { WriteFixture } from "./application-write-contract.js";
type Completion =
  { error: unknown; status: "rejected" } | { status: "fulfilled" };
export function packedWriteFixture(
  sdk: PackedSdk<"node">,
  reader: ReadPort,
  signal?: AbortSignal,
): WriteFixture & {
  acknowledged(): readonly PackedObject[];
  creationUncertain(): boolean;
} {
  let acknowledged: readonly PackedObject[] = [];
  let pending: Promise<Completion> | undefined;
  let observedFailure = false;
  let uncertain = false;
  return {
    acknowledged: () => acknowledged,
    async close() {
      const errors: unknown[] = [];
      for (const close of [() => reader.close(), () => sdk.close()]) {
        try {
          await close();
        } catch (error) {
          errors.push(error);
        }
      }
      return errors;
    },
    creationUncertain: () => uncertain,
    async readAcknowledged() {
      if (acknowledged.length !== 1)
        throw new Error("Single input requires one destination");
      const row = await reader.object(acknowledged[0]!.id());
      return [{ metadata: row.metadata, stream: await reader.download(row) }];
    },
    async settleOwnedWork() {
      const completion = await pending;
      if (completion?.status === "rejected" && !observedFailure) {
        observedFailure = true;
        throw completion.error;
      }
    },
    async write(source, metadata) {
      if (pending) throw new Error("This fixture owns only one write");
      signal?.throwIfAborted();
      uncertain = true;
      pending = (async () => {
        const upload = sdk.uploadPacked();
        await upload.add(source);
        try {
          // Retain the entire original batch before getters, metadata, pin, seal or delivery.
          acknowledged = await upload.finalize();
          uncertain = false;
        } catch (error) {
          if (error instanceof PackedFinalizeError)
            acknowledged = error.objects;
          throw error;
        }
        for (const object of acknowledged) {
          object.id();
          object.updateMetadata(metadata);
          await sdk.updateObjectMetadata(object);
          await sdk.pinObject(object);
          object.seal(sdk.appKey());
        }
      })().then<Completion, Completion>(
        () => ({ status: "fulfilled" }),
        (error: unknown) => ({ error, status: "rejected" }),
      );
      let detach: (() => void) | undefined;
      const observed = signal
        ? new Promise<{ error: unknown; status: "aborted" }>((resolve) => {
            const stopped = () =>
              resolve({ error: signal.reason, status: "aborted" });
            signal.addEventListener("abort", stopped, { once: true });
            detach = () => signal.removeEventListener("abort", stopped);
            if (signal.aborted) stopped();
          })
        : undefined;
      try {
        const completion = await (observed
          ? Promise.race([pending, observed])
          : pending);
        if (completion.status === "rejected") {
          observedFailure = true;
          throw completion.error;
        }
        if (completion.status === "aborted") throw completion.error;
      } finally {
        detach?.();
      }
    },
  };
}
