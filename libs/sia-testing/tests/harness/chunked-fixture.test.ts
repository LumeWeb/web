import { createHash } from "node:crypto";
import { expect, it } from "vitest";
import * as fixtures from "../../src/mock.js";

it("chunked fixtures replay detached patterned chunks and an independently checked digest", async () => {
  expect(fixtures).toHaveProperty("chunkedFixture");
  const pattern = Uint8Array.of(1, 2, 3);
  const file = await fixtures.chunkedFixture({
    chunkSizeBytes: 3,
    name: "pattern",
    pattern,
    sizeBytes: 8,
  });
  pattern.fill(9);
  const expected = Uint8Array.of(1, 2, 3, 1, 2, 3, 1, 2);
  expect(file.sha256).toBe(createHash("sha256").update(expected).digest("hex"));
  for (let attempt = 0; attempt < 2; attempt++) {
    const reader = file.open().getReader();
    const first = (await reader.read()).value!;
    expect(first).toEqual(Uint8Array.of(1, 2, 3));
    first.fill(7);
    expect((await reader.read()).value).toEqual(Uint8Array.of(1, 2, 3));
    expect((await reader.read()).value).toEqual(Uint8Array.of(1, 2));
    expect((await reader.read()).done).toBe(true);
  }
});

it("empty fixtures close and cancelled opens do not affect replays", async () => {
  const file = await fixtures.chunkedFixture({
    chunkSizeBytes: 1,
    name: "empty",
    pattern: Uint8Array.of(4),
    sizeBytes: 0,
  });
  expect(file.sha256).toBe(
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  );
  expect((await file.open().getReader().read()).done).toBe(true);
  const nonempty = await fixtures.chunkedFixture({
    chunkSizeBytes: 2,
    name: "cancel",
    pattern: Uint8Array.of(4),
    sizeBytes: 3,
  });
  await nonempty.open().cancel("stop");
  expect(await new Response(nonempty.open()).bytes()).toEqual(
    Uint8Array.of(4, 4, 4),
  );
});

it.each([
  { sizeBytes: -1 },
  { sizeBytes: 1.5 },
  { sizeBytes: Number.MAX_SAFE_INTEGER + 1 },
  { sizeBytes: 16 * 1024 * 1024 + 1 },
  { chunkSizeBytes: 0 },
  { chunkSizeBytes: 65537 },
  { pattern: new Uint8Array() },
  { pattern: new Uint8Array(65537) },
])("rejects unsafe fixture options %j", async (change) => {
  await expect(
    fixtures.chunkedFixture({
      chunkSizeBytes: 1,
      name: "invalid",
      pattern: Uint8Array.of(1),
      sizeBytes: 2,
      ...change,
    }),
  ).rejects.toMatchObject({ code: "invalid-input" });
});

it("hashes across block and chunk boundaries with pattern offsets independent of chunks", async () => {
  const pattern = Uint8Array.from({ length: 257 }, (_, i) => i % 251);
  const file = await fixtures.chunkedFixture({
    chunkSizeBytes: 65536,
    name: "boundaries",
    pattern,
    sizeBytes: 65539,
  });
  const expected = Uint8Array.from(
    { length: 65539 },
    (_, i) => (i % 257) % 251,
  );
  expect(file.sha256).toBe(createHash("sha256").update(expected).digest("hex"));
  expect(await new Response(file.open()).bytes()).toEqual(expected);
});
