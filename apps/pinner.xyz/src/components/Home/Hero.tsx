import HeroSection from "@/components/hero/HeroSection";
import ProgressCard from "@/components/cards/ProgressCard";
import MenuCard from "@/components/cards/MenuCard";

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
      subheadline={<><a href="/solutions/website-hosting" className="underline hover:text-white transition-colors">Website hosting</a>, <a href="/solutions/ipfs-pinning" className="underline hover:text-white transition-colors">IPFS pinning</a>, and <a href="/solutions/private-storage" className="underline hover:text-white transition-colors">private storage</a>.<br /><br />No one else can read your files, not even us.<br /><br />No vendor lock-in, no hidden fees.</>}
      primaryButton={{
        label: "Start Pinning →",
        url: "https://account.pinner.xyz",
        buttonStyle: "btn-light"
      }}
      secondaryButton={{
        label: "Read the Docs →",
        url: "https://docs.pinner.xyz",
        buttonStyle: "outline"
      }}
      visualContent={visualContent}
      microcopy="No ID required for crypto payments"
      trustLine="Built on Sia · Open source · Zero-knowledge encryption"
    />
  );
};

export default Hero;
