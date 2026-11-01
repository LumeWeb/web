/** Runs real browser upload/download calls without installing MSW. */
import { createSDKDiagnostics } from "../../support/sdk-diagnostics.js";
import { summaryChecks } from "./summary-checks.js";
import { expiryChecks } from "./expiry-checks.js";
import {
  payloadChecks,
  preservingFailure,
  releaseAll,
} from "./payload-checks.js";
import { accountingChecks } from "./accounting-checks.js";
import {
  browserDeletionEvent,
  browserDetach,
  browserEventPages,
  browserOwnerIsolation,
} from "./event-sharing-checks.js";
import { referenceChecks } from "./reference-checks.js";
import { waitForFundingReady } from "../../support/funding-readiness.js";
import {
  type AppMetadata,
  Builder,
  generateRecoveryPhrase,
  PinnedObject,
  type Sdk,
} from "@siafoundation/sia-storage";
export type BrowserProbe = ReturnType<typeof createBrowserHarness>;

export function createBrowserHarness(diagnostics = createSDKDiagnostics()) {
  let builder: Builder | undefined,
    object: PinnedObject | undefined,
    sdk: Sdk | undefined;
  let accountKey: string | undefined,
    appMeta: AppMetadata,
    indexerUrl = "";
  let peerBuilder: Builder | undefined,
    peerKey: string | undefined,
    peerMeta: AppMetadata,
    peerSdk: Sdk | undefined;
  let reference: ReturnType<typeof referenceChecks> | undefined;
  let summaries: ReturnType<typeof summaryChecks> | undefined;
  let expiry: ReturnType<typeof expiryChecks> | undefined;

  let closed = false,
    connecting = false,
    peerConnecting = false,
    uploading = false;
  function close() {
    if (closed) return;
    closed = true;
    const releases = [expiry, summaries, reference].map(
      (value) => () => value?.close(),
    );
    const ownedBuilder = builder,
      ownedObject = object,
      ownedSDK = sdk;
    expiry = summaries = reference = undefined;
    object = sdk = builder = undefined;
    releaseAll([
      ...releases,
      disconnectPeer,
      () => ownedObject?.free(),
      () => ownedSDK?.free(),
      () => ownedBuilder?.free(),
    ]);
  }
  function disconnectPeer() {
    const connected = peerSdk,
      pending = peerBuilder;
    peerSdk = peerBuilder = undefined;
    releaseAll([() => connected?.free(), () => pending?.free()]);
  }
  function active() {
    if (closed) throw new Error("Browser harness is closed");
  }
  function owner() {
    active();
    if (!sdk) throw new Error("Owner SDK is not connected");
    return sdk;
  }
  async function registerPeer() {
    active();
    if (peerSdk || peerConnecting)
      throw new Error("Peer SDK is already connected or registering");
    if (!peerBuilder) throw new Error("Peer connection was not requested");
    peerConnecting = true;
    try {
      await peerBuilder.waitForApproval();
      peerSdk = await peerBuilder.register(generateRecoveryPhrase());
      return recordIdentity(peerSdk, (key) => {
        peerKey = key;
      });
    } finally {
      peerConnecting = false;
    }
  }
  async function waitReady(connected: Sdk) {
    await waitForFundingReady(async () => (await connected.account()).ready);
  }
  async function withPinnedFixture<T>(
    run: (sdk: Sdk, fixture: PinnedObject) => Promise<T>,
  ): Promise<T> {
    if (!object) throw new Error("Payload fixture was not uploaded");
    return preservingFailure(() => run(owner(), object!), close);
  }
  return {
    get accounting() {
      return accountingChecks(owner());
    },
    accountKey() {
      return accountKey;
    },
    appID() {
      return appMeta.appId;
    },
    close,
    closePeer() {
      const retained = reference;
      reference = undefined;
      releaseAll([() => retained?.close(), disconnectPeer]);
    },
    async connect() {
      active();
      if (sdk || connecting)
        throw new Error("Owner SDK is already connected or registering");
      if (!builder) throw new Error("Owner connection was not requested");
      connecting = true;
      try {
        await builder.waitForApproval();
        sdk = await builder.register(generateRecoveryPhrase());
        return recordIdentity(sdk, (key) => {
          accountKey = key;
        });
      } finally {
        connecting = false;
      }
    },
    deletionEvent() {
      return withPinnedFixture(browserDeletionEvent);
    },
    async destinationContainsSource() {
      if (!reference) throw new Error("Reference was not prepared");
      return await reference.destinationContainsSource();
    },
    detachSharing() {
      return withPinnedFixture((connected, fixture) =>
        browserDetach(connected, fixture, indexerUrl),
      );
    },
    diagnostics() {
      return diagnostics.snapshot();
    },
    eventPages() {
      return withPinnedFixture(browserEventPages);
    },
    expiryDenyFresh() {
      if (!expiry) throw new Error("Expiry fixture is not prepared");
      return expiry.denyFresh();
    },
    expiryFreshAuthorized() {
      if (!expiry) throw new Error("Expiry fixture is not prepared");
      return expiry.freshAuthorized();
    },
    expiryOwnerRead() {
      if (!expiry) throw new Error("Expiry fixture is not prepared");
      return expiry.readOwner();
    },
    expiryProgress() {
      if (!expiry) throw new Error("Expiry fixture is not prepared");
      return expiry.progress();
    },
    expiryRecipientRead() {
      if (!expiry) throw new Error("Expiry fixture is not prepared");
      return expiry.readRecipient();
    },
    expiryRevoke() {
      if (!expiry) throw new Error("Expiry fixture is not prepared");
      return expiry.revoke();
    },
    async finishReference() {
      if (!reference) throw new Error("Reference was not prepared");
      return await reference.finish();
    },
    async importReference(scoped: boolean) {
      if (!reference) throw new Error("Reference was not prepared");
      return await reference.import(scoped);
    },
    ownerIsolation() {
      return withPinnedFixture(async (connected, fixture) => {
        if (!peerSdk) throw new Error("Foreign SDK is not connected");
        return browserOwnerIsolation(connected, fixture, indexerUrl, peerSdk);
      });
    },
    get payload() {
      return payloadChecks(owner(), { appMeta, indexerUrl });
    },
    peerAccountKey() {
      return peerKey;
    },
    async prepareExpiry(expiresAtMs?: number) {
      if (!object || expiry)
        throw new Error("Expiry fixture is absent or already prepared");
      expiry = expiryChecks(owner(), object, indexerUrl);
      return expiry.prepare(expiresAtMs);
    },
    async prepareReference() {
      if (reference) throw new Error("Reference is already prepared");
      if (!peerSdk) throw new Error("Peer SDK is not connected");
      reference = referenceChecks(
        owner(),
        peerSdk,
        { appMeta: peerMeta, indexerUrl },
        disconnectPeer,
      );
      await reference.prepare();
    },
    async prepareSummaries() {
      if (!object || summaries)
        throw new Error("Summary fixture is absent or already prepared");
      summaries = summaryChecks(owner(), object, indexerUrl);
      await summaries.prepare();
    },
    registerPeer,
    async request(url: string, appId: string) {
      active();
      if (builder) throw new Error("Owner connection is already requested");
      indexerUrl = url;
      appMeta = {
        appId,
        callbackUrl: undefined,
        description: "Local host transport diagnosis",
        logoUrl: undefined,
        name: "Disposable browser probe",
        serviceUrl: "https://example.invalid",
      };
      builder = new Builder(url, appMeta);
      await builder.requestConnection();
      return builder.responseUrl();
    },
    async requestPeer(appId: string) {
      owner();
      if (peerBuilder || peerSdk)
        throw new Error("Peer connection is already requested");
      peerMeta = { ...appMeta, appId, name: "Reference destination" };
      peerBuilder = new Builder(indexerUrl, peerMeta);
      await peerBuilder.requestConnection();
      return peerBuilder.responseUrl();
    },
    async summaries() {
      if (!summaries) throw new Error("Summary fixture was not prepared");
      return summaries.list();
    },
    async summaryBytes() {
      if (!summaries) throw new Error("Summary fixture was not prepared");
      return preservingFailure(() => summaries!.finish(), close);
    },
    async upload() {
      const connected = owner();
      if (object || uploading)
        throw new Error("Payload fixture is already uploaded or pending");
      uploading = true;
      try {
        object = await connected.upload(
          new PinnedObject(),
          new ReadableStream<Uint8Array>({
            start(controller) {
              controller.enqueue(new Uint8Array([42]));
              controller.close();
            },
          }),
        );
        await connected.pinObject(object);
        return { id: object.id() };
      } finally {
        uploading = false;
      }
    },
    waitPeerReady() {
      if (!peerSdk) throw new Error("Peer SDK is not connected");
      return waitReady(peerSdk);
    },
    waitReady() {
      return waitReady(owner());
    },
  };
}
function recordIdentity(connected: Sdk, record: (key: string) => void) {
  const key = connected.appKey();
  try {
    const identity = key.publicKey();
    // Cleanup still needs the registered account if releasing its temporary key fails.
    record(identity);
    return identity;
  } finally {
    key.free();
  }
}
