import { Button } from "@/components/ui/button";
import HeroImage from "../../assets/hero-image.svg";
import HeroImageMobile from "../../assets/hero-mobile-image.svg";


const Hero = () => {
	return (
    <section className="pt-[155px] lg:pt-[170px]">
      <div className="container">
        <div className="md:columns-2 sm:columns-1 lg:flex lg:min-h-[701px] xl:min-h-[910px] lg:items-center lg:justify-between">
          <div className="mb-[50px] lg:mb-0 pb-[50px]">
            <div className="text-left max-w-[670px]">
              <h1 className="text-3xl  2xl:text-[75px] lg:text-5xl md:text-[2.5rem] sm:4xl font-medium mb-7 lg:mb-[50px] text-white leading-tight">
                Store <span className="underline">a ton</span> of files, with
                Lume
              </h1>

              <p className="text-[#BDC2C1] text-base lg:text-xl mb-5 lg:mb-[60px] max-w-[480px]">
                Experience privacy-first solutions that are more affordable than
                most on the market, putting you in control.
              </p>

              <div className="flex space-x-3 lg:space-x-6 mt-8">
                <Button label="Get 1TB for free →" url="#" style="btn-light" />
                <Button label="How it works →" url="#" style="outline" />
              </div>
            </div>
          </div>

          <div>
            <img
              src={HeroImage.src}
              alt="hero image"
              className="hidden lg:block"
            />

            <div className="lg:hidden">
              <img
                className="w-full"
                src={HeroImageMobile.src}
                alt="hero image"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
