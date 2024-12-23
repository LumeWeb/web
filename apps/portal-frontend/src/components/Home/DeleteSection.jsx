import Heading from "../Heading";
import { Button } from "@/components/ui/button";
import Image from "../../assets/progress-image.svg";

const DeleteSection = () => {
  return (
    <section className="py-[65px] md:py-[158px]">
      <div className="xl:container px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-11 md:gap-10 items-center">
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

          <div>
            <img src={Image.src} alt="Delete" />
            <p className="text-[#abeedb]/50 text-lg hidden lg:block font-normal font-['Euclid Circular A'] leading-[29px] tracking-tight mt-5">
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
