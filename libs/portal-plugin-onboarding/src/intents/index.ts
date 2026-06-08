import { OnboardingIntent } from "../types";
import type { IntentStepConfig } from "../types";
import { CLI_STEP, PINNING_STEPS, usePinningSteps } from "./pinning";
import { HOSTING_STEPS, useHostingSteps } from "./hosting";

export { CLI_STEP } from "./pinning";
export { PINNING_STEPS } from "./pinning";
export { HOSTING_STEPS } from "./hosting";
export { usePinningSteps } from "./pinning";
export { useHostingSteps } from "./hosting";

export const INTENT_STEP_CONFIGS: Record<OnboardingIntent, IntentStepConfig[]> = {
  [OnboardingIntent.Pinning]: PINNING_STEPS,
  [OnboardingIntent.Hosting]: HOSTING_STEPS,
};

export const DEFAULT_INTENT = OnboardingIntent.Pinning;
