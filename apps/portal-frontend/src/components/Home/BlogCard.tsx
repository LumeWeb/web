import { Button } from "@/components/ui/button";

interface BlogCardProps {
	items: {
		title: string;
		categories?: string[];
		content: string;
		image: string;
		buttonText: string;
		slug: string;
	};
}

const BlogCard = ({ items }: BlogCardProps) => {
	const { title, categories, content, image, buttonText, slug } = items;

	return (
		<article>
			<div className="mb-8 md:mb-[50px] overflow-hidden rounded-tl-[50px] rounded-br-[50px]">
				<img src={image} alt="blog image" className="w-full" />
			</div>

			{categories && (
				<div className="flex gap-2 mb-5 md:mb-8">
					{categories.map((category, index) => (
						<a
							key={index}
							href="#"
							className="text-home-text text-[10px] font-medium inline-block border border-white rounded-full py-1.5 px-3 transition ease-in-out duration-300 hover:bg-white hover:text-black"
						>
							{category}
						</a>
					))}
				</div>
			)}

			<h3 className="text-[20px] md:text-[24px] text-home-text font-medium mb-2.5 md:mb-6 leading-8">
				{title}
			</h3>
			<p className="text-lg text-[#EAEBEB] mb-6 md:mb-11">{content}</p>

			<Button label={buttonText} url={slug} />
		</article>
	);
};

export default BlogCard;
