import { Fingerprint, ShieldCheck, Globe } from "lucide-react";

const valueProps = [
  {
    icon: Fingerprint,
    label: "IPFS CID for every upload",
    sublabel: "Content-addressed, verifiable hash",
  },
  {
    icon: ShieldCheck,
    label: "Hosts prove they hold your data",
    sublabel: "Cryptographic storage proofs on Sia",
  },
  {
    icon: Globe,
    label: "Works on any IPFS gateway",
    sublabel: "Your CID is universal",
  },
];

export default function PinHeroValueProps() {
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
