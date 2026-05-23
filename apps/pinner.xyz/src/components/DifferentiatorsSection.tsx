import Section from "@/components/layout/Section";

interface Differentiator {
  factor: string;
  traditional: string;
  pinnerPrivate: string;
  pinnerPublic: string;
}

interface DifferentiatorsSectionProps {
  variant?: "default" | "dark" | "gray" | "white";
}

const differentiators: Differentiator[] = [
  {
    factor: "Can we read your data?",
    traditional: "Yes",
    pinnerPrivate: "No — zero-knowledge encryption means we can't read your files",
    pinnerPublic: "Yes, but it's public",
  },
  {
    factor: "Pricing",
    traditional: "Complex tiers, hidden fees",
    pinnerPrivate: "Simple plans, bundled storage",
    pinnerPublic: "Simple plans, bundled storage",
  },
  {
    factor: "Ownership",
    traditional: "They can delete your data",
    pinnerPrivate: "Your data, your rules",
    pinnerPublic: "Your data, your rules",
  },
  {
    factor: "Lock-in",
    traditional: "Export fees, proprietary formats",
    pinnerPrivate: "Open standards, leave anytime",
    pinnerPublic: "Open standards, leave anytime",
  },
  {
    factor: "Infrastructure",
    traditional: "Centralized data centers",
    pinnerPrivate: "Distributed network",
    pinnerPublic: "Distributed network",
  },
  {
    factor: "Payment options",
    traditional: "Credit card only, ID required",
    pinnerPrivate: "Crypto or card — no ID for crypto",
    pinnerPublic: "Crypto or card — no ID for crypto",
  },
];

const darkTableStyles = {
  headingBg: "bg-home-card-bg",
  headingText: "text-home-text",
  headingMuted: "text-home-text-muted",
  cellBg: "bg-home-card-bg/60",
  cellText: "text-home-text",
  cellMuted: "text-home-text-muted",
  border: "border-home-text/20",
};

const lightTableStyles = {
  headingBg: "bg-content-section-gray",
  headingText: "text-content-text",
  headingMuted: "text-content-text-muted",
  cellBg: "bg-white",
  cellText: "text-content-text",
  cellMuted: "text-content-text-muted",
  border: "border-content-divider/50",
};

export default function DifferentiatorsSection({ variant = "default" }: DifferentiatorsSectionProps) {
  const isDark = variant === "dark";
  const s = isDark ? darkTableStyles : lightTableStyles;

  return (
    <Section variant={variant}>
      <div className="xl:container px-6">
        <h2 className={`${s.headingText} pb-4 text-center text-[25px] leading-tight font-medium md:text-[32px] lg:pb-8 lg:text-[40px]`}>
          Why Pinner?
        </h2>
        <div className="mx-auto w-full md:w-3/4">
          <div className={`overflow-x-auto ${isDark ? "border-home-text/20" : "border"} py-12`}>
            <table className="w-full overflow-hidden rounded-lg">
              <thead>
                <tr className={`${s.border} border-b`}>
                  <th className={`${s.headingBg} ${s.headingText} px-4 pt-4 pb-4 text-left text-sm font-semibold`}>
                    Factor
                  </th>
                  <th className={`${s.headingBg} ${s.headingMuted} px-4 pt-4 pb-4 text-left text-sm font-semibold`}>
                    Traditional Cloud
                  </th>
                  <th className={`${s.cellBg} ${s.cellText} px-4 pt-4 pb-4 text-left text-sm font-semibold`}>
                    Private Storage
                  </th>
                  <th className={`${s.cellBg} ${s.cellText} px-4 pt-4 pb-4 text-left text-sm font-semibold`}>
                    Public (IPFS)
                  </th>
                </tr>
              </thead>
              <tbody>
                {differentiators.map((d) => (
                  <tr
                    key={d.factor}
                    className={`${s.border} border-b last:border-0`}>
                    <td className={`${s.headingBg} ${s.headingText} px-4 py-4 text-sm font-medium`}>
                      {d.factor}
                    </td>
                    <td className={`${s.headingBg} ${s.cellMuted} px-4 py-4 text-sm`}>
                      {d.traditional}
                    </td>
                    <td className={`${s.cellBg} ${s.cellText} px-4 py-4 text-sm`}>
                      {d.pinnerPrivate}
                    </td>
                    <td className={`${s.cellBg} ${s.cellText} px-4 py-4 text-sm`}>
                      {d.pinnerPublic}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </Section>
  );
}