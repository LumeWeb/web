const FooterMenu = ({ menus, color }) => {
	const { title, menuItems } = menus;
	return (
		<div>
			<h3
				className={`${
					color === "dark" ? "text-[#F8F8F8]" : "text-[#0D1D1C]"
				} mb-4 text-[13px] md:text-lg font-medium`}
			>
				{title}
			</h3>
			<ul>
				{menuItems.map((item) => (
					<li key={item.id}>
						<a
							href="{item.url}"
							className={`${
								color === "dark"
									? "text-[#BBBFBF] hover:text-white"
									: "text-[#485453] hover:text-[#0D1D1C]"
							} text-[12px] underline md:no-underline md:text-base leading-[31px] md:leading-[34px] transition ease-in-out duration-300`}
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
