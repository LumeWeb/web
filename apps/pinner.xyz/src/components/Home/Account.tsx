import Section from "@/components/layout/Section";
import Heading from "@/components/Heading";
import AccountSlider from "./AccountSlider";

interface AccountProps {
	variant?: "default" | "dark" | "gray" | "white";
}

const Account = ({ variant = "default" }: AccountProps) => {
	return (
		<Section variant={variant}>
			<div className="xl:container px-6">
				<Heading
				title="Pin. Host. Store."
   description="Upload to IPFS. Host websites. Store private data with encryption. Three products, one platform, one set of credentials."
				/>

				<AccountSlider />
			</div>
		</Section>
	);
};

export default Account;
