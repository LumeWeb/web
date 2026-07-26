import { Shield, DollarSign, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhyPinnerProps {
  className?: string;
}

/**
 * WhyPinner: Three-statement value proposition.
 *
 * Horizontal on desktop, stacked on mobile.
 * No cards, no borders, no heavy styling. Whitespace + icons only.
 */
const WhyPinner = ({ className }: WhyPinnerProps) => {
  const statements = [
    {
      icon: <Shield className="w-7 h-7" />,
      heading: "No single company controls your data.",
      body: "Files split across independent providers. No one provider sees the whole file.",
    },
    {
      icon: <DollarSign className="w-7 h-7" />,
      heading: "No surprise bills.",
      body: "Flat storage pricing. Bandwidth priced upfront. No egress shocks.",
    },
    {
      icon: <ArrowRight className="w-7 h-7" />,
      heading: "Take your data with you.",
      body: "Open standards, portable CIDs. No export fees.",
    },
  ];

  return (
    <section className={cn("py-20 md:py-28", className)}>
      <div className="xl:container px-6">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white text-center mb-16">
          What you get that AWS doesn&apos;t sell.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 max-w-5xl mx-auto">
          {statements.map((s, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center group"
            >
              <div className="mb-5 flex items-center justify-center w-14 h-14 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 transition-transform duration-300 group-hover:scale-110">
                {s.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {s.heading}
              </h3>
              <p className="text-sm text-home-text-muted leading-relaxed max-w-xs">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyPinner;
