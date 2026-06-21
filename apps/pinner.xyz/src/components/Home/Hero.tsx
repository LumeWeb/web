import HeroSection from "@/components/hero/HeroSection";
import ProgressCard from "@/components/cards/ProgressCard";
import MenuCard from "@/components/cards/MenuCard";
import { config } from "@/lib/config";

const Hero = () => {
  const visualContent = (
    <>
      <div className="hidden lg:block">
        <ProgressCard
          value="25"
          width="w-[90%]"
          title="design-assets.sketch (28 MB)"
          opacity="opacity-25"
        />
        <MenuCard
          title="project-backup"
          description="15 files (2.3 GB)"
          day="Just now"
          style="bg-home-card-bg border-none mb-8 opacity-25 max-w-[360px]"
        />
        <MenuCard
          title="photos"
          description="29 files (345 MB)"
          day="2 days ago"
          style="mb-8 opacity-25 max-w-[290px]"
        />
        <ProgressCard value="88" width="w-[90%]" title="quarterly-report.pdf (13 MB)" />
      </div>

      <div className="lg:hidden max-w-[342px] mx-auto">
        <ProgressCard
          value="25"
          width="w-full"
          title="design-assets.sketch (28 MB)"
          opacity="opacity-25"
        />
        <MenuCard
          title="project-backup"
          description="1 file (1.2 MB)"
          day="7 days ago"
          style="bg-home-card-bg border-none mb-8 opacity-100 max-w-[342px]"
        />
      </div>
    </>
  );

  return (
    <HeroSection
      headline={<>Your data.<br />Your rules.</>}
      subheadline={<><span className="block mb-2"><a href="/solutions/ipfs-pinning" className="underline hover:text-white transition-colors">Pin files</a>. <a href="/solutions/website-hosting" className="underline hover:text-white transition-colors">Host sites</a>. <a href="/solutions/private-storage" className="underline hover:text-white transition-colors">Store private data</a>.</span><span className="block mb-2">All on one quota. Zero-knowledge encrypted.</span><span className="block">Pay by card or crypto, no KYC on crypto.</span></>}
      primaryButtons={[
        { label: "Start Pinning →", url: config.registerUrl("pinning"), buttonStyle: "btn-light" },
        { label: "Host a Website →", url: config.registerUrl("hosting"), buttonStyle: "btn-light" },
      ]}
      secondaryButton={{
        label: "Read the Docs →",
        url: "https://docs.pinner.xyz",
        buttonStyle: "outline",
        target: "_blank"
      }}
      visualContent={visualContent}
      microcopy="Pay with crypto or card · No ID required for crypto"
      trustLine="Built on Sia · FOSS · Zero-knowledge encryption · No bandwidth tricks, no feature gating"
    />
  );
};

export default Hero;
