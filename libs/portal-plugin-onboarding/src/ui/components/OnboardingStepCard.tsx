
import { Button, lazyIcon } from "@lumeweb/portal-framework-ui-core";
import type { OnboardingStep } from "@/types";
import { CliInstallBlock } from "./CliInstallBlock";
const Check = lazyIcon("Check");


interface OnboardingStepCardProps {
  step: OnboardingStep;
  stepNumber: number;
  isExpanded: boolean;
  onCtaClick: () => void;
  ctaLabel: string;
}

export function OnboardingStepCard({
  step,
  stepNumber,
  isExpanded,
  onCtaClick,
  ctaLabel,
}: OnboardingStepCardProps) {
  if (step.isComplete) {
    return (
      <div className="onboarding-step onboarding-step--complete flex items-center gap-3 py-2">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/20">
          <Check className="h-3.5 w-3.5 text-green-500" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">{step.label}</span>
          <span className="text-xs text-muted-foreground">{step.description}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`onboarding-step ${isExpanded ? "onboarding-step--expanded" : ""} flex items-start gap-3 py-2`}
    >
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-muted-foreground/30 text-xs font-medium text-muted-foreground">
        {stepNumber}
      </div>
      <div className="flex-1">
        <span className="text-sm font-medium">{step.label}</span>
        <p className="text-xs text-muted-foreground">{step.description}</p>
        {isExpanded && (
          <div className="mt-2 flex items-center gap-3">
            {step.id === "cli" ? (
              <CliInstallBlock />
            ) : (
              <Button size="sm" variant="outline" onClick={onCtaClick}>
                {ctaLabel}
              </Button>
            )}
            {step.docsUrl && (
              <a
                href={step.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                Documentation
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
