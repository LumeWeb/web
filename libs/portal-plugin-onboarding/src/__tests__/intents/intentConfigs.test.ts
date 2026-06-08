import { describe, it, expect } from "vitest";
import { PINNING_STEPS } from "@/intents/pinning";
import { HOSTING_STEPS } from "@/intents/hosting";
import { INTENT_STEP_CONFIGS, DEFAULT_INTENT } from "@/intents/index";
import { OnboardingIntent } from "@/types";

describe("PINNING_STEPS", () => {
  it("has 3 steps: cli, subscribe, upload", () => {
    expect(PINNING_STEPS).toHaveLength(3);
    expect(PINNING_STEPS[0].id).toBe("cli");
    expect(PINNING_STEPS[1].id).toBe("subscribe");
    expect(PINNING_STEPS[2].id).toBe("upload");
  });

  it("cli step has null ctaRoute (clipboard copy)", () => {
    expect(PINNING_STEPS[0].ctaRoute).toBeNull();
    expect(PINNING_STEPS[0].ctaLabel).toBe("Copy install command");
  });

  it("subscribe step navigates to /account/subscription", () => {
    expect(PINNING_STEPS[1].ctaRoute).toBe("/account/subscription");
  });

  it("upload step navigates to /files", () => {
    expect(PINNING_STEPS[2].ctaRoute).toBe("/files");
    expect(PINNING_STEPS[2].ctaLabel).toBe("Upload files");
  });
});

describe("HOSTING_STEPS", () => {
  it("has 3 steps: cli, subscribe, deploy", () => {
    expect(HOSTING_STEPS).toHaveLength(3);
    expect(HOSTING_STEPS[0].id).toBe("cli");
    expect(HOSTING_STEPS[1].id).toBe("subscribe");
    expect(HOSTING_STEPS[2].id).toBe("deploy");
  });

  it("cli step has null ctaRoute (clipboard copy)", () => {
    expect(HOSTING_STEPS[0].ctaRoute).toBeNull();
    expect(HOSTING_STEPS[0].ctaLabel).toBe("Copy install command");
  });

  it("subscribe step navigates to /account/subscription", () => {
    expect(HOSTING_STEPS[1].ctaRoute).toBe("/account/subscription");
  });

  it("deploy step navigates to /websites", () => {
    expect(HOSTING_STEPS[2].ctaRoute).toBe("/websites");
    expect(HOSTING_STEPS[2].ctaLabel).toBe("Create website");
  });
});

describe("INTENT_STEP_CONFIGS registry", () => {
  it("maps pinning intent to PINNING_STEPS", () => {
    expect(INTENT_STEP_CONFIGS[OnboardingIntent.Pinning]).toBe(PINNING_STEPS);
  });

  it("maps hosting intent to HOSTING_STEPS", () => {
    expect(INTENT_STEP_CONFIGS[OnboardingIntent.Hosting]).toBe(HOSTING_STEPS);
  });

  it("has entries for all OnboardingIntent values", () => {
    const intents = Object.values(OnboardingIntent);
    for (const intent of intents) {
      expect(INTENT_STEP_CONFIGS[intent]).toBeDefined();
      expect(INTENT_STEP_CONFIGS[intent].length).toBeGreaterThan(0);
    }
  });
});

describe("DEFAULT_INTENT", () => {
  it("defaults to pinning", () => {
    expect(DEFAULT_INTENT).toBe(OnboardingIntent.Pinning);
  });
});
