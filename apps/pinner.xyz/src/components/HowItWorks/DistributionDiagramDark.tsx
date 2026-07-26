import { Server, HardDrive, ShieldCheck } from "lucide-react";

const hosts = [
  { id: "host-1", label: "Host A", sublabel: "Encrypted shard" },
  { id: "host-2", label: "Host B", sublabel: "Encrypted shard" },
  { id: "host-3", label: "Host C", sublabel: "Encrypted shard" },
  { id: "host-4", label: "Host D", sublabel: "Encrypted shard" },
];

export default function DistributionDiagramDark() {
  return (
    <div className="w-full">
      {/* Desktop: hub and spoke */}
      <div className="hidden md:block">
        <div className="flex flex-col items-center">
          {/* Central hub */}
          <div className="rounded-lg border border-home-text/20 bg-home-card-bg p-4 text-center md:w-[200px]">
            <div className="mb-2 flex items-center justify-center gap-2">
              <Server className="text-orange-400 h-5 w-5" />
              <span className="text-white text-sm font-medium">Pinner</span>
            </div>
            <p className="text-home-text-muted text-xs leading-relaxed">
              Encrypts and distributes your files
            </p>
          </div>

          {/* Connecting lines */}
          <div className="my-2 flex h-8 items-center justify-center gap-12">
            <div className="h-full w-px bg-home-text/20" />
          </div>

          {/* Host row */}
          <div className="flex gap-3">
            {hosts.map((host) => (
              <HostBoxDark key={host.id} host={host} />
            ))}
          </div>

          {/* Proof badge */}
          <div className="mt-4 flex items-center gap-2 rounded-full border border-home-text/20 bg-home-card-bg px-4 py-2">
            <ShieldCheck className="text-orange-400 h-4 w-4" />
            <span className="text-home-text-muted text-xs">
              Hosts prove they're storing your data. Or they don't get paid.
            </span>
          </div>
        </div>
      </div>

      {/* Mobile: vertical stack */}
      <div className="flex flex-col items-center gap-3 md:hidden">
        <div className="rounded-lg border border-home-text/20 bg-home-card-bg p-4 text-center w-full max-w-[280px]">
          <div className="mb-2 flex items-center justify-center gap-2">
            <Server className="text-orange-400 h-5 w-5" />
            <span className="text-white text-sm font-medium">Pinner</span>
          </div>
          <p className="text-home-text-muted text-xs leading-relaxed">
            Encrypts and distributes your files
          </p>
        </div>

        <div className="h-6 w-px bg-home-text/20" />

        <div className="grid grid-cols-2 gap-3 w-full max-w-[280px]">
          {hosts.map((host) => (
            <HostBoxDark key={host.id} host={host} />
          ))}
        </div>

        <div className="mt-2 flex items-center gap-2 rounded-full border border-home-text/20 bg-home-card-bg px-4 py-2">
          <ShieldCheck className="text-orange-400 h-4 w-4" />
          <span className="text-home-text-muted text-xs">
            Hosts prove storage. Or no pay.
          </span>
        </div>
      </div>
    </div>
  );
}

function HostBoxDark({ host }: { host: { id: string; label: string; sublabel: string } }) {
  return (
    <div className="rounded-lg border border-home-text/10 bg-home-card-bg p-3 text-center md:w-[120px]">
      <div className="mb-1 flex items-center justify-center">
        <HardDrive className="text-home-text-muted h-4 w-4" />
      </div>
      <span className="text-white block text-xs font-medium">{host.label}</span>
      <span className="text-home-text-muted block text-[10px]">{host.sublabel}</span>
    </div>
  );
}
