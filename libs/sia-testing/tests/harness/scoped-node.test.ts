/** Node runs must own fixture teardown and detect files changed after descriptor creation. */
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  emptyManagedMetadata,
  invalidManagedMetadata,
  managedMetadataInputs,
} from "./managed-metadata.js";
import { foreignMetadata } from "./foreign-metadata.js";
import { bytesFixture } from "../../src/testing/files.js";
import { expect, it } from "vitest";
import {
  fileFixture,
  type RunOptions,
  withSiaRun,
} from "../../src/testing/node.js";
it("an unsupported backend cannot report mock success", async () => {
  await expect(
    withSiaRun(
      {
        backend: { kind: "cluster" },
      } as unknown as RunOptions,
      () => Promise.resolve("wrong backend"),
    ),
  ).rejects.toMatchObject({ code: "invalid-input" });
});
it("an application failure and a final close failure are both retained", async () => {
  const application = new Error("Application failed");
  const cleanup = new Error("Final close failed");
  const result = withSiaRun(
    {
      backend: {
        app: {
          description: "Failures",
          id: "a".repeat(64),
          name: "Failures",
          serviceUrl: "https://example.invalid",
        },
        kind: "mock",
      },
    },
    (run) => {
      const close = run.mock.close.bind(run.mock);
      run.mock.close = async () => {
        await close();
        throw cleanup;
      };
      return Promise.reject(application);
    },
  );
  await expect(result).rejects.toMatchObject({
    errors: [application, cleanup],
  });
});
it("a Node run returns the callback value after closing retained readers", async () => {
  const node = { fileFixture, withSiaRun };
  const directory = await mkdtemp(join(tmpdir(), "sia-node-"));
  try {
    const path = join(directory, "video.mp4");
    await writeFile(path, Uint8Array.of(4, 5));
    const file = await node.fileFixture(path);
    let retained:
      | undefined
      | { objects(input: { limit: number; offset: number }): Promise<unknown> };
    const result = await node.withSiaRun(
      {
        backend: {
          app: {
            description: "Node test",
            id: "a".repeat(64),
            name: "Node",
            serviceUrl: "https://example.invalid",
          },
          kind: "mock",
        },
      },
      async (run) => {
        const object = await run.objects.upload({
          file,
          metadata: new Uint8Array(),
          name: file.name,
        });
        retained = run.mock.reader({
          access: run.ownerAccess,
          as: run.mock.actor("node"),
        });
        expect(
          (
            await run.mock
              .reader({ access: run.ownerAccess, as: run.mock.actor("probe") })
              .object(object.id)
          ).sizeBytes,
        ).toBe(2);
        await writeFile(path, Uint8Array.of(9, 9));
        await expect(
          run.objects.upload({
            file,
            metadata: new Uint8Array(),
            name: file.name,
          }),
        ).rejects.toMatchObject({ code: "invalid-input" });
        return "done";
      },
    );
    expect(result.value).toBe("done");
    expect(result.summary.cleanup).toBe("clean");
    await expect(
      retained!.objects({ limit: 1, offset: 0 }),
    ).rejects.toMatchObject({ code: "closed" });
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
});

it.each(["foreign", "padding", "overwrite"])(
  "managed mock collects actual %s fixture bytes",
  async (kind) => {
    const expected =
      kind === "padding"
        ? Uint8Array.of(1, 0)
        : kind === "overwrite"
          ? Uint8Array.of(1, 3)
          : Uint8Array.of(1, 2, 3);
    const descriptor = await bytesFixture({ bytes: expected, name: "bytes" });
    const chunk =
      kind === "foreign"
        ? foreignMetadata("Uint8Array.of(1, 2, 3)")
        : Uint8Array.from(kind === "padding" ? [1] : [1, 2]);
    if (kind !== "foreign")
      Object.defineProperty(chunk, "byteLength", {
        value: kind === "padding" ? 2 : 1,
      });
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(chunk);
        if (kind === "overwrite") controller.enqueue(Uint8Array.of(3));
        controller.close();
      },
    });
    const result = await withSiaRun(
      {
        backend: {
          app: {
            description: "Bytes",
            id: "a".repeat(64),
            name: "Bytes",
            serviceUrl: "https://example.invalid",
          },
          kind: "mock",
        },
      },
      async (run) => {
        const uploading = run.objects.upload({
          file: { ...descriptor, open: () => stream },
          metadata: new Uint8Array(),
        });
        const reader = run.mock.reader({
          access: run.ownerAccess,
          as: run.mock.actor("reader"),
        });
        if (kind === "foreign") {
          const object = await uploading;
          expect(
            new Uint8Array(
              await new Response(await reader.download(object)).arrayBuffer(),
            ),
          ).toEqual(expected);
        } else {
          await expect(uploading).rejects.toMatchObject({
            code: "invalid-input",
          });
          expect(await reader.objects({ limit: 10, offset: 0 })).toMatchObject({
            objects: [],
          });
          expect(
            run.mock
              .history()
              .filter(
                (row) => row.operation === "upload" || row.operation === "pin",
              )
              .every((row) => !row.committed),
          ).toBe(true);
        }
        expect(stream.locked).toBe(false);
        await reader.close();
      },
    );
    expect(result.summary.cleanup).toBe("clean");
  },
);

