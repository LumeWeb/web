import { cn } from "@/lib/utils";

type ButtonStyle = "outline" | "outline-dark" | "btn-light" | "gray" | "light";
type ButtonSize = "sm" | "md" | "lg";
type ButtonStyleMap = Record<ButtonStyle | "default", string>;
type ButtonSizeMap = Record<ButtonSize, string>;

interface ButtonProps {
	label: string;
	url: string;
	style?: ButtonStyle;
	size?: ButtonSize;
}

const buttonStyles: ButtonStyleMap = {
	outline:
		"border border-home-text! text-home-text bg-transparent hover:bg-home-card-bg! hover:text-home-text hover:border-home-card-bg!",
	"outline-dark":
		"border border-content-text! text-content-text! bg-transparent hover:bg-content-text! hover:text-white! hover:border-content-text!",
	"btn-light":
		"bg-white! text-content-text! hover:bg-transparent! hover:text-white! border-white!",
	gray: "bg-content-section-gray text-content-text! hover:bg-home-card-bg! hover:text-white!",
	light: "bg-white text-content-text hover:bg-home-card-bg hover:text-white",
	default: "text-home-text bg-home-card-bg hover:bg-white hover:text-content-text",
};

const buttonSizes: ButtonSizeMap = {
	sm: "py-2 px-6 text-[13px] leading-none",
	md: "py-[11px] px-4 lg:py-4 lg:px-6",
	lg: "text-xl",
};

const Button = ({ label, url, style, size = "md" }: ButtonProps) => {
	return (
		<a
			href={url}
			className={cn(
				"inline-flex rounded-full border border-transparent text-[13px] lg:text-lg font-medium transition ease-in-out duration-300",
				buttonStyles[style || "default"],
				buttonSizes[size]
			)}
		>
			{label}
		</a>
	);
};

export default Button;
