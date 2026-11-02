/** HTTP and MSW readers use one dispatcher and authenticate the application's current credential. */
import { type MockCredential, mockRuntime } from "./runtime.js";
import type { ActorRef, BrowserAccess, MockSia, ReadObject } from "./types.js";

export interface MockConnection {
  readonly client: string;
  readonly kind: MockCredential["kind"];
  readonly url: string;
}
export interface MockEndpoint {
  connection(input: {
    readonly access: BrowserAccess;
    readonly as: ActorRef;
  }): MockConnection;
  readonly url: string;
}
export function createMockEndpoint(mock: MockSia, base: string) {
  const root = new URL("./sia-test/", base.endsWith("/") ? base : base + "/");
  const clients = new Map<
    string,
    { actor: ActorRef; kind: MockCredential["kind"] }
  >();
  const runtime = mockRuntime(mock);
  const endpoint: MockEndpoint = {
    connection({ access, as }) {
      const credential = runtime.credential(access);
      const reader = mock.reader({ access, as });
      void reader.close();
      const client = crypto.randomUUID();
      clients.set(client, { actor: as, kind: credential.kind });
      return Object.freeze({ client, kind: credential.kind, url: root.href });
    },
    url: root.href,
  };
  async function dispatch(request: Request): Promise<Response> {
    let detach: (() => void) | undefined;
    const url = new URL(request.url);
    if (url.origin !== root.origin || !url.pathname.startsWith(root.pathname))
      return Response.json({ code: "not-found" }, { status: 404 });
    const parts = url.pathname.substring(root.pathname.length).split("/");
    const client = parts.length === 2 && clients.get(parts[0]!);
    if (!client) return Response.json({ code: "denied" }, { status: 403 });
    const isAuth = parts[1]?.startsWith("auth-");
    if (request.method !== (isAuth ? "POST" : "GET"))
      return Response.json({ code: "invalid-input" }, { status: 405 });
    try {
      const header = request.headers.get("authorization") ?? "";
      if (!/^Bearer [a-f0-9]{64}$/.test(header))
        return Response.json({ code: "denied" }, { status: 403 });
      const credential = { keyHex: header.substring(7), kind: client.kind };
      if (isAuth) {
        const input: unknown = await request.json();
        if (!input || typeof input !== "object" || Array.isArray(input))
          throw Object.assign(new Error("Invalid auth body"), {
            code: "invalid-input",
          });
        return Response.json(
          runtime.authentication(
            credential,
            parts[1]!,
            input as Record<string, unknown>,
            root.href,
          ),
        );
      }
      const access = runtime.authenticate({
        ...credential,
        kind: client.kind === "registration" ? "app-key" : client.kind,
      });
      const reader = mock.reader({ access, as: client.actor });
      const cancelled = () => {
        void reader.close();
      };
      request.signal.addEventListener("abort", cancelled, { once: true });
      detach = () => request.signal.removeEventListener("abort", cancelled);
      if (request.signal.aborted) cancelled();
      const allowed =
        parts[1] === "objects"
          ? ["offset", "limit"]
          : parts[1] === "download"
            ? ["id", "offset", "length"]
            : ["id"];
      for (const key of url.searchParams.keys())
        if (!allowed.includes(key) || url.searchParams.getAll(key).length !== 1)
          throw Object.assign(new Error("Invalid parameter"), {
            code: "invalid-input",
          });
      const number = (key: string, fallback: number) => {
        const value = url.searchParams.get(key);
        if (value === null) return fallback;
        if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)))
          throw Object.assign(new Error("Invalid range"), {
            code: "invalid-input",
          });
        return Number(value);
      };
      const id = url.searchParams.get("id");
      if (parts[1] === "objects") {
        const page = await reader.objects({
          limit: number("limit", 100),
          offset: number("offset", 0),
        });
        return Response.json({
          ...page,
          objects: page.objects.map(wireObject),
        });
      }
      if (!id)
        throw Object.assign(new Error("Object is required"), {
          code: "invalid-input",
        });
      if (parts[1] === "object")
        return Response.json(wireObject(await reader.object(id)));
      if (parts[1] !== "download")
        return Response.json({ code: "not-found" }, { status: 404 });
      const stream = await reader.download(
        { id },
        {
          ...(url.searchParams.has("length")
            ? { length: number("length", 0) }
            : {}),
          offset: number("offset", 0),
          signal: request.signal,
        },
      );
      return new Response(stream, {
        headers: { "content-type": "application/octet-stream" },
      });
    } catch (error) {
      const code =
        error &&
        typeof error === "object" &&
        "code" in error &&
        typeof error.code === "string"
          ? error.code
          : "invalid-input";
      return Response.json(
        { code },
        {
          status:
            code === "denied"
              ? 403
              : code === "not-found"
                ? 404
                : code === "closed"
                  ? 410
                  : 400,
        },
      );
    } finally {
      detach?.();
    }
  }
  return { dispatch, endpoint };
}
function wireObject(object: ReadObject) {
  return { ...object, metadata: [...object.metadata] };
}
