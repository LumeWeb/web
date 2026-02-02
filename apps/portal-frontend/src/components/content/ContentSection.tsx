import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ImagePosition = "left" | "right";

interface ContentSectionProps {
	subtitle?: string;
	title?: string;
	description?: string;
	buttonText?: string;
	buttonUrl?: string;
	imageContent?: React.ReactNode;
	imagePosition?: ImagePosition;
	className?: string;
	id?: string;
}

const ContentSection = ({
	subtitle,
	title,
	description,
	buttonText,
	buttonUrl,
	imageContent,
	imagePosition = "left",
	className = "",
	id,
}: ContentSectionProps) => {
	return (
		<section id={id} className={cn("py-[60px] md:py-[120px]", className)}>
			<div className="xl:container px-6">
				<div className="flex md:gap-10 flex-wrap md:flex-nowrap md:items-center md:justify-between">
					<div
						className={cn(
							"w-full md:w-auto basis-auto 2xl:basis-[40%]",
							imagePosition === "right" ? "order-2" : "order-2 md:order-1"
						)}>
						{imageContent}
					</div>

					<div
						className={cn(
							"mb-[44px] md:mb-[50px] lg:mb-0 flex-2",
							imagePosition === "right" ? "order-1" : "order-1 md:order-2"
						)}>
						<div className="text-left max-w-[670px]">
							{subtitle && (
								<h3 className="text-content-text-muted lg:text-[21px] md:text-base hidden md:block font-medium lg:mb-6 md:mb-2">
									{subtitle}
								</h3>
							)}

							{title && (
								<h2 className="text-[25px] lg:text-[40px] md:text-[32px] font-medium mb-4 lg:mb-[26px] text-content-text leading-tight">
									{title}
								</h2>
							)}

							{description && (
								<div className="text-content-text-muted text-[13px] md:text-base lg:text-lg leading-[21px]! lg:leading-[35px]! md:leading-[26px]! lg:text-xl mb-6 lg:mb-[26px] max-w-[600px]" dangerouslySetInnerHTML={{ __html: description }} />
							)}

							{buttonText && (
								<div className="hidden md:block">
									<Button label={buttonText} url={buttonUrl} />
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default ContentSection;
