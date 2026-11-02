/** Node runs must own fixture teardown and detect files changed after descriptor creation. */
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
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
