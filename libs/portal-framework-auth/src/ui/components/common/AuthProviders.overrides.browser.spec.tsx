import { describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

import { AuthProviders } from "./AuthProviders";

/**
 * Brand-override browser spec: the generated map is mocked (build-time
 * output, gitignored) but the merge in SocialProviders.tsx runs for real,
 * so this verifies the full pipeline — generator data + providerOverrides
 * → SocialProviders → AuthProviders rendering.
 *
 * Google's Identity Branding Guidelines require the four-color G
 * (#4285F4 / #34A853 / #FBBC05 / #EA4335) on a white tile with a
 * #747775 border — never the mono SiGoogle glyph on a colored disc.
 * With the labeled-button layout the override classes surface on the
 * leading icon chip (the neutral vessel) inside the outline button.
 */
const { generatedMap, metaValue } = vi.hoisted(() => ({
  generatedMap: new Map([
    [
      "github",
      {
        bgColor: "bg-[#181717]",
        icon: (_props: Record<string, unknown>) => null,
        name: "Github",
      },
    ],
    // mono SiGoogle on colored disc — the generated default that the
    // override must replace
    [
      "google",
      {
        bgColor: "bg-[#4285F4]",
        icon: (_props: Record<string, unknown>) => (
          <svg data-testid="generated-si-google" viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="currentColor" />
          </svg>
        ),
        name: "Google",
      },
    ],
  ]),
  metaValue: ["google", "github"],
}));

vi.mock("@/ui/generated/social-providers.generated", () => ({
  default: generatedMap,
  socialLoginProviders: generatedMap,
}));

vi.mock("@/hooks/useSsoUrl", () => ({
  useSsoUrl: () => (providerId: string) => `/sso/${providerId}`,
}));

vi.mock("@lumeweb/portal-framework-ui", () => ({
  Input: "input",
  usePluginMeta: () => metaValue,
}));

vi.mock("@/ui/components/common/AuthConsentNotice", () => ({
  AuthConsentNotice: () => null,
}));

const GOOGLE_FILL_COLORS = [
  "#4285F4",
  "#34A853",
  "#FBBC05",
  "#EA4335",
];

describe("AuthProviders (per-provider brand overrides)", () => {
  it("renders google with the vendored four-color G on a neutral white bordered chip", async () => {
    render(<AuthProviders />);

    const button = page.getByRole("button", {
      name: "Continue with Google",
    });
    await expect.element(button).toBeInTheDocument();
    const el = button.element() as HTMLElement;

    // labeled button — visible text alongside the chip
    await expect.element(page.getByText("Continue with Google")).toBeInTheDocument();
    // the button itself is a plain outline row — no generated disc colors
    expect(el.className).not.toContain("bg-[#4285F4]");

    // neutral chip: white tile + #747775 border REPLACING the generated blue disc
    const chip = el.querySelector("span") as HTMLElement;
    expect(chip.className).toContain("bg-white");
    expect(chip.className).toContain("border-[#747775]");
    expect(chip.className).not.toContain("bg-[#4285F4]");

    // the vendored multicolor G (not the mono generated glyph)
    expect(el.querySelector('[data-testid="generated-si-google"]')).toBeNull();
    const svg = el.querySelector("svg");
    expect(svg).not.toBeNull();
    const fills = Array.from(
      (svg as SVGSVGElement).querySelectorAll("[fill]"),
    ).map((node) => node.getAttribute("fill"));
    for (const hex of GOOGLE_FILL_COLORS) {
      expect(fills).toContain(hex);
    }
  });

  it("keeps generic providers on the default chip (brand bg + white glyph)", async () => {
    render(<AuthProviders />);

    const githubButton = page.getByRole("button", {
      name: "Continue with Github",
    });
    await expect.element(githubButton).toBeInTheDocument();
    const el = githubButton.element() as HTMLElement;

    const chip = el.querySelector("span") as HTMLElement;
    // generated brand bg + default white-glyph treatment intact on the chip
    expect(chip.className).toContain("bg-[#181717]");
    expect(chip.className).toContain("text-white");

    // labeled list-style: the visible "Continue with Github" text is present
    await expect
      .element(page.getByText("Continue with Github"))
      .toBeInTheDocument();
  });
});
