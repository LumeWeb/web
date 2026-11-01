/** Mock payload routes use server-bound SDK clients so a request cannot replace its account or device. */
import type { MockOperation } from "../sdk/control.js";
import type { MockSdk } from "../sdk/index.js";
import { MOCK_SDK_PATH, mockMethods } from "../sdk/protocol.js";

export function createMockDispatcher(clients: ReadonlyMap<string, MockSdk>) {
  return async (request: Request): Promise<Response | undefined> => {
    const url = new URL(request.url);
    if (!url.pathname.startsWith(MOCK_SDK_PATH)) return undefined;
    try {
      const parts = url.pathname.substring(MOCK_SDK_PATH.length).split("/");
      if (parts.length !== 2) return error(404, "mock route not found");
      const client = clients.get(decodeURIComponent(parts[0]!));
      if (!client) return error(404, "mock client not found");
      const operation = parts[1] as MockOperation;
      if (!Object.hasOwn(mockMethods, operation))
        return error(404, "mock operation not found");
      if (request.method !== mockMethods[operation])
        return error(405, "mock method not allowed");
      const allowed =
        operation === "download" ? ["id", "offset", "length"] : ["id"];
      for (const name of url.searchParams.keys()) {
        if (
          !allowed.includes(name) ||
          url.searchParams.getAll(name).length !== 1
        )
          return error(400, "invalid mock parameters");
      }
      const id = url.searchParams.get("id");
      if (operation !== "pruneSlabs" && !id)
        return error(400, "object id is required");
      const call = { signal: request.signal };
      switch (operation) {
        case "deleteObject":
          await client.deleteObject(id!, call);
          break;
        case "download": {
          const range: { length?: number; offset?: number } = {};
          for (const name of ["offset", "length"] as const) {
            const value = url.searchParams.get(name);
            if (value !== null) {
              if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)))
                return error(400, "invalid mock range");
              range[name] = Number(value);
            }
          }
          const stream = await client.download(
            { id: () => id! },
            { ...call, ...range },
          );
          return new Response(stream, {
            headers: { "content-type": "application/octet-stream" },
          });
        }
        case "object": {
          const object = await client.object(id!, call);
          return Response.json({ id: object.id(), size: object.size() });
        }
        case "pinObject":
          await client.pinObject({ id: () => id! }, call);
          break;
        case "pruneSlabs":
          await client.pruneSlabs(call);
          break;
        case "upload": {
          const object = await client.upload(
            new Uint8Array(await request.arrayBuffer()),
            { ...call, id: id! },
          );
          return Response.json({ id: object.id(), size: object.size() });
        }
      }
      return new Response(null, { status: 204 });
    } catch (cause) {
      return error(
        400,
        cause instanceof Error ? cause.message : "mock request failed",
      );
    }
  };
}

function error(status: number, message: string): Response {
  return Response.json({ error: message }, { status });
}
