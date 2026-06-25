import { cn } from "@/lib/utils";

interface PinataComparisonSectionProps {
  subtitle?: string;
  title?: string;
  description?: string;
  theme?: "gray" | "white";
  imagePosition?: "left" | "right";
}

/**
 * PinataComparisonSection - Side-by-side comparison of Pinner vs Pinata.
 *
 * Replaces solutions-pinata-differ.jpg (which was a decorative 3D isometric
 * network diagram with no informational content).
 *
 * Shows actual comparison points: what Pinner offers that Pinata doesn't.
 */
export default function PinataComparisonSection({
  subtitle = "How It Works",
  title = "Verifiable hosting, no-KYC payments, and more",
  description = "Pay with crypto or card. No KYC for crypto. Your pins live across independent storage providers instead of centralized infrastructure. Host static websites from the same pinned content. Fully open source, no black box.",
  theme = "gray",
  imagePosition = "right",
}: PinataComparisonSectionProps) {
  const isReversed = imagePosition === "right";

  const pinataPoints = [
    { label: "Storage", detail: "Centralized infrastructure" },
    { label: "Payments", detail: "Card only" },
    { label: "KYC", detail: "Required" },
    { label: "Website hosting", detail: "Not available" },
    { label: "Source code", detail: "Closed source" },
  ];

  const pinnerPoints = [
    { label: "Storage", detail: "Sia network, independent hosts" },
    { label: "Payments", detail: "Crypto or card" },
    { label: "KYC", detail: "Not required for crypto" },
    { label: "Website hosting", detail: "From pinned content" },
    { label: "Source code", detail: "Fully open source" },
  ];

  return (
    <section className={cn("py-[60px] md:py-[120px]", theme === "gray" ? "bg-content-section-gray" : "bg-white")}>
      <div className="xl:container px-6">
        <div className="flex md:gap-10 flex-wrap md:flex-nowrap md:items-center md:justify-between">
          {/* Comparison cards */}
          <div className={cn(
            "w-full md:w-auto basis-auto md:basis-[48%] lg:basis-[52%] order-2",
            isReversed ? "md:order-2" : "md:order-1"
          )}>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* Pinata column */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-300">
                  <span className="text-xs sm:text-sm font-medium text-gray-500">Pinata</span>
                </div>
                {pinataPoints.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg bg-gray-100 border border-gray-200 p-3 sm:p-4"
                  >
                    <p className="text-[10px] sm:text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                      {item.label}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 leading-tight">
                      {item.detail}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pinner column */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#abeedb]/30">
                  <div className="h-2 w-2 rounded-full bg-[#abeedb]" />
                  <span className="text-xs sm:text-sm font-medium text-[#abeedb]">Pinner</span>
                </div>
                {pinnerPoints.map((item) => (
                  <div
                    key={item.label}
                    className={cn(
                      "group relative overflow-hidden rounded-lg p-3 sm:p-4",
                      "bg-[#0d1d1c] border border-[#0d2d2a]",
                      "transition-transform duration-200 hover:-translate-y-0.5"
                    )}
                  >
                    <div className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-[#abeedb]/5" />
                    <p className="text-[10px] sm:text-xs text-[#abeedb]/70 font-medium uppercase tracking-wide mb-1">
                      {item.label}
                    </p>
                    <p className="text-xs sm:text-sm text-[#bdc2c1] leading-tight">
                      {item.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Text content */}
          <div className={cn(
            "mb-[44px] md:mb-[50px] lg:mb-0 flex-2 order-1",
            isReversed ? "md:order-1" : "md:order-2"
          )}>
            <div className="text-left max-w-[670px]">
              <h3 className="text-content-text-muted lg:text-[21px] md:text-base hidden md:block font-medium lg:mb-6 md:mb-2">
                {subtitle}
              </h3>
              <h2 className="text-[25px] lg:text-[40px] md:text-[32px] font-medium mb-4 lg:mb-[26px] text-content-text leading-tight">
                {title}
              </h2>
              <p className="text-content-text-muted text-[13px] md:text-base lg:text-lg leading-[21px] lg:leading-[35px] md:leading-[26px] lg:text-xl mb-6 lg:mb-[26px] max-w-[600px]">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
