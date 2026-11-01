/** Asserts browser payload results against the opted-in real host cluster. */
import { observeSummaryResponses } from "../support/response-drain.js";
import { observeHostPayload } from "../support/host-observer.js";
import { expect, test } from "./browser-fixture.js";

test("pages browser events without repeating pinned objects", async ({
  realPage,
}) => {
  const result = await realPage.evaluate(() => window.probe.eventPages());
  expect([result.head.id, result.tail.id].sort()).toEqual(
    [result.fixtureID, result.secondID].sort(),
  );
  expect(result.head.id).not.toBe(result.tail.id);
  expect(result.fromZero).toEqual([result.head.id]);
  expect(result.exhausted).toEqual([]);
  expect(result.head.updatedAt).toBeLessThanOrEqual(result.tail.updatedAt);
  if (result.head.updatedAt === result.tail.updatedAt)
    expect(result.head.id.localeCompare(result.tail.id)).toBeLessThan(0);
  const expected = new Map([
    [result.fixtureID, { bytes: [42], metadata: [1, 0, 255], size: 1 }],
    [result.secondID, { bytes: [8, 7], metadata: [2, 0, 255], size: 2 }],
  ]);
  for (const event of [result.head, result.tail]) {
    expect(event.deleted).toBe(false);
    expect(event.object).toEqual({ ...expected.get(event.id), id: event.id });
  }
});

test("returns a browser deletion event after the live cursor", async ({
  realPage,
}) => {
  const result = await realPage.evaluate(() => window.probe.deletionEvent());
  expect(result.live).toMatchObject({
    deleted: false,
    id: result.fixtureID,
    object: { bytes: [42], id: result.fixtureID, metadata: [], size: 1 },
  });
  expect(result.deleted).toMatchObject({
    deleted: true,
    id: result.fixtureID,
    object: null,
  });
  expect(result.deleted.updatedAt).toBeGreaterThan(result.live.updatedAt);
  expect(result.exhausted).toEqual([]);
  expect(result.missing).toBe(true);
});

test("detaches browser sharing while owner bytes and old record counts remain", async ({
  realPage,
}) => {
  const result = await realPage.evaluate(() => window.probe.detachSharing());
  expect(result.ownerBefore).toEqual([
    { bytes: [42], id: result.fixtureID, metadata: [7, 0, 255, 4], size: 1 },
  ]);
  expect(result.ownerExhausted).toEqual([]);
  expect(result.ownerAfter).toEqual([]);
  expect(result.before).toEqual([
    { bytes: [42], id: result.fixtureID, metadata: [7, 0, 255, 4], size: 1 },
  ]);
  expect(result.exhausted).toEqual([]);
  expect(result.after).toEqual([]);
  expect(result.currentCount).toBe(0);
  expect(result.staleCount).toBe(1);
  expect(result.missing).toBe(true);
  expect(result.ownerBytes).toEqual([42]);
  expect(result.ownerMetadata).toEqual([7, 0, 255, 4]);
});

