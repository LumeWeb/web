import type {
  IndexdModel,
  ModelObject,
  SharingAttachment,
} from "./model/index.js";
import { hostQueryResponse } from "./host-query.js";

export interface DispatcherOptions {
  baseUrl?: string;
  connectionBaseUrl?: string;
  /** Clock used for signed-query expiry; model clocks remain separate. */
  now?: () => Date;
  /** Test-only response fault hook; runs after model mutation and before returning. */
  responseOverride?: (
    request: Request,
    response: Response,
  ) => Promise<Response> | Response;
}
export interface DispatchResponse {
  body?: unknown;
  headers?: HeadersInit;
  status: number;
}

const json = (body: unknown, status = 200): DispatchResponse => ({
  body,
  headers: { "content-type": "application/json" },
  status,
});
const empty = (status = 204): DispatchResponse => ({
  headers: { "content-type": "application/json" },
  status,
});

export type IndexdDispatcher = ReturnType<typeof createIndexdDispatcher>;
/** Dispatches Indexd wire requests to the account-scoped model. */
export function createIndexdDispatcher(
  model: IndexdModel,
  options: DispatcherOptions = {},
) {
  const base = options.baseUrl ? new URL(options.baseUrl) : undefined;
  return async function dispatch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (
      base &&
      (url.origin !== base.origin ||
        !(
          url.pathname === base.pathname.replace(/\/$/, "") ||
          url.pathname.startsWith(base.pathname.replace(/\/$/, "") + "/") ||
          url.pathname === "/api" ||
          url.pathname.startsWith("/api/")
        ))
    )
      return new Response(JSON.stringify({ error: "unsupported origin" }), {
        headers: { "content-type": "application/json" },
        status: 404,
      });
    const path = url.pathname.replace(/^\/api/, "").replace(/\/$/, "") || "/";
    const method = request.method.toUpperCase();
    const params = url.searchParams;
    const approval = /^\/auth\/connect\/[^/]+$/.test(path) && method === "POST";
    const publicKey = signedCaller(
      params,
      (options.now ?? (() => new Date()))(),
    );
    const caller = publicKey ? model.caller(publicKey) : undefined;
    const connection =
      path === "/auth/connect" || path.startsWith("/auth/connect/");
    const shared = path === "/shared" || path.startsWith("/shared/");
    if (!approval && (!publicKey || (!connection && !shared && !caller)))
      return makeResponse(json({ error: "unauthorized" }, 401));
    if (shared) {
      try {
        model.sharedStats(publicKey!, publicKey!);
      } catch {
        return makeResponse(json({ error: "unauthorized" }, 401));
      }
    }
    const account = caller?.id;
    const finish = (response: Response) =>
      options.responseOverride
        ? options.responseOverride(request, response)
        : response;
    try {
      const connectionRequest =
        connection && !approval && path !== "/auth/connect"
          ? model.connectionRequest(path.split("/")[3]!)
          : undefined;
      if (
        connection &&
        !approval &&
        path !== "/auth/connect" &&
        connectionRequest?.publicKey !== publicKey
      )
        return makeResponse(json({ error: "unauthorized" }, 401));
      let value: unknown;
      if (path === "/auth/connect" && method === "POST") {
        const body = (await request.json().catch(() => ({}))) as {
          appId?: string;
          appID?: string;
        };
        const connection = model.requestConnection({
          appId: body.appId ?? body.appID ?? "",
          publicKey: publicKey!,
        });
        value = {
          expiration: connection.expiresAt.toISOString(),
          id: connection.id,
          registerURL: new URL(
            `/auth/connect/${connection.id}/register`,
            options.connectionBaseUrl ?? base?.toString() ?? request.url,
          ).toString(),
          responseURL: new URL(
            `/auth/connect/${connection.id}`,
            options.connectionBaseUrl ?? base?.toString() ?? request.url,
          ).toString(),
          statusURL: new URL(
            `/auth/connect/${connection.id}/status`,
            options.connectionBaseUrl ?? base?.toString() ?? request.url,
          ).toString(),
        };
      } else if (/^\/auth\/connect\/[^/]+$/.exec(path) && method === "POST") {
        const id = path.split("/").pop()!;
        const basic = request.headers.get("authorization") ?? "";
        if (!basic.toLowerCase().startsWith("basic "))
          return makeResponse(json({ error: "unauthorized" }, 401));
        model.approveConnection(id, atob(basic.slice(6)).split(":")[1] ?? "");
        return finish(makeResponse(empty()));
      } else if (
        /^\/auth\/connect\/[^/]+\/status$/.exec(path) &&
        method === "GET"
      ) {
        value = {
          approved: connectionRequest!.approved,
          reconnecting: false,
          ...(connectionRequest!.approved
            ? {
                userSecret:
                  "0000000000000000000000000000000000000000000000000000000000000000",
              }
            : {}),
        };
      } else if (
        /^\/auth\/connect\/[^/]+\/register$/.exec(path) &&
        method === "POST"
      ) {
        const id = path.split("/")[3]!;
        const body = (await request.json()) as { appKey: string };
        model.registerConnection(id, body.appKey);
        return finish(makeResponse(empty()));
      } else if (path === "/auth/check" && method === "GET")
        return finish(makeResponse(empty()));
      else if (path === "/auth" || path.startsWith("/auth/"))
        return finish(
          makeResponse(
            json({ error: `unsupported route ${method} ${path}` }, 404),
          ),
        );
      if (path.startsWith("/auth/")) return finish(makeResponse(json(value)));
      if (path === "/account" && method === "GET")
        value = {
          accountKey: account,
          app: {
            description: "deterministic control-plane test",
            id: "00".repeat(32),
            logoUrl: null,
            name: "Sia testing browser",
            serviceUrl: "https://example.invalid",
          },
          encryptedDataKey: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
          lastUsed: new Date().toISOString(),
          maxPinnedData: 1_000_000_000,
          pinnedData: 0,
          pinnedSize: account ? model.accountStats(account).pinnedSize : 0,
          ready: true,
          remainingStorage: 1_000_000_000,
        };
      else if (path === "/hosts" && method === "GET") {
        const country = params.get("country") ?? params.get("countryCode");
        const filter = {
          ...(country ? { countryCode: country } : {}),
          ...(params.get("publicKey")
            ? { publicKey: params.get("publicKey")! }
            : {}),
          ...(params.has("goodForUpload")
            ? { goodForUpload: params.get("goodForUpload") === "true" }
            : {}),
        };
        value = hostQueryResponse(model.hosts(account!, filter), params);
      } else if (path === "/objects" && method === "GET") {
        const after = params.get("after");
        const key = params.get("key") ?? "";
        const events = model
          .objectEvents(account!)
          .sort(
            (a, b) =>
              Date.parse(a.updatedAt) - Date.parse(b.updatedAt) ||
              (a.key < b.key ? -1 : a.key > b.key ? 1 : 0),
          );
        const limit = Number(params.get("limit") ?? events.length);
        value = events
          .filter(
            (event) =>
              !after ||
              Date.parse(event.updatedAt) > Date.parse(after) ||
              (Date.parse(event.updatedAt) === Date.parse(after) &&
                event.key > key),
          )
          .slice(0, limit)
          .map((event) => ({
            ...event,
            ...(event.object
              ? {
                  object: {
                    ...event.object,
                    createdAt: event.updatedAt,
                    updatedAt: event.updatedAt,
                  },
                }
              : {}),
          }));
      } else if (
        path.startsWith("/objects/") &&
        path.endsWith("/shared") &&
        method === "GET"
      ) {
        if (!caller)
          return finish(makeResponse(json({ error: "unauthorized" }, 401)));
        const object = model.object(
          caller.id,
          decodeURIComponent(path.slice(9, -7)),
        );
        if (!object)
          return finish(makeResponse(json({ error: "object not found" }, 404)));
        value = {
          slabs: (object.slabs ?? []).map((id) => model.getSlab(caller.id, id)),
        };
      } else if (path === "/slabs" && method === "GET")
        value = model.listSlabs(account!);
      else if (path === "/slabs" && method === "POST") {
        const body = (await request.json()) as { id: string; size: number };
        model.pinSlab(account!, body);
        return finish(makeResponse(empty()));
      } else if (path.startsWith("/slabs/") && method === "GET")
        value = model.getSlab(account!, decodeURIComponent(path.slice(7)));
      else if (path.startsWith("/slabs/") && method === "DELETE") {
        model.unpinSlab(account!, decodeURIComponent(path.slice(7)));
        return finish(makeResponse(empty()));
      } else if (path === "/slabs/prune" && method === "POST")
        value = model.pruneSlabs(account!);
      else if (path === "/objects" && method === "POST") {
        const body = (await request.json()) as {
          dataSignature?: string;
          encryptedDataKey?: string;
          encryptedMetadata?: string;
          encryptedMetadataKey?: string;
          id: string;
          metadataSignature?: string;
          slabs?: { id: string }[];
        };
        model.pinObject(account!, {
          id: body.id,
          slabs: (body.slabs ?? []).map((s) => s.id),
          ...(body.encryptedDataKey !== undefined
            ? { encryptedDataKey: body.encryptedDataKey }
            : {}),
          ...(body.dataSignature !== undefined
            ? { dataSignature: body.dataSignature }
            : {}),
          ...(body.encryptedMetadataKey !== undefined
            ? { encryptedMetadataKey: body.encryptedMetadataKey }
            : {}),
          ...(body.encryptedMetadata !== undefined
            ? { encryptedMetadata: body.encryptedMetadata }
            : {}),
          ...(body.metadataSignature !== undefined
            ? { metadataSignature: body.metadataSignature }
            : {}),
        });
        return finish(makeResponse(empty()));
      } else if (path.startsWith("/objects/") && method === "GET") {
        const id = decodeURIComponent(path.slice(9));
        value = model.object(account!, id);
        if (!value)
          return finish(makeResponse(json({ error: "object not found" }, 404)));
        // Missing sealed fields get decoder placeholders, not valid encryption.
        // Preserve supplied sealed fields unchanged.
        const hexZeros = (length: number) => "00".repeat(length);
        const object = value as ModelObject;
        value = {
          ...object,
          slabs: [],
          ...(object.encryptedDataKey === undefined
            ? { encryptedDataKey: hexZeros(72) }
            : {}),
          ...(object.dataSignature === undefined
            ? { dataSignature: hexZeros(64) }
            : {}),
          ...(object.encryptedMetadataKey === undefined
            ? { encryptedMetadataKey: "" }
            : {}),
          ...(object.metadataSignature === undefined
            ? { metadataSignature: hexZeros(64) }
            : {}),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } else if (path.startsWith("/objects/") && method === "DELETE") {
        model.deleteObject(account!, decodeURIComponent(path.slice(9)));
        return finish(makeResponse(empty()));
      } else if (path === "/sharing" && method === "GET")
        value = model.listSharingKeys(account!);
      else if (path === "/sharing" && method === "POST") {
        const body = (await request.json()) as {
          description?: string;
          expiresAt?: string;
          nonce: string;
          publicKey: string;
        };
        value = model.createSharingKey(account!, body);
      } else if (/^\/sharing\/[^/]+\/objects$/.exec(path) && method === "GET")
        value = model.listSharedObjects(
          account!,
          decodeURIComponent(path.split("/")[2]!),
        );
      else if (/^\/sharing\/[^/]+\/objects$/.exec(path) && method === "POST") {
        const key = decodeURIComponent(path.split("/")[2]!);
        const body = (await request.json()) as SharingAttachment;
        model.attachSharedObject(account!, key, body);
        return finish(makeResponse(empty()));
      } else if (
        /^\/sharing\/[^/]+\/objects\/[^/]+$/.exec(path) &&
        method === "DELETE"
      ) {
        const parts = path.split("/");
        model.detachSharedObject(
          account!,
          decodeURIComponent(parts[2]!),
          decodeURIComponent(parts[4]!),
        );
        return finish(makeResponse(empty()));
      } else if (path.startsWith("/sharing/") && method === "GET")
        value = model.getSharingKey(
          account!,
          decodeURIComponent(path.slice(9)),
        );
      else if (path.startsWith("/sharing/") && method === "DELETE") {
        model.revokeSharingKey(account!, decodeURIComponent(path.slice(9)));
        return finish(makeResponse(empty()));
      } else if (path === "/shared/hosts" && method === "GET") {
        value = [];
      } else if (path === "/shared" && method === "GET")
        value = model.sharedStats(publicKey!, publicKey!);
      else if (path === "/shared/objects" && method === "GET") {
        const key = publicKey!;
        const stamp = new Date().toISOString();
        value = model
          .listRecipientObjects(key, key)
          .map((item) => ({
            ...item,
            createdAt: stamp,
            id: item.objectID,
            size: 0,
            slabs: [],
            updatedAt: stamp,
          }));
      } else if (path.startsWith("/shared/objects/") && method === "GET") {
        const key = publicKey!;
        const stamp = new Date().toISOString();
        value = {
          ...model.sharedObject(key, key, decodeURIComponent(path.slice(16))),
          createdAt: stamp,
          id: decodeURIComponent(path.slice(16)),
          size: 0,
          slabs: [],
          updatedAt: stamp,
        };
      } else
        return finish(
          makeResponse(
            json(
              {
                error: `unsupported route ${method} ${path}?${params.toString()}`,
              },
              404,
            ),
          ),
        );
      const response = makeResponse(json(value));
      return options.responseOverride
        ? await options.responseOverride(request, response)
        : response;
    } catch (error) {
      const message = error instanceof Error ? error.message : "internal error";
      return makeResponse(json({ error: message }, errorStatus(message)));
    }
  };
}

