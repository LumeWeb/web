import { useState, type ComponentType } from "react";
import {
  Wallet,
  Server,
  HardDrive,
  ShieldCheck,
  ArrowDown,
  Repeat,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const flowNodes = [
  {
    id: "you",
    label: "You pay Pinner",
    sublabel: "Card or crypto. One price.",
    icon: Wallet,
    accent: false,
  },
  {
    id: "platform",
    label: "Pinner (software and tools)",
    sublabel: "Dashboard, apps, support, file management",
    icon: Server,
    accent: false,
  },
  {
    id: "hosts",
    label: "Independent hosts",
    sublabel: "People and businesses who store your encrypted files",
    icon: HardDrive,
    accent: true,
  },
];

const proofSteps = [
  {
    label: "Hosts prove they're storing your data",
    description:
      "At the end of each storage period, the host has to prove they still have your files. The network picks a random piece of your data to check. The host can't predict which piece, so they have to keep all of it.",
  },
  {
    label: "Hosts put their own money on the line",
    description:
      "Hosts deposit their own money as a guarantee. If they can't prove your data is there, they lose that money. They have real skin in the game, not just a promise.",
  },
  {
    label: "No single company controls your data",
    description:
      "Your payment, your storage, and the proof system are all spread across many independent computers. No one company is in charge.",
  },
];

const technicalDetail = [
  {
    heading: "Storage proofs",
    body: "When a storage contract ends, the host must submit a cryptographic proof showing they still have a randomly selected segment of your data. The network chooses the segment, so the host can't predict which part to keep. If they pass, they get paid. If they fail or miss the deadline, they lose their collateral.",
  },
  {
    heading: "Collateral and penalties",
    body: "Hosts lock up their own funds as collateral when they accept a storage contract. Think of it as a security deposit. If they fail the storage proof, that collateral is burned (permanently destroyed, not given to anyone). Burning rather than redistributing prevents anyone from profiting by interfering with a host's proof.",
  },
  {
    heading: "File contracts (smart contracts)",
    body: "Storage agreements are enforced by file contracts on the Sia network. A file contract is an agreement between you (the renter) and a host. Both parties lock funds in escrow (a holding account that neither side can access alone). The contract records what data is being stored, for how long, and the payment terms. When the contract period ends, the network automatically resolves it: the host gets paid if they proved storage, or loses collateral if they didn't.",
  },
  {
    heading: "Payment splitting",
    body: "Your subscription covers two things: the software and tools you use (your dashboard, apps, file management, and support) and the storage layer (payments to independent hosts on the Sia network). Pinner coordinates the storage; the Sia network handles contract enforcement and host payouts. Hosts are paid by the network according to their contracts, not by Pinner directly.",
  },
];

export default function PaymentFlowDiagram() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="bg-white py-[60px] md:py-[120px]">
      <div className="xl:container px-6">
        <div className="mx-auto max-w-[900px]">
          {/* Section heading */}
          <div className="mb-12 text-center">
            <p className="text-content-text-muted mb-2 text-sm font-medium uppercase tracking-wide">
              Where your money goes
            </p>
            <h2 className="text-content-text text-[25px] leading-tight font-medium md:text-[32px] lg:text-[40px]">
              Your payment goes to the people storing your data
            </h2>
            <p className="text-content-text-muted mx-auto mt-4 max-w-[600px] text-base md:text-lg">
              When you pay Pinner, your money doesn't go to one company. Part
              of it pays for the software and tools you use. The rest goes to
              independent hosts who store your data and have to prove they're
              actually holding it.
            </p>
          </div>

          {/* Diagram: desktop horizontal, mobile vertical */}
          <div className="mb-12">
            {/* Desktop layout */}
            <div className="hidden md:flex md:items-start md:justify-center md:gap-2">
              {/* You pay */}
              <FlowBox
                node={flowNodes[0]}
                className="md:w-[200px]"
              />

              {/* Arrow down to split */}
              <div className="flex flex-col items-center justify-center self-stretch py-4">
                <ArrowDown className="text-content-text-muted h-6 w-6" />
              </div>

              {/* Split: platform + hosts stacked */}
              <div className="flex flex-col gap-4">
                <FlowBox
                  node={flowNodes[1]}
                  className="md:w-[280px]"
                />
                <FlowBox
                  node={flowNodes[2]}
                  className="md:w-[280px]"
                />
              </div>

              {/* Proof loop arrow */}
              <div className="flex flex-col items-center justify-center self-center pt-4">
                <div className="flex flex-col items-center gap-1">
                  <Repeat className="text-content-text-muted h-8 w-8" />
                  <span className="text-content-text-muted text-center text-xs leading-tight">
                    Hosts prove
                    <br />
                    storage
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile layout */}
            <div className="flex flex-col items-center gap-4 md:hidden">
              <FlowBox node={flowNodes[0]} className="w-full max-w-[300px]" />
              <ArrowDown className="text-content-text-muted h-6 w-6" />
              <FlowBox node={flowNodes[1]} className="w-full max-w-[300px]" />
              <ArrowDown className="text-content-text-muted h-6 w-6" />
              <FlowBox node={flowNodes[2]} className="w-full max-w-[300px]" />

              {/* Proof loop indicator */}
              <div className="mt-2 flex flex-col items-center gap-1">
                <Repeat className="text-content-text-muted h-6 w-6" />
                <span className="text-content-text-muted text-center text-xs leading-tight">
                  Hosts prove storage
                </span>
              </div>
            </div>
          </div>

          {/* Plain language explainer */}
          <div className="mx-auto mb-10 max-w-[600px] space-y-4">
            {proofSteps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <ShieldCheck className="text-content-text mt-0.5 h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="text-content-text font-medium">{step.label}</p>
                  <p className="text-content-text-muted text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Collapsible technical detail */}
          <div className="mx-auto max-w-[600px]">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-content-text-muted hover:text-content-text flex w-full items-center justify-between border-t border-border pt-4 text-sm font-medium transition-colors"
              aria-expanded={expanded}
            >
              How the economics work
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  expanded && "rotate-180"
                )}
              />
            </button>
            {expanded && (
              <div className="mt-4 space-y-6">
                {technicalDetail.map((detail, i) => (
                  <div key={i}>
                    <h4 className="text-content-text text-sm font-medium">
                      {detail.heading}
                    </h4>
                    <p className="text-content-text-muted mt-1 text-sm leading-relaxed">
                      {detail.body}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

interface FlowNode {
  id: string;
  label: string;
  sublabel: string;
  icon: ComponentType<{ className?: string }>;
  accent: boolean;
}

function FlowBox({
  node,
  className,
}: {
  node: FlowNode;
  className?: string;
}) {
  const Icon = node.icon;
  return (
    <div
      className={cn(
        "rounded-lg border p-4 text-left",
        node.accent
          ? "border-content-text/30 bg-content-section-gray"
          : "border-border bg-white",
        className
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <Icon
          className={cn(
            "h-5 w-5 flex-shrink-0",
            node.accent ? "text-content-text" : "text-content-text-muted"
          )}
        />
        <span className="text-content-text text-sm font-medium">
          {node.label}
        </span>
      </div>
      <p className="text-content-text-muted text-xs leading-relaxed">
        {node.sublabel}
      </p>
    </div>
  );
}
