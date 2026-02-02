import Section from "@/components/layout/Section";
import Heading from "@/components/Heading";

interface TrustSectionProps {
	variant?: "default" | "dark" | "gray" | "white";
}

const TrustSection = ({ variant = "default" }: TrustSectionProps) => {
	return (
		<Section variant={variant} padding="sm">
			<div className="xl:container px-6">
				<Heading
					title="Privacy-first"
					highlightText="by design"
					description="Enterprise-grade reliability. When you delete, it's actually deleted. Your data, your rules."
				/>
			</div>
		</Section>
	);
};

export default TrustSection;
