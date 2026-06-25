import { cn } from "@/lib/utils";
import { Server, HardDrive, ShieldCheck } from "lucide-react";

/**
 * DistributionDiagram - Hub-and-spoke layout showing distributed storage
 * across multiple independent hosts. Each host receives an encrypted shard.
 * Responsive: horizontal on desktop, vertical stack on mobile.
 */

const hosts = [
  { id: "host-1", label: "Host A", sublabel: "Encrypted shard" },
  { id: "host-2", label: "Host B", sublabel: "Encrypted shard" },
  { id: "host-3", label: "Host C", sublabel: "Encrypted shard" },
  { id: "host-4", label: "Host D", sublabel: "Encrypted shard" },
];

export default function DistributionDiagram() {
  return (
    <div className="w-full">
      {/* Desktop: hub and spoke */}
      <div className="hidden md:block">
        <div className="flex flex-col items-center">
          {/* Central hub */}
          <div className="rounded-lg border border-border bg-white p-4 text-center md:w-[200px]">
            <div className="mb-2 flex items-center justify-center gap-2">
              <Server className="text-content-text h-5 w-5" />
              <span className="text-content-text text-sm font-medium">
                Pinner
              </span>
            </div>
            <p className="text-content-text-muted text-xs leading-relaxed">
              Encrypts and distributes your files
            </p>
          </div>

          {/* Connecting lines */}
          <div className="my-2 flex h-8 items-center justify-center gap-12">
            {/* Vertical drop to split */}
            <div className="h-full w-px bg-content-text/20" />
          </div>

          {/* Host row */}
          <div className="flex gap-3">
            {hosts.map((host) => (
              <HostBox key={host.id} host={host} />
            ))}
          </div>

          {/* Proof badge */}
          <div className="mt-4 flex items-center gap-2 rounded-full border border-content-text/20 bg-content-section-gray px-4 py-2">
            <ShieldCheck className="text-content-text h-4 w-4" />
            <span className="text-content-text-muted text-xs">
              Hosts prove they're storing your data. Or they don't get paid.
            </span>
          </div>
        </div>
      </div>

      {/* Mobile: vertical stack */}
      <div className="flex flex-col items-center gap-3 md:hidden">
        <div className="rounded-lg border border-border bg-white p-4 text-center w-full max-w-[280px]">
          <div className="mb-2 flex items-center justify-center gap-2">
            <Server className="text-content-text h-5 w-5" />
            <span className="text-content-text text-sm font-medium">
              Pinner
            </span>
          </div>
          <p className="text-content-text-muted text-xs leading-relaxed">
            Encrypts and distributes your files
          </p>
        </div>

        <div className="h-6 w-px bg-content-text/20" />

        <div className="grid grid-cols-2 gap-3 w-full max-w-[280px]">
          {hosts.map((host) => (
            <HostBox key={host.id} host={host} />
          ))}
        </div>

        <div className="mt-1 flex items-center gap-2 rounded-full border border-content-text/20 bg-content-section-gray px-3 py-2">
          <ShieldCheck className="text-content-text h-4 w-4" />
          <span className="text-content-text-muted text-xs leading-tight">
            Hosts prove storage. Or they don't get paid.
          </span>
        </div>
      </div>
    </div>
  );
}

interface HostNode {
  id: string;
  label: string;
  sublabel: string;
}

function HostBox({ host, className }: { host: HostNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-content-text/30 bg-content-section-gray p-3 text-center",
        "md:w-[110px]",
        className
      )}
    >
      <HardDrive className="text-content-text mx-auto mb-1 h-5 w-5" />
      <p className="text-content-text text-xs font-medium">{host.label}</p>
      <p className="text-content-text-muted text-[10px] leading-tight">
        {host.sublabel}
      </p>
    </div>
  );
}
