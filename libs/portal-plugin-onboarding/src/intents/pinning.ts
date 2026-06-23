import type { IntentStepConfig, OnboardingStep } from "../types";
import { DOCS_URL } from "../constants";
import { useCliInstalled } from "../hooks/useCliInstalled";
import { useIsSubscribed } from "../hooks/useIsSubscribed";
import { useHasPins } from "../hooks/useHasPins";

export const CLI_STEP: IntentStepConfig = {
  id: "cli",
  label: "Install CLI",
  description: "Copy the command below, paste it into your terminal, and run it to install the Pinner CLI",
  ctaLabel: "Copy install command",
  ctaRoute: null,
};

export const PINNING_STEPS: IntentStepConfig[] = [
  CLI_STEP,
  {
    id: "subscribe",
    label: "Subscribe",
    description: "Choose a plan to start pinning content to the IPFS network",
    ctaLabel: "View plans",
    ctaRoute: "/account/subscription",
  },
  {
    id: "upload",
    label: "Upload Content",
    description: "Pin your first file or directory to IPFS",
    ctaLabel: "Upload files",
    ctaRoute: "/files",
    docsUrl: DOCS_URL,
  },
];

export function usePinningSteps(active = true): {
  steps: OnboardingStep[];
  isBusy: boolean;
} {
  const { isInstalled, isBusy: cliBusy } = useCliInstalled(active);
  const { isSubscribed, isBusy: subscribeBusy } = useIsSubscribed(active);
  const { hasPins, isBusy: pinsBusy } = useHasPins(active);

  const steps: OnboardingStep[] = [
    { ...PINNING_STEPS[0], isComplete: isInstalled },
    { ...PINNING_STEPS[1], isComplete: isSubscribed },
    { ...PINNING_STEPS[2], isComplete: hasPins },
  ];

  return {
    steps,
    isBusy: active && (cliBusy || subscribeBusy || pinsBusy),
  };
}
