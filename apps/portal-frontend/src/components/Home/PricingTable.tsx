import Section from "@/components/layout/Section";
import Heading from "@/components/Heading";
import Pricing from "@/components/Pricing";
import PricingContents from "@/data/pricing.json";

const PricingTable = () => {
	return (
    <Section>
      <div className="xl:container px-6">
        <Heading
          title="Pay as you go, upgrade"
          highlightText="whenever"
          description="To understand how Pinner works, it helps to understand."
        />
        <div className="mt-[65px] md:mt-[120px]">
          <Pricing pricingData={PricingContents} tag="true" />
        </div>
      </div>
    </Section>
  );
};

export default PricingTable;
