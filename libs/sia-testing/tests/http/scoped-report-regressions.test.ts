/** Transport dispatch must keep read controls and authentication scoped to the requested operation. */
import { expect, it } from "vitest";
import { bytesFixture, createMockSia } from "../../src/testing/mock.js";
import { createMockEndpoint } from "../../src/testing/transport.js";
import { mockCredential } from "../../src/testing/http.js";
import type { MockRun, MockSia } from "../../src/testing/types.js";
const app = {
  description: "Review",
  id: "a".repeat(64),
  name: "Review",
  serviceUrl: "https://example.invalid",
};
async function fixture(use: (run: MockRun, mock: MockSia) => Promise<void>) {
  const mock = createMockSia();
  try {
    await mock.run({ app }, (run) => use(run, mock));
  } finally {
    await mock.close();
  }
}
it("a download does not consume an object-specific fault", () =>
  fixture(async (run, mock) => {
    const file = await bytesFixture({ bytes: Uint8Array.of(7), name: "video" });
    const object = await run.objects.upload({
      file,
      metadata: new Uint8Array(),
      name: file.name,
    });
    const { dispatch, endpoint } = createMockEndpoint(mock, "http://127.0.0.1");
    const actor = mock.actor("reader");
    const connection = endpoint.connection({
      access: run.ownerAccess,
      as: actor,
    });
    const headers = {
      authorization: `Bearer ${mockCredential(mock, run.ownerAccess).keyHex}`,
    };
    mock.faults.fail(
      { actor, object, operation: "object" },
      { code: "unavailable", times: 1 },
    );
    const response = await dispatch(
      new Request(
        new URL(
          `${connection.client}/download?id=${object.id}`,
          connection.url,
        ),
        { headers },
      ),
    );
    expect(response.status).toBe(200);
    expect([...new Uint8Array(await response.arrayBuffer())]).toEqual([7]);
    const metadata = await dispatch(
      new Request(
        new URL(`${connection.client}/object?id=${object.id}`, connection.url),
        { headers },
      ),
    );
    expect(metadata.status).toBe(400);
  }));
it.each(["objects", "object"] as const)(
  "disconnecting a held %s request cancels its receipt",
  (operation) =>
    fixture(async (run, mock) => {
      const file = await bytesFixture({
        bytes: Uint8Array.of(7),
        name: "video",
      });
      const object = await run.objects.upload({
        file,
        metadata: new Uint8Array(),
        name: file.name,
      });
      const actor = mock.actor("reader");
      const hold = mock.faults.hold({ actor, operation });
      const { dispatch, endpoint } = createMockEndpoint(
        mock,
        "http://127.0.0.1",
      );
      const connection = endpoint.connection({
        access: run.ownerAccess,
        as: actor,
      });
      const abort = new AbortController();
      const response = dispatch(
        new Request(
          new URL(
            `${connection.client}/${operation}?${operation === "object" ? `id=${object.id}` : "limit=1&offset=0"}`,
            connection.url,
          ),
          {
            headers: {
              authorization: `Bearer ${mockCredential(mock, run.ownerAccess).keyHex}`,
            },
            signal: abort.signal,
          },
        ),
      );
      await hold.started();
      abort.abort();
      await new Promise((resolve) => setTimeout(resolve, 0));
      try {
        expect(mock.history().at(-1)?.status).toBe("cancelled");
      } finally {
        hold.release();
        await response;
      }
    }),
);
it("a registered app key reads through the original registration connection", () =>
  fixture(async (run, mock) => {
    const { dispatch, endpoint } = createMockEndpoint(mock, "http://127.0.0.1");
    const connection = endpoint.connection({
      access: run.auth.registrationAccess,
      as: mock.actor("login"),
    });
    const credential = mockCredential(mock, run.auth.registrationAccess);
    const auth = async (operation: string, body: unknown) =>
      (
        await dispatch(
          new Request(
            new URL(`${connection.client}/${operation}`, connection.url),
            {
              body: JSON.stringify(body),
              headers: {
                "authorization": `Bearer ${credential.keyHex}`,
                "content-type": "application/json",
              },
              method: "POST",
            },
          ),
        )
      ).json() as Promise<{ id: string; keyHex: string; responseUrl: string }>;
    const request = await auth("auth-request", { app });
    await run.auth.approve(request.responseUrl);
    const key = await auth("auth-register", {
      id: request.id,
      phrase: run.auth.fixturePhrase,
    });
    const response = await dispatch(
      new Request(new URL(`${connection.client}/objects`, connection.url), {
        headers: { authorization: `Bearer ${key.keyHex}` },
      }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ objects: [] });
  }));
