import type { IntentStepConfig, OnboardingStep } from "../types";
import { DOCS_HOSTING_URL } from "../constants";
import { useCliInstalled } from "../hooks/useCliInstalled";
import { useIsSubscribed } from "../hooks/useIsSubscribed";
import { useHasWorkspaces } from "../hooks/useHasWorkspaces";
import { CLI_STEP, DOCS_STEP } from "./pinning";

export const HOSTING_STEPS: IntentStepConfig[] = [
  {
    id: "subscribe",
    label: "Subscribe",
    description: "Choose a plan to start hosting websites on IPFS",
    ctaLabel: "View plans",
    ctaRoute: "/account/subscription",
  },
  { ...DOCS_STEP, docsUrl: DOCS_HOSTING_URL },
  CLI_STEP,
  {
    id: "deploy",
    label: "Deploy Website",
    description: "Create a Workspace to build and publish your website",
    ctaLabel: "Create site",
    ctaRoute: "/sites/new",
  },
];

export function useHostingSteps(active = true): {
  steps: OnboardingStep[];
  isBusy: boolean;
} {
  const { isInstalled, isBusy: cliBusy } = useCliInstalled(active);
  const { isSubscribed, isBusy: subscribeBusy } = useIsSubscribed(active);
  const { hasWorkspace, isBusy: workspacesBusy } = useHasWorkspaces(active);

  const steps: OnboardingStep[] = [
    { ...HOSTING_STEPS[0], isComplete: isSubscribed },
    { ...HOSTING_STEPS[1], isComplete: true },
    { ...HOSTING_STEPS[2], isComplete: isInstalled },
    {
      ...HOSTING_STEPS[3],
      isComplete: hasWorkspace,
      // When a Workspace already exists, direct users to the unified Sites
      // list; otherwise guide them straight into first-class creation.
      ...(hasWorkspace ? { ctaRoute: "/sites" } : { ctaRoute: "/sites/new" }),
    },
  ];

  return {
    steps,
    isBusy: active && (cliBusy || subscribeBusy || workspacesBusy),
  };
}
