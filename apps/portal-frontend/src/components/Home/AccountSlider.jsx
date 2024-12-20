import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Controller } from "swiper/modules";
import ContentCard from "./ContentCard";

import SignUp from "../../assets/signup.svg";
import signUpImage from "../../assets/signup-image-1.svg";
import signUpImageTwo from "../../assets/signup-image-2.svg";

import "swiper/swiper-bundle.css";
import { motion } from "motion/react";

const sliderContent = [
	{
		title: "Create an account",
		description: "Lume handles the privacy so that you can focus on you.",
	},
	{
		title: "Upload",
		description: "Lume handles the privacy so that you can focus on you.",
	},
	{
		title: "Secure",
		description: "Lume handles the privacy so that you can focus on you.",
	},
];

const AccountSlider = () => {
	const [activeSlide, setActiveSlide] = useState(0);
	const [firstSwiper, setFirstSwiper] = useState(null);
	const [secondSwiper, setSecondSwiper] = useState(null);

	// Handle slide change from either swiper
	const handleSlideChange = (swiper) => {
		setActiveSlide(swiper.activeIndex);
	};

	// Handle thumbnail click
	const handleThumbClick = (index) => {
		if (firstSwiper) {
			firstSwiper.slideTo(index);
		}
		if (secondSwiper) {
			secondSwiper.slideTo(index);
		}
		setActiveSlide(index);
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 50 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "-100px" }}
			transition={{
				duration: 0.8,
				delay: 0.2,
				ease: "easeOut",
			}}
		>
			<Swiper
				modules={[Controller]}
				onSwiper={setFirstSwiper}
				controller={{ control: secondSwiper }}
				onSlideChange={handleSlideChange}
			>
				<SwiperSlide className="flex items-center justify-center">
					<div className="mb-[65px] md:mb-[155px]">
						<img
							src={SignUp.src}
							alt="sign up"
							className="mx-auto"
						/>
					</div>
				</SwiperSlide>
				<SwiperSlide className="flex items-center justify-center">
					<div className="mb-5">
						<img
							src={signUpImage.src}
							alt="sign up"
							className="mx-auto"
						/>
					</div>
				</SwiperSlide>
				<SwiperSlide className="flex items-center justify-center">
					<div className="mb-[80px]">
						<img
							src={signUpImageTwo.src}
							alt="sign up"
							className="mx-auto"
						/>
					</div>
				</SwiperSlide>
			</Swiper>

			<Swiper
				modules={[Controller]}
				onSwiper={setSecondSwiper}
				controller={{ control: firstSwiper }}
				watchSlidesProgress
				breakpoints={{
					992: {
						slidesPerView: 3,
					},
					480: {
						slidesPerView: 2,
					},
					320: {
						slidesPerView: 1,
					},
				}}
				spaceBetween={50}
			>
				{sliderContent.map((item, index) => (
					<SwiperSlide
						key={index}
						onClick={() => handleThumbClick(index)}
						style={{ cursor: "pointer" }}
					>
						<ContentCard
							activeSlide={activeSlide === index}
							title={item.title}
							description={item.description}
						/>
					</SwiperSlide>
				))}
			</Swiper>
		</motion.div>
	);
};

export default AccountSlider;
