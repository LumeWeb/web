import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

const PricingItem = ({ pricingData, type = "dark", tag = "true" }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-2 md:gap-5 lg:gap-5">
      {pricingData.map((item, index) => (
        <div
          key={index}
          className={`${
            type === "light" ? "hover:bg-[#E4E0D4]" : ""
          } py-[28px] lg:py-[50px] px-[30px] lg:px-[40px] transition-all duration-300 ease-in-out`}>
          <h3
            className={`${
              type === "light" ? "text-[#0D1D1C]" : "text-[#F8F8F8]"
            } text-[21px] md:text-[40px] font-medium leading-10 mb-3 mb:mb-1 items-center flex`}>
            {item.title}
            {tag === "true" && item.tag && (
              <Badge className="ml-2" variant="custom">
                {item.tag}
              </Badge>
            )}
          </h3>
          <p
            className={`${
              type === "light" ? "text-[#0D1D1C]" : "text-[#F8F8F8]"
            } text-[17px] md:text-[19px] font-medium mb-4 md:mb-8`}>
            {item.description}
          </p>

          <h4
            className={`${
              type === "light" ? "text-[#0D1D1C]" : "text-[#F8F8F8]"
            }  text-[21px] md:text-[40px] font-medium flex items-center gap-2 mb-3 md:mb-5`}>
            ${item.price}{" "}
            <span className="text-[15px] md:text-base">/month</span>
          </h4>

          <ul className="mb-5 md:mb-11">
            {item.features.map((feature) => (
              <li
                key={feature.id}
                className={`${
                  type === "light" ? "text-[#485453]" : "text-[#BDC2C1]"
                } flex items-center gap-2 md:gap-4 text-[13px] mb-2 md:text-base xl:text-lg leading-8`}>
                {type === "light" ? (
                  <img
                    className="w-[16px]"
                    src={feature.iconBlack}
                    alt="user icon"
                  />
                ) : (
                  <img
                    className="w-[16px]"
                    src={feature.icon}
                    alt="user icon"
                  />
                )}
                <span>{feature.text}</span>
              </li>
            ))}
          </ul>

          <Button
            label={item.buttonText}
            url={item.url}
            style={type === "light" ? "outline-dark" : "outline"}
          />
        </div>
      ))}
    </div>
  );
};

export default PricingItem;
