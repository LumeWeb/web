import { useAnalytics } from "@lumeweb/analytics";

const FIRST_SEEN_KEY = "pinner_onboarding_first_seen";

function getFirstSeenTime(): number {
  try {
    const raw = localStorage.getItem(FIRST_SEEN_KEY);
    if (raw) {
      return parseInt(raw, 10);
    }
  } catch {
    // SSR or localStorage unavailable — ignore
  }
  return 0;
}

function getTimeSinceSignup(): number {
  const firstSeen = getFirstSeenTime();
  if (!firstSeen) return 0;
  return Date.now() - firstSeen;
}

export function useOnboardingAnalytics() {
  const { capture } = useAnalytics();

  return {
    captureStepViewed(step: string, stepOrder: number) {
      capture("$onboarding_step_viewed", {
        step,
        step_order: stepOrder,
      });
    },
    captureStepCompleted(step: string) {
      capture("$onboarding_step_completed", {
        step,
        time_since_signup: getTimeSinceSignup(),
      });
    },
    captureDismissed(remainingSteps: number) {
      capture("$onboarding_dismissed", {
        remaining_steps: remainingSteps,
      });
    },
    captureOnboardingCompleted() {
      capture("$onboarding_completed", {
        total_time: getTimeSinceSignup(),
      });
    },
  };
}
