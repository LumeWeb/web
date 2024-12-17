import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Controller } from "swiper/modules";
import ContentCard from "./ContentCard";
// Import Swiper styles
import "swiper/swiper-bundle.css";

import SignUp from "../../assets/signup.svg";
import signUpImage from "../../assets/signup-image-1.svg";
import signUpImageTwo from "../../assets/signup-image-2.svg";

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
	// Track active slide index
	const [activeSlide, setActiveSlide] = useState(0);

	const [firstSwiper, setFirstSwiper] = useState(null);
	const [secondSwiper, setSecondSwiper] = useState(null);

	// Handle slide change
	const handleSlideChange = (swiper) => {
		setActiveSlide(swiper.activeIndex);
	};

	return (
		<div>
			<Swiper
				modules={[Controller]}
				onSwiper={setFirstSwiper}
				controller={{ control: secondSwiper }}
				onSlideChange={(swiper) => handleSlideChange(swiper)}
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
				onSlideChange={handleSlideChange}
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
				onClick={(swiper) => swiper.slideTo(swiper.clickedIndex)}
			>
				{sliderContent.map((item, index) => (
					<SwiperSlide key={index}>
						<ContentCard
							activeSlide={activeSlide === index}
							title={item.title}
							description={item.description}
						/>
					</SwiperSlide>
				))}
			</Swiper>
		</div>
	);
};

export default AccountSlider;
