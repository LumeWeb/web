interface TerminalLineProps {
  command?: string;
  output?: string[];
  className?: string;
}

/**
 * TerminalStep: renders a single terminal command with optional output lines.
 * Used in how-it-works sections to show actual CLI interactions.
 */
export default function TerminalStep({ command, output, className = "" }: TerminalLineProps) {
  return (
    <div className={`rounded-lg border border-white/10 bg-home-card-bg overflow-hidden ${className}`}>
      {command && (
        <div className="flex items-center gap-2 px-4 py-2.5 font-mono text-sm border-b border-white/5">
          <span className="text-emerald-400 select-none">$</span>
          <code className="text-white whitespace-nowrap">{command}</code>
        </div>
      )}
      {output && output.length > 0 && (
        <div className="px-4 py-2.5 font-mono text-sm space-y-1">
          {output.map((line, i) => (
            <div key={i} className="text-home-text-muted">{line}</div>
          ))}
        </div>
      )}
    </div>
  );
}
