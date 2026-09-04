import { afterEach, describe, expect, it, vi } from "vitest";

import { detectSolanaWallets, detectWallets } from "./detect";

type SolanaWindow = typeof window & {
  backpack?: unknown;
  phantom?: { solana?: unknown };
  solana?: unknown;
  solflare?: unknown;
};

function clearSolanaInjections() {
  const w = window as SolanaWindow;
  delete w.phantom;
  delete w.solflare;
  delete w.backpack;
  delete w.solana;
}

describe("wallet/detect — Solana injection probes", () => {
  afterEach(clearSolanaInjections);

  it("detects Phantom via window.phantom.solana with its base58 identity", () => {
    const phantomProvider = {
      signMessage: vi.fn(),
      publicKey: { toString: () => "Base58Pubkey1111" },
    };
    (window as SolanaWindow).phantom = { solana: phantomProvider };

    const detected = detectSolanaWallets();

    expect(detected).toEqual([
      {
        address: "Base58Pubkey1111",
        id: "phantom",
        name: "Phantom",
        network: "solana",
        provider: phantomProvider,
      },
    ]);
  });

  it("detects Solflare and Backpack under their native keys", () => {
    const solflare = { signMessage: vi.fn() };
    const backpack = { signMessage: vi.fn() };
    const w = window as SolanaWindow;
    w.solflare = solflare;
    w.backpack = backpack;

    const detected = detectSolanaWallets();

    expect(detected.map((wallet) => [wallet.id, wallet.name])).toEqual([
      ["solflare", "Solflare"],
      ["backpack", "Backpack"],
    ]);
    expect(detected[0]?.provider).toBe(solflare);
  });

  it("treats a generic window.solana aliasing Phantom as its alias — one pick", () => {
    const phantomProvider = {
      isPhantom: true,
      signMessage: vi.fn(),
      publicKey: { toString: () => "Base58Pubkey1111" },
    };
    const w = window as SolanaWindow;
    w.phantom = { solana: phantomProvider };
    w.solana = phantomProvider; // Phantom's standard alias injection.

    const detected = detectSolanaWallets();

    expect(detected).toHaveLength(1);
    expect(detected[0]).toMatchObject({ id: "phantom", name: "Phantom" });
  });

  it("names an unaliased generic window.solana by its is* flag (isPhantom, no window.phantom)", () => {
    (window as SolanaWindow).solana = {
      isPhantom: true,
      signMessage: vi.fn(),
      publicKey: { toString: () => "Base58Pubkey2222" },
    };

    const detected = detectSolanaWallets();

    expect(detected).toHaveLength(1);
    expect(detected[0]).toMatchObject({
      id: "phantom",
      name: "Phantom",
      network: "solana",
    });
  });

  it("falls back to a neutral label for a generic provider with no known flag", () => {
    (window as SolanaWindow).solana = {
      signMessage: vi.fn(),
      publicKey: { toString: () => "Base58Pubkey3333" },
    };

    const detected = detectSolanaWallets();

    expect(detected).toHaveLength(1);
    expect(detected[0]).toMatchObject({
      id: "solana",
      name: "Solana Wallet",
    });
  });

  it("detects nothing when no provider is injected", () => {
    expect(detectSolanaWallets()).toEqual([]);
  });

  it("detectWallets combines EVM and Solana detections", async () => {
    const w = window as SolanaWindow;
    w.solana = {
      isSolflare: true,
      signMessage: vi.fn(),
      publicKey: { toString: () => "Base58Pubkey4444" },
    };
    window.addEventListener("eip6963:requestProvider", () => {
      window.dispatchEvent(
        new CustomEvent("eip6963:announceProvider", {
          detail: {
            info: { name: "MetaMask", rdns: "io.metamask", uuid: "uuid-1" },
            provider: {},
          },
        }),
      );
    });

    const detected = await detectWallets(20);

    expect(detected.map((wallet) => wallet.network)).toEqual([
      "ethereum",
      "solana",
    ]);
    expect(detected[1]).toMatchObject({ id: "solflare", name: "Solflare" });
    delete w.solana;
  });
});
