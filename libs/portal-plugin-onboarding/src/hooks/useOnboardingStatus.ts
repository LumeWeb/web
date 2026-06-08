import { useState, useEffect } from "react";
import { readPersistedParam } from "@lumeweb/portal-framework-core";
import { OnboardingIntent } from "../types";
import type { OnboardingState } from "../types";
import { usePinningSteps, useHostingSteps, DEFAULT_INTENT } from "../intents";

function isValidIntent(value: string | null): value is OnboardingIntent {
  return value === OnboardingIntent.Pinning || value === OnboardingIntent.Hosting;
}

export function useOnboardingStatus(): OnboardingState {
  const [intent, setIntent] = useState<OnboardingIntent | null>(null);

  useEffect(() => {
    readPersistedParam("intent").then((value) => {
      if (isValidIntent(value)) setIntent(value);
    });
  }, []);

  const resolvedIntent = intent ?? DEFAULT_INTENT;
  const isHosting = resolvedIntent === OnboardingIntent.Hosting;

  const pinning = usePinningSteps(!isHosting);
  const hosting = useHostingSteps(isHosting);

  const { steps, isBusy } = isHosting ? hosting : pinning;

  const completedCount = steps.filter((s) => s.isComplete).length;
  const isComplete = completedCount === steps.length;

  return {
    steps,
    completedCount,
    isComplete,
    isBusy,
    intent,
  };
}
