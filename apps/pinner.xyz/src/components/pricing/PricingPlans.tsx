import { useState } from "react";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import type { BillingPlan, BillingPlansResponse } from "@/lib/api";
import { themeStyles } from "./theme";
import { getPlansApiUrl, fetcher } from "./utils";
import type { Cadence } from "./utils";
import { CadenceToggle } from "./CadenceToggle";
import { PlanCard } from "./PlanCard";
import { SkeletonCard } from "./SkeletonCard";
import { translateFeature } from "./featureCopy";
import { Button } from "@/components/ui/button";

const CUSTOM_PLAN: BillingPlan = {
  id: -1,
  name: "Custom",
  description: "For larger storage needs — we'll work with you on pricing and setup.",
  currency: "usd",
  price_usd: 0,
  features: ["Custom storage allocation", "Dedicated support", "Volume pricing"],
  pricing_periods: [],
};

interface PricingPlansProps {
  variant?: "dark" | "light";
  showToggle?: boolean;
}

const PricingPlans = ({
  variant = "dark",
  showToggle = true,
}: PricingPlansProps) => {
  const [cadence, setCadence] = useState<Cadence>("monthly");
  const theme = themeStyles[variant];

  const { data, error, isLoading } = useSWR<BillingPlansResponse>(
    getPlansApiUrl(),
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  const apiPlans = data?.data ?? [];

  if (error) {
    return (
      <div className="text-center py-16">
        <p className={cn(theme.errorText, "text-lg mb-4")}>
          Unable to load pricing plans.
        </p>
        <button
          onClick={() => window.location.reload()}
          className={cn(
            "inline-flex rounded-full border px-6 py-3 text-sm font-medium transition-colors",
            variant === "dark"
              ? "border-home-text text-home-text hover:bg-home-text hover:text-white"
              : "border-content-text text-content-text hover:bg-content-text hover:text-white"
          )}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {showToggle && (
        <CadenceToggle cadence={cadence} onChange={setCadence} variant={variant} />
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-2 md:gap-5 lg:gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} variant={variant} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-2 md:gap-5 lg:gap-5">
            {apiPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                cadence={cadence}
                variant={variant}
              />
            ))}
          </div>

          <div
            className={cn(
              "mt-4 md:mt-6 rounded-lg border p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4",
              variant === "dark"
                ? "border-home-text/20 bg-home-card-bg"
                : "border-content-divider/50 bg-content-section-gray"
            )}
          >
            <div>
              <h3
                className={cn(
                  theme.title,
                  "text-lg md:text-xl font-medium mb-1"
                )}
              >
                Need more? {CUSTOM_PLAN.description}
              </h3>
              <ul
                className={cn(
                  theme.description,
                  "flex flex-col sm:flex-row sm:gap-6 gap-1 text-sm mt-2"
                )}
              >
                {(CUSTOM_PLAN.features ?? []).map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <svg
                      className={cn(theme.description, "shrink-0")}
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 8.5 6.5 12 13 4" />
                    </svg>
                    {translateFeature(feature)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-shrink-0">
              <Button
                label="Contact Us →"
                url="/contact"
                buttonStyle={variant === "light" ? "outline-dark" : "outline"}
                onClick={() => window.posthog?.capture("pricing_custom_plan_contact_clicked")}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PricingPlans;
