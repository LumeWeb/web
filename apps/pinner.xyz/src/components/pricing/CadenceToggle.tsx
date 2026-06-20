import { cn } from "@/lib/utils";
import { themeStyles } from "./theme";
import { Cadence } from "./utils";

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
        role="radiogroup"
        aria-label="Billing cadence"
        className={cn(
          theme.toggleBg,
          "inline-flex rounded-full p-1 border",
          variant === "dark"
            ? "border-home-text/20"
            : "border-content-text/20"
        )}
      >
        <button
          role="radio"
          aria-pressed={cadence === Cadence.Monthly}
          aria-checked={cadence === Cadence.Monthly}
          onClick={() => { onChange(Cadence.Monthly); window.posthog?.capture("pricing_cadence_toggled", { cadence: Cadence.Monthly }); }}
          className={cn(
            "px-5 py-2 rounded-full text-sm font-medium transition-all duration-200",
            cadence === Cadence.Monthly ? theme.toggleActive : theme.toggleInactive
          )}
        >
          Monthly
        </button>
        <button
          role="radio"
          aria-pressed={cadence === Cadence.Yearly}
          aria-checked={cadence === Cadence.Yearly}
          onClick={() => { onChange(Cadence.Yearly); window.posthog?.capture("pricing_cadence_toggled", { cadence: Cadence.Yearly }); }}
          className={cn(
            "px-5 py-2 rounded-full text-sm font-medium transition-all duration-200",
            cadence === Cadence.Yearly ? theme.toggleActive : theme.toggleInactive
          )}
        >
          <span>Yearly</span>
          <span
            aria-label="2 months free"
            className={cn(
              "ml-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none",
              cadence === Cadence.Yearly ? theme.badgeActive : theme.badgeInactive
            )}
          >
            2 months free
          </span>
        </button>
      </div>
    </div>
  );
}
