import { Network, ShieldCheck, Globe } from "lucide-react";

const valueProps = [
  {
    icon: Network,
    label: "Independent providers",
    sublabel: "No single company controls your data",
  },
  {
    icon: ShieldCheck,
    label: "Resilient by design",
    sublabel: "If one goes down, your content stays online",
  },
  {
    icon: Globe,
    label: "Host or pin",
    sublabel: "One network. Websites and IPFS.",
  },
];

export default function HomeHeroValueProps() {
  return (
    <div className="flex flex-col gap-4 mb-6">
      {valueProps.map((prop) => {
        const Icon = prop.icon;
        return (
          <div key={prop.label} className="flex items-start gap-3">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-home-accent/10">
              <Icon className="h-3.5 w-3.5 text-home-accent" />
            </div>
            <div>
              <span className="text-white text-base lg:text-lg font-medium">
                {prop.label}
              </span>
              <span className="text-home-text-muted text-base lg:text-lg">
                {": "}
                {prop.sublabel}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
