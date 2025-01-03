import { Button } from "@/components/ui/button";

import ProgressCard from "../cards/ProgressCard";
import MenuCard from "../cards/MenuCard";

const Hero = () => {
  return (
    <section className="pt-[155px]">
      <div className="xl:container px-6">
        <div className="md:columns-2 sm:columns-1 lg:flex lg:h-[600px] xl:min-h-[880px] lg:items-center overflow-hidden lg:justify-between">
          <div className="mb-[50px] lg:mb-0 pb-[50px]">
            <div className="text-left max-w-[670px]">
              <h1 className="text-3xl 2xl:text-[75px] lg:text-5xl md:text-[2.5rem] sm:4xl font-medium mb-7 lg:mb-[50px] text-white leading-tight">
                Your files, <span className="underline">truly private</span>,
                with Lume
              </h1>

              <p className="text-[#BDC2C1] text-base lg:text-xl mb-5 lg:mb-[60px] max-w-[480px]">
                Experience decentralized storage that puts you in control -
                secure, private, and more affordable than traditional solutions.
              </p>

              <div className="flex space-x-3 lg:space-x-6 mt-8">
                <Button
                  label="Start Storing →"
                  url="https://account.pinner.xyz"
                  style="btn-light"
                />
                <Button
                  label="How it works →"
                  url="/how-it-works"
                  style="outline"
                />
              </div>
            </div>
          </div>

          <div className="lg:w-[480px] !translate-y-11 lg:translate-y-0">
            <div className="hidden lg:block">
              <ProgressCard
                value="25"
                width="w-[90%]"
                title="design-assets.sketch (28 MB)"
                opacity="opacity-25"
              />
              <MenuCard
                title="project-backup"
                description="1 file (1.2 MB)"
                day="7 days ago"
                style="bg-[#0D2D2A] border-none mb-8 opacity-100 max-w-[340px]"
              />
              <MenuCard
                title="photos"
                description="29 files (345 MB)"
                day="2 days ago"
                style="mb-8 opacity-25 max-w-[290px]"
              />
              <ProgressCard value="88" title="quarterly-report.pdf (13 MB)" />
              <MenuCard
                title="project-backup"
                description="15 files (2.3 GB)"
                day="Just now"
                style="bg-[#0D2D2A] border-none opacity-25 max-w-[360px]"
              />
            </div>

            <div className="lg:hidden max-w-[342px]">
              <ProgressCard
                value="25"
                title="design-assets.sketch (28 MB)"
                opacity="opacity-25"
              />
              <MenuCard
                title="project-backup"
                description="1 file (1.2 MB)"
                day="7 days ago"
                style="bg-[#0D2D2A] border-none mb-8 opacity-100 max-w-[342px] !mb-[-60px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
