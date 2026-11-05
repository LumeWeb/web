/** HTTP and MSW readers use one dispatcher and authenticate the application's current credential. */
import {
  diagnosticField,
  invalidInput,
  isEndpointShutdown,
} from "./diagnostics.js";
import { isLostReply } from "./reply-loss.js";
import { createApplicationTransport } from "./application-transport.js";
import { type MockCredential, mockRuntime } from "./runtime.js";
import type {
  ActorRef,
  ApplicationPort,
  BrowserAccess,
  MockShareGrant,
  MockSia,
  OwnerShareRef,
  ReadObject,
} from "./types.js";

export interface MockConnection {
  readonly client: string;
  readonly credential?: MockCredential;
  readonly kind: MockCredential["kind"];
  readonly url: string;
}
export interface MockEndpoint {
  connection(input: {
    readonly access: BrowserAccess;
    readonly as: ActorRef;
    readonly shareGrants?: readonly MockShareGrant[];
  }): MockConnection & { readonly credential: MockCredential };
  readonly url: string;
}
export function createMockEndpoint(
  mock: MockSia,
  base: string,
  requestBody?: (
    request: Request,
    onCleanupError: (error: unknown) => void,
  ) => null | ReadableStream<Uint8Array>,
) {
  const root = new URL("./sia-test/", base.endsWith("/") ? base : base + "/");
  const clients = new Map<
    string,
    {
      abort: AbortController;
      actor: ActorRef;
      cleanupErrors: Set<AggregateError>;
      createApplication: () => ApplicationPort;
      credential: string;
      kind: MockCredential["kind"];
      pending: Set<Promise<Response>>;
      release: () => void;
      shares: Map<string, OwnerShareRef>;
      tokens: WeakMap<OwnerShareRef, string>;
    }
  >();
  const runtime = mockRuntime(mock);
  runtime.assertTransport();
  const application = createApplicationTransport(mock, requestBody);
  let closed = false;
  const endpoint: MockEndpoint = {
    connection({ access, as, shareGrants = [] }) {
      if (closed)
        throw Object.assign(new Error("Mock endpoint is closed"), {
          code: "closed",
        });
      const credential = runtime.credential(access);
      const createApplication = runtime.installShareGrants(
        access,
        as,
        shareGrants,
      );
      const reader = mock.reader({ access, as });
      void reader.close();
      const client = crypto.randomUUID();
      const abort = new AbortController();
      const pending = new Set<Promise<Response>>();
      const cleanupErrors = new Set<AggregateError>();
      const release = runtime.onRunCleanup(access, async () => {
        clients.delete(client);
        abort.abort();
        const results = await Promise.allSettled([...pending]);
        for (const result of results) {
          if (
            result.status === "rejected" &&
            result.reason instanceof AggregateError
          )
            cleanupErrors.add(result.reason);
        }
        if (cleanupErrors.size)
          throw new AggregateError(
            [...cleanupErrors],
            "Application run cleanup failed",
          );
      });
      clients.set(client, {
        abort,
        actor: as,
        cleanupErrors,
        createApplication,
        credential: credential.keyHex,
        kind: credential.kind,
        pending,
        release,
        shares: new Map(),
        tokens: new WeakMap(),
      });
      return Object.freeze({
        client,
        credential: Object.freeze(credential),
        kind: credential.kind,
        url: root.href,
      });
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
    const isApplication = parts[1]?.startsWith("app-");
    const isAuth = parts[1]?.startsWith("auth-");
    if (request.method !== (isAuth || isApplication ? "POST" : "GET"))
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
        const authenticationCredential: MockCredential =
          client.kind === "registration" &&
          parts[1] === "auth-connected" &&
          "keyHex" in input &&
          input.keyHex === credential.keyHex
            ? { ...credential, kind: "app-key" }
            : credential;
        return Response.json(
          runtime.authentication(
            authenticationCredential,
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
      if (isApplication) {
        if (
          client.kind !== "app-key" ||
          client.credential !== credential.keyHex
        )
          throw Object.assign(new Error("Owner connection required"), {
            code: "denied",
          });
        for (const key of url.searchParams.keys())
          if (key !== "token" || url.searchParams.getAll(key).length !== 1)
            throw Object.assign(new Error("Invalid parameter"), {
              code: "invalid-input",
            });
        const work = application.dispatch(request, parts[1]!, {
          access,
          actor: client.actor,
          client,
          createApplication: client.createApplication,
          credential: credential.keyHex,
          signal: client.abort.signal,
        });
        client.pending.add(work);
        try {
          return await work;
        } catch (error) {
          if (error instanceof AggregateError) client.cleanupErrors.add(error);
          throw error;
        } finally {
          client.pending.delete(work);
        }
      }
      const allowed =
        parts[1] === "owner-shares"
          ? ["offset", "limit"]
          : parts[1] === "owner-share"
            ? ["ref"]
            : parts[1] === "owner-share-objects"
              ? ["ref", "offset", "limit"]
              : parts[1] === "objects"
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
          throw invalidInput(key, `${key} must be a nonnegative safe integer`);
        return Number(value);
      };
      if (
        ["owner-share", "owner-share-objects", "owner-shares"].includes(
          parts[1]!,
        )
      ) {
        // Registration connections can authenticate readers after linking, but cannot become owner ports.
        if (client.kind !== "app-key")
          throw Object.assign(new Error("Owner connection required"), {
            code: "denied",
          });
        const owner = mock.ownerShares({ access, as: client.actor });
        const cancelled = () => {
          void owner.close();
        };
        request.signal.addEventListener("abort", cancelled, { once: true });
        const wire = (details: Awaited<ReturnType<typeof owner.detail>>) => {
          let token = client.tokens.get(details.ref);
          if (!token) {
            token = crypto.randomUUID();
            client.tokens.set(details.ref, token);
            client.shares.set(token, details.ref);
          }
          return { ...details, ref: token };
        };
        try {
          if (request.signal.aborted) cancelled();
          const page = {
            limit: number("limit", 100),
            offset: number("offset", 0),
            signal: request.signal,
          };
          const ref = client.shares.get(url.searchParams.get("ref") ?? "")!;
          if (parts[1] === "owner-share")
            return Response.json(
              wire(await owner.detail(ref, { signal: request.signal })),
            );
          if (parts[1] === "owner-shares") {
            const result = await owner.list(page);
            return Response.json({ ...result, items: result.items.map(wire) });
          }
          const result = await owner.objects(ref, page);
          return Response.json({
            ...result,
            items: result.items.map(wireObject),
          });
        } finally {
          request.signal.removeEventListener("abort", cancelled);
          await owner.close();
        }
      }
      const reader = mock.reader({ access, as: client.actor });
      const cancelled = () => {
        void reader.close();
      };
      request.signal.addEventListener("abort", cancelled, { once: true });
      detach = () => request.signal.removeEventListener("abort", cancelled);
      if (request.signal.aborted) cancelled();
      const id = url.searchParams.get("id");
      if (parts[1] === "objects") {
        const page = await reader.objects({
          limit: number("limit", 100),
          offset: number("offset", 0),
          signal: request.signal,
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
        return Response.json(
          wireObject(await reader.object(id, { signal: request.signal })),
        );
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
      if (isLostReply(error)) throw error;
      const shutdown =
        isEndpointShutdown(request.signal.reason) || isEndpointShutdown(error);
      const field = diagnosticField(error);
      const code = shutdown
        ? "closed"
        : error &&
            typeof error === "object" &&
            "code" in error &&
            typeof error.code === "string"
          ? error.code
          : "invalid-input";
      return Response.json(
        { code, ...(field ? { field } : {}) },
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
  return {
    close: () => {
      closed = true;
      for (const client of clients.values()) client.release();
      clients.clear();
      return application.close();
    },
    dispatch,
    endpoint,
  };
}
function wireObject(object: ReadObject) {
  return { ...object, metadata: [...object.metadata] };
}
