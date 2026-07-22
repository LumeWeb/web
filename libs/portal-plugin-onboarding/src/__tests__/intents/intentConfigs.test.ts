import { describe, it, expect } from "vitest";
import { PINNING_STEPS } from "@/intents/pinning";
import { HOSTING_STEPS } from "@/intents/hosting";
import { INTENT_STEP_CONFIGS, DEFAULT_INTENT } from "@/intents/index";
import { OnboardingIntent } from "@/types";

describe("PINNING_STEPS", () => {
  it("has 4 steps: subscribe, docs, cli, upload", () => {
    expect(PINNING_STEPS).toHaveLength(4);
    expect(PINNING_STEPS[0].id).toBe("subscribe");
    expect(PINNING_STEPS[1].id).toBe("docs");
    expect(PINNING_STEPS[2].id).toBe("cli");
    expect(PINNING_STEPS[3].id).toBe("upload");
  });

  it("subscribe step navigates to /account/subscription", () => {
    expect(PINNING_STEPS[0].ctaRoute).toBe("/account/subscription");
  });

  it("docs step has docsUrl and null ctaRoute", () => {
    expect(PINNING_STEPS[1].ctaRoute).toBeNull();
    expect(PINNING_STEPS[1].docsUrl).toBeDefined();
    expect(PINNING_STEPS[1].ctaLabel).toBe("Browse docs");
  });

  it("cli step has null ctaRoute (clipboard copy)", () => {
    expect(PINNING_STEPS[2].ctaRoute).toBeNull();
    expect(PINNING_STEPS[2].ctaLabel).toBe("Copy install command");
  });

  it("upload step navigates to /files", () => {
    expect(PINNING_STEPS[3].ctaRoute).toBe("/services/ipfs/files");
    expect(PINNING_STEPS[3].ctaLabel).toBe("Upload files");
  });
});

describe("HOSTING_STEPS", () => {
  it("has 4 steps: subscribe, docs, cli, deploy", () => {
    expect(HOSTING_STEPS).toHaveLength(4);
    expect(HOSTING_STEPS[0].id).toBe("subscribe");
    expect(HOSTING_STEPS[1].id).toBe("docs");
    expect(HOSTING_STEPS[2].id).toBe("cli");
    expect(HOSTING_STEPS[3].id).toBe("deploy");
  });

  it("subscribe step navigates to /account/subscription", () => {
    expect(HOSTING_STEPS[0].ctaRoute).toBe("/account/subscription");
  });

  it("docs step has docsUrl and null ctaRoute", () => {
    expect(HOSTING_STEPS[1].ctaRoute).toBeNull();
    expect(HOSTING_STEPS[1].docsUrl).toBeDefined();
    expect(HOSTING_STEPS[1].ctaLabel).toBe("Browse docs");
  });

  it("cli step has null ctaRoute (clipboard copy)", () => {
    expect(HOSTING_STEPS[2].ctaRoute).toBeNull();
    expect(HOSTING_STEPS[2].ctaLabel).toBe("Copy install command");
  });

  it("deploy step navigates to /websites", () => {
    expect(HOSTING_STEPS[3].ctaRoute).toBe("/websites");
    expect(HOSTING_STEPS[3].ctaLabel).toBe("Create website");
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
