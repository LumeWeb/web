import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "vitest-browser-react";

vi.mock("@lumeweb/portal-framework-auth", () => ({
  DATA_PROVIDER_NAME: "dashboard",
}));

vi.mock("@microsoft/fetch-event-source", () => ({
  fetchEventSource: vi.fn(() => Promise.resolve()),
}));

let mockAuthToken = "test-auth-token";

vi.mock("@lumeweb/portal-framework-core", () => ({
  getApiBaseUrl: vi.fn(() => "https://api.example.com"),
  useCapability: vi.fn(() => ({
    data: {
      getAuthToken: () => mockAuthToken,
      getApiUrl: () => "https://api.example.com",
    },
  })),
}));

import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useSubscriptionEventFeed } from "@/hooks/useSubscriptionEventFeed";
import { BillingSSEEventType } from "@/types/subscription";

const mockFetchEventSource = vi.mocked(fetchEventSource);

describe("useSubscriptionEventFeed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("jwt", "test-token");
  });

  afterEach(() => {
    localStorage.removeItem("jwt");
    mockAuthToken = "test-auth-token";
  });

  it("connects with fetch override that injects fresh auth headers", async () => {
    const { result } = await renderHook(() => useSubscriptionEventFeed());

    const callArgs = mockFetchEventSource.mock.calls[0][1];
    expect(callArgs.fetch).toBeDefined();
    expect(callArgs.method).toBe("GET");
  });

  it("skips SSE connection when no auth token available", async () => {
    mockAuthToken = null as any;

    const { result } = await renderHook(() => useSubscriptionEventFeed());

    expect(mockFetchEventSource).not.toHaveBeenCalled();
  });

  it("emits on payment.completed channel", async () => {
    const { result } = await renderHook(() => useSubscriptionEventFeed());
    const listener = vi.fn();
    result.current.on(BillingSSEEventType.PaymentCompleted, listener);

    const onmessage = mockFetchEventSource.mock.calls[0][1].onmessage!;
    onmessage({ event: BillingSSEEventType.PaymentCompleted, data: '{"amount":"10.00"}', id: undefined, retry: undefined } as any);

    expect(listener).toHaveBeenCalledWith({ amount: "10.00" });
  });

  it("emits on subscription.active channel", async () => {
    const { result } = await renderHook(() => useSubscriptionEventFeed());
    const listener = vi.fn();
    result.current.on(BillingSSEEventType.SubscriptionActive, listener);

    const onmessage = mockFetchEventSource.mock.calls[0][1].onmessage!;
    onmessage({ event: BillingSSEEventType.SubscriptionActive, data: '{"subscription_id":"sub_123"}', id: undefined, retry: undefined } as any);

    expect(listener).toHaveBeenCalled();
  });

  it("emits on plan.changed channel", async () => {
    const { result } = await renderHook(() => useSubscriptionEventFeed());
    const listener = vi.fn();
    result.current.on(BillingSSEEventType.PlanChanged, listener);

    const onmessage = mockFetchEventSource.mock.calls[0][1].onmessage!;
    onmessage({ event: BillingSSEEventType.PlanChanged, data: '{"new_plan_id":2}', id: undefined, retry: undefined } as any);

    expect(listener).toHaveBeenCalledWith({ new_plan_id: 2 });
  });

  it("does not emit on unknown event type", async () => {
    const { result } = await renderHook(() => useSubscriptionEventFeed());
    const listener = vi.fn();
    (result.current as any).on("unknown.event", listener);

    const onmessage = mockFetchEventSource.mock.calls[0][1].onmessage!;
    onmessage({ event: "unknown.event", data: "{}", id: undefined, retry: undefined } as any);

    expect(listener).not.toHaveBeenCalled();
  });

  it("aborts SSE connection on unmount", async () => {
    const { unmount } = await renderHook(() => useSubscriptionEventFeed());

    const signal = mockFetchEventSource.mock.calls[0][1].signal as AbortSignal;
    expect(signal.aborted).toBe(false);

    unmount();

    expect(signal.aborted).toBe(true);
  });

  it("does not crash on malformed JSON in onmessage", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { result } = await renderHook(() => useSubscriptionEventFeed());
    const listener = vi.fn();
    result.current.on(BillingSSEEventType.PaymentCompleted, listener);

    const onmessage = mockFetchEventSource.mock.calls[0][1].onmessage!;
    onmessage({ event: BillingSSEEventType.PaymentCompleted, data: "not-valid-json", id: undefined, retry: undefined } as any);

    expect(listener).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith("SSE: skipping malformed JSON in event data");
    warnSpy.mockRestore();
  });

  it("throws on 401 auth error in onerror to stop retry", async () => {
    const { result } = await renderHook(() => useSubscriptionEventFeed());

    const onerror = mockFetchEventSource.mock.calls[0][1].onerror!;
    const authError = { status: 401 };

    expect(() => onerror(authError)).toThrow();
  });

  it("throws on 403 auth error in onerror to stop retry", async () => {
    const { result } = await renderHook(() => useSubscriptionEventFeed());

    const onerror = mockFetchEventSource.mock.calls[0][1].onerror!;
    const authError = { status: 403 };

    expect(() => onerror(authError)).toThrow();
  });

  it("does not throw on server error (503) in onerror — allows retry", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { result } = await renderHook(() => useSubscriptionEventFeed());

    const onerror = mockFetchEventSource.mock.calls[0][1].onerror!;
    const serverError = { status: 503 };

    expect(() => onerror(serverError)).not.toThrow();
    expect(warnSpy).toHaveBeenCalledWith("SSE connection error, will retry:", serverError);
    warnSpy.mockRestore();
  });

  it("unbind listener stops receiving events", async () => {
    const { result } = await renderHook(() => useSubscriptionEventFeed());
    const listener = vi.fn();
    const unbind = result.current.on(BillingSSEEventType.PaymentCompleted, listener);

    unbind();

    const onmessage = mockFetchEventSource.mock.calls[0][1].onmessage!;
    onmessage({ event: BillingSSEEventType.PaymentCompleted, data: "{}", id: undefined, retry: undefined } as any);

    expect(listener).not.toHaveBeenCalled();
  });
});
