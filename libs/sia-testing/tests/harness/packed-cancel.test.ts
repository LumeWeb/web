/** Native stream states distinguish failed producer cancellation from repeated reader errors. */
import { expect, it } from "vitest";
import { createMockSia } from "../../src/mock.js";

const app = {
  description: "Cancellation origins",
  id: "a".repeat(64),
  name: "Origins",
  serviceUrl: "https://example.invalid",
};
function containsIdentity(value: unknown, target: unknown): boolean {
  return (
    value === target ||
    (value instanceof AggregateError &&
      value.errors.some((item: unknown) => containsIdentity(item, target)))
  );
}

it.each(["upload", "sdk"] as const)(
  "%s cancellation rejecting its exact reason remains a cleanup failure",
  async (closeWith) => {
    const mock = createMockSia();
    let reason: unknown;
    let closeFailure: unknown;
    let cancelCalls = 0;
    let adding: Promise<{ error: unknown } | { value: number }> | undefined;
    try {
      const outcome = await mock
        .run({ app }, async (run) => {
          const sdk = mock.packedSdk({
            access: run.ownerAccess,
            as: mock.actor("writer"),
            maxBytes: 8,
            maxObjects: 1,
            platform: "browser",
          });
          const upload = sdk.uploadPacked();
          let started!: () => void;
          const reading = new Promise<void>((resolve) => {
            started = resolve;
          });
          adding = upload
            .add(
              new ReadableStream(
                {
                  cancel(value: unknown) {
                    cancelCalls++;
                    reason = value;
                    throw value;
                  },
                  pull() {
                    started();
                  },
                },
                { highWaterMark: 0 },
              ),
            )
            .then(
              (value) => ({ value }),
              (error: unknown) => ({ error }),
            );
          let closing: Promise<void> | undefined;
          try {
            await reading;
            if (closeWith === "upload") upload.cancel();
            else {
              closing = sdk.close();
              void closing.catch(() => undefined);
            }
            const result = await adding;
            expect(result).toHaveProperty("error");
            if ("error" in result) expect(result.error).toBe(reason);
            const disposal = await upload.dispose().then(
              (value) => ({ value }),
              (error: unknown) => ({ error }),
            );
            expect(disposal).toHaveProperty("error");
            if ("error" in disposal)
              expect(containsIdentity(disposal.error, reason)).toBe(true);
            closing ??= sdk.close();
            expect(sdk.close()).toBe(closing);
            const closed = await closing.then(
              (value) => ({ value }),
              (error: unknown) => ({ error }),
            );
            expect(closed).toHaveProperty("error");
            if ("error" in closed) {
              closeFailure = closed.error;
              expect(containsIdentity(closed.error, reason)).toBe(true);
            }
          } finally {
            upload.cancel();
            await adding;
            await sdk.close().catch(() => undefined);
          }
        })
        .then(
          (value) => ({ value }),
          (error: unknown) => ({ error }),
        );
      expect(cancelCalls).toBe(1);
      expect(outcome).toHaveProperty("error");
      if ("error" in outcome) {
        expect(outcome.error).toBeInstanceOf(AggregateError);
        if (outcome.error instanceof AggregateError) {
          expect(outcome.error.errors).toHaveLength(1);
          expect(outcome.error.errors[0]).toBe(closeFailure);
        }
        expect(containsIdentity(outcome.error, reason)).toBe(true);
      }
    } finally {
      await mock.close();
      await adding;
    }
  },
);

