import { cn } from "@/lib/utils";

interface ContentCardProps {
	title: string;
	description: string;
	activeSlide: boolean;
}

const ContentCard = ({ title, description, activeSlide }: ContentCardProps) => {
	return (
		<div
			className={cn(
				"transition ease-in-out duration-300",
				activeSlide ? "opacity-100" : "opacity-50"
			)}
		>
			<span className="block bg-home-text rounded w-full h-[4px]"></span>
			<div className="pt-4">
				<h3 className="text-[17px] md:text-[24px] lg:text-[30px] xl:text-[40px] font-medium mb-2 md:mb-3 text-home-text">
					{title}
				</h3>
				<p className="text-home-text text-[13px] md:text-lg max-w-[300px]">
					{description}
				</p>
			</div>
		</div>
	);
};

export default ContentCard;
