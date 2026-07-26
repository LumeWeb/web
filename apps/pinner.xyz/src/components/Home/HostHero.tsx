import HeroSection from "@/components/hero/HeroSection";
import HostServerGrid from "./HostServerGrid";
import HostHeroValueProps from "./HostHeroValueProps";
import { config } from "@/lib/config";

/**
 * HostHero: Hero section for the /host funnel page.
 *
 * Homepage-style dark theme with live server grid animation.
 * CLI install flows naturally inside the hero text column.
 */
const HostHero = () => {
  return (
    <HeroSection
      headline="Your website. Your name. Distributed storage."
      subheadline={<HostHeroValueProps />}
      primaryButtons={[
        {
          label: "Deploy your site",
          url: config.registerUrl("hosting"),
          buttonStyle: "btn-light",
          trackEvent: "host_hero_deploy_clicked",
        },
      ]}
      secondaryButton={{
        label: "See how it works",
        url: "#how-it-works",
        buttonStyle: "outline",
        trackEvent: "host_hero_secondary_clicked",
      }}
      trustLine="Distributed storage · Fixed pricing · Cancel anytime"
      visualContent={<HostServerGrid />}
      showCLIInstall
    />
  );
};

export default HostHero;
