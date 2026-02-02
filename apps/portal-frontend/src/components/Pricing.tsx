import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type PricingTheme = {
	hoverBg: string;
	title: string;
	description: string;
	price: string;
	feature: string;
};

const pricingThemes: Record<"dark" | "light", PricingTheme> = {
	dark: {
		hoverBg: "",
		title: "text-home-text",
		description: "text-home-text",
		price: "text-home-text",
		feature: "text-home-text-muted",
	},
	light: {
		hoverBg: "hover:bg-content-section-gray",
		title: "text-content-text",
		description: "text-content-text",
		price: "text-content-text",
		feature: "text-content-text-muted",
	},
};

interface Feature {
	id: string | number;
	text: string;
	icon?: string;
	iconBlack?: string;
}

interface PricingItem {
	title: string;
	description: string;
	price?: number;
	tag?: string;
	features: Feature[];
	buttonText: string;
	url: string;
}

interface PricingProps {
	pricingData: PricingItem[];
	type?: "dark" | "light";
	tag?: "true" | "false";
	showPricing?: boolean;
}

const PricingItem = ({
  pricingData,
  type = "dark",
  tag = "true",
  showPricing = false,
}: PricingProps) => {
  const theme = pricingThemes[type];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-2 md:gap-5 lg:gap-5">
      {pricingData.map((item: PricingItem, index: number) => (
        <div
          key={index}
          className={cn(
            theme.hoverBg,
            "py-[28px] lg:py-[50px] px-[30px] lg:px-[40px] transition-all duration-300 ease-in-out"
          )}>
          <h3
            className={cn(
              theme.title,
              "text-[21px] md:text-[40px] font-medium leading-10 mb-3 mb:mb-1 items-center flex whitespace-nowrap"
            )}>
            {item.title}
            {tag === "true" && item.tag && (
              <Badge className="ml-2" variant="custom">
                {item.tag}
              </Badge>
            )}
          </h3>
          <p
            className={cn(
              theme.description,
              "text-[17px] md:text-[19px] font-medium mb-4 md:mb-8"
            )}>
            {item.description}
          </p>

          {showPricing && item.price !== undefined && (
            <h4
              className={cn(
                theme.price,
                "text-[32px] md:text-[40px] font-medium mb-4 md:mb-8"
              )}>
              ${item.price}{" "}
              <span className="text-[15px] md:text-base">/month</span>
            </h4>
          )}

          <ul className="mb-5 md:mb-11">
            {item.features.map((feature: Feature) => (
              <li
                key={feature.id}
                className={cn(
                  theme.feature,
                  "flex items-center gap-2 md:gap-4 text-[13px] mb-2 md:text-base xl:text-lg leading-8"
                )}>
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
