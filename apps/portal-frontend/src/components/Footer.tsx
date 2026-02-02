import FooterMenu from "@/components/FooterMenu";
import { cn } from "@/lib/utils";

interface FooterProps {
	theme?: "dark" | "light";
}

type FooterTheme = {
	bg: string;
	link: string;
	linkHover: string;
	separator: string;
	copyright: string;
	small: string;
	smallLink: string;
	smallLinkHover: string;
};

const footerThemes: Record<"dark" | "light", FooterTheme> = {
	dark: {
		bg: "bg-home-section-dark",
		link: "text-gray-footer hover:text-white",
		linkHover: "text-gray-footer hover:text-white",
		separator: "text-border-dark",
		copyright: "text-content-text-light",
		small: "text-gray-footer",
		smallLink: "text-gray-footer hover:text-white",
		smallLinkHover: "text-gray-footer hover:text-white",
	},
	light: {
		bg: "bg-home-text",
		link: "text-content-text",
		linkHover: "text-content-text",
		separator: "text-content-section-gray",
		copyright: "text-content-text",
		small: "text-content-text-muted",
		smallLink: "text-content-text-muted",
		smallLinkHover: "text-content-text-muted hover:text-content-text",
	},
};

const Footer = ({ theme = "dark" }: FooterProps) => {
	const t = footerThemes[theme];

	return (
		<footer className={t.bg}>
			<div className="container py-8">
				<div className="flex flex-col items-center gap-6">
					<div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-2">
						<a
							href="https://docs.pinner.xyz"
							className={cn(t.link, "text-base transition ease-in-out duration-300")}>
							Documentation
						</a>
						<a
							href="https://github.com/lumeweb"
							className={cn(t.link, "text-base transition ease-in-out duration-300")}>
							GitHub
						</a>
						<a
							href="https://discord.gg/qpC8ADp3rS"
							className={cn(t.link, "text-base transition ease-in-out duration-300")}>
							Discord
						</a>
						<span className={t.separator}>|</span>
						<a
							href="#"
							className={cn(t.link, "text-base transition ease-in-out duration-300")}>
							Privacy Policy
						</a>
						<a
							href="#"
							className={cn(t.link, "text-base transition ease-in-out duration-300")}>
							Terms of Use
						</a>
					</div>

					<div className="flex flex-col items-center gap-1">
						<p className={cn(t.copyright, "text-sm")}>
							© 2024 Hammer Technologies LLC
						</p>
						<p className={t.small}>
							A{" "}
							<a
								href="https://lumeweb.com"
								target="_blank"
								rel="noopener noreferrer"
								className={cn(t.smallLinkHover, "transition-colors duration-300")}>
								Lume Web
							</a>{" "}
							service
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
