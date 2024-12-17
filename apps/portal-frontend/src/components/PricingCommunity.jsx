import Button from "./Button";
import iconUser from "../assets/icon-user-black.svg";
import iconFolder from "../assets/icon-folder-black.svg";
import iconDeliver from "../assets/icon-deliver-black.svg";
import iconCheck from "../assets/icon-check-black.svg";

const PricingCommunity = () => {
	return (
		<div className=" bg-[#E4E0D4] py-[28px] lg:py-[50px] px-[30px] lg:px-[40px] transition-all duration-300 ease-in-out w-full lg:w-1/2 max-w-[610px]">
			<h3 className="text-[#0D1D1C] text-[21px] md:text-[40px] font-medium leading-10 mb-3 mb:mb-1">
				Community Metered
			</h3>
			<p className="text-[#0D1D1C] text-[17px] md:text-[21px] font-medium mb-2 mb:mb-6">
				Fair use
			</p>

			<h4 className="text-[#0D1D1C] text-[21px] md:text-[40px] font-medium flex items-center gap-2 mb-3 md:mb-5">
				Free
			</h4>

			<ul className="mb-5 md:mb-11">
				<li className="text-[#485453] flex items-center gap-2 md:gap-4 text-[13px] md:text-lg leading-8">
					<img src={iconUser.src} alt="user icon" />

					<span>1 User</span>
				</li>

				<li className="text-[#485453] flex items-center gap-2 md:gap-4 text-[13px] md:text-lg leading-8">
					<img src={iconFolder.src} alt="user icon" />

					<span>2 TB of storage</span>
				</li>

				<li className="text-[#485453] flex items-center gap-2 md:gap-4 text-[13px] md:text-lg leading-8">
					<img src={iconDeliver.src} alt="user icon" />

					<span>Large file delivery up to 2 GB</span>
				</li>

				<li className="text-[#485453] flex items-center gap-2 md:gap-4 text-[13px] md:text-lg leading-8">
					<img src={iconCheck.src} alt="user icon" />

					<span>30 days to restore deleted files</span>
				</li>
			</ul>

			<Button label="Sign up now for free →" url="#" />
		</div>
	);
};

export default PricingCommunity;
