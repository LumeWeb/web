import { useState, useEffect, useCallback } from "react";
import { Activity } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle, lazyIcon } from "@lumeweb/portal-framework-ui-core";
import { Progress } from "@lumeweb/portal-framework-ui-core";
import { Button } from "@lumeweb/portal-framework-ui-core";
import { Skeleton } from "@lumeweb/portal-framework-ui-core";

import { useOnboardingStatus } from "@/hooks";
import { useOnboardingAnalytics } from "@/analytics/useOnboardingAnalytics";
import { OnboardingStepCard } from "./OnboardingStepCard";
const X = lazyIcon("X");
const ChevronRight = lazyIcon("ChevronRight");


const STORAGE_KEY = "pinner_onboarding";
const FIRST_SEEN_KEY = "pinner_onboarding_first_seen";

interface LocalStorageState {
  dismissed: boolean;
}

function readStorageState(): LocalStorageState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as LocalStorageState;
    }
  } catch {
    // SSR or parse error — ignore
  }
  return { dismissed: false };
}

function writeStorageState(state: LocalStorageState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // SSR or quota error — ignore
  }
}

function ensureFirstSeen(): void {
  try {
    if (!localStorage.getItem(FIRST_SEEN_KEY)) {
      localStorage.setItem(FIRST_SEEN_KEY, String(Date.now()));
    }
  } catch {
    // SSR or localStorage unavailable — ignore
  }
}

export function OnboardingChecklist() {
  const { steps, completedCount, isComplete, isBusy, intent } = useOnboardingStatus();
  const analytics = useOnboardingAnalytics();
  const navigate = useNavigate();
  const [storageState, setStorageState] = useState(() => readStorageState());

  useEffect(() => {
    ensureFirstSeen();
  }, []);

  const [prevComplete, setPrevComplete] = useState<Record<string, boolean>>({});

  useEffect(() => {
    for (const step of steps) {
      if (step.isComplete && !prevComplete[step.id]) {
        analytics.captureStepCompleted(step.id);
        setPrevComplete((prev) => ({ ...prev, [step.id]: true }));
      }
    }
  }, [steps, prevComplete, analytics]);

  useEffect(() => {
    if (isComplete) {
      analytics.captureOnboardingCompleted();
    }
  }, [isComplete, analytics]);

  useEffect(() => {
    const firstIncomplete = steps.find((s) => !s.isComplete);
    if (firstIncomplete) {
      const order = steps.indexOf(firstIncomplete) + 1;
      analytics.captureStepViewed(firstIncomplete.id, order);
    }
  // Only on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDismiss = useCallback(() => {
    const newState = { dismissed: true };
    setStorageState(newState);
    writeStorageState(newState);
    analytics.captureDismissed(steps.filter((s) => !s.isComplete).length);
  }, [steps, analytics]);

  const handleExpand = useCallback(() => {
    const newState = { dismissed: false };
    setStorageState(newState);
    writeStorageState(newState);
  }, []);

  const handleCtaClick = useCallback(
    (stepId: string) => {
      const step = steps.find((s) => s.id === stepId);
      if (!step) return;

      if (step.ctaRoute) {
        navigate(step.ctaRoute);
      }
    },
    [navigate, steps],
  );

  if (isComplete) {
    return null;
  }

  const firstIncompleteIndex = steps.findIndex((s) => !s.isComplete);
  const hasError = steps.length === 0;

  return (
    <>
      {isBusy && <OnboardingSkeleton />}
      <Activity mode={isBusy ? "hidden" : "visible"}>
        {hasError ? (
          <Card className="onboarding-checklist">
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Unable to load onboarding status
              </p>
            </CardContent>
          </Card>
        ) : storageState.dismissed ? (
          <Card
            className="onboarding-banner cursor-pointer"
            onClick={handleExpand}
          >
            <CardContent className="flex items-center justify-between py-3">
              <span className="text-sm text-muted-foreground">
                {steps.filter((s) => !s.isComplete).length} step{steps.filter((s) => !s.isComplete).length !== 1 ? "s" : ""} remaining
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        ) : (
          <Card className="onboarding-checklist">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-3">
                <CardTitle className="text-sm font-medium">Get Started</CardTitle>
                <span className="text-xs text-muted-foreground">
                  {completedCount} of {steps.length}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleDismiss}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-1">
              <Progress className="mb-3 h-1.5" value={(completedCount / steps.length) * 100} />
              {steps.map((step, index) => (
                <OnboardingStepCard
                  key={step.id}
                  step={step}
                  stepNumber={index + 1}
                  isExpanded={index === firstIncompleteIndex}
                  onCtaClick={() => handleCtaClick(step.id)}
                  ctaLabel={step.ctaLabel}
                />
              ))}
            </CardContent>
          </Card>
        )}
      </Activity>
    </>
  );
}

function OnboardingSkeleton() {
  return (
    <Card className="onboarding-checklist">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <CardTitle className="text-sm font-medium">Get Started</CardTitle>
          <Skeleton className="h-3 w-8" />
        </div>
        <Skeleton className="h-6 w-6" />
      </CardHeader>
      <CardContent className="space-y-1">
        <Skeleton className="mb-3 h-1.5 w-full" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div className="flex items-center gap-3 py-2" key={i}>
            <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
