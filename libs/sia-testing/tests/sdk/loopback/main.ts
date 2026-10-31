import { Builder, generateRecoveryPhrase, initSia, PinnedObject } from "@siafoundation/sia-storage";
import { enableStreaming, openStreams, type Streams } from "@siafoundation/sia-storage";

interface Evidence { bytes: number; controller: boolean; handshake: boolean; objectId: string; reconnected: boolean; released: boolean; releasedStatus: number; streaming: boolean; }
declare global { interface Window { __loopbackEvidence?: Evidence; } }

const status = document.querySelector<HTMLDivElement>("#status");
const metadata = { appId: "11".repeat(32), callbackUrl: undefined, description: "loopback", logoUrl: undefined, name: "loopback", serviceUrl: "https://example.invalid" };

async function connect(builder: Builder, mnemonic: string) {
  await builder.requestConnection();
  await fetch(builder.responseUrl(), { headers: { authorization: "Basic dGVzdDp0ZXN0" }, method: "POST" });
  await builder.waitForApproval();
  return builder.register(mnemonic);
}

async function run(): Promise<void> {
  const indexerUrl = new URL(new URLSearchParams(location.search).get("indexd") ?? "");
  await initSia();
  const builder = new Builder(indexerUrl.toString(), metadata);
  const sdk = await connect(builder, generateRecoveryPhrase());
  await sdk.account();
  const object = new PinnedObject();
  const key = sdk.appKey();
  object.seal(key);
  const reconnectBuilder = new Builder(indexerUrl.toString(), metadata);
  const reconnected = await reconnectBuilder.connected(key);
  if (!reconnected) throw new Error("App key did not reconnect");
  await reconnected.account();
  reconnected.free();
  reconnectBuilder.free();
  key.free();
  await sdk.pinObject(object);
  const pinned = await sdk.object(object.id());
  const handshake = await enableStreaming();
  const streams: Streams = openStreams(sdk, { appMeta: metadata, indexerUrl: indexerUrl.toString() });
  const file = await streams.url(pinned, { name: "empty.bin", type: "application/octet-stream" });
  const response = await fetch(file.url);
  const bytes = (await response.arrayBuffer()).byteLength;
  file.release();
  const releasedResponse = await fetch(file.url);
  const releasedStatus = releasedResponse.status;
  await releasedResponse.arrayBuffer();
  streams.close();
  pinned.free();
  sdk.free(); builder.free();
  window.__loopbackEvidence = { bytes, controller: navigator.serviceWorker.controller !== null, handshake, objectId: object.id(), reconnected: true, released: true, releasedStatus, streaming: file.url.startsWith(location.origin) };
  object.free();
  status!.textContent = "ready";
}

run().catch((error: unknown) => { console.error(error); if (status) status.textContent = "error"; });
