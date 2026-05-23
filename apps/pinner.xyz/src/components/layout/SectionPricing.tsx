import { cn } from "@/lib/utils";

interface SectionPricingProps {
	children?: React.ReactNode;
	className?: string;
	id?: string;
}

const SectionPricing = ({
	children,
	className = "",
	id,
}: SectionPricingProps) => {
	return (
		<section
			id={id}
			className={cn("bg-white py-[70px] md:py-[130px]", className)}>
			{children}
		</section>
	);
};

export default SectionPricing;
