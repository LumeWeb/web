import Section from "@/components/layout/Section";
import ComparisonTable from "@/components/ComparisonTable";

interface DifferentiatorsSectionProps {
  variant?: "default" | "dark" | "gray" | "white";
}

const columns = [
  { label: "Traditional Cloud" },
  { label: "Cloud Storage", highlight: true },
  { label: "Public (IPFS)", highlight: true },
];

const rows = [
  {
    factor: "Can we read your data?",
    values: [
      "Yes",
      "No. Zero-knowledge encryption means we can't read your files",
      "Yes, but it's public",
    ],
  },
  {
    factor: "Pricing",
    values: [
      "Complex tiers, hidden fees",
      "Simple plans, bundled storage",
      "Simple plans, bundled storage",
    ],
  },
  {
    factor: "Ownership",
    values: [
      "They can delete your data",
      "Your data, your rules",
      "Your data, your rules",
    ],
  },
  {
    factor: "Lock-in",
    values: [
      "Export fees, proprietary formats",
      "Open standards, leave anytime",
      "Open standards, leave anytime",
    ],
  },
  {
    factor: "Infrastructure",
    values: [
      "Centralized data centers",
      "Peer-to-peer storage",
      "Peer-to-peer storage",
    ],
  },
  {
    factor: "Payment options",
    values: [
      "Credit card only, ID required",
    "Crypto or card. No ID for crypto",
    "Crypto or card. No ID for crypto",
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
