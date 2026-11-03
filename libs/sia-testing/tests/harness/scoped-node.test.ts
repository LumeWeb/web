/** Node runs must own fixture teardown and detect files changed after descriptor creation. */
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
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
