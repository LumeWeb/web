import Heading from "../Heading";
import Pricing from "../Pricing";
import PricingContents from "@/data/pricing";

const PricingTable = () => {
	return (
		<section className="py-[65px] md:py-[158px]">
			<div className="container">
				<Heading
					client:load
					title="Pay as you go, upgrade"
					highligtText="whenever"
					description="To understand how Lume works, it helps to understand."
				/>
				<div className="mt-[65px] md:mt-[170px]">
					<Pricing pricingData={PricingContents} client:load />
				</div>
			</div>
		</section>
	);
};

export default PricingTable;
