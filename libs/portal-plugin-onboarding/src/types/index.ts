export enum OnboardingIntent {
  Pinning = "pinning",
  Hosting = "hosting",
}

export interface IntentStepConfig {
  id: string;
  label: string;
  description: string;
  ctaLabel: string;
  ctaRoute: string | null;
  docsUrl?: string;
}

export interface OnboardingStep {
  id: string;
  isComplete: boolean;
  label: string;
  description: string;
  ctaLabel: string;
  ctaRoute: string | null;
  docsUrl?: string;
}

export interface OnboardingState {
  steps: OnboardingStep[];
  completedCount: number;
  isComplete: boolean;
  isBusy: boolean;
  intent: OnboardingIntent | null;
}
