import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useRef } from "react";

const BrandLogos = ({ logos, title, logoType = "dark" }) => {
	const logoContainer = useRef();
	const titleRef = useRef();

	useGSAP(() => {
		gsap.registerPlugin(ScrollTrigger);

		gsap.from(titleRef.current, {
			opacity: 0,
			y: 50,
			duration: 0.5,
			scrollTrigger: {
				trigger: titleRef.current,
				start: "top 85%",
				toggleActions: "play none none none",
				once: true,
			},
		});

		gsap.from(logoContainer.current, {
			opacity: 0,
			y: 50,
			duration: 0.5,
			delay: 0.2,
			scrollTrigger: {
				trigger: logoContainer.current,
				start: "top 85%",
				toggleActions: "play none none none",
				once: true,
			},
		});
	});

	return (
		<section
			className={`py-[40px] md:py-[90px] ${
				logoType === "light" ? "bg-white" : "bg-[#051413]"
			}`}
		>
			<div className="container">
				<div className="md:flex items-start md:items-center justify-between gap-[150px]">
					<div className="basis-80 md:basis-[17rem] mb-[30px] md:mb-0">
						<h2
							className={`text-[31px] font-medium ${
								logoType === "light"
									? "text-[#0D1D1C]"
									: "text-[#F8F8F8]"
							}`}
							ref={titleRef}
						>
							{title}
						</h2>
					</div>

					<div className="flex-grow" ref={logoContainer}>
						<div className="flex flex-wrap gap-7 md:gap-10 flex-2 items-center justify-start md:justify-between">
							{logoType === "light"
								? logos.logoLight.map((logo) => (
										<img
											key={logo.id}
											src={logo.src}
											alt="brand logo"
										/>
								  ))
								: logos.logoDark.map((logo) => (
										<img
											key={logo.id}
											src={logo.src}
											alt="brand logo"
										/>
								  ))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default BrandLogos;
