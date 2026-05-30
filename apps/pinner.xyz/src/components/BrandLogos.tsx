import Section from "@/components/layout/Section";
import { cn } from "@/lib/utils";

interface Logo {
	id: string | number;
	src: string;
	alt?: string;
	url?: string;
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
        <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-12 xl:gap-16">
          <div className="text-center lg:text-left">
            <h2
              className={cn(
                "text-[24px] sm:text-[28px] md:text-[31px] font-medium",
                theme.title
              )}>
              {title}
            </h2>
          </div>

          <div>
            <div className="flex gap-6 sm:gap-8 md:gap-10 items-center justify-center">
              {logoList.map((logo: Logo) => (
                <a key={logo.id} href={logo.url} target="_blank" rel="noopener noreferrer" aria-label={logo.alt || "brand logo"}>
                  <img src={logo.src} alt={logo.alt || "brand logo"} width={120} height={50} loading="lazy" className="max-h-[50px] w-auto h-auto object-contain" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default BrandLogos;
