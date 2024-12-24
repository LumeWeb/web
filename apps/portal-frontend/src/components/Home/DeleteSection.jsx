import Heading from "../Heading";
import { Button } from "@/components/ui/button";
import Image from "../../assets/progress-image.svg";
import { DownloadProgressCard } from "../cards/DownloadCard";

const DeleteSection = () => {
  return (
    <section className="py-[65px] lg:py-[158px]">
      <div className="xl:container px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-11 lg:gap-28">
          <div>
            <Heading
              align="text-left"
              title="Delete what you  don’t need (forever)"
              description="Experience privacy-first solutions that are more affordable than most on the market, putting you in control."
            />

            <div>
              <Button
                style="outline"
                label="Read more about data delection →"
                url="#"
              />
            </div>
          </div>

          <div className="md:px-10 lg:px-0 w-full max-w-[550px] m-auto overflow-hidden md:overflow-visible">
            {/* <img src={Image.src} alt="Delete" /> */}
            <div className="relative space-y-6 h-[375px]">
              <div className="relative left-6 md:left-0">
                <DownloadProgressCard
                  title="Download"
                  limit={10}
                  used={5}
                  left={5}
                  onAddMore={() => alert("Add more download limit")}
                />
              </div>
              <div className="md:absolute bottom-1 w-full md:right-8 right-0 lg:right-[68px]">
                <DownloadProgressCard
                  title="Upload"
                  limit={15}
                  used={5}
                  left={10}
                  onAddMore={() => alert("Add more upload limit")}
                />
              </div>
            </div>
            <p className="text-[#abeedb]/50 text-md hidden lg:block font-normal font-['Euclid Circular A'] leading-[29px] tracking-tight relative right-14">
              * 503c related text might go here, along with any other relevant
              info.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeleteSection;
