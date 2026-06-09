import Section from "@/components/layout/Section";
import { cn } from "@/lib/utils";

interface UseCaseCardProps {
  title: string;
  description: string;
  cta: string;
  href: string;
}

const useCases: UseCaseCardProps[] = [
  {
    title: "Private AI & RAG Pipelines",
    description:
      "Store embeddings, vector databases, and knowledge bases with zero-knowledge encryption. Your AI data stays fully private, even from us.",
    cta: "Store Privately →",
    href: "/solutions/private-storage",
  },
  {
    title: "Client & Project Files for Agencies",
    description:
      "Keep sensitive client documents under your own keys. No vendor can be compelled to hand them over.",
    cta: "Store Privately →",
    href: "/solutions/private-storage",
  },
  {
    title: "Static Sites & Developer Workflows",
    description:
      "Host static sites with permanent links that don't depend on one company's servers. Deploy from the CLI, a zip, or GitHub Actions.",
    cta: "Host a Site →",
    href: "/solutions/website-hosting",
  },
  {
    title: "NFT Metadata & Decentralized Assets",
    description:
      "Pin NFT metadata, dApp frontends, and verifiable data with permanent links. Content stays accessible as long as it's pinned.",
    cta: "Start Pinning →",
    href: "/solutions/ipfs-pinning",
  },
  {
    title: "Verifiable Public Data",
    description:
      "Publish scientific datasets, public records, and archival data with permanent links. Anyone can verify the data hasn't been altered since no single organization controls access.",
    cta: "Start Pinning →",
    href: "/solutions/ipfs-pinning",
  },
  {
    title: "Backups & Disaster Recovery",
    description:
      "Automated backups to S3-compatible storage on a peer-to-peer network. Use rclone, restic, or any S3 backup tool you already run. Encrypted, no surprise bills.",
    cta: "Start Storing →",
    href: "/solutions/s3-storage",
  },
];

const UseCases = () => {
  return (
    <Section variant="dark" padding="md">
      <div className="xl:container px-6">
        <h2 className="text-home-text text-2xl lg:text-3xl font-semibold text-center mb-2">
          Real-world use cases
        </h2>
        <p className="text-home-text-muted text-sm text-center mb-10">
          From private AI to verifiable public data, see what people build with Pinner.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((card) => (
            <a
              key={`${card.title}-${card.href}`}
              href={card.href}
              className={cn(
                "group flex flex-col rounded-lg border border-home-text/10 p-6 lg:p-8",
                "transition-colors duration-200 hover:border-home-text/30"
              )}
            >
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

export default UseCases;
