import Button from "../Button";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";

const BlogCard = ({ items }) => {
	const { title, categories, content, image, buttonText, url } = items;
	const container = useRef();

	gsap.registerPlugin(ScrollTrigger);

	useGSAP(() => {
		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: container.current,
				start: "top 80%",
				toggleActions: "play none none none",
				once: true,
			},
		});

		tl.from(container.current, {
			opacity: 0,
			y: 50,
			duration: 0.7,
			delay: 1,
			ease: "power1.out",
		});
	});

	return (
		<article ref={container}>
			<div className="mb-8 md:mb-[50px] overflow-hidden rounded-tl-[50px] rounded-br-[50px]">
				<img src={image} alt="blog image" className="w-full" />
			</div>

			{categories && (
				<div className="flex gap-2 mb-5 md:mb-8">
					{categories.map((category, index) => (
						<a
							key={index}
							href="#"
							className="text-[#F8F8F8] text-[10px] font-medium inline-block border border-white rounded-full py-1.5 px-3 transition ease-in-out duration-300 hover:bg-white hover:text-black"
						>
							{category}
						</a>
					))}
				</div>
			)}

			<h3 className="text-[20px] md:text-[24px] text-[#F8F8F8] font-medium mb-2.5 md:mb-6 leading-8">
				{title}
			</h3>
			<p className="text-lg text-[#EAEBEB] mb-6 md:mb-11">{content}</p>

			<Button label={buttonText} url={url} />
		</article>
	);
};

export default BlogCard;
