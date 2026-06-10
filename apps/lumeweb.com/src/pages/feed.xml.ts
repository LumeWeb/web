import rss from "@astrojs/rss";
import type { APIContext } from "astro";

const pages = [
  {
    title: "Lume Web - Your Open Web",
    description:
      "Lume Web is building the open, user-owned web. Privacy-respecting tools, decentralized storage, and censorship-resistant infrastructure for everyone.",
    link: "/",
  },
  {
    title: "Services - Lume Web",
    description:
      "Explore Lume Web services: decentralized web hosting, IPFS pinning, and private storage powered by the Sia network.",
    link: "/services/",
  },
  {
    title: "Community Projects - Lume Web",
    description:
      "Community projects building on Lume Web's open infrastructure. Join developers creating the decentralized web.",
    link: "/projects/",
  },
  {
    title: "Principles - Lume Web",
    description:
      "Our core principles: user ownership, privacy by default, open source, and censorship resistance. The web should work for people.",
    link: "/principles/",
  },
  {
    title: "Donate - Lume Web",
    description:
      "Support Lume Web's mission to build the open, user-owned web. Donate with cryptocurrency or fiat to fund decentralized infrastructure.",
    link: "/donate/",
  },
];

export async function GET(context: APIContext) {
  return rss({
    title: "Lume Web",
    description:
      "A platform, network and experience that allows you to control and own your online web.",
    site: context.site!.href,
    items: pages.map((page) => ({
      title: page.title,
      description: page.description,
      link: page.link,
      pubDate: new Date("2025-01-01"),
    })),
  });
}
