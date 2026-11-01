/** A caller-owned checkpoint file restores the same payload model behind a new HTTP listener. */
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";
import {
  createIndexdHttpServer,
  type IndexdHttpServer,
} from "../../src/http/index.js";
import {
  createMockNetwork,
  createRemoteMockSdk,
  type MockNetwork,
} from "../../src/sdk/index.js";

test("an explicit checkpoint restores HTTP payloads after a server restart", async () => {
  const directory = await mkdtemp(join(tmpdir(), "sia-mock-checkpoint-"));
  const servers: IndexdHttpServer[] = [];
  async function start(network: MockNetwork) {
    const server = createIndexdHttpServer({
      mockClients: {
        other: { accountId: "other" },
        owner: { accountId: "owner" },
      },
      mockNetwork: network,
    });
    servers.push(server);
    const { port } = await server.listen();
    return { server, url: `http://127.0.0.1:${port}` };
  }
  try {
    const original = createMockNetwork();
    original.model.createAccount({ publicKey: "owner" });
    original.model.createAccount({ publicKey: "other" });
    const first = await start(original);
    const writer = createRemoteMockSdk({ client: "owner", url: first.url });
    const object = await writer.upload(new Uint8Array([4, 5, 6]), {
      id: "video",
    });
    await writer.pinObject(object);
    const request = original.model.requestConnection({
      appId: "app",
      publicKey: "pending",
    });
    await first.server.close();
    servers.splice(servers.indexOf(first.server), 1);
    const checkpoint = join(directory, "state.json");
    await writeFile(checkpoint, original.serialize(), { mode: 0o600 });
    original.model.reset();

    const restored = createMockNetwork({
      state: await readFile(checkpoint, "utf8"),
    });
    const second = await start(restored);
    const reader = createRemoteMockSdk({ client: "owner", url: second.url });
    const loaded = await reader.object("video");
    const response = new Response(await reader.download(loaded));
    expect([...new Uint8Array(await response.arrayBuffer())]).toEqual([
      4, 5, 6,
    ]);
    expect(restored.model.objectEvents("owner")).toHaveLength(1);
    expect(restored.model.connectionRequest(request.id)?.approved).toBe(false);
    const other = createRemoteMockSdk({ client: "other", url: second.url });
    await expect(other.download(object)).rejects.toThrow("not found");
  } finally {
    await Promise.all(servers.map((server) => server.close()));
    await rm(directory, { force: true, recursive: true });
  }
});
