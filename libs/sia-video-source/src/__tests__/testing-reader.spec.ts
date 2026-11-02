/** Video test adapters must preserve the reader's recipient checks and returned payload bytes. */
import { expect, it } from "vitest";
import { bytesFixture, createMockSia } from "@lumeweb/sia-testing/mock";
import { objectSize } from "../ranged-reader.js";
import { createVideoReaderSdk } from "../testing/reader.js";
it("the video adapter reads a shared range and observes revocation", async () => {
  const mock = createMockSia();
  try {
    await mock.run(
      {
        app: {
          description: "Adapter test",
          id: "a".repeat(64),
          name: "Adapter",
          serviceUrl: "https://example.invalid",
        },
      },
      async (run) => {
        const file = await bytesFixture({
          bytes: Uint8Array.of(1, 2, 3),
          name: "video",
        });
        const object = await run.objects.upload({
          file,
          metadata: new Uint8Array(),
          name: file.name,
        });
        const share = await run.shares.create({ objects: [object] });
        const reader = mock.reader({
          access: share.access,
          as: mock.actor("video"),
        });
        const sdk = createVideoReaderSdk(reader);
        const handle = await sdk.objectFromSharedKey!(object.id);
        expect(handle.size()).toBe(3);
        expect(objectSize(handle)).toBe(3);
        expect([
          ...new Uint8Array(
            await new Response(
              await sdk.download(handle, { length: 2, offset: 1 }),
            ).arrayBuffer(),
          ),
        ]).toEqual([2, 3]);
        for (const scheme of ["sia", "https"]) {
          const url = `${scheme}://indexer.invalid/objects/${object.id}/shared?signature=fixture#encryption_key=${"A".repeat(43)}`;
          const resolved = await sdk.objectFromShareUrl!(url);
          expect([
            ...new Uint8Array(
              await new Response(
                await sdk.download(resolved, { length: 1, offset: 1 }),
              ).arrayBuffer(),
            ),
          ]).toEqual([2]);
        }
        await run.shares.revoke(share);
        await expect(sdk.objectFromSharedKey!(object.id)).rejects.toMatchObject(
          { code: "denied" },
        );
        await sdk.dispose?.();
      },
    );
  } finally {
    await mock.close();
  }
});
