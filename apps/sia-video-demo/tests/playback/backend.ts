/** Test composition authenticates the UI's current seed against the shared fixture backend. */
import {
  createMockAuth,
  createMockReader,
  type MockConnection,
  type MockCredential,
} from "@lumeweb/sia-testing/client";
import { APP_ID, APP_META } from "../../src/lib/constants";
import { fromHex } from "../../src/lib/hex";
import type {
  AuthRequest,
  AuthSession,
  ListingSession,
} from "../../src/lib/storageBackend";

declare global {
  interface Window {
    __siaDemoTest?: { readonly credential: MockCredential };
  }
}
export async function connectAppKey(
  indexerUrl: string,
  userKeyHex: string,
): Promise<AuthSession> {
  const auth = createMockAuth(connection(indexerUrl, "app-key"), {
    keyHex: userKeyHex,
    kind: "app-key",
  });
  try {
    const key = await auth.connected(userKeyHex);
    if (!key) throw new Error("App key is not registered");
    return session(key);
  } finally {
    await auth.close();
  }
}
export function connection(
  indexerUrl: string,
  kind: MockCredential["kind"],
): MockConnection {
  const target = new URL(
    indexerUrl.endsWith("/") ? indexerUrl : indexerUrl + "/",
  );
  const client = target.pathname.split("/").filter(Boolean).at(-1);
  if (!client) throw new Error("Mock reader client is missing");
  return { client, kind, url: new URL("../", target).href };
}
export function connectSharedObjects(
  indexerUrl: string,
  seedHex: string,
): Promise<ListingSession> {
  const reader = createMockReader(connection(indexerUrl, "sharing-key"), {
    keyHex: seedHex,
    kind: "sharing-key",
  });
  return Promise.resolve({
    free() {
      void reader.close();
    },
    async objectSummaries(offset, limit, signal) {
      return (await reader.objects({ limit, offset, signal })).objects.map(
        (object) => ({
          free: () => undefined,
          id: object.id,
          metadata: object.metadata,
          size: object.sizeBytes,
        }),
      );
    },
  });
}
export async function openAuthRequest(
  indexerUrl: string,
): Promise<AuthRequest> {
  const credential = window.__siaDemoTest?.credential;
  if (!credential || credential.kind !== "registration")
    throw new Error("Registration access is unavailable");
  const auth = createMockAuth(
    connection(indexerUrl, "registration"),
    credential,
  );
  const request = await auth.requestConnection({
    description: APP_META.description,
    id: APP_ID,
    name: APP_META.name,
    serviceUrl: APP_META.serviceUrl,
  });
  return {
    free() {
      void auth.close();
    },
    matchesExistingAppKey: () => Promise.resolve(false),
    async register(phrase) {
      return session(await auth.register(request, phrase));
    },
    responseUrl: () => request.responseUrl,
    waitForApproval: () => auth.waitForApproval(request),
  };
}
function session(key: MockCredential): AuthSession {
  return {
    appKey: () => ({
      export: () => fromHex(key.keyHex),
      free: () => undefined,
    }),
    free: () => undefined,
  };
}
