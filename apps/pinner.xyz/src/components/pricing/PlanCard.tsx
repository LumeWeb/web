import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { BillingPlan } from "@/lib/api";
import { themeStyles } from "./theme";
import type { Cadence } from "./utils";
import {
  getPriceDisplay,
  getCTA,
  isCustomPlan,
} from "./utils";
import { translateFeature } from "./featureCopy";

interface CheckIconProps {
  className?: string;
  size?: number;
}

function CheckIcon({ className, size = 16 }: CheckIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 8.5 6.5 12 13 4" />
    </svg>
  );
}

interface PlanCardProps {
  plan: BillingPlan;
  cadence: Cadence;
  variant: "dark" | "light";
}

export function PlanCard({ plan, cadence, variant }: PlanCardProps) {
  const theme = themeStyles[variant];
  const { price, sub } = getPriceDisplay(plan, cadence);
  const cta = getCTA(plan);
  const custom = isCustomPlan(plan);

  return (
    <div
      className={cn(
        theme.card,
        "py-[28px] lg:py-[50px] px-[30px] lg:px-[40px] border-2 rounded-lg transition-all duration-300 ease-in-out relative hover:-translate-y-1 hover:shadow-lg flex flex-col"
      )}
    >
      <h3
        className={cn(
          theme.title,
          "text-[21px] md:text-[28px] xl:text-[32px] font-medium leading-tight mb-2"
        )}
      >
        {plan.name}
      </h3>

      <p
        className={cn(
          theme.description,
          "text-[15px] md:text-[17px] font-medium mb-4 md:mb-6"
        )}
      >
        {plan.description}
      </p>

      <div className="mb-6 md:mb-8">
        <span
          className={cn(theme.price, "text-[32px] md:text-[40px] font-medium")}
        >
          {price}
        </span>
        <span className={cn(theme.priceSub, "text-[13px] md:text-base ml-1")}>
          {sub}
        </span>
      </div>

      {plan.features && plan.features.length > 0 && (
        <ul className="mb-6 md:mb-8 space-y-2 flex-1">
          {plan.features.map((feature, i) => (
            <li
              key={i}
              className={cn(
                theme.description,
                "flex items-start gap-3 text-[13px] md:text-base leading-7"
              )}
            >
              <CheckIcon
                className={cn(theme.description, "shrink-0 mt-[6px]")}
              />
              <span>{translateFeature(feature)}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto">
        <Button
          label={cta.label}
          url={cta.url}
          buttonStyle={variant === "light" ? "outline-dark" : "outline"}
          onClick={() => window.posthog?.capture("pricing_plan_cta_clicked", { plan_name: plan.name, cadence })}
        />

        {!custom && (
          <p className={cn(theme.description, "mt-3 text-xs")}>
            No credit card required
          </p>
        )}
      </div>
    </div>
  );
}
