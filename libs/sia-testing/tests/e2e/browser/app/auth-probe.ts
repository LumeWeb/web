/** Runs browser control-plane flows without admin credentials or host payload transfers. */
import { releaseAll } from "./payload-checks.js";
import { browserPackedCancel } from "./packed-cancel.js";
import {
  AppKey,
  Builder,
  generateRecoveryPhrase,
  type HostQuery,
  initSia,
  type Sdk,
} from "@siafoundation/sia-storage";
import {
  deployedHostPages,
  recipientHostQueries,
  rejectSlabFreePin,
  sameAppSharingIsolation,
  sharingKeyPages,
} from "./metadata-checks.js";

let indexdURL: string;
let appID: string;
let mnemonic: string;
let sdk: Sdk | undefined;
let key: AppKey | undefined;
let pending: Builder | undefined;
let peerPending: Builder | undefined;
let peerSdk: Sdk | undefined;
let accountKey: string | undefined;
let peerAccountKey: string | undefined;

const builder = () =>
  new Builder(indexdURL, {
    appId: appID,
    callbackUrl: undefined,
    description: "Browser metadata checks",
    logoUrl: undefined,
    name: "Disposable browser metadata",
    serviceUrl: "https://example.invalid",
  });

function adopt(next: Sdk) {
  const nextKey = next.appKey();
  accountKey = nextKey.publicKey();
  key?.free();
  sdk?.free();
  key = nextKey;
  sdk = next;
  return key.publicKey();
}

const auth = {
  accountKey() {
    return accountKey;
  },
  async bufferedCancel() {
    if (!sdk) throw new Error("Browser account was not registered");
    return browserPackedCancel(sdk, [7, 0, 255]);
  },
  close() {
    const owned = [peerPending, peerSdk, pending, key, sdk];
    peerPending = undefined;
    peerSdk = undefined;
    pending = undefined;
    key = undefined;
    sdk = undefined;
    releaseAll(owned.map((value) => () => value?.free()));
  },
  async connect(seed: number[], invalidPhrase = false) {
    const request = builder();
    try {
      return adopt(
        await request.connectPreAuthorized(
          Uint8Array.from(seed),
          invalidPhrase ? "not a recovery phrase" : mnemonic,
        ),
      );
    } finally {
      request.free();
    }
  },
  async finishPhraseCheck() {
    if (!pending || !key) throw new Error("Phrase check was not requested");
    try {
      await pending.waitForApproval();
      const reconnecting = pending.reconnecting();
      const correct = await pending.matchesExistingAppKey(mnemonic);
      const wrong = await pending.matchesExistingAppKey(
        generateRecoveryPhrase(),
      );
      let invalidRejected = false;
      try {
        await pending.matchesExistingAppKey("not a recovery phrase");
      } catch {
        invalidRejected = true;
      }
      const previous = key.publicKey();
      const current = adopt(await pending.register(mnemonic));
      return {
        correct,
        invalidRejected,
        reconnecting,
        sameAccount: previous === current,
        wrong,
      };
    } finally {
      pending.free();
      pending = undefined;
    }
  },
  async hostPages() {
    if (!sdk) throw new Error("Browser account was not registered");
    return deployedHostPages(sdk);
  },
  async keyPages() {
    if (!sdk) throw new Error("Browser account was not registered");
    return sharingKeyPages(sdk);
  },
  peerAccountKey() {
    return peerAccountKey;
  },
  async queryHosts(query: HostQuery) {
    if (!sdk) throw new Error("Browser account was not registered");
    return sdk.hosts(query);
  },
  async recipientHosts() {
    if (!sdk) throw new Error("Browser account was not registered");
    return recipientHostQueries(sdk, indexdURL);
  },
  async registerPeer() {
    if (!peerPending) throw new Error("Same-app peer was not requested");
    try {
      await peerPending.waitForApproval();
      peerSdk = await peerPending.register(generateRecoveryPhrase());
      const peerKey = peerSdk.appKey();
      try {
        peerAccountKey = peerKey.publicKey();
        return peerAccountKey;
      } finally {
        peerKey.free();
      }
    } finally {
      peerPending.free();
      peerPending = undefined;
    }
  },
  async rejectEmptyPin() {
    if (!sdk) throw new Error("Browser account was not registered");
    return rejectSlabFreePin(sdk);
  },
  async requestPeer() {
    if (peerPending || peerSdk)
      throw new Error("Same-app peer is already pending or registered");
    peerPending = builder();
    await peerPending.requestConnection();
    return peerPending.responseUrl();
  },
  async requestPhraseCheck() {
    if (pending) throw new Error("Phrase check is already pending");
    pending = builder();
    await pending.requestConnection();
    return pending.responseUrl();
  },
  async sameAppIsolation() {
    if (!sdk || !peerSdk)
      throw new Error("Same-app accounts were not registered");
    return sameAppSharingIsolation(sdk, peerSdk, indexdURL);
  },
  setup(url: string, id: string) {
    const address = new URL(url);
    if (
      !["http:", "https:"].includes(address.protocol) ||
      !["127.0.0.1", "localhost"].includes(address.hostname) ||
      address.username ||
      address.password
    )
      throw new Error("Auth probe requires a loopback service");
    indexdURL = url;
    appID = id;
    mnemonic = generateRecoveryPhrase();
  },
  async snapshot() {
    if (!sdk || !key) throw new Error("Browser account was not registered");
    const owner = await sdk.account();
    return {
      accountKey: owner.accountKey,
      ownedKey: key.publicKey(),
      pinnedData: String(owner.pinnedData),
      pinnedSize: String(owner.pinnedSize),
    };
  },
};

declare global {
  interface Window {
    __browserAuth: typeof auth;
  }
}
await initSia();
window.__browserAuth = auth;
const status = document.querySelector("#status");
if (!status) throw new Error("Auth probe status element is missing");
status.textContent = "ready";
