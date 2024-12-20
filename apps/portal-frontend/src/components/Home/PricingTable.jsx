import Heading from "../Heading";
import Pricing from "../Pricing";
import PricingContents from "@/data/pricing";

const PricingTable = () => {
	return (
    <section className="py-[65px] md:pt-[158px] md:pb-[100px]">
      <div className="container">
        <Heading
          client:load
          title="Pay as you go, upgrade"
          highligtText="whenever"
          description="To understand how Lume works, it helps to understand."
        />
        <div className="mt-[65px] md:mt-[120px]">
          <Pricing pricingData={PricingContents} tag="true" client:load />
        </div>
      </div>
    </section>
  );
};

export default PricingTable;
