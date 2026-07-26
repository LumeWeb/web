import { Globe, Server, Loader2 } from "lucide-react";
import { useNodeGrid } from "./useNodeGrid";

export default function HostServerGrid() {
  const { nodes, loading: browserLoading, packetPaths, activeCount, totalCount } = useNodeGrid();

  return (
    <div className="relative w-full max-w-[480px] mx-auto select-none">
      {/* Browser / Website indicator */}
      <div className="flex justify-center mb-8">
        <div
          className={`relative flex items-center gap-3 rounded-xl border px-5 py-3 transition-all duration-500 ${
            activeCount >= 3
              ? "border-home-accent/40 bg-home-accent/5"
              : activeCount >= 1
              ? "border-yellow-400/30 bg-yellow-400/5"
              : "border-red-400/30 bg-red-400/5"
          }`}
        >
          <div className="relative">
            <Globe
              className={`h-6 w-6 transition-colors duration-500 ${
                activeCount >= 3
                  ? "text-home-accent"
                  : activeCount >= 1
                  ? "text-yellow-400"
                  : "text-red-400"
              }`}
            />
            {browserLoading && (
              <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-home-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-home-accent"></span>
              </span>
            )}
          </div>
          <div>
            <p className="text-white text-sm font-medium">my-site.com</p>
            <p className="text-home-text-muted text-xs">
              {activeCount} of {totalCount} providers active
            </p>
          </div>
        </div>
      </div>

      {/* Connection lines from nodes to browser (SVG overlay) */}
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ top: "-20px", height: "calc(100% + 20px)" }}
        width="100%"
      >
        {packetPaths.map((packet) => {
          const row = Math.floor(packet.fromNode / 3);
          const col = packet.fromNode % 3;
          const x = 16.67 + col * 33.33;
          const y = 65 + row * 30;
          return (
            <circle
              key={packet.id}
              cx={`${x}%`}
              cy={`${y}%`}
              r="3"
              fill="#abeedb"
              opacity="0.9"
            >
              <animate
                attributeName="cy"
                from={`${y}%`}
                to="12%"
                dur="1.5s"
                repeatCount="1"
                fill="freeze"
              />
              <animate
                attributeName="opacity"
                values="0.9;0.9;0"
                keyTimes="0;0.8;1"
                dur="1.5s"
                repeatCount="1"
                fill="freeze"
              />
            </circle>
          );
        })}
      </svg>

      {/* Server grid */}
      <div className="grid grid-cols-3 gap-3">
        {nodes.map((node) => (
          <div
            key={node.id}
            className={`relative rounded-xl border p-3 text-center transition-all duration-700 ${
              node.phase === "online"
                ? "border-home-accent/20 bg-home-card-bg"
                : node.phase === "recovering"
                ? "border-yellow-400/20 bg-yellow-400/5"
                : "border-red-400/10 bg-red-400/5 opacity-60"
            }`}
          >
            {/* Status ring */}
            <div className="absolute -top-1 -right-1">
              <span className="relative flex h-3 w-3">
                {node.phase === "online" && (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-home-accent opacity-40"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-home-accent"></span>
                  </>
                )}
                {node.phase === "recovering" && (
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-400 animate-pulse"></span>
                )}
                {node.phase === "offline" && (
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-400/50"></span>
                )}
              </span>
            </div>

            <div className="flex justify-center mb-1.5">
              {node.phase === "recovering" ? (
                <Loader2 className="h-5 w-5 text-yellow-400 animate-spin" />
              ) : (
                <Server
                  className={`h-5 w-5 transition-colors duration-500 ${
                    node.phase === "online"
                      ? node.health > 80
                        ? "text-home-accent"
                        : "text-home-accent/60"
                      : "text-red-400/40"
                  }`}
                />
              )}
            </div>
            <p
              className={`text-[10px] font-medium uppercase tracking-wider ${
                node.phase === "online"
                  ? "text-home-text-muted"
                  : "text-home-text-muted/40"
              }`}
            >
              {node.phase === "recovering" ? "RECONNECT" : node.phase === "online" ? "ONLINE" : "OFFLINE"}
            </p>
            <p className="text-[9px] text-home-text-muted/30 mt-0.5">
              Host {String.fromCharCode(65 + node.id)}
            </p>
          </div>
        ))}
      </div>

      {/* Redundancy status bar */}
      <div className="mt-4 flex items-center gap-2 rounded-lg border border-home-text/5 bg-home-card-bg/50 px-3 py-2">
        <div className="flex-1 flex gap-0.5">
          {nodes.map((node) => (
            <div
              key={node.id}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                node.phase === "online"
                  ? "bg-home-accent"
                  : node.phase === "recovering"
                  ? "bg-yellow-400 animate-pulse"
                  : "bg-red-400/20"
              }`}
            />
          ))}
        </div>
        <span className="text-[10px] text-home-text-muted/60 whitespace-nowrap">
          {activeCount >= 5
            ? "Fully redundant"
            : activeCount >= 3
            ? "Resilient"
            : activeCount >= 1
            ? "Degraded"
            : "Offline"}
        </span>
      </div>
    </div>
  );
}
