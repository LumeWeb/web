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

vi.mock("@/hooks/useHasWorkspaces", () => ({
  useHasWorkspaces: vi.fn(),
}));

import { useCliInstalled } from "@/hooks/useCliInstalled";
import { useIsSubscribed } from "@/hooks/useIsSubscribed";
import { useHasWorkspaces } from "@/hooks/useHasWorkspaces";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";

const mockUseCliInstalled = vi.mocked(useCliInstalled);
const mockUseIsSubscribed = vi.mocked(useIsSubscribed);
const mockUseHasWorkspaces = vi.mocked(useHasWorkspaces);

describe("useOnboardingStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReadPersistedParam.mockResolvedValue(null);

    mockUseCliInstalled.mockReturnValue({ isInstalled: false, isBusy: false, hasError: false });
    mockUseIsSubscribed.mockReturnValue({ isSubscribed: false, isBusy: false, hasError: false });
    mockUseHasWorkspaces.mockReturnValue({ hasWorkspace: false, isBusy: false, hasError: false });
  });

  describe("default (null) intent — falls back to pinning", () => {
    it("returns 3 pinning steps with correct IDs, labels, and CTAs", async () => {
      const { result } = await renderHook(() => useOnboardingStatus());

      expect(result.current.steps).toHaveLength(3);
      expect(result.current.steps[0].id).toBe("subscribe");
      expect(result.current.steps[0].label).toBe("Subscribe");
      expect(result.current.steps[0].ctaLabel).toBe("View plans");
      expect(result.current.steps[0].ctaRoute).toBe("/account/subscription");
      expect(result.current.steps[1].id).toBe("docs");
      expect(result.current.steps[1].label).toBe("Read the Docs");
      expect(result.current.steps[1].ctaLabel).toBe("Browse docs");
      expect(result.current.steps[1].ctaRoute).toBeNull();
      expect(result.current.steps[2].id).toBe("cli");
      expect(result.current.steps[2].label).toBe("Install CLI");
      expect(result.current.steps[2].ctaLabel).toBe("Copy install command");
      expect(result.current.steps[2].ctaRoute).toBeNull();
    });

    it("completedCount is correct for partial completion", async () => {
      mockUseCliInstalled.mockReturnValue({ isInstalled: true, isBusy: false, hasError: false });

      const { result } = await renderHook(() => useOnboardingStatus());
      expect(result.current.completedCount).toBe(2);
    });

    it("completedCount is 3 when two tracked steps complete", async () => {
      mockUseCliInstalled.mockReturnValue({ isInstalled: true, isBusy: false, hasError: false });
      mockUseIsSubscribed.mockReturnValue({ isSubscribed: true, isBusy: false, hasError: false });

      const { result } = await renderHook(() => useOnboardingStatus());
      expect(result.current.completedCount).toBe(3);
    });

    it("isComplete is true only when all tracked steps complete", async () => {
      mockUseCliInstalled.mockReturnValue({ isInstalled: true, isBusy: false, hasError: false });
      mockUseIsSubscribed.mockReturnValue({ isSubscribed: true, isBusy: false, hasError: false });

      const { result } = await renderHook(() => useOnboardingStatus());
      expect(result.current.isComplete).toBe(true);
      expect(result.current.completedCount).toBe(3);
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

    it("returns 4 hosting steps with correct IDs, labels, and CTAs", async () => {
      const { result } = await renderHook(() => useOnboardingStatus());

      expect(result.current.steps).toHaveLength(4);
      expect(result.current.steps[0].id).toBe("subscribe");
      expect(result.current.steps[0].label).toBe("Subscribe");
      expect(result.current.steps[0].ctaLabel).toBe("View plans");
      expect(result.current.steps[0].ctaRoute).toBe("/account/subscription");
      expect(result.current.steps[1].id).toBe("docs");
      expect(result.current.steps[1].label).toBe("Read the Docs");
      expect(result.current.steps[1].ctaLabel).toBe("Browse docs");
      expect(result.current.steps[1].ctaRoute).toBeNull();
      expect(result.current.steps[2].id).toBe("cli");
      expect(result.current.steps[2].label).toBe("Install CLI");
      expect(result.current.steps[2].ctaLabel).toBe("Copy install command");
      expect(result.current.steps[2].ctaRoute).toBeNull();
      expect(result.current.steps[3].id).toBe("deploy");
      expect(result.current.steps[3].label).toBe("Deploy Website");
      expect(result.current.steps[3].ctaLabel).toBe("Create site");
      expect(result.current.steps[3].ctaRoute).toBe("/sites/new");
    });

    it("uses workspace existence for deploy step completion", async () => {
      mockUseHasWorkspaces.mockReturnValue({ hasWorkspace: true, isBusy: false, hasError: false });

      const { result } = await renderHook(() => useOnboardingStatus());
      expect(result.current.steps[3].isComplete).toBe(true);
    });

    it("routes to /sites when a workspace already exists", async () => {
      mockUseHasWorkspaces.mockReturnValue({ hasWorkspace: true, isBusy: false, hasError: false });

      const { result } = await renderHook(() => useOnboardingStatus());
      expect(result.current.steps[3].ctaRoute).toBe("/sites");
    });

    it("leaves deploy incomplete when no workspace exists", async () => {
      mockUseHasWorkspaces.mockReturnValue({ hasWorkspace: false, isBusy: false, hasError: false });

      const { result } = await renderHook(() => useOnboardingStatus());
      expect(result.current.steps[3].isComplete).toBe(false);
    });

    it("isComplete is true when all hosting steps complete", async () => {
      mockUseCliInstalled.mockReturnValue({ isInstalled: true, isBusy: false, hasError: false });
      mockUseIsSubscribed.mockReturnValue({ isSubscribed: true, isBusy: false, hasError: false });
      mockUseHasWorkspaces.mockReturnValue({ hasWorkspace: true, isBusy: false, hasError: false });

      const { result } = await renderHook(() => useOnboardingStatus());
      expect(result.current.isComplete).toBe(true);
      expect(result.current.completedCount).toBe(4);
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

    it("returns 3 pinning steps with no upload step", async () => {
      const { result } = await renderHook(() => useOnboardingStatus());

      expect(result.current.steps).toHaveLength(3);
      expect(result.current.steps[0].id).toBe("subscribe");
      expect(result.current.steps[1].id).toBe("docs");
      expect(result.current.steps[2].id).toBe("cli");
    });

    it("returns pinning intent", async () => {
      const { result } = await renderHook(() => useOnboardingStatus());
      expect(result.current.intent).toBe(OnboardingIntent.Pinning);
    });
  });
});
