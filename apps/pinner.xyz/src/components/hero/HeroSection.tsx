import { TrackedButton } from "@/components/TrackedButton";
import { cn } from "@/lib/utils";

interface HeroButtonProps {
	label: string;
	url: string;
	buttonStyle?: "default" | "outline" | "outline-dark" | "btn-light" | "gray" | "light";
	target?: string;
	trackEvent?: string;
	trackProperties?: Record<string, unknown>;
}

interface HeroSectionProps {
	headline: string | React.ReactNode;
	subheadline?: React.ReactNode;
	primaryButton?: HeroButtonProps;
	primaryButtons?: HeroButtonProps[];
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
	primaryButtons,
	secondaryButton,
	visualContent,
	microcopy,
	trustLine,
	className = "",
}: HeroSectionProps) => {
	const buttons = primaryButtons ?? (primaryButton ? [primaryButton] : []);

	return (
		<section className={cn("pt-[160px] md:pt-[120px] lg:pt-[155px]", className)}>
			<div className="xl:container px-6">
				<div className="md:columns-2 sm:columns-1 lg:flex lg:h-[600px] xl:min-h-[700px] lg:items-center overflow-hidden lg:justify-between">
					<div className="mb-[50px] lg:mb-0 pb-[50px]">
						<div className="text-left max-w-[670px]">
							<h1 className="text-[28px] md:text-[2.5rem] lg:text-5xl xl:text-6xl 2xl:text-[75px] font-medium mb-7 lg:mb-[50px] text-white leading-tight">
								{headline}
							</h1>

							{subheadline && (
								<p className="text-home-text-muted text-base lg:text-xl mb-5 lg:mb-[60px] max-w-[480px]">
									{subheadline}
								</p>
							)}

							{(buttons.length > 0 || secondaryButton) && (
								<div className="flex flex-col sm:flex-row gap-3 sm:gap-3 lg:gap-6 mt-8">
									{buttons.map((btn) => (
										<TrackedButton
											key={btn.label}
											label={btn.label}
											url={btn.url}
											buttonStyle={btn.buttonStyle}
											target={btn.target}
											trackEvent={btn.trackEvent || "hero_cta_clicked"}
											trackProperties={btn.trackProperties || { label: btn.label }}
										/>
									))}
									{secondaryButton && (
										<TrackedButton
											label={secondaryButton.label}
											url={secondaryButton.url}
											buttonStyle={secondaryButton.buttonStyle}
											target={secondaryButton.target}
											trackEvent={secondaryButton.trackEvent || "hero_secondary_clicked"}
											trackProperties={secondaryButton.trackProperties || { label: secondaryButton.label }}
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
						<div className="lg:w-[480px] xl:w-[520px] 2xl:w-[560px] lg:translate-y-0 overflow-hidden">
							{visualContent}
						</div>
					)}
				</div>
			</div>
		</section>
	);
};

export default HeroSection;
