import HeroSection from "@/components/hero/HeroSection";
import PinNetworkGrid from "./PinNetworkGrid";
import PinHeroValueProps from "./PinHeroValueProps";
import { config } from "@/lib/config";

/**
 * PinHero: Hero section for the /pin funnel page.
 *
 * Homepage-style dark theme with IPFS pinning network grid animation.
 * CLI install flows naturally inside the hero text column.
 */
const PinHero = () => {
  return (
    <HeroSection
      headline="Pin with storage proofs, not promises"
      subheadline={<PinHeroValueProps />}
      primaryButtons={[
        {
          label: "Start pinning",
          url: config.registerUrl("pinning"),
          buttonStyle: "btn-light",
          trackEvent: "pin_hero_start_clicked",
        },
      ]}
      secondaryButton={{
        label: "See how it works",
        url: "#how-it-works",
        buttonStyle: "outline",
        trackEvent: "pin_hero_secondary_clicked",
      }}
      trustLine="Storage proofs · Fixed pricing · Content-addressed"
      visualContent={<PinNetworkGrid />}
      showCLIInstall
    />
  );
};

export default PinHero;
