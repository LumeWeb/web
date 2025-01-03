import Heading from "../Heading";
import AccountSlider from "./AccountSlider";

const Account = () => {
	return (
		<section className="py-[80px] md:py-[158px] bg-[#051413]">
			<div className="xl:container px-6">
				<Heading
					title="Sign up, upload, and"
					highligtText="share"
					description="Lume handles the privacy."
				/>

				<AccountSlider />
			</div>
		</section>
	);
};

export default Account;
