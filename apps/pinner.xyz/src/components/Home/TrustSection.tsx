import Section from "@/components/layout/Section";
import Heading from "@/components/Heading";

interface TrustSectionProps {
	variant?: "default" | "dark" | "gray" | "white";
}

const principles = [
	{
		title: "We can't read your files",
		description:
    "Zero-knowledge encryption means even we don't have the keys. That's not a promise. It's the architecture.",
	},
	{
		title: "What you see is what you pay",
		description:
			"Storage and bandwidth, priced upfront. No tiers to climb, no surprise line items. The pricing page is the pricing page.",
	},
	{
		title: "You can leave",
		description:
			"Open standards, no export fees, no lock-in. Your data stays yours even when you walk away.",
	},
];

const TrustSection = ({ variant = "default" }: TrustSectionProps) => {
	return (
		<Section variant={variant} padding="md">
			<div className="xl:container px-6">
				<Heading title="What Pinner Does Better" />

				<div className="mx-auto max-w-[1000px] grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-6">
					{principles.map((p, i) => (
						<div
							key={p.title}
							className="border border-home-text/10 rounded-lg bg-home-card-bg p-6 lg:p-8"
						>
							<span className="text-home-text-muted text-sm font-medium mb-3 block">
								{String(i + 1).padStart(2, "0")}
							</span>
							<h3 className="text-home-text text-base font-medium mb-2 lg:text-lg">
								{p.title}
							</h3>
							<p className="text-home-text-muted text-sm leading-relaxed lg:text-base">
								{p.description}
							</p>
						</div>
					))}
				</div>

				<div className="text-center mt-8">
					<a
						href="/how-it-works"
						className="text-home-text-muted text-sm font-medium underline hover:text-white transition-colors duration-300"
					>
						See how it works →
					</a>
				</div>
				</div>
				</Section>
	);
};

export default TrustSection;
