import { describe, expect, it, vi } from "vitest";

import socialLoginProviders from "./SocialProviders";

// The generated module is build-time output and gitignored — mock it so the
// merge works hermetically (and never hits the network).
const { generatedMap, sentinelIcon } = vi.hoisted(() => {
  const sentinelIcon = (_props: Record<string, unknown>) => null;
  const generatedMap = new Map([
    [
      "github",
      {
        bgColor: "bg-[#181717]",
        icon: (_props: Record<string, unknown>) => null,
        name: "Github",
      },
    ],
    // has a real override in providerOverrides.ts → must be swapped
    [
      "google",
      {
        bgColor: "bg-[#4285F4]",
        icon: sentinelIcon,
        name: "Google",
      },
    ],
    // icon-less entry: generator emits providers simple-icons + Font Awesome
    // cannot resolve, consumers must cope with a missing `icon`.
    ["openid-connect", { bgColor: "bg-[#F78C40]", name: "OpenID" }],
  ]);
  return { generatedMap, sentinelIcon };
});

vi.mock("@/ui/generated/social-providers.generated", () => ({
  default: generatedMap,
  socialLoginProviders: generatedMap,
}));

describe("SocialProviders (merge of generated map + providerOverrides)", () => {
  it("exposes the same provider ids as the generated map", () => {
    expect(socialLoginProviders.size).toBe(generatedMap.size);
    for (const [id] of generatedMap) {
      expect(socialLoginProviders.has(id as string)).toBe(true);
    }
    // the merged map is a derivation, not the generated instance itself
    expect(socialLoginProviders).not.toBe(generatedMap);
  });

  it("preserves the consumer entry shape: { name, bgColor, icon?, className? }", () => {
    for (const [id, provider] of socialLoginProviders) {
      expect(idsAreProviderSlugs(id)).toBe(true);
      expect(typeof provider["name"]).toBe("string");
      expect(provider["name"].length).toBeGreaterThan(0);
      expect(typeof provider["bgColor"]).toBe("string");
      // icon is optional (undefined for unresolvable ids) but otherwise fn
      if (provider["icon"] !== undefined) {
        expect(typeof provider["icon"]).toBe("function");
      }
      // className is the final-form tile field: either undefined or a
      // non-empty tailwind class string (never the generated bg re-stated)
      if (provider["className"] !== undefined) {
        expect(provider["className"].length).toBeGreaterThan(0);
      }
    }
    expect(socialLoginProviders.get("github")?.name).toBe("Github");
    expect(socialLoginProviders.get("github")?.className).toBeUndefined();
    expect(socialLoginProviders.get("openid-connect")?.icon).toBeUndefined();
  });

  it("applies the google override with precedence over generated data", () => {
    const google = socialLoginProviders.get("google");
    expect(google).toBeDefined();
    // generated mono SiGoogle icon replaced by the vendored component
    expect(google?.icon).not.toBe(sentinelIcon);
    // final-form tile classes replacing the generated blue disc
    expect(google?.className).toContain("bg-white");
    expect(google?.className).toContain("border-[#747775]");
  });

  it("leaves providers without an override untouched", () => {
    const github = socialLoginProviders.get("github");
    expect(github?.bgColor).toBe("bg-[#181717]");
    expect(github?.icon).toBe(generatedMap.get("github")?.icon);
  });

  it("marks exactly the override-backed providers with a final-form className (neutral chip contract)", () => {
    // AuthProviders renders a neutral icon chip (e.g. white bg + border)
    // exactly when `className` is present; everything else gets the default
    // brand-bg disc. Pin the marker to providerOverrides entries only.
    const overrideIds = [...socialLoginProviders.entries()]
      .filter(([, provider]) => provider.className !== undefined)
      .map(([id]) => id);
    expect(overrideIds).toEqual(["google"]);
  });
});

function idsAreProviderSlugs(id: string) {
  return /^[a-z0-9][a-z0-9-_.]*$/i.test(id);
}
