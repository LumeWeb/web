import Section from "@/components/layout/Section";
import { cn } from "@/lib/utils";

interface Logo {
	id: string | number;
	src: string;
}

interface Logos {
	logoLight: Logo[];
	logoDark: Logo[];
}

interface BrandLogosProps {
	logos: Logos;
	title: string;
	logoType?: "dark" | "light";
	variant?: "default" | "dark" | "gray" | "white";
	padding?: "none" | "sm" | "md" | "lg" | "default";
}

type BrandLogoTheme = {
	bg: string;
	title: string;
};

const brandLogoThemes: Record<"dark" | "light", BrandLogoTheme> = {
	dark: {
		bg: "bg-home-section-dark",
		title: "text-home-text",
	},
	light: {
		bg: "bg-white",
		title: "text-content-text",
	},
};

const BrandLogos = ({ logos, title, logoType = "dark", variant = "default", padding = "sm" }: BrandLogosProps) => {
  const theme = brandLogoThemes[logoType];
  const logoList = logoType === "light" ? logos.logoLight : logos.logoDark;

  return (
    <Section variant={variant} padding={padding}>
      <div className="xl:container px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 xl:gap-16">
          <div className="mb-[20px] lg:mb-0 text-center lg:text-left">
            <h2
              className={cn(
                "text-[24px] sm:text-[28px] md:text-[31px] font-medium",
                theme.title
              )}>
              {title}
            </h2>
          </div>

          <div>
            <div className="flex flex-wrap gap-4 sm:gap-6 md:gap-8 items-center justify-center">
              {logoList.map((logo: Logo) => (
                <img key={logo.id} src={logo.src} alt="brand logo" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default BrandLogos;
