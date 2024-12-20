import { motion } from "motion/react";
import Docs from "@/data/docs";
import Heading from "../Heading";
import { Button } from "@/components/ui/button";
import BlogCard from "./BlogCard";

const Blog = () => {
	return (
		<section className="py-[65px] md:py-[158px]">
			<div className="container">
				<div className="lg:flex justify-between items-center">
					<Heading
						client:load
						align="text-left"
						title="Docs, Updates, & Guides"
						description="To understand how Lume keeps you safe, it helps to understand."
					/>

					<motion.div
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-100px" }}
						transition={{
							duration: 0.6,
							delay: 0.2,
							ease: "easeOut",
						}}
					>
						<Button
							label="Read our docs →"
							url="#"
							style="outline"
						/>
					</motion.div>
				</div>

				<div className="grid grid-cols-1 gap-12 lg:grid-cols-3 md:grid-cols-2 mt-[55px] lg:mt-[30px]">
					{Docs.map((item, index) => (
						<BlogCard client:load key={index} items={item} />
					))}
				</div>
			</div>
		</section>
	);
};

export default Blog;