function decodeBytes(
  value: null | string,
  length: number,
): Uint8Array | undefined {
  if (
    !value ||
    !/^[A-Za-z0-9_-]+={1,2}$/.test(value) ||
    value.length !== Math.ceil(length / 3) * 4
  )
    return undefined;
  try {
    const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
    if (binary.length !== length) return undefined;
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  } catch {
    return undefined;
  }
}
function errorStatus(message: string): number {
  if (/not found|unknown account|unknown request|unpinned slab/.test(message))
    return 404;
  if (/already exists|duplicate/.test(message)) return 409;
  if (message.includes("quota")) return 429;
  if (/forbidden|unavailable|still referenced/.test(message)) return 403;
  if (/expired|not approved|unauthorized|authentication/.test(message))
    return 401;
  return 400;
}
function makeResponse(result: DispatchResponse): Response {
  return new Response(
    result.body === undefined ? null : JSON.stringify(result.body),
    {
      status: result.status,
      ...(result.headers ? { headers: result.headers } : {}),
    },
  );
}
/** Checks wire structure and expiry only; signatures are not cryptographically verified. */
function signedCaller(params: URLSearchParams, now: Date): string | undefined {
  const key = decodeBytes(params.get("sc"), 32);
  const signature = decodeBytes(params.get("ss"), 64);
  const expiry = params.get("sv");
  if (!key || !signature || !expiry || !/^[+-]?\d+$/.test(expiry))
    return undefined;
  const seconds = BigInt(expiry);
  if (
    seconds < -9223372036854775808n ||
    seconds > 9223372036854775807n ||
    seconds * 1000n < BigInt(now.getTime())
  )
    return undefined;
  return `ed25519:${[...key].map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}
export type { ModelObject };
