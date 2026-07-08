import type { OGConfig } from "./og-template";

export interface OGPage extends OGConfig {
  slug: string;
}

export const OG_PAGES: OGPage[] = [
  {
    slug: "default",
    headline: "Storage and hosting where you're in control.",
    subtitle:
      "Store files, host websites, and keep your data private by default. One plan, no surprises.",
    subtitleSize: 24,
    footer: "Open source - Built on Sia",
  },
  {
    slug: "about",
    headline: "Your data. Your rules.",
    subtitle:
      "Independent, open-source storage that respects you.",
    footer: "Founder-owned. No investors. No exit strategy.",
  },
  {
    slug: "pricing",
    headline: "One plan. Every feature. No surprises.",
    subtitle:
      "Storage and bandwidth, priced upfront. No tiers to climb.",
    footer: "Card or crypto accepted",
  },
  {
    slug: "blog-default",
    headline: "The Pinner Blog",
    subtitle:
      "Technical deep dives, opinions, and updates on decentralized storage.",
    footer: "Open source - Built on Sia",
  },
];
