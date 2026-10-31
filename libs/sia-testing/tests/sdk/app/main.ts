import { setupWorker } from "msw/browser";
import { http, HttpResponse } from "msw";
import { createIndexdDispatcher } from "../../../src/dispatcher";
import { createIndexdModel } from "../../../src/model";
import { Builder, generateRecoveryPhrase, initSia, PinnedObject, SharedSdk } from "@siafoundation/sia-storage";

declare global {
  interface Window {
    __browserError?: string;
    __browserEvidence?: Awaited<ReturnType<typeof main>>;
    __dedicatedWorkerCheck: (url: string) => Promise<unknown>;
    __emulatorRequests: { account: null | string; path: string; }[];
    __stopEmulator: () => void;
  }
}

const status = document.querySelector<HTMLDivElement>("#status")!;
const model = createIndexdModel();
const dispatch = createIndexdDispatcher(model);
const worker = setupWorker(
  http.all("/auth", async ({ request }) => {
    const response = await dispatch(request);
    return new HttpResponse(await response.arrayBuffer(), { headers: response.headers, status: response.status });
  }),
  http.all("/auth/*", async ({ request }) => {
    const response = await dispatch(request);
    return new HttpResponse(await response.arrayBuffer(), { headers: response.headers, status: response.status });
  }),
  http.all("/account", async ({ request }) => {
    const response = await dispatch(request);
    return new HttpResponse(await response.arrayBuffer(), { headers: response.headers, status: response.status });
  }),
  http.all("/hosts", async ({ request }) => {
    const response = await dispatch(request);
    return new HttpResponse(await response.arrayBuffer(), { headers: response.headers, status: response.status });
  }),
  http.all("/slabs", async ({ request }) => {
    const response = await dispatch(request);
    return new HttpResponse(await response.arrayBuffer(), { headers: response.headers, status: response.status });
  }),
  http.all("/slabs/*", async ({ request }) => {
    const response = await dispatch(request);
    return new HttpResponse(await response.arrayBuffer(), { headers: response.headers, status: response.status });
  }),
  http.all("/objects", async ({ request }) => {
    const response = await dispatch(request);
    return new HttpResponse(await response.arrayBuffer(), { headers: response.headers, status: response.status });
  }),
  http.all("/objects/*", async ({ request }) => {
    const response = await dispatch(request);
    return new HttpResponse(await response.arrayBuffer(), { headers: response.headers, status: response.status });
  }),
  // MSW's path wildcard does not consume the slash in `/objects/:id/shared`;
  // register the nested shared-object route explicitly for dedicated workers.
  http.all(/\/objects\/[^/]+\/shared$/, async ({ request }) => {
    const response = await dispatch(request);
    return new HttpResponse(await response.arrayBuffer(), { headers: response.headers, status: response.status });
  }),
  http.all("/sharing*", async ({ request }) => {
    const response = await dispatch(request);
    return new HttpResponse(await response.arrayBuffer(), { headers: response.headers, status: response.status });
  }),
  http.all("/shared*", async ({ request }) => {
    const response = await dispatch(request);
    return new HttpResponse(await response.arrayBuffer(), { headers: response.headers, status: response.status });
  }),
  http.get("/browser/zero", () => new HttpResponse(new Uint8Array(0), { headers: { "content-type": "application/octet-stream" }, status: 200 })),
);

