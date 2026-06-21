import Section from "@/components/layout/Section";
import { cn } from "@/lib/utils";

interface CardProps {
  title: string;
  description: React.ReactNode;
  cta: string;
  href: string;
  soon?: boolean;
}

const cards: CardProps[] = [
  {
    title: "Website Hosting",
    description: (
      <>
        Host static websites on a peer-to-peer network. Replicas across independent providers, not one company's server.
        <br /><br />
        Pin a zip or upload your build folder: CLI, GitHub Action, and API available.
      </>
    ),
    cta: "Quick start →",
    href: "/solutions/website-hosting",
  },
  {
    title: "IPFS Pinning",
    description:
      "Pin files on a peer-to-peer network. They stay online as long as they're pinned.",
    cta: "Start Pinning →",
    href: "/solutions/ipfs-pinning",
  },
  {
    title: "S3 Storage",
    description:
      "S3-compatible object storage backed by the Sia network. Run your own gateway appliance.",
    cta: "S3 Compatible →",
    href: "/solutions/s3-storage",
    soon: true,
  },
  {
    title: "Private Storage",
    description:
      "Encrypted storage where only you hold the keys. Personal use or build apps on the Sia network.",
    cta: "Store Privately →",
    href: "/solutions/private-storage",
    soon: true,
  },
];

const ProductCards = () => {
  return (
    <Section variant="dark" padding="md">
      <div className="xl:container px-6">
        <h2 className="text-home-text text-2xl lg:text-3xl font-semibold text-center mb-2">
          Four ways to store
        </h2>
        <p className="text-home-text-muted text-sm text-center mb-10">
          Simple tiered pricing. Priced upfront, no seats.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <a
              key={card.href}
              href={card.href}
              className={cn(
                "group flex flex-col rounded-lg border border-home-text/10 p-6 lg:p-8",
                "transition-colors duration-200 hover:border-home-text/30"
              )}
            >
              {card.soon && (
                <span className="inline-block text-xs font-medium text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded mb-3 w-fit">
                  Coming Soon
                </span>
              )}
              <h3 className="text-home-text text-lg font-semibold mb-3">
                {card.title}
              </h3>
              <p className="text-home-text-muted text-sm leading-relaxed mb-4">
                {card.description}
              </p>
              <span className="text-home-text text-sm font-medium group-hover:underline mt-auto">
                {card.cta}
              </span>
            </a>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default ProductCards;
