import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

const CallToAction = () => {
	return (
		<section className="py-[65px] md:py-[115px] bg-[#051413]">
			<div className="container">
				<motion.h2
					initial={{ opacity: 0, y: 50 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-50px" }}
					transition={{
						duration: 0.6,
						ease: "easeOut",
					}}
					className="text-[#F8F8F8] text-[25px] md:text-[35px] font-medium text-center"
				>
					Want to be a part of the next big thing?
				</motion.h2>

				<motion.div
					initial={{ opacity: 0, y: 50 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-50px" }}
					transition={{
						duration: 0.6,
						delay: 0.2,
						ease: "easeOut",
					}}
					className="mt-7 md:mt-[50px] flex gap-3 justify-center"
				>
					<Button label="Learn more about Lume →" url="#" />

					<Button style="outline" label="Referrals" url="#" />
				</motion.div>
			</div>
		</section>
	);
};

export default CallToAction;
