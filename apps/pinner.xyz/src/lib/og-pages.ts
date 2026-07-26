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
  {
    slug: "host",
    headline: "Host a website on independent providers.",
    subtitle:
      "Your files copied across independent providers, not one company's servers. Harder to take down.",
    subtitleSize: 24,
    footer: "Open source - Built on Sia",
  },
  {
    slug: "pin",
    headline: "Pin to IPFS with storage proofs.",
    subtitle:
      "Upload a file, get a CID. Hosts prove they're holding your data or they don't get paid.",
    subtitleSize: 24,
    footer: "Open source - Built on Sia",
  },
  {
    slug: "ens",
    headline: "Host your .eth website on independent providers.",
    subtitle:
      "Point your ENS name at content hosted on the Sia network. Two commands: upload and point.",
    subtitleSize: 24,
    footer: "Open source - Built on Sia",
  },
];
