import { cn } from "@/lib/utils";

interface ValuesSectionProps {
  subtitle?: string;
  title?: string;
  description?: string;
  theme?: "gray" | "white";
  imagePosition?: "left" | "right";
}

/**
 * ValuesSection - "What We Stand For" section.
 *
 * Replaces the AboutSection + about-values.jpg combination.
 * Shows the values description text and the ValuesIcons.
 *
 * Accepts props so alternative/comparison pages can pass their own copy
 * while reusing the same icon design.
 */
export default function ValuesSection({
  subtitle = "What We Stand For",
  title = "Your data is yours.",
  description = `We can't look at it. Zero-knowledge encryption means the keys never leave your device. We can't sell it. We can't train models on it. Not because we chose not to, but because the architecture makes it impossible.

Uptime is a contract, not a promise. Hosts only get paid when they prove your data is there. Pricing is storage and bandwidth, upfront. No tiers to climb.

No roadblocks: we may use automation to scale, but if you need a human, you will get one.

Real SMB: founder-owned LLC, no investors, no exit strategy.

Open by default: fully open source, public GitHub. Don't take our word for it. Read the code.`,
  theme = "gray",
  imagePosition = "left",
}: ValuesSectionProps) {
  const valuePoints = description.split("\n\n").filter(Boolean);
  const isReversed = imagePosition === "right";

  const valueCards = [
    {
      id: "encryption",
      label: "Zero-knowledge encryption",
      sublabel: "Keys never leave your device. We can't read your files.",
      icon: <LockIcon />,
    },
    {
      id: "proofs",
      label: "Verifiable storage",
      sublabel: "Hosts prove they're holding your data. Or they don't get paid.",
      icon: <HandshakeIcon />,
    },
    {
      id: "open-source",
      label: "Open source",
      sublabel: "Fully open on GitHub. Don't take our word for it. Read the code.",
      icon: <CodeIcon />,
    },
  ];

  return (
    <section className={cn("py-[60px] md:py-[120px]", theme === "gray" ? "bg-content-section-gray" : "bg-white")}>
      <div className="xl:container px-6">
        <div className="flex md:gap-10 flex-wrap md:flex-nowrap md:items-center md:justify-between">
          {/* Values icons - left on desktop (or right if reversed), top on mobile */}
          <div className={cn(
            "w-full md:w-auto basis-auto xl:basis-[38%] 2xl:basis-[40%] order-2",
            isReversed ? "md:order-2" : "md:order-1"
          )}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 sm:gap-3">
              {valueCards.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl p-5",
                    "bg-[#0d1d1c] border border-[#0d2d2a]",
                    "transition-transform duration-200",
                    "hover:-translate-y-0.5"
                  )}
                >
                  {/* Subtle inner glow ring */}
                  <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-[#abeedb]/5" />

                  <div className="flex items-start gap-4">
                    {/* Icon with mint accent ring */}
                    <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#051413] ring-1 ring-[#abeedb]/20">
                      <div className="text-[#abeedb] [&>svg]:h-6 [&>svg]:w-6">
                        {item.icon}
                      </div>
                    </div>

                    <div className="flex-1">
                      <h4 className="text-[#abeedb] text-sm font-medium leading-tight">
                        {item.label}
                      </h4>
                      <p className="text-[#bdc2c1] mt-1 text-xs leading-relaxed">
                        {item.sublabel}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Text content - right on desktop (or left if reversed), bottom on mobile */}
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
              <div className="text-content-text-muted text-[13px] md:text-base lg:text-lg leading-[21px]! lg:leading-[35px]! md:leading-[26px]! lg:text-xl mb-6 lg:mb-[26px] max-w-[600px]">
                {valuePoints.map((point, i) => (
                  <p key={i} className={i > 0 ? "mt-4" : ""}>
                    {point}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --- Hand-composed SVG icons --- */
/* Detailed line art with proper stroke weight, round caps, */
/* and enough detail to read as "designed" not "stock emoji". */

function LockIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Shackle */}
      <path d="M10 14 V10 a6 6 0 0 1 12 0 V14" />
      {/* Body */}
      <rect x="7" y="14" width="18" height="14" rx="2.5" />
      {/* Keyhole */}
      <path d="M16 19 V23" />
      <circle cx="16" cy="19" r="1.5" fill="currentColor" stroke="none" />
      {/* Ward lines (detail that makes it feel designed) */}
      <path d="M12 17.5 H14" />
      <path d="M18 17.5 H20" />
    </svg>
  );
}

function HandshakeIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Left forearm */}
      <path d="M3 18 L9 18" />
      {/* Left hand reaching right */}
      <path d="M9 18 L13 22 L17 22" />
      {/* Clasp - interlocked fingers (two bumps) */}
      <path d="M17 22 Q18.5 21 20 22" />
      <path d="M15 20 Q16.5 19 18 20" />
      {/* Right hand reaching left */}
      <path d="M20 22 L24 18" />
      <path d="M18 20 L22 16" />
      {/* Right forearm */}
      <path d="M24 18 L29 18" />
      {/* Cuff detail (makes it read as formal agreement) */}
      <path d="M5 16 L5 20" />
      <path d="M27 16 L27 20" />
      {/* Checkmark seal above (the "proof" element) */}
      <path d="M14 10 L16 12 L19 8" strokeWidth="1.5" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Left angle bracket */}
      <path d="M11 9 L5 16 L11 23" />
      {/* Right angle bracket */}
      <path d="M21 9 L27 16 L21 23" />
      {/* Center slash */}
      <path d="M18 7 L14 25" strokeWidth="2" />
      {/* Terminal dots (detail that reads as "code" not just brackets) */}
      <circle cx="8" cy="5" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="24" cy="5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}
