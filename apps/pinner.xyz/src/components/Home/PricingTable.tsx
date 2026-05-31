import Section from "@/components/layout/Section";
import Heading from "@/components/Heading";
import PricingPlans from "@/components/pricing";

const trustBadges = [
  "No hidden fees",
  "Open source",
  "Encrypted private storage",
  "Crypto & card payments",
];

const PricingTable = () => {
  return (
    <Section>
      <div className="xl:container px-6">
        <Heading
          title="Simple pricing, upgrade"
          highlightText="whenever"
          description="Simple, transparent pricing. Pay for storage and bandwidth. No hidden fees, no API call charges. Pick a plan that fits the needs of any project."
        />
        <div className="mt-[65px] md:mt-[120px]">
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mb-8 md:mb-12">
            {trustBadges.map((badge) => (
              <span key={badge} className="text-home-text-muted text-base flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 8.5 6.5 12 13 4" />
                </svg>
                {badge}
              </span>
            ))}
          </div>
          <PricingPlans variant="dark" />
        </div>
      </div>
    </Section>
  );
};

export default PricingTable;
