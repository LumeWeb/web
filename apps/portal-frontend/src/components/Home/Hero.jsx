import Button from "../Button";
import HeroImage from "../../assets/hero-image.svg";
import HeroImageMobile from "../../assets/hero-mobile-image.svg";
import { useRef } from "react";
import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

const Hero = () => {
	const heroImage = useRef();
	const HeroImageMb = useRef();
	const title = useRef();
	const description = useRef();
	const button = useRef();

	useGSAP(
		() => {
			const tl = gsap.timeline();

			gsap.from(heroImage.current, {
				opacity: 0,
				y: 50,
				duration: 0.7,
				delay: 0.5,
			});

			tl.from(title.current, {
				opacity: 0,
				y: 100,
				duration: 0.7,
				ease: "power1.out",
			});

			// Description split
			tl.from(description.current, {
				opacity: 0,
				y: 50,
				// duration: 0.5,
			});

			// Button
			tl.from(button.current, {
				opacity: 0,
				y: 50,
				// duration: 0.5,
			});

			tl.from(HeroImageMb.current, {
				opacity: 0,
				y: 50,
				duration: 1,
				delay: 0.5,
			});
		},
		{ scope: heroImage.current }
	);

	return (
		<section className="pt-[155px] lg:pt-[170px]">
			<div className="container">
				<div className="md:columns-2 sm:columns-1 lg:flex lg:items-center lg:justify-between">
					<div className="mb-[50px] lg:mb-0">
						<div className="text-left max-w-[670px]">
							<h1
								className="text-3xl  2xl:text-[75px] lg:text-5xl md:text-[2.5rem] sm:4xl font-medium mb-7 lg:mb-[50px] text-white leading-tight"
								ref={title}
							>
								Store <span className="underline">a ton</span>{" "}
								of files, with Lume
							</h1>

							<p
								className="text-[#BDC2C1] text-base lg:text-xl mb-5 lg:mb-[60px] max-w-[480px]"
								ref={description}
							>
								Experience privacy-first solutions that are more
								affordable than most on the market, putting you
								in control.
							</p>

							<div
								className="flex space-x-3 lg:space-x-6 mt-8"
								ref={button}
							>
								<Button
									label="Get 1TB for free →"
									url="#"
									style="btn-light"
								/>

								<Button
									label="How it works →"
									url="#"
									style="outline"
								/>
							</div>
						</div>
					</div>

					<div>
						<img
							src={HeroImage.src}
							alt="hero image"
							className="hidden lg:block"
							ref={heroImage}
						/>

						<div className="lg:hidden">
							<img
								src={HeroImageMobile.src}
								alt="hero image"
								ref={HeroImageMb}
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Hero;