test("pages browser recipient summaries without slab payload transfers", async ({
  realPage,
}) => {
  await realPage.evaluate(() => window.probe.prepareSummaries());
  const log = process.env.SIA_TEST_CLUSTER_LOG;
  if (!log)
    throw new Error(
      "Summary transport observation requires the owned cluster log",
    );
  const wire = observeSummaryResponses(realPage);
  let priorFailure: undefined | { error: unknown };
  try {
    const { payloadRPCs, result } = await observeHostPayload(log, () =>
      realPage.evaluate(() => window.probe.summaries()),
    );
    expect(payloadRPCs).toEqual([]);
    expect(result).toMatchObject({ exhausted: [], revoked: true });
    expect(
      result.head.map((row) => ({
        id: row.id,
        metadata: row.metadata,
        size: row.size,
      })),
    ).toEqual([{ id: result.secondID, metadata: [2, 0, 255], size: 2 }]);
    expect(
      result.tail.map((row) => ({
        id: row.id,
        metadata: row.metadata,
        size: row.size,
      })),
    ).toEqual([{ id: result.fixtureID, metadata: [1, 0, 255], size: 1 }]);
    for (const row of [...result.head, ...result.tail]) {
      expect(row.createdAt).toBeGreaterThan(0);
      expect(result.fullTimes.find((full) => full.id === row.id)).toEqual({
        createdAt: row.createdAt,
        id: row.id,
        updatedAt: row.updatedAt,
      });
    }
    await wire.drain();
    const responses = wire.snapshot();
    expect(responses).toHaveLength(3);
    for (const response of responses) {
      expect(Array.isArray(response)).toBe(true);
      if (!Array.isArray(response))
        throw new Error("Summary response was not an array");
      for (const row of response as Record<string, unknown>[])
        expect(Object.prototype.hasOwnProperty.call(row, "slabs")).toBe(false);
    }
    expect(
      responses.map((response) =>
        Array.isArray(response) ? response.length : -1,
      ),
    ).toEqual([1, 1, 0]);
  } catch (error) {
    priorFailure = { error };
    throw error;
  } finally {
    await wire.finish(priorFailure);
  }
  const downloaded = await observeHostPayload(log, () =>
    realPage.evaluate(() => window.probe.summaryBytes()),
  );
  expect(downloaded.result).toEqual([[42], [8, 7]]);
  expect(downloaded.payloadRPCs.some((rpc) => rpc.includes("ReadSector"))).toBe(
    true,
  );
  expect(
    downloaded.payloadRPCs.some((rpc) => rpc.includes("WriteSector")),
  ).toBe(false);
});

