import { motion } from "motion/react";

const Heading = ({
	title,
	highligtText,
	align = "text-center",
	description,
}) => {
	return (
		<div className={`heading mb-5 lg:mb-[60px] sm:mb-8 ${align}`}>
			<motion.h2
				initial={{ opacity: 0, y: 50 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: "-100px" }}
				transition={{ duration: 0.8, ease: "easeOut" }}
				className={`text-[28px] 2xl:text-[60px] md:text-5xl sm:text-4xl font-medium mb-3 lg:mb-[36px] text-white leading-tight`}
			>
				{title} <span className="underline">{highligtText}</span>
			</motion.h2>

			{description && (
				<motion.p
					initial={{ opacity: 0, y: 50 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-100px" }}
					transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
					className="text-[#BDC2C1] text-base md:text-xl"
				>
					{description}
				</motion.p>
			)}
		</div>
	);
};

export default Heading;
