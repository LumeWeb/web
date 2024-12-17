import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import ScrollTrigger from "gsap/ScrollTrigger";

const Heading = ({
	title,
	highligtText,
	align = "text-center",
	description,
}) => {
	const container = useRef();
	const sectionTitle = useRef();
	const sectionDescription = useRef();

	useGSAP(() => {
		gsap.registerPlugin(ScrollTrigger);

		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: container.current,
				start: "top 80%", // Starts when top of element hits 80% of viewport
				toggleActions: "play none none none",
				once: false, // Ensures animation only happens once
			},
		});

		tl.from(sectionTitle.current, {
			opacity: 0,
			y: 50,
			duration: 0.7,
			ease: "power1.out",
		});

		tl.from(sectionDescription.current, {
			opacity: 0,
			y: 50,
			duration: 0.5,
		});
	});

	return (
		<div
			className={`heading mb-5 lg:mb-[60px] sm:mb-8 ${align}`}
			ref={container}
		>
			<h2
				className={`text-[28px] 2xl:text-[60px] md:text-5xl sm:text-4xl font-medium mb-3 lg:mb-[36px] text-white leading-tight`}
				ref={sectionTitle}
			>
				{title} <span className="underline">{highligtText}</span>
			</h2>

			{description && (
				<p
					className="text-[#BDC2C1] text-base md:text-xl"
					ref={sectionDescription}
				>
					{description}
				</p>
			)}
		</div>
	);
};

export default Heading;
