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
					title="We store and manage data"
					highlightText="for applications"
					description="Files, objects, streams, or anything else. Whatever you're building, we handle the storage so you can focus on your product."
				/>

				<AccountSlider />
			</div>
		</Section>
	);
};

export default Account;
