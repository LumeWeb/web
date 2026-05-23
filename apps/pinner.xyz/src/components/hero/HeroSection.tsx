import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeroButtonProps {
	label: string;
	url: string;
	buttonStyle?: "default" | "outline" | "outline-dark" | "btn-light" | "gray" | "light";
}

interface HeroSectionProps {
	headline: string | React.ReactNode;
	subheadline?: React.ReactNode;
	primaryButton?: HeroButtonProps;
	secondaryButton?: HeroButtonProps;
	visualContent?: React.ReactNode;
	microcopy?: string;
	trustLine?: string;
	className?: string;
}

const HeroSection = ({
	headline,
	subheadline,
	primaryButton,
	secondaryButton,
	visualContent,
	microcopy,
	trustLine,
	className = "",
}: HeroSectionProps) => {
	return (
		<section className={cn("pt-[100px] md:pt-[120px] lg:pt-[155px]", className)}>
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
								<div className="flex flex-col sm:flex-row gap-3 sm:gap-3 lg:gap-6 mt-8">
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

							{microcopy && (
								<p className="text-home-text-muted text-sm mt-4">{microcopy}</p>
							)}

							{trustLine && (
								<p className="text-home-text-muted/60 text-xs mt-2 flex items-center gap-3 flex-wrap">
									{trustLine.split('·').map((item, i) => (
										<span key={i} className="flex items-center gap-1.5">
											{i > 0 && <span className="text-home-text-muted/30">·</span>}
											{item.trim()}
										</span>
									))}
								</p>
							)}

						</div>
					</div>

					{visualContent && (
						<div className="lg:w-[480px] xl:w-[500px] lg:translate-y-0 overflow-hidden">
							{visualContent}
						</div>
					)}
				</div>
			</div>
		</section>
	);
};

export default HeroSection;
