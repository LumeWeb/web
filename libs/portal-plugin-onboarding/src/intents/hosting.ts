import type { IntentStepConfig, OnboardingStep } from "../types";
import { DOCS_HOSTING_URL } from "../constants";
import { useCliInstalled } from "../hooks/useCliInstalled";
import { useIsSubscribed } from "../hooks/useIsSubscribed";
import { useHasWebsites } from "../hooks/useHasWebsites";
import { CLI_STEP, DOCS_STEP } from "./pinning";

export const HOSTING_STEPS: IntentStepConfig[] = [
  { ...DOCS_STEP, docsUrl: DOCS_HOSTING_URL },
  CLI_STEP,
  {
    id: "subscribe",
    label: "Subscribe",
    description: "Choose a plan to start hosting websites on IPFS",
    ctaLabel: "View plans",
    ctaRoute: "/account/subscription",
  },
  {
    id: "deploy",
    label: "Deploy Website",
    description: "Deploy your first website to IPFS",
    ctaLabel: "Create website",
    ctaRoute: "/websites",
  },
];

export function useHostingSteps(active = true): {
  steps: OnboardingStep[];
  isBusy: boolean;
} {
  const { isInstalled, isBusy: cliBusy } = useCliInstalled(active);
  const { isSubscribed, isBusy: subscribeBusy } = useIsSubscribed(active);
  const { hasWebsites, isBusy: websitesBusy } = useHasWebsites(active);

  const steps: OnboardingStep[] = [
    { ...HOSTING_STEPS[0], isComplete: true },
    { ...HOSTING_STEPS[1], isComplete: isInstalled },
    { ...HOSTING_STEPS[2], isComplete: isSubscribed },
    { ...HOSTING_STEPS[3], isComplete: hasWebsites },
  ];

  return {
    steps,
    isBusy: active && (cliBusy || subscribeBusy || websitesBusy),
  };
}
