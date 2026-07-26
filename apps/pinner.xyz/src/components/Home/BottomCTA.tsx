import { TrackedButton } from "@/components/TrackedButton";
import { cn } from "@/lib/utils";

interface BottomCTAProps {
  className?: string;
}

/**
 * BottomCTA: Captures intent from scrollers.
 * Different headline from hero. Same two actions.
 */
const BottomCTA = ({ className }: BottomCTAProps) => {
  return (
    <section className={cn("py-20 md:py-32", className)}>
      <div className="xl:container px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white mb-4">
            Host a site or pin content. On your terms.
          </h2>
          <p className="text-home-text-muted text-base md:text-lg mb-10">
            Decentralized storage with upfront pricing you control.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <TrackedButton
              label="Host a website"
              url="/host"
              buttonStyle="default"
              trackEvent="bottom_cta_host_clicked"
            />
            <TrackedButton
              label="Pin to IPFS"
              url="/pin"
              buttonStyle="outline"
              trackEvent="bottom_cta_pin_clicked"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BottomCTA;
