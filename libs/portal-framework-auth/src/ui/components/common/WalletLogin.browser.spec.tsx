import { beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

import type { DetectedWallet } from "@/wallet/detect";
import WalletLogin from "./WalletLogin";

// Mutable fixture so each scenario can choose its detected wallet set.
const fixtures = vi.hoisted(() => ({
  detected: [] as DetectedWallet[],
  signInCalls: [] as DetectedWallet[],
}));

vi.mock("@/wallet/detect", () => ({
  detectWallets: () => Promise.resolve(fixtures.detected),
}));

vi.mock("@/hooks/useWalletLogin", () => ({
  useWalletLogin: () => ({
    isConnecting: false,
    isSigning: false,
    signInWith: (wallet: DetectedWallet) => {
      fixtures.signInCalls.push(wallet);
      return Promise.resolve();
    },
  }),
}));

// A valid small base64 png so `sanitizeWalletIcon` accepts it on the row.
const VALID_PNG_URI =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const META_MASK: DetectedWallet = {
  icon: VALID_PNG_URI,
  id: "io.metamask",
  name: "MetaMask",
  network: "ethereum",
  provider: {},
};

const PHANTOM: DetectedWallet = {
  address: "Base58Pubkey1111",
  id: "phantom",
  name: "Phantom",
  network: "solana",
  provider: {},
};

async function clickTrigger() {
  await page.getByRole("button", { name: "Continue with wallet" }).click();
}

describe("WalletLogin picker", () => {
  beforeEach(() => {
    fixtures.detected = [];
    fixtures.signInCalls = [];
  });

  it("one detected wallet → connect + sign directly (no picker)", async () => {
    fixtures.detected = [META_MASK];
    render(<WalletLogin />);

    await clickTrigger();

    expect(fixtures.signInCalls).toEqual([META_MASK]);
    // No sheet/group content leaked into the page.
    expect(page.getByText("Ethereum").query()).toBeNull();
  });

  it("zero detected wallets → error on click, no sign-in attempt", async () => {
    fixtures.detected = [];
    render(<WalletLogin />);

    await clickTrigger();

    await expect
      .element(page.getByText(/No wallet detected/))
      .toBeInTheDocument();
    expect(fixtures.signInCalls).toHaveLength(0);
  });

  it("multiple wallets → picker Sheet with only-detected network groups, icons, and row targets", async () => {
    fixtures.detected = [META_MASK, PHANTOM];
    render(<WalletLogin />);

    await clickTrigger();

    // Both groups render… labeled "Ethereum" / "Solana".
    for (const group of ["Ethereum", "Solana"]) {
      await expect.element(page.getByText(group)).toBeInTheDocument();
    }
    await expect
      .element(page.getByRole("button", { name: "Continue with MetaMask" }))
      .toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { name: "Continue with Phantom" }))
      .toBeInTheDocument();

    // Announced icon URI renders as an img on the row (the wallet's own
    // icon wins for a known id that has no curated SVG mark).
    const metaMaskRow = page
      .getByRole("button", { name: "Continue with MetaMask" })
      .element() as HTMLElement;
    const icon = metaMaskRow.querySelector("img");
    expect(icon?.getAttribute("src")).toBe(VALID_PNG_URI);

    // Solana row without an icon → initial fallback chip instead of img.
    const phantomRow = page
      .getByRole("button", { name: "Continue with Phantom" })
      .element() as HTMLElement;
    expect(phantomRow.querySelector("img")).toBeNull();
    expect(phantomRow.textContent).toContain("Continue with Phantom");

    // Picking a row routes into the sign-in flow and closes the sheet.
    await page.getByRole("button", { name: "Continue with Phantom" }).click();
    expect(fixtures.signInCalls).toEqual([PHANTOM]);
  });

  it("a network with zero detections shows no group header for it", async () => {
    fixtures.detected = [PHANTOM, { ...PHANTOM, id: "solflare", name: "Solflare" }];
    render(<WalletLogin />);

    await clickTrigger();

    await expect.element(page.getByText("Solana")).toBeInTheDocument();
    expect(page.getByText("Ethereum").query()).toBeNull();
  });
});
