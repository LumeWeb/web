import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "vitest-browser-react";

vi.mock("@lumeweb/analytics", () => ({
  useAnalytics: vi.fn(),
}));

import { useAnalytics } from "@lumeweb/analytics";
import { useOnboardingAnalytics } from "@/analytics/useOnboardingAnalytics";

const mockUseAnalytics = vi.mocked(useAnalytics);
const FIRST_SEEN_KEY = "pinner_onboarding_first_seen";

describe("useOnboardingAnalytics", () => {
  let mockCapture: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCapture = vi.fn();
    mockUseAnalytics.mockReturnValue({
      capture: mockCapture,
      identify: vi.fn(),
    } as any);
    localStorage.clear();
  });

  it("captureStepViewed calls capture with correct event name and properties", async () => {
    const { result } = await renderHook(() => useOnboardingAnalytics());
    result.current.captureStepViewed("cli", 1);

    expect(mockCapture).toHaveBeenCalledWith("$onboarding_step_viewed", {
      step: "cli",
      step_order: 1,
    });
  });

  it("captureStepCompleted calls capture with correct event name and time_since_signup", async () => {
    const firstSeen = Date.now() - 5000;
    localStorage.setItem(FIRST_SEEN_KEY, String(firstSeen));

    const { result } = await renderHook(() => useOnboardingAnalytics());
    result.current.captureStepCompleted("subscribe");

    expect(mockCapture).toHaveBeenCalledWith("$onboarding_step_completed", {
      step: "subscribe",
      time_since_signup: expect.any(Number),
    });

    const call = mockCapture.mock.calls[0] as [string, { time_since_signup: number }];
    expect(call[1].time_since_signup).toBeGreaterThanOrEqual(5000);
  });

  it("captureStepCompleted uses 0 for time_since_signup when first_seen is not set", async () => {
    const { result } = await renderHook(() => useOnboardingAnalytics());
    result.current.captureStepCompleted("subscribe");

    expect(mockCapture).toHaveBeenCalledWith("$onboarding_step_completed", {
      step: "subscribe",
      time_since_signup: 0,
    });
  });

  it("captureDismissed calls capture with correct event name and remaining steps", async () => {
    const { result } = await renderHook(() => useOnboardingAnalytics());
    result.current.captureDismissed(2);

    expect(mockCapture).toHaveBeenCalledWith("$onboarding_dismissed", {
      remaining_steps: 2,
    });
  });

  it("captureOnboardingCompleted calls capture with correct event name and total_time", async () => {
    const firstSeen = Date.now() - 10000;
    localStorage.setItem(FIRST_SEEN_KEY, String(firstSeen));

    const { result } = await renderHook(() => useOnboardingAnalytics());
    result.current.captureOnboardingCompleted();

    expect(mockCapture).toHaveBeenCalledWith("$onboarding_completed", {
      total_time: expect.any(Number),
    });

    const call = mockCapture.mock.calls[0] as [string, { total_time: number }];
    expect(call[1].total_time).toBeGreaterThanOrEqual(10000);
  });

  it("captureOnboardingCompleted uses 0 for total_time when first_seen is not set", async () => {
    const { result } = await renderHook(() => useOnboardingAnalytics());
    result.current.captureOnboardingCompleted();

    expect(mockCapture).toHaveBeenCalledWith("$onboarding_completed", {
      total_time: 0,
    });
  });
});
