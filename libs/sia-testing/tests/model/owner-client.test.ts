/** Malformed owner-share replies must be rejected by the client. */
import { expect, it, vi } from "vitest";
import { createMockOwnerShares } from "../../src/client.js";

const row = {
  description: "Owned",
  ref: "00000000-0000-4000-8000-000000000001",
  statistics: { logicalBytes: 0, objectCount: 0 },
};
const connection = {
  client: "test",
  kind: "app-key" as const,
  url: "https://owner.example.invalid/",
};
const credential = { keyHex: "a".repeat(64), kind: "app-key" as const };

it.each([
  { ...row, ref: "-".repeat(36) },
  { ...row, description: null },
  { ...row, statistics: { logicalBytes: 0, objectCount: -1 } },
  {
    ...row,
    statistics: { logicalBytes: Number.MAX_SAFE_INTEGER + 1, objectCount: 0 },
  },
  { ...row, expiresAt: "not a date" },
])("rejects malformed owner details %j", async (invalid) => {
  const fetch = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(
      Response.json({ done: false, items: [invalid], nextOffset: 1 }),
    );
  const owner = createMockOwnerShares(connection, credential);
  try {
    await expect(owner.list({ limit: 1, offset: 0 })).rejects.toMatchObject({
      code: "invalid-input",
    });
  } finally {
    await owner.close();
    fetch.mockRestore();
  }
});

it.each([
  { done: false, items: [row, row], nextOffset: 2 },
  { done: false, items: [row], nextOffset: 0 },
  { done: true, items: [row], nextOffset: 1 },
  { done: "yes", items: [], nextOffset: 0 },
])("rejects malformed owner pages %j", async (invalid) => {
  const fetch = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(Response.json(invalid));
  const owner = createMockOwnerShares(connection, credential);
  try {
    await expect(owner.list({ limit: 1, offset: 0 })).rejects.toMatchObject({
      code: "invalid-input",
    });
  } finally {
    await owner.close();
    fetch.mockRestore();
  }
});

it("rejects malformed detail and object replies for a known share", async () => {
  const fetch = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValueOnce(
      Response.json({ done: false, items: [row], nextOffset: 1 }),
    )
    .mockResolvedValueOnce(Response.json({ ...row, statistics: null }))
    .mockResolvedValueOnce(
      Response.json({
        done: false,
        items: [{ id: "test", metadata: [256], sizeBytes: 1 }],
        nextOffset: 1,
      }),
    );
  const owner = createMockOwnerShares(connection, credential);
  try {
    const ref = (await owner.list({ limit: 1, offset: 0 })).items[0]!.ref;
    await expect(owner.detail(ref)).rejects.toMatchObject({
      code: "invalid-input",
    });
    await expect(owner.objects(ref, { limit: 1, offset: 0 })).rejects.toThrow(
      "Invalid mock object response",
    );
  } finally {
    await owner.close();
    fetch.mockRestore();
  }
});
