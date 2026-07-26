import Section from "@/components/layout/Section";
import { TrackedButton } from "@/components/TrackedButton";

interface ButtonConfig {
	label: string;
	url: string;
	buttonStyle?: "default" | "outline" | "outline-dark" | "btn-light" | "gray" | "light";
	trackEvent?: string;
	trackProperties?: Record<string, unknown>;
	target?: string;
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
						<TrackedButton
							label={primaryButton.label}
							url={primaryButton.url}
							buttonStyle={primaryButton.buttonStyle}
							trackEvent={primaryButton.trackEvent || "cta_primary_clicked"}
							trackProperties={primaryButton.trackProperties}
							target={primaryButton.target}
						/>
					)}
					{secondaryButton && (
						<TrackedButton
							label={secondaryButton.label}
							url={secondaryButton.url}
							buttonStyle={secondaryButton.buttonStyle}
							trackEvent={secondaryButton.trackEvent || "cta_secondary_clicked"}
							trackProperties={secondaryButton.trackProperties}
							target={secondaryButton.target}
						/>
					)}
				</div>
			</div>
		</Section>
	);
};

export default CallToActionSection;