test.describe("uploads and downloads", () => {
  test("ordinary upload retains metadata and downloads equal bytes", async ({
    fundedPage,
  }) => {
    const result = await fundedPage.evaluate(() =>
      window.probe.payload.uploadAndRead([0, 1, 2, 3, 4, 5, 6, 7], "ordinary"),
    );
    expect(result).toEqual({
      bytes: [0, 1, 2, 3, 4, 5, 6, 7],
      metadata: "ordinary",
    });
  });

  test("packed upload returns each object's original bytes", async ({
    fundedPage,
  }) => {
    const result = await fundedPage.evaluate(() =>
      window.probe.payload.uploadPackedAndRead([
        [10, 11, 12],
        [20, 21],
      ]),
    );
    expect(result).toEqual({
      bytes: [
        [10, 11, 12],
        [20, 21],
      ],
    });
  });

  test("range reads return only the requested bytes", async ({
    fundedPage,
  }) => {
    expect(
      await fundedPage.evaluate(() =>
        window.probe.payload.readPinnedRange([0, 1, 2, 3, 4, 5, 6, 7], {
          length: 3,
          offset: 2,
        }),
      ),
    ).toEqual({ bytes: [2, 3, 4] });
  });

  test("metadata updates preserve uploaded bytes", async ({ fundedPage }) => {
    expect(
      await fundedPage.evaluate(() =>
        window.probe.payload.updateMetadataAndRead(
          [0, 1, 2, 3, 4, 5, 6, 7],
          "updated",
        ),
      ),
    ).toEqual({ bytes: [0, 1, 2, 3, 4, 5, 6, 7], metadata: "updated" });
  });

  test("append preserves the existing prefix", async ({ fundedPage }) => {
    expect(
      await fundedPage.evaluate(() =>
        window.probe.payload.appendAndRead([0, 1, 2, 3, 4, 5, 6, 7], [8, 9]),
      ),
    ).toEqual({ bytes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] });
  });

  test("overwrite preserves bytes outside the patch", async ({
    fundedPage,
  }) => {
    expect(
      await fundedPage.evaluate(() =>
        window.probe.payload.overwriteAndRead(
          [0, 1, 2, 3, 4, 5, 6, 7],
          [90, 91],
          2n,
        ),
      ),
    ).toEqual({ bytes: [0, 1, 90, 91, 4, 5, 6, 7] });
  });

  test("truncate returns the requested prefix", async ({ fundedPage }) => {
    expect(
      await fundedPage.evaluate(() =>
        window.probe.payload.truncateAndRead([0, 1, 2, 3, 4, 5, 6, 7], 3n),
      ),
    ).toEqual({ bytes: [0, 1, 2] });
  });

  test("metadata update accepts uploaded slabs before an explicit object pin", async ({
    fundedPage,
  }) => {
    expect(
      await fundedPage.evaluate(() =>
        window.probe.payload.updateUploadedMetadata(
          [0, 1, 2, 3, 4, 5, 6, 7],
          "after-pin",
        ),
      ),
    ).toEqual({ metadata: "after-pin", rejectedBeforePin: false });
  });

  test("a source error rejects an ordinary upload", async ({ fundedPage }) => {
    expect(
      await fundedPage.evaluate(() =>
        window.probe.payload.uploadFailingSource(),
      ),
    ).toEqual({ rejected: true, sourceError: true });
  });

  test("cancelling an active packed add makes finalization fail", async ({
    fundedPage,
  }) => {
    expect(
      await fundedPage.evaluate(() =>
        window.probe.payload.cancelPackedUpload([]),
      ),
    ).toEqual({ addRejected: true, finalizeError: "upload closed" });
  });

  test("reconnecting retrieves the pinned payload", async ({ fundedPage }) => {
    expect(
      await fundedPage.evaluate(() =>
        window.probe.payload.reconnectAndRead([0, 1, 2, 3, 4, 5, 6, 7]),
      ),
    ).toEqual({ bytes: [0, 1, 2, 3, 4, 5, 6, 7] });
  });

  test("retained scoped bytes remain readable immediately after key revocation", async ({
    fundedPage,
  }) => {
    expect(
      await fundedPage.evaluate(() =>
        window.probe.payload.revokeAndReadRetained([0, 1, 2, 3, 4, 5, 6, 7]),
      ),
    ).toEqual({
      bytes: [0, 1, 2, 3, 4, 5, 6, 7],
      bytesAfterRevocation: [0, 1, 2, 3, 4, 5, 6, 7],
      revoked: true,
    });
  });

  test.describe("HTTPS signed share URLs", () => {
    test.skip(
      !process.env.SIA_TEST_INDEXD_URL?.startsWith("https://"),
      "SDK 0.1.4 share-URL reads require an HTTPS app listener",
    );

    test("a signed share URL downloads bytes without exposing owner metadata", async ({
      fundedPage,
    }) => {
      expect(
        await fundedPage.evaluate(() =>
          window.probe.payload.readSignedShareUrl([0, 1, 2, 3, 4, 5, 6, 7], {
            expiresAtMs: Date.now() + 60_000,
            metadata: "owner-only",
          }),
        ),
      ).toEqual({ bytes: [0, 1, 2, 3, 4, 5, 6, 7], metadata: "" });
    });

    test("an expired signed share URL rejects object retrieval", async ({
      fundedPage,
    }) => {
      await expect(
        fundedPage.evaluate(() =>
          window.probe.payload.readSignedShareUrl([0, 1, 2, 3, 4, 5, 6, 7], {
            expiresAtMs: Date.now() - 60_000,
            metadata: "owner-only",
          }),
        ),
      ).rejects.toThrow(/expired/i);
    });
  });

  test("the actual streaming worker serves the requested payload range", async ({
    fundedPage,
  }) => {
    expect(
      await fundedPage.evaluate(() =>
        window.probe.payload.streamRange([0, 1, 2, 3, 4, 5, 6, 7], "bytes=2-4"),
      ),
    ).toEqual({
      bytes: [2, 3, 4],
      contentRange: "bytes 2-4/8",
      status: 206,
      streamed: true,
      workerPath: "/sia-storage-sw.js",
    });
  });
});