it("run-owned cancellation retains a producer rejection of its exact abort reason", async () => {
  const mock = createMockSia();
  let reason: unknown;
  let cancelCalls = 0;
  let adding: Promise<unknown> | undefined;
  try {
    const outcome = await mock
      .run({ app }, async (run) => {
        const sdk = mock.packedSdk({
          access: run.ownerAccess,
          as: mock.actor("writer"),
          maxBytes: 8,
          maxObjects: 1,
          platform: "browser",
        });
        let started!: () => void;
        const reading = new Promise<void>((resolve) => {
          started = resolve;
        });
        adding = sdk
          .uploadPacked()
          .add(
            new ReadableStream(
              {
                cancel(value: unknown) {
                  reason = value;
                  cancelCalls++;
                  // oxlint-disable-next-line typescript/prefer-promise-reject-errors -- Producer rejection must preserve the exact received value.
                  return Promise.reject(value);
                },
                pull() {
                  started();
                },
              },
              { highWaterMark: 0 },
            ),
          )
          .then(
            (value) => ({ value }),
            (error: unknown) => ({ error }),
          );
        await reading;
      })
      .then(
        (value) => ({ value }),
        (error: unknown) => ({ error }),
      );
    expect(cancelCalls).toBe(1);
    expect(await adding).toEqual({ error: reason });
    expect(outcome).toHaveProperty("error");
    if ("error" in outcome)
      expect(containsIdentity(outcome.error, reason)).toBe(true);
  } finally {
    await mock.close();
    await adding;
  }
});

it("resolving producer cancellation preserves add's abort without poisoning cleanup", async () => {
  const mock = createMockSia();
  let cancelCalls = 0;
  let reason: unknown;
  try {
    await mock.run({ app }, async (run) => {
      const sdk = mock.packedSdk({
        access: run.ownerAccess,
        as: mock.actor("writer"),
        maxBytes: 8,
        maxObjects: 1,
        platform: "browser",
      });
      const upload = sdk.uploadPacked();
      let started!: () => void;
      const reading = new Promise<void>((resolve) => {
        started = resolve;
      });
      const adding = upload
        .add(
          new ReadableStream(
            {
              cancel(value: unknown) {
                cancelCalls++;
                reason = value;
              },
              pull() {
                started();
              },
            },
            { highWaterMark: 0 },
          ),
        )
        .then(
          (value) => ({ value }),
          (error: unknown) => ({ error }),
        );
      try {
        await reading;
        upload.cancel();
        const result = await adding;
        expect(result).toHaveProperty("error");
        if ("error" in result) expect(result.error).toBe(reason);
      } finally {
        upload.cancel();
        await adding;
        await upload.dispose();
        await sdk.close();
      }
    });
    expect(cancelCalls).toBe(1);
  } finally {
    await mock.close();
  }
});

it.each([
  undefined,
  NaN,
  new AggregateError([new Error("reader item")], "reader failed"),
])(
  "an already-errored reader racing abort does not report producer cancellation (%s)",
  async (readError) => {
    const mock = createMockSia();
    let cancelCalls = 0;
    try {
      await mock.run({ app }, async (run) => {
        const sdk = mock.packedSdk({
          access: run.ownerAccess,
          as: mock.actor("writer"),
          maxBytes: 8,
          maxObjects: 1,
          platform: "browser",
        });
        const upload = sdk.uploadPacked();
        await expect(
          upload.add(
            new ReadableStream(
              {
                cancel() {
                  cancelCalls++;
                },
                pull(controller) {
                  controller.enqueue(Uint8Array.of(1));
                  controller.error(readError);
                  upload.cancel();
                },
              },
              { highWaterMark: 0 },
            ),
          ),
        ).rejects.toBeInstanceOf(Error);
        await upload.dispose();
        await sdk.close();
      });
      expect(cancelCalls).toBe(0);
    } finally {
      await mock.close();
    }
  },
);

it.each([undefined, NaN])(
  "an actual %s read rejection remains a reader failure rather than a cleanup sentinel",
  async (readError) => {
    const mock = createMockSia();
    let cancelCalls = 0;
    try {
      await mock.run({ app }, async (run) => {
        const sdk = mock.packedSdk({
          access: run.ownerAccess,
          as: mock.actor("writer"),
          maxBytes: 8,
          maxObjects: 1,
          platform: "browser",
        });
        const upload = sdk.uploadPacked();
        await expect(
          upload.add(
            new ReadableStream(
              {
                cancel() {
                  cancelCalls++;
                },
                pull(controller) {
                  controller.error(readError);
                },
              },
              { highWaterMark: 0 },
            ),
          ),
        ).rejects.toBe(readError);
        await upload.dispose();
        await sdk.close();
      });
      expect(cancelCalls).toBe(0);
    } finally {
      await mock.close();
    }
  },
);
