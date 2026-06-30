import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "vitest-browser-react";
import { OnboardingIntent } from "@/types";

const mockReadPersistedParam = vi.fn<() => Promise<string | null>>();

vi.mock("@lumeweb/portal-framework-core", () => ({
  readPersistedParam: () => mockReadPersistedParam(),
}));

vi.mock("@/hooks/useCliInstalled", () => ({
  useCliInstalled: vi.fn(),
}));

vi.mock("@/hooks/useIsSubscribed", () => ({
  useIsSubscribed: vi.fn(),
}));

vi.mock("@/hooks/useHasPins", () => ({
  useHasPins: vi.fn(),
}));

vi.mock("@/hooks/useHasWebsites", () => ({
  useHasWebsites: vi.fn(),
}));

import { useCliInstalled } from "@/hooks/useCliInstalled";
import { useIsSubscribed } from "@/hooks/useIsSubscribed";
import { useHasPins } from "@/hooks/useHasPins";
import { useHasWebsites } from "@/hooks/useHasWebsites";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";

const mockUseCliInstalled = vi.mocked(useCliInstalled);
const mockUseIsSubscribed = vi.mocked(useIsSubscribed);
const mockUseHasPins = vi.mocked(useHasPins);
const mockUseHasWebsites = vi.mocked(useHasWebsites);

