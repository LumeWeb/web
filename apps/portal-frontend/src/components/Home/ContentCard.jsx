const ContentCard = ({ title, description }) => {
	return (
		<div className="opacity-50 transition ease-in-out duration-300 hover:opacity-100">
			<span className="block bg-[#F8F8F8] rounded w-full h-[4px]"></span>
			<div className="pt-4">
				<h3 className="text-[17px] md:text-[40px] font-medium mb-2 md:mb-3 text-[#F8F8F8]">
					{title}
				</h3>
				<p className="text-[#F8F8F8] text-[13px] md:text-lg max-w-[300px]">
					{description}
				</p>
			</div>
		</div>
	);
};

export default ContentCard;
