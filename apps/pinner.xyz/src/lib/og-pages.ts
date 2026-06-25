import type { OGConfig } from "./og-template";

export interface OGPage extends OGConfig {
  slug: string;
}

export const OG_PAGES: OGPage[] = [
  {
    slug: "default",
    headline: "Your data. Your rules.",
    subtitle: "IPFS pinning - S3-compatible storage - Static hosting",
    footer: "Card and crypto accepted - Priced upfront",
  },
  {
    slug: "about",
    headline: "Infrastructure that respects your data",
    subtitle: "Open source - Built on Sia network - Priced upfront",
  },
  {
    slug: "pricing",
    headline: "Simple, transparent pricing",
    subtitle:
      "Storage and bandwidth, priced upfront - Encrypted private storage - Card and crypto accepted",
    subtitleSize: 20,
  },
];
