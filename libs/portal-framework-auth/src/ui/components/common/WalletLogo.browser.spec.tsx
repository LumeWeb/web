import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

import type { DetectedWallet } from "@/wallet/detect";

import { WalletLogo } from "./WalletLogo";

const VALID_PNG_URI =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

function wallet(over: Partial<DetectedWallet>): DetectedWallet {
  return {
    icon: undefined,
    id: "io.metamask",
    name: "MetaMask",
    network: "ethereum",
    provider: {},
    ...over,
  };
}

// Each case awaits visibility first (render commits async), then inspects.
describe("WalletLogo resolution", () => {
  it("renders a curated inline-SVG mark when the known id has an Icon", async () => {
    render(
      <WalletLogo
        wallet={wallet({ id: "com.coinbase.wallet", name: "Coinbase Wallet" })}
      />,
    );
    const vector = page.getByTestId("wallet-logo-vector");
    await expect.element(vector).toBeInTheDocument();
    const svg = vector.element().querySelector("svg");
    expect(svg?.innerHTML).toContain("#0052FF");
  });

  it("prefers a validated announced icon over the curated monogram for known ids", async () => {
    render(<WalletLogo wallet={wallet({ icon: VALID_PNG_URI })} />);
    const icon = page.getByTestId("wallet-logo-icon");
    await expect.element(icon).toBeInTheDocument();
    expect(icon.element().getAttribute("src")).toBe(VALID_PNG_URI);
    expect(page.getByTestId("wallet-logo-monogram").query()).toBeNull();
  });

  it("uses the curated brand-colour monogram when a known id has no SVG and no valid icon", async () => {
    render(<WalletLogo wallet={wallet({ icon: undefined })} />);
    const mono = page.getByTestId("wallet-logo-monogram");
    await expect.element(mono).toBeInTheDocument();
    expect(mono.element().textContent).toBe("M");
    expect(mono.element().className).toContain("bg-[#F6851B]");
    expect(page.getByTestId("wallet-logo-icon").query()).toBeNull();
  });

  it("rejects an unvalidated announced icon (svg) and falls back to the curated monogram", async () => {
    render(
      <WalletLogo
        wallet={wallet({ icon: "data:image/svg+xml,<svg onload=alert(1)>" })}
      />,
    );
    const mono = page.getByTestId("wallet-logo-monogram");
    await expect.element(mono).toBeInTheDocument();
    expect(page.getByTestId("wallet-logo-icon").query()).toBeNull();
    expect(mono.element().textContent).toBe("M");
  });

  it("uses a neutral grey disc for unknown wallets", async () => {
    render(
      <WalletLogo
        wallet={wallet({ id: "io.unknown-wallet", name: "Mystery" })}
      />,
    );
    const mono = page.getByTestId("wallet-logo-monogram");
    await expect.element(mono).toBeInTheDocument();
    expect(mono.element().textContent).toBe("M");
    expect(mono.element().className).toContain("bg-gray-500");
  });
});
