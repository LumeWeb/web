import { motion } from "motion/react";
const BrandLogos = ({ logos, title, logoType = "dark" }) => {
	return (
		<section
			className={`py-[40px] md:py-[90px] ${
				logoType === "light" ? "bg-white" : "bg-[#051413]"
			}`}
		>
			<div className="container">
				<div className="lg:flex items-start md:items-center justify-between gap-[150px]">
					<div className="basis-80 md:basis-[17rem] mb-[30px] lg:mb-0">
						<motion.h2
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-50px" }}
							transition={{
								duration: 0.8,
								ease: "easeOut",
							}}
							className={`text-[31px] font-medium ${
								logoType === "light"
									? "text-[#0D1D1C]"
									: "text-[#F8F8F8]"
							}`}
						>
							{title}
						</motion.h2>
					</div>

					<motion.div
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-50px" }}
						transition={{
							duration: 0.5,
							delay: 0.2,
							ease: "easeOut",
						}}
						className="flex-grow"
					>
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
					</motion.div>
				</div>
			</div>
		</section>
	);
};

export default BrandLogos;
