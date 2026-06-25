import { cn } from "@/lib/utils";

interface MigrationSectionProps {
  subtitle?: string;
  title?: string;
  description?: string;
  theme?: "gray" | "white";
  imagePosition?: "left" | "right";
}

/**
 * MigrationSection - Simple migration flow diagram.
 *
 * Replaces solutions-pinata-migrate.jpg (abstract cube-to-hexagons line art).
 *
 * Shows: Existing pins (CIDs) -> Re-pin on Pinner -> Live, same addresses
 */
export default function MigrationSection({
  subtitle = "Migration",
  title = "Need help moving your pins? We'll help you migrate.",
  description = "Switching IPFS pinning providers is straightforward. Your content addresses stay the same because they're content hashes, not proprietary URLs. Pin your existing CIDs on Pinner and they're live. If you have a large collection or custom setup, reach out and we'll work with you on the transition.",
  theme = "white",
  imagePosition = "left",
}: MigrationSectionProps) {
  const isReversed = imagePosition === "right";

  const steps = [
    {
      label: "Existing pins",
      sublabel: "Your CIDs stay the same",
      icon: <PinIcon />,
    },
    {
      label: "Re-pin on Pinner",
      sublabel: "Pin your CIDs on the Sia network",
      icon: <ArrowIcon />,
    },
    {
      label: "Live",
      sublabel: "Same addresses, verifiable storage",
      icon: <CheckCircleIcon />,
    },
  ];

  return (
    <section className={cn("py-[60px] md:py-[120px]", theme === "gray" ? "bg-content-section-gray" : "bg-white")}>
      <div className="xl:container px-6">
        <div className="flex md:gap-10 flex-wrap md:flex-nowrap md:items-center md:justify-between">
          {/* Migration flow diagram */}
          <div className={cn(
            "w-full md:w-auto basis-auto md:basis-[45%] lg:basis-[48%] order-2",
            isReversed ? "md:order-2" : "md:order-1"
          )}>
            <div className="flex flex-col gap-3 sm:gap-4">
              {steps.map((step, i) => (
                <div key={step.label}>
                  <div
                    className={cn(
                      "group relative overflow-hidden rounded-2xl p-5",
                      "bg-[#0d1d1c] border border-[#0d2d2a]",
                      "transition-transform duration-200 hover:-translate-y-0.5"
                    )}
                  >
                    <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-[#abeedb]/5" />
                    <div className="flex items-center gap-4">
                      <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#051413] ring-1 ring-[#abeedb]/20">
                        <div className="text-[#abeedb] [&>svg]:h-6 [&>svg]:w-6">
                          {step.icon}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-[#abeedb] text-sm font-medium leading-tight">
                          {step.label}
                        </h4>
                        <p className="text-[#bdc2c1] mt-1 text-xs leading-relaxed">
                          {step.sublabel}
                        </p>
                      </div>
                      {/* Step number */}
                      <span className="text-[#abeedb]/30 text-2xl font-bold tabular-nums">
                        {i + 1}
                      </span>
                    </div>
                  </div>
                  {/* Connector line between steps (not after last) */}
                  {i < steps.length - 1 && (
                    <div className="flex justify-center py-1">
                      <div className="h-4 w-px bg-[#abeedb]/20" />
                    </div>
                  )}
                </div>
              ))}
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

/* --- Icons --- */

function PinIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Push pin shape */}
      <path d="M20 4 L28 12 L24 16 L16 8 Z" />
      <path d="M24 16 L18 22 L10 14 L16 8" />
      <path d="M18 22 L12 28" />
      <path d="M10 14 L6 18" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Arrow right with circle */}
      <circle cx="6" cy="16" r="3" />
      <path d="M10 16 H22" />
      <path d="M18 12 L22 16 L18 20" />
      <circle cx="26" cy="16" r="3" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="16" r="12" />
      <path d="M11 16 L15 20 L22 12" strokeWidth="2.5" />
    </svg>
  );
}
