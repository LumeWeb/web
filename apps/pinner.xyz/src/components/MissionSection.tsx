import { Lock, Shield, Zap, Wallet } from "lucide-react";

const beliefs = [
  {
    icon: Lock,
    title: "Private files don't need a privacy policy to stay private",
    description: "Your files are encrypted before they leave your device. Even we can't read them",
  },
  {
    icon: Shield,
    title: "Reliability is a contract, not a promise",
    description: "Your data stays available. Hosts only get paid when they prove it's there",
  },
  {
    icon: Zap,
    title: "Infrastructure complexity is our problem, not yours",
    description: "Upload. We handle encryption, distribution, and backups automatically",
  },
  {
    icon: Wallet,
    title: "Pricing should be boring",
    description: "Pay for what you store and transfer. Priced upfront, no tiers to climb",
  },
];

export default function MissionSection() {
  return (
    <div className="mx-auto max-w-[1000px]">
      <h2 className="text-content-text mb-4 text-center text-[25px] leading-tight font-medium md:text-[32px] lg:mb-[26px] lg:text-[40px]">
        What we believe
      </h2>
      <p className="text-content-text mx-auto mb-12 text-center text-lg leading-relaxed font-medium md:text-xl lg:text-2xl">
        Four principles that shape every decision we make.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
        {beliefs.map((belief) => {
          const IconComponent = belief.icon;
          return (
            <div
              key={belief.title}
              className="border-content-divider/30 flex items-start gap-4 rounded-lg border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md lg:p-8">
              <div className="flex-shrink-0">
                <div className="bg-content-section-gray flex h-10 w-10 items-center justify-center rounded-lg lg:h-12 lg:w-12">
                  <IconComponent className="text-content-text h-5 w-5 lg:h-6 lg:w-6" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-content-text mb-1 text-base font-medium lg:text-lg">
                  {belief.title}
                </h3>
                <p className="text-teal-muted text-sm leading-relaxed lg:text-base">
                  {belief.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
