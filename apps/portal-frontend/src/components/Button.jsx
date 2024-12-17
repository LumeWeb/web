const Button = ({ label, url, style, size = "md" }) => {
	return (
		<a
			href={url}
			className={`inline-flex rounded-full border border-transparent  text-[13px] lg:text-lg font-medium transition ease-in-out duration-300 
                ${
					style === "outline"
						? "border !border-[#F8F8F8] text-[#f8f8f8] bg-transparent hover:!bg-[#0D2D2A] hover:text-[#F8F8F8] hover:!border-[#0D2D2A]"
						: style === "outline-dark"
						? "border !border-[#0D1D1C] !text-[#0D1D1C] bg-transparent hover:!bg-[#0D1D1C] hover:!text-white hover:!border-[#0D1D1C]"
						: style === "btn-light"
						? "!bg-white !text-[#0D1D1C] hover:!bg-transparent hover:!text-white !border-white"
						: style === "gray"
						? "bg-[#E4E0D4] !text-[#0D1D1C] hover:!bg-[#0D2D2A] hover:!text-white"
						: style === "light"
						? "bg-white text-[#0D1D1C] hover:bg-[#0D2D2A] hover:text-white"
						: "text-[#F8F8F8] bg-[#0D2D2A] hover:bg-white hover:text-[#0D1D1C]"
				}
				
				${
					size === "sm"
						? "py-2 px-6 text-[13px] leading-none"
						: size === "lg"
						? "text-xl"
						: "py-[11px] px-4 lg:py-4 lg:px-6"
				}

				`}
		>
			{label}
		</a>
	);
};

export default Button;
