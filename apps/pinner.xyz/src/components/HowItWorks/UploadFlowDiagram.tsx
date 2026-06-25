import { cn } from "@/lib/utils";

/**
 * UploadFlowDiagram - Shows the file upload to content-address flow:
 * File -> Hash -> Content Address (permanent link).
 * Responsive: horizontal on desktop, vertical on mobile.
 */

import { FileUp, Hash, Link2, ArrowRight, ArrowDown } from "lucide-react";

const steps = [
  {
    id: "upload",
    label: "Upload file",
    sublabel: "Any file, any size. Encrypted before it leaves your device.",
    icon: FileUp,
  },
  {
    id: "hash",
    label: "Content hash",
    sublabel: "A unique fingerprint derived from your file's contents.",
    icon: Hash,
  },
  {
    id: "address",
    label: "Content address",
    sublabel: "A permanent link. Valid as long as your content is pinned.",
    icon: Link2,
    accent: true,
  },
];

export default function UploadFlowDiagram() {
  return (
    <div className="w-full">
      {/* Desktop: horizontal flow */}
      <div className="hidden md:flex md:items-stretch md:justify-center md:gap-3">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-stretch gap-3">
            <FlowBox node={step} className="md:w-[180px]" />
            {i < steps.length - 1 && (
              <div className="flex items-center justify-center self-center">
                <ArrowRight className="text-content-text-muted h-5 w-5" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile: vertical flow */}
      <div className="flex flex-col items-center gap-3 md:hidden">
        {steps.map((step, i) => (
          <div key={step.id} className="flex flex-col items-center gap-3">
            <FlowBox node={step} className="w-full max-w-[280px]" />
            {i < steps.length - 1 && (
              <ArrowDown className="text-content-text-muted h-5 w-5" />
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
  icon: React.ComponentType<{ className?: string }>;
  accent?: boolean;
}

function FlowBox({ node, className }: { node: FlowNode; className?: string }) {
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
