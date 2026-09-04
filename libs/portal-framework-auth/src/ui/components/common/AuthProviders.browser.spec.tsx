import { describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

import { AuthProviders } from "./AuthProviders";

// --- mocks: everything except the provider-stack rendering is stubbed ---
const { generatedMap, meta } = vi.hoisted(() => ({
  generatedMap: new Map<string, Record<string, unknown>>([
    [
      "google",
      { bgColor: "bg-[#4285F4]", icon: () => null, name: "Google" },
    ],
    // known id without resolvable icon → letter fallback on brand disc
    ["microsoftonline", { bgColor: "bg-[#00A4EF]", name: "Microsoft" }],
  ]),
  // mutable so each scenario can select its provider count (Sheet threshold)
  meta: {
    current: [
      "google",
      "microsoftonline",
      "steampunkops",
      "brand_new_gitlab",
      "discord",
    ],
  },
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

vi.mock("@/ui/components/common/AuthConsentNotice", () => ({
  AuthConsentNotice: () => null,
}));

function buttonChip(buttonName: string): HTMLElement {
  const el = page
    .getByRole("button", { name: buttonName })
    .element() as HTMLElement;
  return el.querySelector("span") as HTMLElement;
}

describe("AuthProviders (labeled provider stack + Sheet overflow)", () => {
  it("renders labeled full-width buttons with icon chips (brand disc or lettered fallback)", async () => {
    render(<AuthProviders />);

    for (const name of ["Google", "Microsoft"]) {
      await expect
        .element(page.getByText(`Continue with ${name}`))
        .toBeInTheDocument();
    }

    // known id with icon → icon inside the chip, not a letter fallback
    // (the mocked generated icon renders null, so neither svg nor letter span)
    const googleChip = buttonChip("Continue with Google");
    expect(googleChip.querySelector("span")).toBeNull();

    // known but icon-less id → brand-bg disc + white glyph (letter fallback)
    const msChip = buttonChip("Continue with Microsoft");
    expect(msChip.className).toContain("bg-[#00A4EF]");
    expect(msChip.className).toContain("text-white");
    expect(msChip.textContent).toBe("M");

    // visible outline buttons are the full column (match wallet sizing)
    const googleButton = page
      .getByRole("button", { name: "Continue with Google" })
      .element() as HTMLElement;
    expect(googleButton.className).toContain("w-full");
  });

  it("keeps the visible-count/Sheet behavior (> 3 live providers: 2 labeled + More options)", async () => {
    render(<AuthProviders />);

    for (const name of ["Google", "Microsoft"]) {
      await expect
        .element(page.getByText(`Continue with ${name}`))
        .toBeInTheDocument();
    }

    // overflow providers are not stacked before opening the Sheet
    expect(
      page.getByRole("button", { name: "Continue with Discord" }).query(),
    ).toBeNull();

    await expect
      .element(page.getByText("More login options"))
      .toBeInTheDocument();

    await page.getByRole("button", { name: "More login options" }).click();

    await expect
      .element(page.getByText("Continue with Discord"))
      .toBeInTheDocument();
    // unknown id humanized in the sheet too (with letter fallback)
    await expect
      .element(page.getByText("Continue with Brand New Gitlab"))
      .toBeInTheDocument();

    const sheetChip = page
      .getByRole("button", { name: "Continue with Brand New Gitlab" })
      .element()
      .querySelector("span") as HTMLElement;
    // fully unknown id → not dropped; humanized name + neutral disc + initial
    expect(sheetChip.className).toContain("bg-gray-500");
    expect(sheetChip.textContent).toBe("B");
  });

  it("renders all labeled buttons and NO Sheet when there are 3 or fewer live providers", async () => {
    meta.current = ["google", "microsoftonline", "steampunkops"];
    render(<AuthProviders />);

    for (const name of ["Google", "Microsoft", "Steampunkops"]) {
      await expect
        .element(page.getByText(`Continue with ${name}`))
        .toBeInTheDocument();
    }

    expect(
      page.getByRole("button", { name: "More login options" }).query(),
    ).toBeNull();

    // unknown id renders on the primary stack with the neutral-disc fallback
    const unknownChip = buttonChip("Continue with Steampunkops");
    expect(unknownChip.className).toContain("bg-gray-500");
    expect(unknownChip.textContent).toBe("S");
  });
});
