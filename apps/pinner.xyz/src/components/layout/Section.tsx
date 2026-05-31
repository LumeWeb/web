import { cn } from "@/lib/utils";

type SectionVariant = "default" | "dark" | "gray" | "white";

interface SectionProps {
	children: React.ReactNode;
	className?: string;
	id?: string;
	variant?: SectionVariant;
	padding?: "none" | "sm" | "md" | "lg" | "default";
}

const Section = ({ children, className = "", id, variant = "default", padding = "default" }: SectionProps) => {
	const variantClasses: Record<SectionVariant, string> = {
		default: "section",
		dark: "section-dark",
		gray: "section-gray",
		white: "section-white",
	};

	const paddingClasses: Record<"none" | "sm" | "md" | "lg" | "default", string> = {
		none: "py-0",
		sm: "py-[40px] lg:py-[80px]",
		md: "py-[60px] lg:py-[120px]",
		lg: "py-[80px] lg:py-[160px]",
		default: "",
	};

	return (
		<section id={id} className={cn(variantClasses[variant], padding === "default" ? "" : paddingClasses[padding], className)}>
			{children}
		</section>
	);
};

export default Section;