describe("useOnboardingStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReadPersistedParam.mockResolvedValue(null);

    mockUseCliInstalled.mockReturnValue({ isInstalled: false, isBusy: false, hasError: false });
    mockUseIsSubscribed.mockReturnValue({ isSubscribed: false, isBusy: false, hasError: false });
    mockUseHasPins.mockReturnValue({ hasPins: false, isBusy: false, hasError: false });
    mockUseHasWebsites.mockReturnValue({ hasWebsites: false, isBusy: false, hasError: false });
  });

  describe("default (null) intent — falls back to pinning", () => {
    it("returns 3 pinning steps with correct IDs, labels, and CTAs", async () => {
      const { result } = await renderHook(() => useOnboardingStatus());

      expect(result.current.steps).toHaveLength(3);
      expect(result.current.steps[0].id).toBe("cli");
      expect(result.current.steps[0].label).toBe("Install CLI");
      expect(result.current.steps[0].ctaLabel).toBe("Copy install command");
      expect(result.current.steps[0].ctaRoute).toBeNull();
      expect(result.current.steps[1].id).toBe("subscribe");
      expect(result.current.steps[1].label).toBe("Subscribe");
      expect(result.current.steps[1].ctaLabel).toBe("View plans");
      expect(result.current.steps[1].ctaRoute).toBe("/account/subscription");
      expect(result.current.steps[2].id).toBe("upload");
      expect(result.current.steps[2].label).toBe("Upload Content");
      expect(result.current.steps[2].ctaLabel).toBe("Upload files");
      expect(result.current.steps[2].ctaRoute).toBe("/services/ipfs/files");
    });

    it("uses hasPins for upload step completion when intent is null", async () => {
      mockUseHasPins.mockReturnValue({ hasPins: true, isBusy: false, hasError: false });

      const { result } = await renderHook(() => useOnboardingStatus());
      expect(result.current.steps[2].isComplete).toBe(true);
    });

    it("completedCount is correct for partial completion", async () => {
      mockUseCliInstalled.mockReturnValue({ isInstalled: true, isBusy: false, hasError: false });

      const { result } = await renderHook(() => useOnboardingStatus());
      expect(result.current.completedCount).toBe(1);
    });

    it("completedCount is 2 when two steps complete", async () => {
      mockUseCliInstalled.mockReturnValue({ isInstalled: true, isBusy: false, hasError: false });
      mockUseIsSubscribed.mockReturnValue({ isSubscribed: true, isBusy: false, hasError: false });

      const { result } = await renderHook(() => useOnboardingStatus());
      expect(result.current.completedCount).toBe(2);
    });

    it("isComplete is true only when all 3 steps complete", async () => {
      mockUseCliInstalled.mockReturnValue({ isInstalled: true, isBusy: false, hasError: false });
      mockUseIsSubscribed.mockReturnValue({ isSubscribed: true, isBusy: false, hasError: false });

      const { result } = await renderHook(() => useOnboardingStatus());
      expect(result.current.isComplete).toBe(false);

      mockUseHasPins.mockReturnValue({ hasPins: true, isBusy: false, hasError: false });

      const { result: result2 } = await renderHook(() => useOnboardingStatus());
      expect(result2.current.isComplete).toBe(true);
      expect(result2.current.completedCount).toBe(3);
    });

    it("isBusy is true when any child hook is busy", async () => {
      mockUseCliInstalled.mockReturnValue({ isInstalled: false, isBusy: true, hasError: false });

      const { result } = await renderHook(() => useOnboardingStatus());
      expect(result.current.isBusy).toBe(true);
    });

    it("isBusy is false when no child hook is busy", async () => {
      const { result } = await renderHook(() => useOnboardingStatus());
      expect(result.current.isBusy).toBe(false);
    });

    it("returns null intent when no persisted intent", async () => {
      const { result } = await renderHook(() => useOnboardingStatus());
      expect(result.current.intent).toBeNull();
    });
  });

  describe("hosting intent", () => {
    beforeEach(() => {
      mockReadPersistedParam.mockResolvedValue(OnboardingIntent.Hosting);
    });

    it("returns 3 hosting steps with correct IDs, labels, and CTAs", async () => {
      const { result } = await renderHook(() => useOnboardingStatus());

      expect(result.current.steps).toHaveLength(3);
      expect(result.current.steps[0].id).toBe("cli");
      expect(result.current.steps[0].label).toBe("Install CLI");
      expect(result.current.steps[0].ctaLabel).toBe("Copy install command");
      expect(result.current.steps[0].ctaRoute).toBeNull();
      expect(result.current.steps[1].id).toBe("subscribe");
      expect(result.current.steps[1].label).toBe("Subscribe");
      expect(result.current.steps[1].ctaLabel).toBe("View plans");
      expect(result.current.steps[1].ctaRoute).toBe("/account/subscription");
      expect(result.current.steps[2].id).toBe("deploy");
      expect(result.current.steps[2].label).toBe("Deploy Website");
      expect(result.current.steps[2].ctaLabel).toBe("Create website");
      expect(result.current.steps[2].ctaRoute).toBe("/websites");
    });

    it("uses hasWebsites for deploy step completion", async () => {
      mockUseHasWebsites.mockReturnValue({ hasWebsites: true, isBusy: false, hasError: false });

      const { result } = await renderHook(() => useOnboardingStatus());
      expect(result.current.steps[2].isComplete).toBe(true);
    });

    it("ignores hasPins for deploy step completion when hosting", async () => {
      mockUseHasPins.mockReturnValue({ hasPins: true, isBusy: false, hasError: false });
      mockUseHasWebsites.mockReturnValue({ hasWebsites: false, isBusy: false, hasError: false });

      const { result } = await renderHook(() => useOnboardingStatus());
      expect(result.current.steps[2].isComplete).toBe(false);
    });

    it("isComplete is true when all 3 hosting steps complete", async () => {
      mockUseCliInstalled.mockReturnValue({ isInstalled: true, isBusy: false, hasError: false });
      mockUseIsSubscribed.mockReturnValue({ isSubscribed: true, isBusy: false, hasError: false });
      mockUseHasWebsites.mockReturnValue({ hasWebsites: true, isBusy: false, hasError: false });

      const { result } = await renderHook(() => useOnboardingStatus());
      expect(result.current.isComplete).toBe(true);
      expect(result.current.completedCount).toBe(3);
    });

    it("returns hosting intent", async () => {
      const { result } = await renderHook(() => useOnboardingStatus());
      expect(result.current.intent).toBe(OnboardingIntent.Hosting);
    });
  });

  describe("pinning intent", () => {
    beforeEach(() => {
      mockReadPersistedParam.mockResolvedValue(OnboardingIntent.Pinning);
    });

    it("returns 3 pinning steps with upload step checking pins", async () => {
      const { result } = await renderHook(() => useOnboardingStatus());

      expect(result.current.steps).toHaveLength(3);
      expect(result.current.steps[2].id).toBe("upload");
      expect(result.current.steps[2].label).toBe("Upload Content");
      expect(result.current.steps[2].ctaLabel).toBe("Upload files");
      expect(result.current.steps[2].ctaRoute).toBe("/services/ipfs/files");
    });

    it("uses hasPins for upload step completion", async () => {
      mockUseHasPins.mockReturnValue({ hasPins: true, isBusy: false, hasError: false });

      const { result } = await renderHook(() => useOnboardingStatus());
      expect(result.current.steps[2].isComplete).toBe(true);
    });

    it("returns pinning intent", async () => {
      const { result } = await renderHook(() => useOnboardingStatus());
      expect(result.current.intent).toBe(OnboardingIntent.Pinning);
    });
  });
});
