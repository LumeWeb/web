import { Button } from "@/components/ui/button";
import BgShape from "../assets/hero-shape.svg";
import { motion } from "motion/react";

const PageHeader = ({
	title,
	mobileTitle,
	description,
	btnText,
	url,
	secondaryBtnText,
	secondaryUrl,
}) => {
	return (
		<div className="pt-[155px] md:pt-[230px] pb-[60px] md:pb-[120px] relative overflow-hidden">
			<div className="container">
				<img
					src={BgShape.src}
					alt="hero bg shape"
					className="absolute left-0 top-0 max-w-max"
				/>
				<div className="text-left md:text-center md:max-w-[810px] mx-auto relative z-10">
					<motion.h1
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{
							duration: 0.6,
							ease: "easeOut",
						}}
						className="text-[60px] text-[#F8F8F8] leading-[60px] font-medium hidden md:block"
					>
						{title}
					</motion.h1>

					<motion.h1
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{
							duration: 0.6,
							ease: "easeOut",
						}}
						className="text-[38px] text-[#F8F8F8] leading-[48px] font-medium md:hidden"
					>
						{mobileTitle}
					</motion.h1>

					{description && (
						<div className="mt-10">
							<motion.p
								initial={{ opacity: 0, y: 50 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{
									duration: 0.6,
									delay: 0.2,
									ease: "easeOut",
								}}
								className="text-[#F8F8F8] text-[20px] md:text-[25px]"
							>
								{description}
							</motion.p>
						</div>
					)}

					{/* Explicit Button Rendering Logic */}
					{(btnText || secondaryBtnText) && (
						<motion.div
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{
								duration: 0.6,
								delay: 0.2,
								ease: "easeOut",
							}}
							className="flex md:justify-center gap-6 mt-8"
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
						</motion.div>
					)}
				</div>
			</div>
		</div>
	);
};

export default PageHeader;
