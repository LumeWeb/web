import { describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

import { AuthConsentNotice } from "./AuthConsentNotice";
import { AuthProviders } from "./AuthProviders";
import WalletLogin from "./WalletLogin";

/**
 * Consent-dedupe browser spec.
 *
 * AuthConsentNotice is rendered once per auth page, by AuthProviders in the
 * last provider slot; WalletLogin renders no copy of its own. These specs
 * render the same WalletLogin + AuthProviders composition the index pages
 * use (login, register, app-login) with the real AuthConsentNotice and both
 * feature flags on, so the "By continuing, you agree to the Terms of Service
 * and Privacy Policy" line can only appear once.
 */

// --- mocks: hook/routing edges only; AuthConsentNotice stays real ---
const { generatedMap, meta } = vi.hoisted(() => ({
  generatedMap: new Map<string, Record<string, unknown>>([
    ["google", { bgColor: "bg-[#4285F4]", icon: () => null, name: "Google" }],
    ["microsoftonline", { bgColor: "bg-[#00A4EF]", name: "Microsoft" }],
  ]),
  meta: { current: ["google", "microsoftonline"] },
}));

vi.mock("@/hooks/useWalletLogin", () => ({
  useWalletLogin: () => ({
    connectAndSignIn: vi.fn(),
    isConnecting: false,
    isSigning: false,
  }),
}));

vi.mock("@/ui/components/common/SocialProviders", () => ({
  default: generatedMap,
}));

vi.mock("@/hooks/useSsoUrl", () => ({
  useSsoUrl: () => (providerId: string) => `/sso/${providerId}`,
}));

vi.mock("@lumeweb/portal-framework-ui", () => ({
  Input: "input",
  usePluginMeta: () => meta.current,
}));

function countConsentTextNodes(): number {
  let count = 0;
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
  );
  while (walker.nextNode()) {
    if (
      (walker.currentNode.textContent ?? "").includes(
        "By continuing, you agree to the",
      )
    ) {
      count += 1;
    }
  }
  return count;
}

/**
 * Same composition as LoginIndex/RegisterIndex/AppLoginStep with both
 * wallet_login + social_login flags on (wallet slot above social slot,
 * preserving the live visual order).
 */
function ProviderStack() {
  return (
    <>
      <div className="mb-5 w-full">
        <WalletLogin />
      </div>
      <div className="mb-5 w-full">
        <AuthProviders />
      </div>
    </>
  );
}

describe("AuthConsentNotice dedupe (wallet + social slots together)", () => {
  it("renders the consent notice EXACTLY ONCE when both wallet and social slots render", async () => {
    render(<ProviderStack />);

    // Both slots actually rendered (so the assertion has teeth).
    await expect
      .element(page.getByRole("button", { name: "Continue with wallet" }))
      .toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { name: "Continue with Google" }))
      .toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { name: "Continue with Microsoft" }))
      .toBeInTheDocument();

    expect(countConsentTextNodes()).toBe(1);
  });

  it("keeps the visual order: wallet stack → social stack → single consent line", async () => {
    render(<ProviderStack />);

    await expect
      .element(page.getByRole("button", { name: "Continue with wallet" }))
      .toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { name: "Continue with Google" }))
      .toBeInTheDocument();

    const walletButton = page
      .getByRole("button", { name: "Continue with wallet" })
      .element() as HTMLElement;
    const socialButton = page
      .getByRole("button", { name: "Continue with Google" })
      .element() as HTMLElement;

    const consentNodes = Array.from(
      document.body.querySelectorAll("p"),
    ).filter((p) =>
      p.textContent?.includes("By continuing, you agree to the"),
    );
    expect(consentNodes).toHaveLength(1);
    const consent = consentNodes[0];

    // Document order: consent comes after both the wallet and social slots.
    expect(
      walletButton.compareDocumentPosition(consent) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      socialButton.compareDocumentPosition(consent) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});

describe("wallet-only face (social_login flag off → AuthProviders not rendered)", () => {
  it("WalletLogin itself renders no consent line (the caller's slot owns it)", async () => {
    // With the social flag off the caller renders AuthConsentNotice below
    // the wallet; this pin keeps WalletLogin itself free of any consent
    // copy so the page never shows two.
    render(<WalletLogin />);

    await expect
      .element(page.getByRole("button", { name: "Continue with wallet" }))
      .toBeInTheDocument();
    expect(countConsentTextNodes()).toBe(0);
  });

  it("face composition renders the consent line once, below the wallet", async () => {
    // Composition the faces render when wallet_login is on and social_login
    // is off: WalletLogin plus a caller-rendered AuthConsentNotice.
    render(
      <div className="mb-5 w-full">
        <WalletLogin />
        <AuthConsentNotice className="mt-4" />
      </div>,
    );

    await expect
      .element(page.getByRole("button", { name: "Continue with wallet" }))
      .toBeInTheDocument();
    expect(countConsentTextNodes()).toBe(1);
  });
});
