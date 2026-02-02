import Section from "@/components/layout/Section";
import Heading from "@/components/Heading";
import { Button } from "@/components/ui/button";
import Image from "@/assets/progress-image.svg";
import { DownloadProgressCard } from "@/components/cards/DownloadCard";

const RailsSection = () => {
  return (
    <Section>
      <div className="xl:container px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-11 lg:gap-28 overflow-hidden">
          <div>
            <Heading
              align="text-left"
              title="Your data"
              highlightText="any use case"
              description="Private storage. File sharing. Social media. Creator tools. Whatever you're building, we support it."
            />

            <p className="text-home-text-muted text-base md:text-xl mb-6">
              Powered by IPFS, Sia, LBRY — and more coming.
            </p>

            <div>
              <Button
                style="outline"
                label="View Documentation →"
                url="https://docs.pinner.xyz"
              />
            </div>
          </div>

          <div className="md:px-6 lg:px-0 w-full max-w-full lg:max-w-[550px] m-auto overflow-hidden">
            {/* <img src={Image.src} alt="Delete" /> */}
            <div className="relative space-y-6 h-[375px]">
              <div className="relative left-6 md:left-0">
                <DownloadProgressCard
                  title="Network" // Instead of "Download"
                  limit={100} // Use 100 to make percentages easy
                  used={85} // Show high activity
                  left={15} // Keep the math correct
                />
              </div>
              <div className="md:absolute bottom-1 w-full md:right-8 right-0 lg:right-[68px]">
                <DownloadProgressCard
                  title="Storage" // Instead of "Upload"
                  limit={100} // Use 100 again
                  used={40} // Show moderate usage
                  left={60} // Keep the math correct
                />
              </div>
            </div>
            <p className="text-home-accent/50 text-md hidden lg:block font-normal font-['Euclid Circular A'] leading-[29px] tracking-tight relative right-14">
              Built on open source technology, powered by Sia
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default RailsSection;
