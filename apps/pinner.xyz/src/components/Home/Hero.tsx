import HeroSection from "@/components/hero/HeroSection";
import NetworkVisual from "@/components/NetworkVisual";
import HomeHeroValueProps from "./HomeHeroValueProps";

/**
 * Hero: Homepage hero.
 *
 * Threat-first headline. Icon-driven value props. Two action CTAs. Trust line.
 * NetworkVisual as the hero graphic (shows what Pinner actually is).
 * No file-manager UI. No docs CTA above fold.
 */
const Hero = () => {
  return (
    <HeroSection
      headline="One company. One decision. Your site offline."
      subheadline={<HomeHeroValueProps />}
      primaryButtons={[
        {
          label: "Host a website",
          url: "/host",
          buttonStyle: "btn-light",
          trackEvent: "hero_host_clicked",
        },
        {
          label: "Pin to IPFS",
          url: "/pin",
          buttonStyle: "btn-light",
          trackEvent: "hero_pin_clicked",
        },
      ]}
      visualContent={<NetworkVisual />}
      trustLine="Distributed storage · Fixed pricing · Cancel anytime"
    />
  );
};

export default Hero;
