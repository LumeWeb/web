import { cn } from "@/lib/utils";

interface MenuItem {
	id: string | number;
	text: string;
	url: string;
}

interface Menu {
	title: string;
	menuItems: MenuItem[];
}

interface FooterMenuProps {
	menus: Menu;
	color: "dark" | "light";
}

type FooterMenuTheme = {
	title: string;
	link: string;
	linkHover: string;
};

const footerMenuThemes: Record<"dark" | "light", FooterMenuTheme> = {
	dark: {
		title: "text-home-text",
		link: "text-gray-footer hover:text-white",
		linkHover: "text-gray-footer hover:text-white",
	},
	light: {
		title: "text-content-text",
		link: "text-content-text-muted hover:text-content-text",
		linkHover: "text-content-text-muted hover:text-content-text",
	},
};

const FooterMenu = ({ menus, color }: FooterMenuProps) => {
	const { title, menuItems } = menus;
	const theme = footerMenuThemes[color];

	return (
		<div>
			<p
				className={cn(
					theme.title,
					"mb-4 text-[13px] md:text-lg font-medium"
				)}
			>
				{title}
			</p>
			<ul>
				{menuItems.map((item: MenuItem) => (
					<li key={item.id}>
						<a
							href={item.url}
							className={cn(
								theme.linkHover,
								"text-[12px] underline md:no-underline md:text-base leading-[31px] md:leading-[34px] transition ease-in-out duration-300"
							)}
						>
							{item.text}
						</a>
					</li>
				))}
			</ul>
		</div>
	);
};

export default FooterMenu;
