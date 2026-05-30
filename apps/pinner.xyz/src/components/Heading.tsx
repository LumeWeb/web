

import { cn } from "@/lib/utils";

interface HeadingProps {
	title?: string;
	highlightText?: string;
	align?: string;
	description?: string;
	subtitle?: string;
}

const Heading = ({
	title,
	highlightText,
	align = "text-center",
	description,
	subtitle,
}: HeadingProps) => {
	return (
		<div className={cn("heading mb-5 lg:mb-[60px] sm:mb-8", align)}>
			{subtitle && (
				<h3 className="text-content-text-muted lg:text-[21px] md:text-base hidden md:block font-medium lg:mb-6 md:mb-2">
					{subtitle}
				</h3>
			)}

			<h2 className="text-[28px] xl:text-[44px] 2xl:text-[60px] md:text-5xl sm:text-4xl font-medium mb-3 lg:mb-[36px] leading-tight">
				{title}{" "}
				{highlightText && <span className="underline">{highlightText}</span>}
			</h2>

			{description && (
				<p className="text-home-text-muted text-base md:text-xl">
					{description}
				</p>
			)}
		</div>
	);
};

export default Heading;
