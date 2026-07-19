import Section from "@/components/layout/Section";
import ComparisonTable from "@/components/ComparisonTable";

interface DifferentiatorsSectionProps {
  variant?: "default" | "dark" | "gray" | "white";
}

const columns = [
  { label: "Traditional Cloud" },
  { label: "Pinner: Cloud Storage", highlight: true },
  { label: "Pinner: Public (IPFS)", highlight: true },
];

const rows = [
  {
    factor: "Can the provider read your data?",
    values: [
      "Yes. They hold the keys.",
      "No. Encrypted on your device.",
      "Not applicable. Public by design.",
    ],
  },
  {
    factor: "Pricing",
    values: [
      "Complex tiers, hidden fees",
      "Upfront. No surprise line items.",
      "Upfront. No surprise line items.",
    ],
  },
  {
    factor: "Can they delete your account?",
    values: [
      "Yes. Terms of service violations, policy changes.",
      "No. Your keys, your data.",
      "No. Your keys, your data.",
    ],
  },
  {
    factor: "Leaving",
    values: [
      "Export fees, proprietary formats",
      "Open standards. Leave anytime.",
      "Open standards. Leave anytime.",
    ],
  },
  {
    factor: "Infrastructure",
    values: [
      "Centralized data centers",
      "Distributed peer-to-peer network",
      "Distributed peer-to-peer network",
    ],
  },
  {
    factor: "Payment",
    values: [
      "Credit card and ID required",
      "Card or crypto. No ID for crypto.",
      "Card or crypto. No ID for crypto.",
    ],
  },
];

export default function DifferentiatorsSection({ variant = "default" }: DifferentiatorsSectionProps) {
  const isDark = variant === "dark";

  return (
    <Section variant={variant}>
      <div className="xl:container px-6">
        <h2 className={`${isDark ? "text-home-text" : "text-content-text"} pb-4 text-center text-[25px] leading-tight font-medium md:text-[32px] lg:pb-8 lg:text-[40px]`}>
          Why Pinner?
        </h2>
        <div className="mx-auto w-full md:w-3/4">
          <ComparisonTable
            columns={columns}
            rows={rows}
            variant={isDark ? "dark" : "light"}
          />
        </div>
      </div>
    </Section>
  );
}
