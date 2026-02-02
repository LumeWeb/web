import Heading from "@/components/Heading";
import { Button } from "@/components/ui/button";
import BlogCard from "./BlogCard";

const Blog = () => {
	const docs = [
		{
			title: "Getting Started with Pinner",
			categories: ["Guide"],
			content: "Learn how to set up and use Pinner for your first project.",
			image: "/placeholder.jpg",
			buttonText: "Read More →",
			slug: "/docs/getting-started"
		},
		{
			title: "Understanding Decentralized Storage",
			categories: ["Concept"],
			content: "Deep dive into how decentralized storage networks work.",
			image: "/placeholder.jpg",
			buttonText: "Read More →",
			slug: "/docs/decentralized-storage"
		},
		{
			title: "API Reference",
			categories: ["Docs"],
			content: "Complete API documentation for all endpoints.",
			image: "/placeholder.jpg",
			buttonText: "Read More →",
			slug: "/docs/api"
		}
	];

	return (
		<section className="py-[65px] md:py-[158px]">
			<div className="xl:container px-6">
				<div className="lg:flex justify-between items-center">
					<Heading
						align="text-left"
						title="Docs, Updates, & Guides"
						description="To understand how Pinner keeps you safe, it helps to understand."
					/>

					<div>
						<Button
							label="Read our docs →"
							url="#"
							style="outline"
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-12 lg:grid-cols-3 md:grid-cols-2 mt-[55px] lg:mt-[30px]">
					{docs.map((item, index) => (
						<BlogCard key={index} items={item} />
					))}
				</div>
			</div>
		</section>
	);
};

export default Blog;
