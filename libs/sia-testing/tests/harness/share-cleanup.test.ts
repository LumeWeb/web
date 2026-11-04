/** Run cleanup owns authenticated session requests even while their JSON body is incomplete. */
import { expect, it } from "vitest";
import { createMockSia } from "../../src/mock.js";
import { createMockEndpoint } from "../../src/testing/transport.js";
import { shareApp as app } from "./share-scenarios.js";
it("run cleanup cancels and joins an incomplete session body without closing the endpoint", async () => {
  const mock = createMockSia();
  const endpoint = createMockEndpoint(mock, "https://cleanup.example.invalid");
  let response: Promise<Response> | undefined;
  let cancelled = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const running = mock.run({ app }, async (run) => {
      const actor = mock.actor("editor");
      const share = await run.shares.create({ objects: [] });
      const grant = await run.shares.grant(share, {
        as: actor,
        label: "list",
        operations: ["end"],
      });
      const connection = endpoint.endpoint.connection({
        access: run.ownerAccess,
        as: actor,
        shareGrants: [grant],
      });
      let reading!: () => void;
      const read = new Promise<void>((resolve) => {
        reading = resolve;
      });
      const body = new ReadableStream<Uint8Array>(
        {
          cancel() {
            cancelled = true;
          },
          pull() {
            reading();
          },
        },
        { highWaterMark: 0 },
      );
      const request = new Request(
        new URL(`${connection.client}/app-share-targets`, connection.url),
        {
          body,
          duplex: "half",
          headers: { authorization: `Bearer ${connection.credential.keyHex}` },
          method: "POST",
        } as RequestInit,
      );
      response = endpoint.dispatch(request);
      await read;
    });
    await Promise.race([
      running,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("run did not join its session body")),
          500,
        );
      }),
    ]);
    expect(cancelled).toBe(true);
    expect((await response!).ok).toBe(false);
    await mock.run({ app }, async (run) => {
      const connection = endpoint.endpoint.connection({
        access: run.ownerAccess,
        as: mock.actor("alive"),
      });
      const request = new Request(
        new URL(`${connection.client}/app-share-targets`, connection.url),
        {
          body: "{}",
          headers: { authorization: `Bearer ${connection.credential.keyHex}` },
          method: "POST",
        },
      );
      expect((await endpoint.dispatch(request)).ok).toBe(true);
    });
  } finally {
    clearTimeout(timer);
    await endpoint.close();
    await response;
    await mock.close();
  }
});
it("run cleanup reports a body cancellation error and leaves other runs usable", async () => {
  const mock = createMockSia();
  const endpoint = createMockEndpoint(
    mock,
    "https://cleanup-error.example.invalid",
  );
  const cancellationError = new Error("body cancellation failed");
  let response: Promise<Response> | undefined;
  try {
    await expect(
      mock.run({ app }, async (run) => {
        const connection = endpoint.endpoint.connection({
          access: run.ownerAccess,
          as: mock.actor("editor"),
        });
        let reading!: () => void;
        const read = new Promise<void>((resolve) => {
          reading = resolve;
        });
        const body = new ReadableStream<Uint8Array>(
          {
            cancel() {
              throw cancellationError;
            },
            pull() {
              reading();
            },
          },
          { highWaterMark: 0 },
        );
        response = endpoint.dispatch(
          new Request(
            new URL(`${connection.client}/app-share-targets`, connection.url),
            {
              body,
              duplex: "half",
              headers: {
                authorization: `Bearer ${connection.credential.keyHex}`,
              },
              method: "POST",
            } as RequestInit,
          ),
        );
        await read;
      }),
    ).rejects.toBeInstanceOf(AggregateError);
    await response;
    await expect(
      mock.run({ app }, async (run) => {
        const connection = endpoint.endpoint.connection({
          access: run.ownerAccess,
          as: mock.actor("alive"),
        });
        const response = await endpoint.dispatch(
          new Request(
            new URL(`${connection.client}/app-share-targets`, connection.url),
            {
              body: "{}",
              headers: {
                authorization: `Bearer ${connection.credential.keyHex}`,
              },
              method: "POST",
            },
          ),
        );
        expect(response.ok).toBe(true);
      }),
    ).resolves.toMatchObject({ summary: { cleanup: "clean" } });
  } finally {
    await expect(endpoint.close()).rejects.toBeInstanceOf(AggregateError);
    await mock.close();
  }
});
it("run cleanup retains a settled request's cancellation error", async () => {
  const mock = createMockSia();
  const endpoint = createMockEndpoint(
    mock,
    "https://settled-cleanup.example.invalid",
  );
  try {
    await expect(
      mock.run({ app }, async (run) => {
        const connection = endpoint.endpoint.connection({
          access: run.ownerAccess,
          as: mock.actor("editor"),
        });
        const body = new ReadableStream<Uint8Array>({
          cancel() {
            throw new Error("settled cancellation failed");
          },
          start(controller) {
            controller.enqueue(new Uint8Array(16385));
          },
        });
        const response = await endpoint.dispatch(
          new Request(
            new URL(`${connection.client}/app-share-targets`, connection.url),
            {
              body,
              duplex: "half",
              headers: {
                authorization: `Bearer ${connection.credential.keyHex}`,
              },
              method: "POST",
            } as RequestInit,
          ),
        );
        expect(response.ok).toBe(false);
      }),
    ).rejects.toBeInstanceOf(AggregateError);
  } finally {
    await expect(endpoint.close()).rejects.toBeInstanceOf(AggregateError);
    await mock.close();
  }
});
