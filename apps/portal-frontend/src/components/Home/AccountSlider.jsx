import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs } from 'swiper/modules';
import ContentCard from "./ContentCard";
// Import Swiper styles
import "swiper/swiper-bundle.css";

import SignUp from "../../assets/signup.svg";
import signUpImage from "../../assets/signup-image-1.svg";
import signUpImageTwo from "../../assets/signup-image-2.svg";

const AccountSlider = () => {
	// store thumbs swiper instance
	const [thumbsSwiper, setThumbsSwiper] = useState(null);

	return (
		<div>
			<Swiper
				modules={[Thumbs]}

				thumbs={{ swiper: thumbsSwiper }}
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
				slidesPerView={3}
				spaceBetween={50}
				modules={[Thumbs]}
				watchSlidesProgress
				onSwiper={setThumbsSwiper}
			>
				<SwiperSlide>
					<ContentCard
						title="Create an account"
						description="Lume handles the privacy so that you can focus on you."
					/>
				</SwiperSlide>

				<SwiperSlide>
					<ContentCard
						title="Upload"
						description="Lume handles the privacy so that you can focus on you."
					/>
				</SwiperSlide>

				<SwiperSlide>
					<ContentCard
						title="Secure"
						description="Lume handles the privacy so that you can focus on you."
					/>
				</SwiperSlide>
			</Swiper>
		</div>
	);
};

export default AccountSlider;
