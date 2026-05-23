import { cn } from "@/lib/utils";
import Section from "@/components/layout/Section";
import { Button } from "@/components/ui/button";

type BannerVariant = "home" | "content";

interface DiscountStairsBannerProps {
  className?: string;
  variant?: BannerVariant;
}

export default function DiscountStairsBanner({
  className,
  variant = "content",
}: DiscountStairsBannerProps) {
  if (variant === "home") {
    return (
      <Section variant="dark" padding="sm">
        <div className="xl:container px-6">
          <div className="mx-auto max-w-[720px] border border-home-text-muted/20 rounded-lg p-6 lg:p-8">
            <p className="text-home-text text-lg font-medium mb-2 lg:text-xl">
              🎉 Introductory Offer
            </p>
            <p className="text-home-text-muted text-sm leading-relaxed lg:text-base">
               We're onboarding a small group of founding users — 6 weeks of
               IPFS pinning at no cost. Help shape this service and get direct
               access to the team. Contact us for your founding trial.
            </p>
            <div className="mt-4">
              <Button
                label="Start Pinning →"
                url="https://account.pinner.xyz"
                buttonStyle="outline"
              />
              <p className="text-home-text-muted text-xs mt-2">
                No credit card required · No ID for crypto payments
              </p>
            </div>
            <p className="text-home-text-muted text-xs mt-3 italic">
              Small team, personal support. No support queues.
            </p>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border-l-4 border-content-text bg-content-section-gray p-6 md:p-8",
        className
      )}
    >
      <p className="text-content-text text-lg font-medium md:text-xl">
        🎉 Introductory Offer
      </p>
      <p className="text-content-text-muted mt-2 text-sm leading-relaxed md:text-base">
        We're onboarding a small group of founding users — 6 weeks of IPFS
        pinning at no cost. Help shape this service and get direct access to
        the team. Contact us for your founding trial.
      </p>
      <p className="text-content-text-muted mt-3 text-xs md:text-sm italic">
        Small team, personal support. No support queues.
      </p>
    </div>
  );
}
