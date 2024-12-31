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
              title="True data removal when you need it"
              description="Unlike traditional cloud storage, when you delete files on Lume, they're genuinely gone"
            />

            <div>
              <Button
                style="outline"
                label="Read more about data deletion →"
                url="#"
              />
            </div>
          </div>

          <div className="md:px-10 lg:px-0 w-full max-w-[550px] m-auto overflow-hidden md:overflow-visible">
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
            <p className="text-[#abeedb]/50 text-md hidden lg:block font-normal font-['Euclid Circular A'] leading-[29px] tracking-tight relative right-14">
              Built on open source technology, powered by Sia
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeleteSection;