window.__stopEmulator = () => worker.stop();
const emulatorRequests: { account: null | string; path: string; }[] = [];
worker.events.on("request:start", ({ request }) => {
  const url = new URL(request.url);
  const encoded = url.searchParams.get("sc");
  let account = encoded;
  if (encoded) {
    try {
      const padded = encoded.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - encoded.length % 4) % 4);
      const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
      const decoded = new TextDecoder().decode(bytes);
      account = /^[\x20-\x7e]+$/.test(decoded) ? decoded : `ed25519:${[...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
    } catch {
      // Malformed auth must still be recorded so the request reaches the dispatcher.
    }
  }
  emulatorRequests.push({ account, path: url.pathname });
});
window.__emulatorRequests = emulatorRequests;

const metadata = {
  appId: "00".repeat(32),
  callbackUrl: undefined,
  description: "deterministic control-plane test",
  logoUrl: undefined,
  name: "Sia testing browser",
  serviceUrl: "https://example.invalid",
};

async function connect(builder: Builder, mnemonic: string) {
  await builder.requestConnection();
  // The model deliberately accepts opaque approval credentials. This is the same
  // browser HTTP approval/register path used by a real user, not a SDK mock.
  await fetch(builder.responseUrl(), { headers: { authorization: "Basic dGVzdDp0ZXN0" }, method: "POST" });
  await builder.waitForApproval();
  return builder.register(mnemonic);
}

async function main() {
  await worker.start({ onUnhandledRequest: "error", quiet: true });
  await initSia();
  const mnemonic = generateRecoveryPhrase();
  const builder = new Builder(location.origin, metadata);
  const sdk = await connect(builder, mnemonic);
  const account = await sdk.account();
  const key = sdk.appKey();
  const object = new PinnedObject();
  const sealed = object.seal(key);
  const reopened = PinnedObject.open(key, sealed);
  await sdk.pinObject(object);
  const fetched = await sdk.object(object.id());
  fetched.updateMetadata(new TextEncoder().encode("browser-metadata"));
  await sdk.updateObjectMetadata(fetched);
  const objectMetadata = new TextDecoder().decode((await sdk.object(object.id())).metadata());
  for (const id of ['11'.repeat(32), '22'.repeat(32)]) {
    model.seedObject(key.publicKey(), { id });
    model.deleteObject(key.publicKey(), id);
  }
  const beforeDelete = await sdk.objectEvents(null, 100);
  const cursorPage = await sdk.objectEvents(null, 1);
  const cursor = cursorPage[0] ? { after: cursorPage[0].updatedAt, id: cursorPage[0].id } : null;
  const afterCursor = cursor ? await sdk.objectEvents(cursor, 100) : [];

  const sharingKey = await sdk.createSharingKey("browser sharing");
  await sdk.shareObject(sharingKey, fetched);
  const ownerRecord = await sdk.sharingKey(sharingKey);
  const shared = await SharedSdk.connect(location.origin, sharingKey.seed());
  const sharedStats = await shared.stats();
  const sharedObjects = await shared.objects(0, 10);
  const sharedSummaries = await shared.objectSummaries(0, 10);
  const sharedObject = await shared.object(object.id());
  const shareUrl = sdk.objectShareUrl(fetched, new Date(Date.now() + 60_000));
  const shareUrlRecord = { objectID: object.id(), publicKey: new URL(shareUrl).searchParams.get("sc") ?? "" };
  const fromShareUrl = await sdk.objectFromShareUrl(shareUrl);
  const shareUrlMetadata = new TextDecoder().decode(fromShareUrl.metadata());
  await sdk.revokeSharingKey(sharingKey);
  let revoked = false;
  try { await shared.stats(); } catch { revoked = true; }

  const firstResult = await sdk.object(object.id());
  await sdk.deleteObject(object.id());
  const afterDelete = await sdk.objectEvents(null, 100);

  // Reconnect with the persisted app key and prove account retrieval is not a
  // registration shortcut. The model account remains independently scoped.
  const reconnectBuilder = new Builder(location.origin, metadata);
  const reconnected = await reconnectBuilder.connected(key);
  const reconnectAccount = reconnected ? await reconnected.account() : null;

  // A second real SDK registration must not observe or overwrite the first
  // account's object metadata, even when the deterministic empty object ID is
  // the same. Both reads below cross the browser SDK/control-plane boundary.
  const secondBuilder = new Builder(location.origin, metadata);
  const secondSdk = await connect(secondBuilder, generateRecoveryPhrase());
  const secondObject = new PinnedObject();
  secondObject.updateMetadata(new TextEncoder().encode("second-account-metadata"));
  await secondSdk.pinObject(secondObject);
  const secondResult = await secondSdk.object(secondObject.id());
  const unknownResponse = await fetch("/browser/not-registered");
  const evidence = {
    account: { key: account.accountKey, ready: !!account },
    accountIsolation: {
      firstMetadata: new TextDecoder().decode(firstResult.metadata()),
      sameObjectId: firstResult.id() === secondResult.id(),
      secondAccountKey: (await secondSdk.account()).accountKey,
      secondMetadata: new TextDecoder().decode(secondResult.metadata()),
    },
    afterCursor: afterCursor.map(event => ({ id: event.id, updatedAt: event.updatedAt })),
    cursor: cursor!,
    cursorPage: cursorPage.length,
    eventsAfterDelete: afterDelete.length,
    eventsBeforeDelete: beforeDelete.length,
    fetchedId: fetched.id(),
    metadata: objectMetadata,
    modelAccounts: model.snapshot().accounts.length,
    modelSnapshot: model.snapshot(),
    objectId: object.id(),
    reconnect: !!reconnectAccount,
    shareUrlMetadata,
    sharing: {
      modelKeyCount: model.snapshot().accounts.length,
      objectCount: sharedObjects.length,
      ownerDescription: ownerRecord.description,
      ownerObjectCount: ownerRecord.stats.objectCount,
      revoked,
      sharedId: sharedObject.id(),
      sharedMetadata: new TextDecoder().decode(sharedObject.metadata()),
      shareUrl: shareUrl.startsWith("sia://"),
      shareUrlObjectId: shareUrlRecord.objectID,
      shareUrlPublicKey: shareUrlRecord.publicKey,
      statsCount: sharedStats.objectCount,
      summaryCount: sharedSummaries.length,
    },
    unknownVisible: !unknownResponse.ok,
    zeroLength: object.size(),
  };
  reopened.free(); fetched.free(); fromShareUrl.free(); firstResult.free(); secondResult.free(); secondObject.free(); sharedObject.free(); sharedObjects.forEach((item) => item.free()); sharingKey.free(); key.free(); sdk.free(); secondSdk.free(); shared.free();
  ownerRecord.free();
  builder.free(); reconnectBuilder.free(); secondBuilder.free(); reconnected?.free();
  return evidence;
}

main().then((evidence) => {
  window.__browserEvidence = evidence;
  status.textContent = "ready";
}).catch((error) => { window.__browserError = String(error); console.error("browser app error", error); status.textContent = "error"; });

const workerSource = `self.onmessage = async ({ data }) => { try { const r = await fetch(data.url); self.postMessage({ ok: r.ok, bytes: (await r.arrayBuffer()).byteLength }); } catch (e) { self.postMessage({ error: String(e) }); } }`;
window.__dedicatedWorkerCheck = (url: string) => new Promise<unknown>((resolve) => {
  const dedicated = new Worker(URL.createObjectURL(new Blob([workerSource], { type: "text/javascript" })));
  dedicated.onmessage = (event) => { dedicated.terminate(); resolve(event.data); };
  dedicated.postMessage({ url: new URL(url, location.href).href });
});
