import gsap from "gsap";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";

import Button from "./Button";
import BgShape from "../assets/hero-shape.svg";

const PageHeader = ({
	title,
	mobileTitle,
	description,
	btnText,
	url,
	secondaryBtnText,
	secondaryUrl,
}) => {
	const container = useRef();
	const titleRef = useRef();
	const titleRefMobile = useRef();
	const descriptionRef = useRef();
	const buttonRef = useRef();

	useGSAP(() => {
		const tl = gsap.timeline();

		tl.from(titleRef.current, {
			opacity: 0,
			y: 50,
			duration: 0.5,
			ease: "power1.out",
		});

		tl.from(descriptionRef.current, {
			opacity: 0,
			y: 50,
			duration: 0.5,
			ease: "power1.out",
		});

		tl.from(buttonRef.current, {
			opacity: 0,
			y: 50,
			duration: 0.5,
			ease: "power1.out",
		});
	});

	return (
		<div className="pt-[155px] md:pt-[230px] pb-[60px] md:pb-[120px] relative overflow-hidden">
			<div className="container">
				<img
					src={BgShape.src}
					alt="hero bg shape"
					className="absolute left-0 top-0 max-w-max"
				/>
				<div
					className="text-left md:text-center md:max-w-[810px] mx-auto relative z-10"
					ref={container}
				>
					<h1
						className="text-[60px] text-[#F8F8F8] leading-[60px] font-medium hidden md:block"
						ref={titleRef}
					>
						{title}
					</h1>

					<h1
						className="text-[38px] text-[#F8F8F8] leading-[48px] font-medium md:hidden"
						ref={titleRefMobile}
					>
						{mobileTitle}
					</h1>

					{description && (
						<div className="mt-10">
							<p
								className="text-[#F8F8F8] text-[20px] md:text-[25px]"
								ref={descriptionRef}
							>
								{description}
							</p>
						</div>
					)}

					{/* Explicit Button Rendering Logic */}
					{(btnText || secondaryBtnText) && (
						<div
							className="flex md:justify-center gap-6 mt-8"
							ref={buttonRef}
						>
							{btnText && (
								<Button
									label={btnText}
									url={url}
									style="btn-light"
								/>
							)}
							{secondaryBtnText && (
								<Button
									label={secondaryBtnText}
									url={secondaryUrl}
									style="outline"
								/>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default PageHeader;
