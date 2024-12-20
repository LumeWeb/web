import Heading from "../Heading";
import { Button } from "@/components/ui/button";
import Image from "../../assets/progress-image.svg";
import { motion } from "motion/react";

const DeleteSection = () => {
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

						<motion.div
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-100px" }}
							transition={{
								duration: 0.8,
								delay: 0.4,
								ease: "easeOut",
							}}
						>
							<Button
								style="outline"
								label="Read more about data delection →"
								url="#"
							/>
						</motion.div>
					</div>

					<div>
						<motion.img
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-100px" }}
							transition={{
								duration: 0.8,
								delay: 0.2,
								ease: "easeOut",
							}}
							src={Image.src}
							alt="Delete"
						/>
						<motion.p
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-100px" }}
							transition={{
								duration: 0.8,
								delay: 0.3,
								ease: "easeOut",
							}}
							className="text-[#abeedb]/50 text-lg font-normal font-['Euclid Circular A'] leading-[29px] tracking-tight mt-5"
						>
							* 503c related text might go here, along with any
							other relevant info.
						</motion.p>
					</div>
				</div>
			</div>
		</section>
	);
};

export default DeleteSection;
