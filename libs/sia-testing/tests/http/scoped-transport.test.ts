/** Reader transports must authenticate the supplied credential rather than substitute owner access. */
import { expect, it } from "vitest";
import { bytesFixture, createMockSia } from "../../src/testing/mock.js";

import {
  createMockReader,
  mockCredential,
  startMockServer,
} from "../../src/testing/http.js";

const app = {
  description: "Transport tests",
  id: "a".repeat(64),
  name: "Transport",
  serviceUrl: "https://example.invalid",
};

it("a wildcard listen host is rejected before binding", async () => {
  const mock = createMockSia();
  try {
    await expect(
      startMockServer(mock, { host: "0.0.0.0" as "127.0.0.1", port: -1 }),
    ).rejects.toMatchObject({
      code: "invalid-input",
      message: "Mock listener host must be loopback",
    });
  } finally {
    await mock.close();
  }
});
it("cancelling a held HTTP read aborts the matching server request", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const file = await bytesFixture({
        bytes: Uint8Array.of(1, 2, 3),
        name: "video",
      });
      const object = await run.objects.upload({
        file,
        metadata: new Uint8Array(),
        name: file.name,
      });
      const actor = mock.actor("held");
      const server = await startMockServer(mock);
      try {
        const reader = createMockReader(
          server.connection({ access: run.ownerAccess, as: actor }),
          mockCredential(mock, run.ownerAccess),
        );
        const hold = mock.faults.hold({ actor, object, operation: "download" });
        const stream = await reader.download(await reader.object(object.id));
        const pending = stream.getReader();
        const read = pending.read();
        const settled = read.catch(() => undefined);
        await hold.started();
        await pending.cancel();
        expect((await hold.cancelled()).status).toBe("cancelled");
        await settled;
        hold.release();
        await reader.close();
      } finally {
        await server.close();
      }
    });
  } finally {
    await mock.close();
  }
});

it("closing a reader cancels held metadata before headers", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const file = await bytesFixture({
        bytes: Uint8Array.of(1),
        name: "video",
      });
      const object = await run.objects.upload({
        file,
        metadata: new Uint8Array(),
        name: file.name,
      });
      const actor = mock.actor("metadata");
      const server = await startMockServer(mock);
      const descriptor = server.connection({
        access: run.ownerAccess,
        as: actor,
      });
      const reader = createMockReader(descriptor, descriptor.credential);
      const hold = mock.faults.hold({ actor, object, operation: "object" });
      let timer: ReturnType<typeof setTimeout> | undefined;
      const request = reader.object(object.id).catch(() => undefined);
      try {
        await hold.started();
        await reader.close();
        const cancelled = await Promise.race([
          hold.cancelled(),
          new Promise<never>((_resolve, reject) => {
            timer = setTimeout(
              () =>
                reject(
                  new Error("Server retained the cancelled metadata request"),
                ),
              1000,
            );
          }),
        ]);
        expect(cancelled.status).toBe("cancelled");
      } finally {
        clearTimeout(timer);
        hold.release();
        await request;
        await server.close();
      }
    });
  } finally {
    await mock.close();
  }
});

it("HTTP recipient reads require the right key and current attachment", async () => {
  const transport = { createMockReader, mockCredential, startMockServer };
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const file = await bytesFixture({
        bytes: Uint8Array.of(1, 2, 3),
        name: "video",
      });
      const object = await run.objects.upload({
        file,
        metadata: Uint8Array.of(9),
        name: file.name,
      });
      const share = await run.shares.create({ objects: [object] });
      const server = await transport.startMockServer(mock);
      try {
        const descriptor = server.connection({
          access: share.access,
          as: mock.actor("recipient"),
        });
        const credential = transport.mockCredential(mock, share.access);
        const reader = transport.createMockReader(descriptor, credential);
        expect((await reader.object(object.id)).metadata).toEqual(
          Uint8Array.of(9),
        );
        const bytes = await new Response(
          await reader.download(await reader.object(object.id), {
            length: 2,
            offset: 1,
          }),
        ).arrayBuffer();
        expect([...new Uint8Array(bytes)]).toEqual([2, 3]);
        const wrong = transport.createMockReader(descriptor, {
          ...credential,
          keyHex: "f".repeat(64),
        });
        await expect(wrong.object(object.id)).rejects.toMatchObject({
          code: "denied",
        });
        const owner = transport.createMockReader(
          descriptor,
          transport.mockCredential(mock, run.ownerAccess),
        );
        await expect(owner.object(object.id)).rejects.toMatchObject({
          code: "denied",
        });
        await run.shares.revoke(share);
        await expect(reader.object(object.id)).rejects.toMatchObject({
          code: "denied",
        });
        await reader.close();
      } finally {
        await server.close();
      }
    });
  } finally {
    await mock.close();
  }
});
