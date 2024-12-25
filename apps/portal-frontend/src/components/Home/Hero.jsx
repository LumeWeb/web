import { Button } from "@/components/ui/button";
import HeroImage from "../../assets/hero-image.svg";
import HeroImageMobile from "../../assets/hero-mobile-image.svg";

import ProgressCard from "../cards/ProgressCard";
import MenuCard from "../cards/MenuCard";

const Hero = () => {
  return (
    <section className="pt-[155px]">
      <div className="xl:container px-6">
        <div className="md:columns-2 sm:columns-1 pb-16 lg:pb-0 lg:flex xl:min-h-[860px] lg:items-center overflow-hidden lg:justify-between">
          <div className="lg:mb-0 md:pb-[50px]">
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

          <div className="lg:w-[480px] !translate-y-11 lg:translate-y-0">
            <div className="hidden lg:block">
              <ProgressCard
                value="25"
                width="w-[90%]"
                title="lume-logo-vector.psd (28 MB)"
                opacity="opacity-25"
              />
              <MenuCard
                title="whirly-project.json"
                description="1 files (1.2 MB)"
                day="7 days ago"
                style="bg-[#0D2D2A] border-none mb-8 opacity-100 max-w-[340px]"
              />
              <MenuCard
                title="backups"
                description="29 files (345 MB)"
                day="2 days ago"
                style="mb-8 opacity-25 max-w-[290px]"
              />
              <ProgressCard
                value="88"
                title="juan-top-secret-project.zip (13 MB)"
              />

              <MenuCard
                title="whirly-project.json"
                style="bg-[#0D2D2A] border-none opacity-25 max-w-[360px]"
              />
            </div>

            <div className="lg:hidden max-w-[342px] m-auto">
              {/* <img src={HeroImageMobile.src} alt='hero image' /> */}
              <ProgressCard
                value="25"
                title="lume-logo-vector.psd (28 MB)"
                opacity="opacity-25"
              />
              <MenuCard
                title="whirly-project.json"
                style="bg-[#0D2D2A] border-none mb-8 opacity-50 max-w-[342px] !mb-[-60px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
