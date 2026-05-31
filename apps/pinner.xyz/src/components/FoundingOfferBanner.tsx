import { cn } from "@/lib/utils";
import Section from "@/components/layout/Section";
import { Button } from "@/components/ui/button";

type BannerVariant = "home" | "content";

interface FoundingOfferBannerProps {
  className?: string;
  variant?: BannerVariant;
  guarantee?: string;
}

const baseBenefits = [
  "Rate locked for life",
  "30-day money-back guarantee, no questions asked",
  "Free migration from your current host",
];

export default function FoundingOfferBanner({
  className,
  variant = "content",
  guarantee,
}: FoundingOfferBannerProps) {
  const foundingBenefits = guarantee
    ? [...baseBenefits.slice(0, 2), guarantee, baseBenefits[2]]
    : baseBenefits;

  if (variant === "home") {
    return (
      <Section variant="dark" padding="sm">
        <div className="xl:container px-6">
          <div className="mx-auto max-w-[720px] xl:max-w-[800px] border border-home-text-muted/20 rounded-lg p-6 lg:p-8">
            <p className="text-home-text text-lg font-medium mb-2 lg:text-xl">
              Founding Offer
            </p>
            <p className="text-home-text-muted text-sm leading-relaxed lg:text-base">
              First 50 accounts get their rate locked for life. After
              that, standard terms apply.
            </p>
            <ul className="mt-3 space-y-1">
              {foundingBenefits.map((item) => (
                <li
                  key={item}
                  className="text-home-text-muted text-sm leading-relaxed lg:text-base flex items-start gap-2"
                >
                  <span className="text-home-text mt-0.5 flex-shrink-0">&#10003;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <Button
                label="Start Pinning →"
                url="https://account.pinner.xyz"
                buttonStyle="outline"
              />
            </div>
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
        Founding Offer
      </p>
      <p className="text-content-text-muted mt-2 text-sm leading-relaxed md:text-base">
        First 50 accounts get their rate locked for life. After that,
        standard terms apply.
      </p>
      <ul className="mt-3 space-y-1">
        {foundingBenefits.map((item) => (
          <li
            key={item}
            className="text-content-text-muted text-sm leading-relaxed md:text-base flex items-start gap-2"
          >
            <span className="text-content-text mt-0.5 flex-shrink-0">&#10003;</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
