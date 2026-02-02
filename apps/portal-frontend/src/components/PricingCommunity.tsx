import { Button } from "@/components/ui/button";
import iconUser from "@/assets/icon-user-black.svg";
import iconFolder from "@/assets/icon-folder-black.svg";
import iconDeliver from "@/assets/icon-deliver-black.svg";
import iconCheck from "@/assets/icon-check-black.svg";

interface PricingCommunityProps {
	title: string;
	description: string;
	priceType: string;
	features: string[];
	buttonText: string;
	url: string;
}

const PricingCommunity = ({
  title,
  description,
  priceType,
  features,
  buttonText,
  url,
}: PricingCommunityProps) => {
  return (
    <div className="bg-content-section-gray py-[28px] lg:py-[50px] px-[30px] lg:px-[40px] transition-all duration-300 ease-in-out w-full max-w-[610px]">
      <h3 className="text-content-text text-[21px] md:text-[24px] xl:text-[40px] font-medium leading-10 mb-3 md:mb-1">
        {title}
      </h3>
      <p className="text-content-text text-[17px] md:text-[21px] font-medium mb-2 md:mb-6">
        {description}
      </p>
      <h4 className="text-content-text text-[21px] md:text-[24px] xl:text-[40px] font-medium flex items-center gap-2 mb-3 md:mb-5">
        {priceType}
      </h4>
      <ul className="mb-5 md:mb-11">
        {features.map((feature: string, index: number) => (
          <li
            key={index}
            className="text-content-text-muted flex items-center gap-2 md:gap-4 text-[13px] md:text-lg leading-8 mb-2">
            <img
              className="w-[16px]"
              src={
                index === 0
                  ? iconUser.src
                  : index === 1
                    ? iconFolder.src
                    : index === 2
                      ? iconDeliver.src
                      : iconCheck.src
              }
              alt="feature icon"
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button label={buttonText} url={url} />
    </div>
  );
};

export default PricingCommunity;
