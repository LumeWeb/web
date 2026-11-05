/* oxlint-disable typescript/prefer-promise-reject-errors, typescript/only-throw-error -- These cases deliberately preserve non-Error producer rejection values. */
import { expect, it } from "vitest";
import { createNodePayloadOwner } from "../../src/testing/node-payload-store.js";
import { collectPayload } from "../../src/testing/streaming-source.js";

const limits = {
  maxLogicalUploadBytes: 16,
  maxObjectBytes: 8,
  maxRetainedBytes: 16,
  maxUploadAttempts: 2,
};
it.each([undefined, NaN, new Error("same value")])(
  "preserves actual cancellation rejection separately from identical primary %s",
  async (reason) => {
    const owner = await createNodePayloadOwner(limits);
    let cancels = 0;
    const cleanup: unknown[] = [];
    try {
      const reservation = owner.reserveUpload(0);
      const spool = await reservation.admitSource(0);
      const result = await collectPayload(
        () =>
          new ReadableStream<Uint8Array>({
            cancel() {
              cancels++;
              return Promise.reject(reason);
            },
          }),
        spool,
        new AbortController().signal,
        () => {
          throw reason;
        },
        (error) => cleanup.push(error),
      ).then(
        () => undefined,
        (error: unknown) => error,
      );
      expect(result).toBeInstanceOf(AggregateError);
      expect((result as AggregateError).errors).toHaveLength(2);
      for (const error of (result as AggregateError).errors)
        expect(error).toBe(reason);
      expect(cleanup).toHaveLength(1);
      expect(cleanup[0]).toBe(reason);
      expect(cancels).toBe(1);
      reservation.release();
    } finally {
      await owner.close();
    }
  },
);
it.each([undefined, NaN, new Error("read failed")])(
  "does not classify an errored reader cancellation as producer cleanup for %s",
  async (reason) => {
    const owner = await createNodePayloadOwner(limits);
    let cancels = 0;
    try {
      const reservation = owner.reserveUpload(0);
      const spool = await reservation.admitSource(0);
      await expect(
        collectPayload(
          () =>
            new ReadableStream<Uint8Array>({
              cancel() {
                cancels++;
                return Promise.reject(reason);
              },
              start(c) {
                c.error(reason);
              },
            }),
          spool,
          new AbortController().signal,
        ),
      ).rejects.toBe(reason);
      expect(cancels).toBe(0);
      reservation.release();
    } finally {
      await owner.close();
    }
  },
);
