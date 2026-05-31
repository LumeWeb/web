import { cn } from "@/lib/utils";
import { themeStyles } from "./theme";
import type { Cadence } from "./utils";

interface CadenceToggleProps {
  cadence: Cadence;
  onChange: (cadence: Cadence) => void;
  variant: "dark" | "light";
}

export function CadenceToggle({
  cadence,
  onChange,
  variant,
}: CadenceToggleProps) {
  const theme = themeStyles[variant];

  return (
    <div className="flex justify-center mb-10 md:mb-16">
      <div
        className={cn(
          theme.toggleBg,
          "inline-flex rounded-full p-1 border",
          variant === "dark"
            ? "border-home-text/20"
            : "border-content-text/20"
        )}
      >
        <button
          onClick={() => { onChange("monthly"); window.posthog?.capture("pricing_cadence_toggled", { cadence: "monthly" }); }}
          className={cn(
            "px-5 py-2 rounded-full text-sm font-medium transition-all duration-200",
            cadence === "monthly" ? theme.toggleActive : theme.toggleInactive
          )}
        >
          Monthly
        </button>
        <button
          onClick={() => { onChange("yearly"); window.posthog?.capture("pricing_cadence_toggled", { cadence: "yearly" }); }}
          className={cn(
            "px-5 py-2 rounded-full text-sm font-medium transition-all duration-200",
            cadence === "yearly" ? theme.toggleActive : theme.toggleInactive
          )}
        >
          Yearly
          <span
            className={cn(
              "ml-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none",
              variant === "dark"
                ? "bg-white/15 text-home-text"
                : "bg-content-text/10 text-content-text"
            )}
          >
            2 months free
          </span>
        </button>
      </div>
    </div>
  );
}
