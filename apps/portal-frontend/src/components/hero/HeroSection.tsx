import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeroButtonProps {
	label: string;
	url: string;
	buttonStyle?: "default" | "outline" | "outline-dark" | "btn-light" | "gray" | "light";
}

interface HeroSectionProps {
	headline: string;
	subheadline?: string;
	primaryButton?: HeroButtonProps;
	secondaryButton?: HeroButtonProps;
	visualContent?: React.ReactNode;
	className?: string;
}

const HeroSection = ({
	headline,
	subheadline,
	primaryButton,
	secondaryButton,
	visualContent,
	className = "",
}: HeroSectionProps) => {
	return (
		<section className={cn("pt-[155px]", className)}>
			<div className="xl:container px-6">
				<div className="md:columns-2 sm:columns-1 lg:flex lg:h-[600px] xl:min-h-[880px] lg:items-center overflow-hidden lg:justify-between">
					<div className="mb-[50px] lg:mb-0 pb-[50px]">
						<div className="text-left max-w-[670px]">
							<h1 className="text-3xl 2xl:text-[75px] lg:text-5xl md:text-[2.5rem] sm:4xl font-medium mb-7 lg:mb-[50px] text-white leading-tight">
								{headline}
							</h1>

							{subheadline && (
								<p className="text-home-text-muted text-base lg:text-xl mb-5 lg:mb-[60px] max-w-[480px]">
									{subheadline}
								</p>
							)}

							{(primaryButton || secondaryButton) && (
								<div className="flex space-x-3 lg:space-x-6 mt-8">
									{primaryButton && (
										<Button
											label={primaryButton.label}
											url={primaryButton.url}
											buttonStyle={primaryButton.buttonStyle}
										/>
									)}
									{secondaryButton && (
										<Button
											label={secondaryButton.label}
											url={secondaryButton.url}
											buttonStyle={secondaryButton.buttonStyle}
										/>
									)}
								</div>
							)}
						</div>
					</div>

					{visualContent && (
						<div className="lg:w-[480px] xl:w-[500px] translate-y-11! lg:translate-y-0 overflow-hidden">
							{visualContent}
						</div>
					)}
				</div>
			</div>
		</section>
	);
};

export default HeroSection;
