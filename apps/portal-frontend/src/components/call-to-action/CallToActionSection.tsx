import Section from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ButtonConfig {
	label: string;
	url: string;
	style?: string;
}

interface CallToActionSectionProps {
	heading: string;
	subheading?: string;
	primaryButton?: ButtonConfig;
	secondaryButton?: ButtonConfig;
	className?: string;
	variant?: "default" | "dark" | "gray" | "white";
}

const CallToActionSection = ({
	heading,
	subheading,
	primaryButton,
	secondaryButton,
	className = "",
	variant = "default",
}: CallToActionSectionProps) => {
	return (
		<Section variant={variant} className={className}>
			<div className="xl:container px-6">
				<h2 className="text-home-text text-[25px] md:text-[35px] font-medium text-center">
					{heading}
				</h2>

				{subheading && (
					<p className="text-home-text-muted text-[17px] md:text-[19px] text-center mt-4">
						{subheading}
					</p>
				)}

				<div className="mt-7 md:mt-[50px] flex gap-3 justify-center">
					{primaryButton && (
						<Button
							label={primaryButton.label}
							url={primaryButton.url}
							style={primaryButton.style}
						/>
					)}
					{secondaryButton && (
						<Button
							label={secondaryButton.label}
							url={secondaryButton.url}
							style={secondaryButton.style}
						/>
					)}
				</div>
			</div>
		</Section>
	);
};

export default CallToActionSection;
