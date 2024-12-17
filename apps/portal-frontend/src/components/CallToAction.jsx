import Button from "./Button";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";

const CallToAction = () => {
	const container = useRef();
	const titleRef = useRef();
	const buttonRef = useRef();

	useGSAP(() => {
		gsap.registerPlugin(ScrollTrigger);

		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: container.current,
				start: "top 80%",
				toggleActions: "play none none none",
				once: true,
			},
		});

		tl.from(titleRef.current, {
			opacity: 0,
			y: 50,
			duration: 0.7,
			ease: "power1.out",
		});

		tl.from(buttonRef.current, {
			opacity: 0,
			y: 50,
			duration: 0.5,
		});
	});

	return (
		<section className="py-[65px] md:py-[115px] bg-[#051413]">
			<div className="container" ref={container}>
				<h2
					className="text-[#F8F8F8] text-[25px] md:text-[35px] font-medium text-center"
					ref={titleRef}
				>
					Want to be a part of the next big thing?
				</h2>

				<div
					className="mt-7 md:mt-[50px] flex gap-3 justify-center"
					ref={buttonRef}
				>
					<Button label="Learn more about Lume →" url="#" />

					<Button style="outline" label="Referrals" url="#" />
				</div>
			</div>
		</section>
	);
};

export default CallToAction;
