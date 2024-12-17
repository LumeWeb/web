import Button from "./Button";
import iconUser from "../assets/icon-user-black.svg";
import iconFolder from "../assets/icon-folder-black.svg";
import iconDeliver from "../assets/icon-deliver-black.svg";
import iconCheck from "../assets/icon-check-black.svg";

const PricingCommunity = ({
  title,
  description,
  priceType,
  features,
  buttonText,
  url,
}) => {
  return (
    <div className="bg-[#E4E0D4] py-[28px] lg:py-[50px] px-[30px] lg:px-[40px] transition-all duration-300 ease-in-out w-full max-w-[610px]">
      <h3 className="text-[#0D1D1C] text-[21px] md:text-[24px] xl:text-[40px] font-medium leading-10 mb-3 md:mb-1">
        {title}
      </h3>
      <p className="text-[#0D1D1C] text-[17px] md:text-[21px] font-medium mb-2 md:mb-6">
        {description}
      </p>
      <h4 className="text-[#0D1D1C] text-[21px] md:text-[24px] xl:text-[40px] font-medium flex items-center gap-2 mb-3 md:mb-5">
        {priceType}
      </h4>
      <ul className="mb-5 md:mb-11">
        {features.map((feature, index) => (
          <li
            key={index}
            className="text-[#485453] flex items-center gap-2 md:gap-4 text-[13px] md:text-lg leading-8">
            <img
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
