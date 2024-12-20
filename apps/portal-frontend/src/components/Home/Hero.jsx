// import Button2 from "@/components/ui/button";
import { Button } from "@/components/ui/button";

import HeroImage from "../../assets/hero-image.svg";
import HeroImageMobile from "../../assets/hero-mobile-image.svg";
import { motion } from "motion/react";

const Hero = () => {
	return (
    <section className="pt-[155px] lg:pt-[170px]">
      <div className="container">
        <div className="md:columns-2 sm:columns-1 lg:flex lg:items-center lg:justify-between">
          <div className="mb-[50px] lg:mb-0">
            <div className="text-left max-w-[670px]">
              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-3xl  2xl:text-[75px] lg:text-5xl md:text-[2.5rem] sm:4xl font-medium mb-7 lg:mb-[50px] text-white leading-tight">
                Store <span className="underline">a ton</span> of files, with
                Lume
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.2,
                  ease: "easeOut",
                }}
                className="text-[#BDC2C1] text-base lg:text-xl mb-5 lg:mb-[60px] max-w-[480px]">
                Experience privacy-first solutions that are more affordable than
                most on the market, putting you in control.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.3,
                  ease: "easeOut",
                }}
                className="flex space-x-3 lg:space-x-6 mt-8">
                <Button label="Get 1TB for free →" url="#" style="btn-light" />

                <Button label="How it works →" url="#" style="outline" />
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.1,
              ease: "easeOut",
            }}>
            <img
              src={HeroImage.src}
              alt="hero image"
              className="hidden lg:block"
            />

            <div className="lg:hidden">
              <img src={HeroImageMobile.src} alt="hero image" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
