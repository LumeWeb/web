import { afterEach, describe, expect, it } from "vitest";

import { detectEvmWallets } from "./detect";

const ANNOUNCE = "eip6963:announceProvider";
const REQUEST = "eip6963:requestProvider";

// Handlers stay tracked so tests cannot leak listeners into each other.
const requestHandlers: EventListener[] = [];

function onRequest(onRequestEvent: () => void) {
  const handler = () => onRequestEvent();
  window.addEventListener(REQUEST, handler);
  requestHandlers.push(handler);
}

function announce(
  rdns: string,
  name: string,
  icon?: string,
  uuid: string = rdns,
) {
  window.dispatchEvent(
    new CustomEvent(ANNOUNCE, {
      detail: {
        info: { name, rdns, uuid: `uuid-${uuid}`, ...(icon ? { icon } : {}) },
        provider: {},
      },
    }),
  );
}

afterEach(() => {
  for (const handler of requestHandlers) {
    window.removeEventListener(REQUEST, handler);
  }
  requestHandlers.length = 0;
});

describe("wallet/detect — EVM (EIP-6963 announcement scan)", () => {
  it("broadcasts eip6963:requestProvider and collects announced providers with their info", async () => {
    let requested = false;
    onRequest(() => {
      requested = true;
      announce("io.metamask", "MetaMask");
      announce("io.rabby", "Rabby");
    });

    const detected = await detectEvmWallets(20);

    expect(requested).toBe(true);
    expect(detected.map((wallet) => wallet.id)).toEqual([
      "io.metamask",
      "io.rabby",
    ]);
    expect(detected[0]).toMatchObject({
      name: "MetaMask",
      network: "ethereum",
      provider: {},
    });
    expect(detected[0]?.icon).toBeUndefined();
  });

  it("keeps the announced icon URI on the detection", async () => {
    onRequest(() => {
      announce(
        "io.metamask",
        "MetaMask",
        "data:image/svg+xml;base64,meta",
        "with-icon",
      );
    });

    const [metaMask] = await detectEvmWallets(20);
    expect(metaMask?.icon).toBe("data:image/svg+xml;base64,meta");
  });

  it("dedupes repeated announcements by rdns (wallets re-announce)", async () => {
    onRequest(() => {
      announce("io.metamask", "MetaMask");
      // Same rdns announced again with a different uuid — still one pick.
      announce("io.metamask", "MetaMask");
      // Distinct rdns still collects.
      announce("com.trustwallet.app", "Trust Wallet");
    });

    const detected = await detectEvmWallets(20);
    expect(detected.map((wallet) => wallet.id)).toEqual([
      "io.metamask",
      "com.trustwallet.app",
    ]);
  });

  it("ignores malformed announcements without rdns", async () => {
    onRequest(() => {
      window.dispatchEvent(new CustomEvent(ANNOUNCE, { detail: {} }));
      window.dispatchEvent(
        new CustomEvent(ANNOUNCE, { detail: { info: { rdns: "" } } }),
      );
      announce("io.metamask", "MetaMask");
    });

    const detected = await detectEvmWallets(20);
    expect(detected.map((wallet) => wallet.id)).toEqual(["io.metamask"]);
  });

  it("stops collecting after the window closes (listener removed)", async () => {
    // An announcement landing after the collection window closed is ignored.
    const afterWindow = new Promise<void>((resolve) => {
      window.setTimeout(() => {
        announce("io.rabby", "Rabby");
        resolve();
      }, 30);
    });
    const detected = await detectEvmWallets(10);
    await afterWindow;
    expect(detected).toEqual([]);
  });
});
