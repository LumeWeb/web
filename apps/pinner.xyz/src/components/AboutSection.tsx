import { Button } from "@/components/ui/button";
import ContentSection from "@/components/content/ContentSection";
import { cn } from "@/lib/utils";

interface AboutSectionProps {
	subtitle?: string;
	title?: string;
	description?: string;
	children?: React.ReactNode;
	buttonText?: string;
	url?: string;
	imageUrl?: { src: string };
	imageAlt?: string;
	imgageMobileUrl?: { src: string };
	theme?: "gray" | "white";
	imagePosition?: "left" | "right";
	centered?: boolean;
	id?: string;
}

const AboutSection = ({
  subtitle,
  title,
  description,
  children,
  buttonText,
  url,
  imageUrl,
  imageAlt = "Diagram showing how Pinner stores and serves your files across a distributed network",
  imgageMobileUrl,
  theme,
  imagePosition,
  centered = false,
  id,
}: AboutSectionProps) => {
  const imageContent = (
    <>
      {imageUrl && (
        <div className="hidden md:block">
          <img src={imageUrl.src} alt={imageAlt} width={600} height={400} loading="lazy" className="max-w-full h-auto object-contain" />
        </div>
      )}

      {imgageMobileUrl && (
        <div
          className={cn(
            "md:hidden p-[10%] rounded-tl-[50px] rounded-br-[50px]",
            theme == "gray" ? "bg-white" : "bg-content-section-gray"
          )}>
          <img
            src={imgageMobileUrl.src}
            alt={imageAlt}
            width={400}
            height={300}
            loading="lazy"
            className="mix-blend-multiply w-full"
          />
        </div>
      )}
    </>
  );

  return (
    <ContentSection
      id={id}
      subtitle={subtitle}
      title={title}
      description={description}
      buttonText={buttonText}
      buttonUrl={url}
      imageContent={imageContent}
      imagePosition={imagePosition}
      centered={centered}
      className={theme == "gray" ? "bg-content-section-gray" : "bg-white"}
    >
      {children}
    </ContentSection>
  );
};
export default AboutSection;
