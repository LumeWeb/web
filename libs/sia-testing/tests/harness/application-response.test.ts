/** Malformed response doubles stay local; feed continuation tests use the account model. */
import { expect, it, vi } from "vitest";
import { createMockApplication } from "../../src/client.js";
it("a malformed feed response cannot masquerade as an empty page", async () => {
  const credential = { keyHex: "a".repeat(64), kind: "app-key" as const };
  const writer = createMockApplication(
    {
      client: "client",
      kind: "app-key",
      url: "https://example.invalid/sia-test/",
    },
    credential,
  );
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve(
        Response.json({ done: "yes", events: [], nextCursor: null }),
      ),
    ),
  );
  try {
    await expect(
      writer.events({ cursor: null, limit: 1 }),
    ).rejects.toMatchObject({ code: "unavailable" });
  } finally {
    await writer.close();
    vi.unstubAllGlobals();
  }
});
