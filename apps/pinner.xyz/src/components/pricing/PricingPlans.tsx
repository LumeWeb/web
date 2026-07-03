import { useState } from "react";
import useSWR from "swr";
import type { SWRConfiguration } from "swr";
import { cn } from "@/lib/utils";
import type { BillingPlan, BillingPlansResponse } from "@/lib/api";
import { themeStyles } from "./theme";
import { getPlansApiUrl, fetcher } from "./utils";
import { Cadence } from "./utils";
import { CadenceToggle } from "./CadenceToggle";
import { PlanCard } from "./PlanCard";
import { TrackedButton } from "@/components/TrackedButton";
import { translateFeature } from "./featureCopy";

const CUSTOM_PLAN: BillingPlan = {
  id: -1,
  name: "Custom",
  description: "For larger storage needs. We'll work with you on pricing and setup.",
  currency: "usd",
  price_usd: 0,
  features: ["Custom storage allocation", "Dedicated support", "Volume pricing"],
  pricing_periods: [],
};

interface PricingPlansProps {
  variant?: "dark" | "light";
  showToggle?: boolean;
  fallbackData?: BillingPlansResponse;
}

const PricingPlans = ({
  variant = "dark",
  showToggle = true,
  fallbackData,
}: PricingPlansProps) => {
  const [cadence, setCadence] = useState<Cadence>(Cadence.Monthly);
  const theme = themeStyles[variant];

  const swrConfig: SWRConfiguration<BillingPlansResponse> = {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
    fallbackData,
  };

  const { data, error, isLoading } = useSWR<BillingPlansResponse>(
    getPlansApiUrl(),
    fetcher,
    swrConfig
  );

  const plans = data?.data ?? fallbackData?.data ?? [];

  // When no fallbackData is available (build-time fetch failed), show loading
  // and error states so the user isn't staring at an empty grid.
  if (!fallbackData && isLoading) {
    return (
      <div>
        {showToggle && (
          <CadenceToggle cadence={cadence} onChange={setCadence} variant={variant} />
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-2 md:gap-5 lg:gap-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-96 animate-pulse rounded-lg bg-content-divider/30" />
          ))}
        </div>
      </div>
    );
  }

  if (!fallbackData && error) {
    return (
      <div className="text-center py-12">
        <p className="text-content-text-muted mb-4">Couldn't load plans. Check your connection and try again.</p>
        <button
          onClick={() => window.location.reload()}
          className={cn(
            "inline-flex rounded-full border px-6 py-3 text-sm font-medium transition-colors",
            variant === "dark"
              ? "border-home-text text-home-text hover:bg-home-text hover:text-white"
              : "border-content-text text-content-text hover:bg-content-text hover:text-white"
          )}
        >
          Retry
        </button>
      </div>
    );
  }

  // Progressive enhancement: if fallbackData exists (build-time fetch), it renders
  // immediately in the server HTML. SWR revalidates against the live API and
  // silently updates if newer data is available.
  return (
    <div>
      {showToggle && (
        <CadenceToggle cadence={cadence} onChange={setCadence} variant={variant} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-2 md:gap-5 lg:gap-5">
        {plans.map((plan) => (
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
          <TrackedButton
            label="Contact Us →"
            url="/contact"
            buttonStyle={variant === "light" ? "outline-dark" : "outline"}
            trackEvent="pricing_custom_plan_contact_clicked"
          />
        </div>
      </div>
    </div>
  );
};

export default PricingPlans;