const metadataOptions = {
  backend: {
    app: {
      description: "Metadata",
      id: "a".repeat(64),
      name: "Metadata",
      serviceUrl: "https://example.invalid",
    },
    kind: "mock" as const,
  },
};

it("managed mock snapshots selected metadata bytes before opening the source", async () => {
  const result = await withSiaRun(metadataOptions, async (run) => {
    const descriptor = await bytesFixture({
      bytes: Uint8Array.of(1, 2, 3),
      name: "payload",
    });
    const reader = run.mock.reader({
      access: run.ownerAccess,
      as: run.mock.actor("reader"),
    });
    for (const metadata of managedMetadataInputs()) {
      let reads = 0;
      const object = await run.objects.upload({
        file: {
          ...descriptor,
          open() {
            metadata[0] = 90;
            return descriptor.open();
          },
        },
        get metadata() {
          reads++;
          return metadata;
        },
        name: "explicit",
      });
      expect(reads).toBe(1);
      metadata[1] = 80;
      const first = await reader.object(object.id);
      expect(first.metadata).toEqual(Uint8Array.of(10, 20));
      first.metadata.fill(0);
      expect((await reader.object(object.id)).metadata).toEqual(
        Uint8Array.of(10, 20),
      );
      expect(
        new Uint8Array(
          await new Response(await reader.download(first)).arrayBuffer(),
        ),
      ).toEqual(Uint8Array.of(1, 2, 3));
      expect(await run.objects.inspect(object)).toBe("present");
    }
    await reader.close();
  });
  expect(result.summary.cleanup).toBe("clean");
});

it.each(["large", "empty"])(
  "managed mock keeps %s metadata valid",
  async (kind) => {
    const result = await withSiaRun(metadataOptions, async (run) => {
      const file = await bytesFixture({
        bytes: Uint8Array.of(1),
        name: "payload",
      });
      const reader = run.mock.reader({
        access: run.ownerAccess,
        as: run.mock.actor("reader"),
      });
      for (const metadata of kind === "large"
        ? [new Uint8Array(1025), new Uint8Array(16385)]
        : emptyManagedMetadata()) {
        const expected = new Uint8Array(metadata);
        const object = await run.objects.upload({ file, metadata });
        expect((await reader.object(object.id)).metadata).toEqual(expected);
      }
      await reader.close();
    });
    expect(result.summary.cleanup).toBe("clean");
  },
);

it("managed mock rejects invalid metadata without opening the source or consuming allowance", async () => {
  const result = await withSiaRun(
    { ...metadataOptions, limits: { maxObjects: 1 } },
    async (run) => {
      const descriptor = await bytesFixture({
        bytes: Uint8Array.of(1),
        name: "payload",
      });
      let opens = 0;
      const file = {
        ...descriptor,
        open() {
          opens++;
          return descriptor.open();
        },
      };
      const callerError = new Error("metadata getter failed");
      await expect(
        run.objects.upload({
          file,
          get metadata(): Uint8Array {
            throw callerError;
          },
        }),
      ).rejects.toBe(callerError);
      for (const metadata of invalidManagedMetadata()) {
        await expect(
          run.objects.upload({
            file,
            // @ts-expect-error Invalid caller values must reject at the upload boundary.
            metadata,
          }),
        ).rejects.toMatchObject({ code: "invalid-input" });
      }
      expect(opens).toBe(0);
      const reader = run.mock.reader({
        access: run.ownerAccess,
        as: run.mock.actor("reader"),
      });
      expect(await reader.objects({ limit: 10, offset: 0 })).toMatchObject({
        objects: [],
      });
      await reader.close();
      await run.objects.upload({ file, metadata: new Uint8Array() });
      expect(opens).toBe(1);
    },
  );
  expect(result.summary.cleanup).toBe("clean");
});
