import type { ComponentType } from "react";
import { cn } from "@/lib/utils";
import { FileUp, Hash, Link2, ArrowRight, ArrowDown } from "lucide-react";

const steps = [
  {
    id: "upload",
    label: "Upload file",
    sublabel: "Any file, any size",
    icon: FileUp,
  },
  {
    id: "hash",
    label: "Content hash",
    sublabel: "A unique fingerprint from your file's contents",
    icon: Hash,
  },
  {
    id: "address",
    label: "Content address",
    sublabel: "A permanent link that never breaks",
    icon: Link2,
    accent: true,
  },
];

export default function UploadFlowDiagramDark() {
  return (
    <div className="w-full">
      {/* Desktop: horizontal flow */}
      <div className="hidden md:flex md:items-stretch md:justify-center md:gap-3">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-stretch gap-3">
            <FlowBoxDark node={step} className="md:w-[180px]" />
            {i < steps.length - 1 && (
              <div className="flex items-center justify-center self-center">
                <ArrowRight className="text-home-text-muted h-5 w-5" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile: vertical flow */}
      <div className="flex flex-col items-center gap-3 md:hidden">
        {steps.map((step, i) => (
          <div key={step.id} className="flex flex-col items-center gap-3">
            <FlowBoxDark node={step} className="w-full max-w-[280px]" />
            {i < steps.length - 1 && (
              <ArrowDown className="text-home-text-muted h-5 w-5" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface FlowNode {
  id: string;
  label: string;
  sublabel: string;
  icon: ComponentType<{ className?: string }>;
  accent?: boolean;
}

function FlowBoxDark({ node, className }: { node: FlowNode; className?: string }) {
  const Icon = node.icon;
  return (
    <div
      className={cn(
        "rounded-lg border p-4 text-left",
        node.accent
          ? "border-orange-400/30 bg-orange-500/5"
          : "border-home-text/10 bg-home-card-bg",
        className
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <Icon
          className={cn(
            "h-5 w-5 flex-shrink-0",
            node.accent ? "text-orange-400" : "text-home-text-muted"
          )}
        />
        <span className="text-white text-sm font-medium">
          {node.label}
        </span>
      </div>
      <p className="text-home-text-muted text-xs leading-relaxed">
        {node.sublabel}
      </p>
    </div>
  );
}
