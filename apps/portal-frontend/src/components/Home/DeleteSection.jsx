import Heading from "../Heading";
import Button from "../Button";
import Image from "../../assets/progress-image.png";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";

const DeleteSection = () => {
	const buttonRef = useRef();
	const imageRef = useRef();

	useGSAP(() => {
		gsap.registerPlugin(ScrollTrigger);

		gsap.from(buttonRef.current, {
			opacity: 0,
			y: 50,
			duration: 0.5,
			delay: 1,
			scrollTrigger: {
				trigger: buttonRef.current,
				start: "top 80%",
				toggleActions: "play none none none",
				once: true,
			},
		});

		gsap.from(imageRef.current, {
			opacity: 0,
			y: 50,
			duration: 0.7,
			delay: 1,
			ease: "power1.out",
			scrollTrigger: {
				trigger: imageRef.current,
				start: "top 80%",
				toggleActions: "play none none none",
				once: true,
			},
		});
	});

	return (
		<section className="py-[65px] md:py-[158px]">
			<div className="container">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-11 md:gap-10 items-center">
					<div>
						<Heading
							align="text-left"
							title="Delete what you  don’t need (forever)"
							description="Experience privacy-first solutions that are more affordable than most on the market, putting you in control."
						/>

						<div ref={buttonRef}>
							<Button
								style="outline"
								label="Read more about data delection →"
								url="#"
							/>
						</div>
					</div>

					<div>
						<img src={Image.src} alt="Delete" ref={imageRef} />
					</div>
				</div>
			</div>
		</section>
	);
};

export default DeleteSection;
