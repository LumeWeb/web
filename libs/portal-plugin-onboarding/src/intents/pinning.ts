import type { IntentStepConfig, OnboardingStep } from "../types";
import { DOCS_PINNING_URL } from "../constants";
import { useCliInstalled } from "../hooks/useCliInstalled";
import { useIsSubscribed } from "../hooks/useIsSubscribed";

export const CLI_STEP: IntentStepConfig = {
  id: "cli",
  label: "Install CLI",
  description: "Copy the command below, paste it into your terminal, and run it to install the Pinner CLI",
  ctaLabel: "Copy install command",
  ctaRoute: null,
};

export const DOCS_STEP: IntentStepConfig = {
  id: "docs",
  label: "Read the Docs",
  description: "Learn how to pin content, manage CIDs, and automate your workflow",
  ctaLabel: "Browse docs",
  ctaRoute: null,
  docsUrl: DOCS_PINNING_URL,
};

export const PINNING_STEPS: IntentStepConfig[] = [
  {
    id: "subscribe",
    label: "Subscribe",
    description: "Choose a plan to start pinning content to the IPFS network",
    ctaLabel: "View plans",
    ctaRoute: "/account/subscription",
  },
  DOCS_STEP,
  CLI_STEP,
];

export function usePinningSteps(active = true): {
  steps: OnboardingStep[];
  isBusy: boolean;
} {
  const { isInstalled, isBusy: cliBusy } = useCliInstalled(active);
  const { isSubscribed, isBusy: subscribeBusy } = useIsSubscribed(active);

  const steps: OnboardingStep[] = [
    { ...PINNING_STEPS[0], isComplete: isSubscribed },
    { ...PINNING_STEPS[1], isComplete: true },
    { ...PINNING_STEPS[2], isComplete: isInstalled },
  ];

  return {
    steps,
    isBusy: active && (cliBusy || subscribeBusy),
  };
}
