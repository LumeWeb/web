import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cliInstall, type OS } from "@/lib/config";

const commands = cliInstall.commands;

export default function CLIInstall() {
  const [os, setOs] = useState<OS>("mac");
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (typeof navigator === "undefined" || typeof document === "undefined") return;
    const text = commands[os];
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(showCopied).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }

    function fallbackCopy() {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        const copied = document.execCommand("copy");
        if (copied) showCopied();
      } catch {}
      ta.remove();
    }

    function showCopied() {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const tabs: { key: OS; label: string }[] = [
    { key: "mac", label: "macOS" },
    { key: "linux", label: "Linux" },
    { key: "windows", label: "Windows" },
  ];

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-white/10 bg-home-card-bg overflow-hidden shadow-md">
        {/* Terminal header bar with window dots */}
        <div className="flex items-center justify-between bg-black/40 px-4 py-2.5 border-b border-white/10">
          <div className="flex gap-1.5 items-center" aria-hidden="true">
            <div className="h-3 w-3 rounded-full bg-red-500/70"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500/70"></div>
            <div className="h-3 w-3 rounded-full bg-green-500/70"></div>
          </div>

          <div className="flex items-center gap-1 text-sm font-medium">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setOs(t.key)}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  os === t.key
                    ? "bg-white/10 text-white"
                    : "text-home-text-muted hover:text-white/80 hover:bg-white/5"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Command line */}
        <div className="flex items-center justify-between px-4 py-4 font-mono text-base">
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 select-none">$</span>
            <code className="text-white whitespace-nowrap tracking-[-0.1px]">{commands[os]}</code>
          </div>
          <button
            onClick={copy}
            className="flex-shrink-0 p-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer active:scale-90"
            title="Copy to clipboard"
          >
            <div className="relative h-5 w-5">
              <Copy
                className={`h-5 w-5 text-white/70 absolute inset-0 transition-all duration-200 ${
                  copied ? "scale-0 opacity-0" : "scale-100 opacity-100"
                }`}
              />
              <Check
                className={`h-5 w-5 text-emerald-400 absolute inset-0 transition-all duration-200 ${
                  copied ? "scale-100 opacity-100" : "scale-0 opacity-0"
                }`}
              />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
