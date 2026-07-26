import HeroSection from "@/components/hero/HeroSection";
import HostServerGrid from "./HostServerGrid";
import { config } from "@/lib/config";

/**
 * EnsHero: Hero section for the /ens funnel page.
 *
 * Homepage-style dark theme with live server grid animation.
 * CLI install flows naturally inside the hero text column.
 */
const EnsHero = () => {
  return (
    <HeroSection
      headline="Your .eth website. Hosted and resolved."
      subheadline="Upload your site, point your ENS name. Two commands."
      primaryButtons={[
        {
          label: "Host your .eth site",
          url: config.registerUrl("hosting"),
          buttonStyle: "btn-light",
          trackEvent: "ens_hero_host_clicked",
        },
      ]}
      secondaryButton={{
        label: "See how it works",
        url: "#how-it-works",
        buttonStyle: "outline",
        trackEvent: "ens_hero_secondary_clicked",
      }}
      trustLine="Contenthash output · IPNS updates · Cancel anytime"
      visualContent={<HostServerGrid domain="my-site.eth" />}
      showCLIInstall
    />
  );
};

export default EnsHero;
