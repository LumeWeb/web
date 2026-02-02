import React from "react";
import { cn } from "@/components/ui/lib/utils";

export interface HeroButton {
  label: string;
  url: string;
  variant?: "primary" | "secondary";
}

export interface HeroProps {
  backgroundImage?: string;
  blur?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  opacity?: "25" | "50" | "75" | "100";
  minHeight?: "none" | "sm" | "md" | "lg" | "xl";
  bgPosition?: "auto" | "center" | "top" | "bottom" | "left" | "right";
  children?: React.ReactNode;
}

export function Hero({ backgroundImage, blur = "sm", opacity = "50", minHeight = "lg", bgPosition = "center", children }: HeroProps) {
  const minHeightClasses = {
    none: "",
    sm: "min-h-[40vh]",
    md: "min-h-[60vh]",
    lg: "min-h-[80vh]",
    xl: "min-h-[100vh]",
  };

  const bgPositionClasses = {
    auto: "",
    center: "top-[50px] left-1/2 -translate-x-1/2",
    top: "top-0 left-1/2 -translate-x-1/2",
    bottom: "bottom-0 left-1/2 -translate-x-1/2",
    left: "top-1/2 left-0 -translate-y-1/2",
    right: "top-1/2 right-0 -translate-y-1/2",
  };

  return (
    <section className={cn("relative flex items-center justify-center overflow-hidden", minHeightClasses[minHeight])}>
      {/* Subtle overlay layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-charcoal-2/30 via-blue-charcoal/30 to-blue-charcoal-2/30" />

      {backgroundImage && (
        <img
          src={backgroundImage}
          className={cn(
            "-z-10 absolute w-[100em] max-w-none",
            bgPositionClasses[bgPosition],
            blur === "xs" ? "[filter:blur(2px)]" : blur !== "none" && `blur-${blur}`,
            `opacity-${opacity}`
          )}
          alt=""
        />
      )}

      <div className="relative z-10 w-full">
        {children}
      </div>
    </section>
  );
}

export interface HeroContentProps {
  title?: string;
  titleSize?: "sm" | "md" | "lg";
  tagline?: string;
  emphasis?: string;
  buttons?: HeroButton[];
}

const defaultButtons: HeroButton[] = [
  { label: "Explore Ecosystem", url: "/projects", variant: "primary" },
  { label: "Join Community", url: "#community", variant: "secondary" },
];

export function HeroContent({
  title = "An open web for everyone.",
  titleSize = "lg",
  tagline,
  emphasis,
  buttons = defaultButtons,
}: HeroContentProps) {
  const titleClasses = {
    sm: "text-3xl md:text-5xl",
    md: "text-4xl md:text-6xl",
    lg: "text-5xl md:text-7xl lg:text-8xl",
  };

  return (
    <div className="max-w-4xl mx-auto px-6 text-center">
      <h1 className={cn("font-display font-bold text-white leading-tight mb-8", titleClasses[titleSize])}>
        {title}
      </h1>
      
      {emphasis ? (
        <p className="font-body text-xl md:text-2xl text-cloud text-center max-w-2xl mx-auto mb-12">
          Freedom. <span className="text-aquamarine font-bold">{emphasis}</span>. Ownership.
        </p>
      ) : tagline ? (
        <p className="font-body text-xl md:text-2xl text-cloud text-center max-w-2xl mx-auto mb-12">
          {tagline}
        </p>
      ) : null}
      
      {buttons.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {buttons.map((button) => (
            <a
              key={button.url}
              href={button.url}
              className={cn(
                "inline-flex items-center justify-center px-8 py-4 font-display font-bold text-lg rounded-lg transition-all duration-250",
                {
                  "bg-blue-charcoal border-2 border-aquamarine text-aquamarine hover:-translate-y-1 hover:shadow-lg hover:shadow-aquamarine/20":
                    button.variant === "secondary",
                  "bg-aquamarine text-blue-charcoal hover:bg-white": button.variant !== "secondary",
                }
              )}
            >
              {button.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export function HomepageHero({ backgroundImage, minHeight, blur, opacity, bgPosition, buttons, title, titleSize, emphasis, tagline }: HeroProps & HeroContentProps) {
  return (
    <Hero backgroundImage={backgroundImage} minHeight={minHeight} blur={blur} opacity={opacity} bgPosition={bgPosition}>
      <HeroContent
        title={title}
        titleSize={titleSize}
        emphasis={emphasis ?? "Privacy"}
        tagline={tagline}
        buttons={buttons && buttons.length > 0 ? buttons : undefined}
      />
    </Hero>
  );
}

export default HomepageHero;