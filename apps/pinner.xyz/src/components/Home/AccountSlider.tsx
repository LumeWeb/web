import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Controller } from "swiper/modules";
import ContentCard from "./ContentCard";

import SignUp from "@/assets/signup.svg";
import signUpImage from "@/assets/signup-image-1.svg";
import signUpImageTwo from "@/assets/signup-image-2.svg";
import StorageCard from "@/components/cards/StorageCard";
import { SecurityCard } from "@/components/cards/SecurityCard";
import ProgressCard from "@/components/cards/ProgressCard";

import "swiper/swiper-bundle.css";
import { Swiper as SwiperType } from "swiper";

interface SliderContent {
	title: string;
	description: string;
}

const sliderContent: SliderContent[] = [
  {
    title: "Create an account",
    description: "Get started with decentralized storage in minutes",
  },
  {
    title: "Upload",
    description: "Simple upload to the decentralized network",
  },
  {
    title: "Secure",
    description: "A decentralized network stores files redundantly",
  },
];

const AccountSlider = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [firstSwiper, setFirstSwiper] = useState<SwiperType | null>(null);
  const [secondSwiper, setSecondSwiper] = useState<SwiperType | null>(null);

  // Handle slide change from either swiper
  const handleSlideChange = (swiper: SwiperType) => {
    setActiveSlide(swiper.activeIndex);
  };

  // Handle thumbnail click
  const handleThumbClick = (index: number) => {
    if (firstSwiper) {
      firstSwiper.slideTo(index);
    }
    if (secondSwiper) {
      secondSwiper.slideTo(index);
    }
    setActiveSlide(index);
  };

  return (
    <div>
      <Swiper
        modules={[Controller]}
        onSwiper={setFirstSwiper}
        controller={{ control: secondSwiper }}
        onSlideChange={handleSlideChange}>
        <SwiperSlide className="flex items-center justify-center">
          <div className="mt-20 lg:mt-0">
            <StorageCard />
          </div>
        </SwiperSlide>
        <SwiperSlide className="flex items-center justify-center">
          <div className="mb-5 max-w-[800px] m-auto">
            <ProgressCard
              value={30}
              title="quarterly-presentation.pptx (8.4 MB)"
              opacity="opacity-100"
              width="w-full"
            />
            <ProgressCard
              value={40}
              opacity="opacity-80"
              title="design-assets-v2.sketch (142 MB)"
              width="w-full"
            />
            <ProgressCard
              value={40}
              opacity="opacity-20"
              title="client-deliverables.zip (298 MB)"
              width="w-full"
            />
          </div>
        </SwiperSlide>
        <SwiperSlide className="flex items-center justify-center">
          <div className="mb-[65px] md:mb-[55px]">
            <div className="m-auto relative max-w-[900px] h-[400px]">
              <div className="absolute bottom-0 left-0 md:-right-56 -z-10 min-w-[400px] max-w-[400px] md:w-auto">
                <SecurityCard
                  title="Password"
                  star="true"
                  buttonText="Change Password"
                />
              </div>

              <div className="pt-28 min-w-[300px] ml-auto mr-auto max-w-[400px] md:w-auto">
                {/* Two-Factor Authentication Card */}
                <SecurityCard
                  title="Two-Factor Authentication"
                  background="bg-home-card-bg"
                  description="Improve security by enabling 2FA."
                  buttonText="Enable Two-Factor Authorization"
                />
              </div>

              <div className="absolute top-0 right-0 -z-10 min-w-[300px] max-w-[400px] md:w-auto">
                {/* Backup Key Card */}
                <SecurityCard
                  title="Backup Key"
                  description="Keep a backup code for account recovery."
                  buttonText="Generate Backup Key"
                />
              </div>
            </div>
          </div>
          {/* <div className="mb-[80px]">
            <img src={signUpImageTwo.src} alt="sign up" className="mx-auto" />
          </div> */}
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
        spaceBetween={50}>
        {sliderContent.map((item, index) => (
          <SwiperSlide
            key={index}
            onClick={() => handleThumbClick(index)}
            style={{ cursor: "pointer" }}>
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
