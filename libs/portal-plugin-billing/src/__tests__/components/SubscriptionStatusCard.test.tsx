/// <reference types="vitest/browser" />
import { describe, it, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { SubscriptionStatusCard } from "@/ui/components/SubscriptionStatusCard";
import type { SubscriptionStatusResponse, PublicPricingPlansListResponse } from "@/types/subscription";

const mockSubscription: { data: SubscriptionStatusResponse } = {
  data: {
    is_subscribed: true,
    pricing_plan_period_id: 10,
    gateway_type: "stripe",
    created_at: "2025-01-01",
    updated_at: "2025-01-01",
  },
};

const mockSubscriptionWithCancel: { data: SubscriptionStatusResponse } = {
  data: {
    is_subscribed: true,
    pricing_plan_period_id: 10,
    gateway_type: "atlos",
    will_cancel_at: "2025-12-31T00:00:00Z",
    created_at: "2025-01-01",
    updated_at: "2025-01-01",
  },
};

const mockSubscriptionWithPause: { data: SubscriptionStatusResponse } = {
  data: {
    is_subscribed: true,
    pricing_plan_period_id: 10,
    gateway_type: "stripe",
    paused_at: "2025-06-15T10:30:00Z",
    created_at: "2025-01-01",
    updated_at: "2025-01-01",
  },
};

const mockPlans: PublicPricingPlansListResponse = {
  data: [
    {
      id: 1,
      name: "Basic",
      description: "Basic plan",
      currency: "USD",
      features: ["Feature 1", "Feature 2"],
      pricing_periods: [
        { id: 10, cadence: "monthly", price_usd: 9.99, quota_plan_id: 1 },
      ],
    },
  ],
  total: 1,
};

const { mockUseBillingContext } = vi.hoisted(() => ({
  mockUseBillingContext: vi.fn(() => ({
    subscription: {
      data: mockSubscription.data,
      isReady: true,
      isBusy: false,
      hasError: false,
      error: null,
    },
    findCurrentPlan: () => ({
      plan: mockPlans.data[0],
      period: mockPlans.data[0].pricing_periods[0],
    }),
  })),
}));

vi.mock("@/ui/context/BillingContext", () => ({
  useBillingContext: mockUseBillingContext,
}));

vi.mock("@/hooks/useManagementCapabilities", () => ({
  useManagementCapabilities: () => ({
    data: null,
    isReady: true,
    isBusy: false,
    hasError: false,
    error: null,
  }),
}));

vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
  Skeleton: ({ ...props }: any) => <div data-testid="skeleton" {...props} />,
}));

vi.mock("@/ui/components/SubscriptionStatusCard/StatusHeader", () => ({
  StatusHeader: () => <div data-testid="status-header">StatusHeader</div>,
}));

vi.mock("@/ui/components/SubscriptionStatusCard/PlanDetails", () => ({
  PlanDetails: ({ planInfo }: any) => <div data-testid="plan-details">Plan: {planInfo?.plan?.name}</div>,
}));

vi.mock("@/ui/components/SubscriptionStatusCard/PausedStatus", () => ({
  PausedStatus: ({ pausedAt }: any) => <div data-testid="paused-status">Paused: {pausedAt}</div>,
}));

vi.mock("@/ui/components/SubscriptionStatusCard/CancellationStatus", () => ({
  CancellationStatus: ({ willCancelAt }: any) => (
    <div data-testid="cancellation-status">Cancels: {willCancelAt}</div>
  ),
}));

describe("SubscriptionStatusCard", () => {
  it("renders loading state when busy", async () => {
    mockUseBillingContext.mockReturnValue({
      subscription: {
        data: null as any,
        isReady: false,
        isBusy: true,
        hasError: false,
        error: null,
      },
      findCurrentPlan: () => null as any,
    });

    render(<SubscriptionStatusCard />);
    await expect.element(page.getByText("Loading subscription...")).toBeVisible();
  });

  it("renders no subscription message when not subscribed", async () => {
    mockUseBillingContext.mockReturnValue({
      subscription: {
        data: { is_subscribed: false, pricing_plan_period_id: 0 } as SubscriptionStatusResponse,
        isReady: true,
        isBusy: false,
        hasError: false,
        error: null,
      },
      findCurrentPlan: () => null as any,
    });

    render(<SubscriptionStatusCard />);
    await expect.element(page.getByText("No active subscription")).toBeVisible();
  });

  it("renders StatusHeader component", async () => {
    mockUseBillingContext.mockReturnValue({
      subscription: {
        data: mockSubscription.data,
        isReady: true,
        isBusy: false,
        hasError: false,
        error: null,
      },
      findCurrentPlan: () => ({
        plan: mockPlans.data[0],
        period: mockPlans.data[0].pricing_periods[0],
      }),
    });

    render(<SubscriptionStatusCard />);
    await expect.element(page.getByTestId("status-header")).toBeVisible();
  });

  it("renders PlanDetails component", async () => {
    mockUseBillingContext.mockReturnValue({
      subscription: {
        data: mockSubscription.data,
        isReady: true,
        isBusy: false,
        hasError: false,
        error: null,
      },
      findCurrentPlan: () => ({
        plan: mockPlans.data[0],
        period: mockPlans.data[0].pricing_periods[0],
      }),
    });

    render(<SubscriptionStatusCard />);
    await expect.element(page.getByTestId("plan-details")).toBeVisible();
  });

  it("renders PausedStatus when paused_at is set", async () => {
    mockUseBillingContext.mockReturnValue({
      subscription: {
        data: mockSubscriptionWithPause.data,
        isReady: true,
        isBusy: false,
        hasError: false,
        error: null,
      },
      findCurrentPlan: () => ({
        plan: mockPlans.data[0],
        period: mockPlans.data[0].pricing_periods[0],
      }),
    });

    render(<SubscriptionStatusCard />);
    await expect.element(page.getByTestId("paused-status")).toBeVisible();
    await expect.element(page.getByText(/2025-06-15/)).toBeVisible();
  });

  it("does not render CancellationStatus when paused_at is set", async () => {
    mockUseBillingContext.mockReturnValue({
      subscription: {
        data: {
          ...mockSubscriptionWithCancel.data,
          paused_at: "2025-06-15T10:30:00Z",
        },
        isReady: true,
        isBusy: false,
        hasError: false,
        error: null,
      },
      findCurrentPlan: () => ({
        plan: mockPlans.data[0],
        period: mockPlans.data[0].pricing_periods[0],
      }),
    });

    render(<SubscriptionStatusCard />);
    await expect.element(page.getByTestId("paused-status")).toBeVisible();
    await expect.element(page.getByTestId("cancellation-status")).not.toBeInTheDocument();
  });

  it("renders CancellationStatus when will_cancel_at is set without paused_at", async () => {
    mockUseBillingContext.mockReturnValue({
      subscription: {
        data: mockSubscriptionWithCancel.data,
        isReady: true,
        isBusy: false,
        hasError: false,
        error: null,
      },
      findCurrentPlan: () => ({
        plan: mockPlans.data[0],
        period: mockPlans.data[0].pricing_periods[0],
      }),
    });

    render(<SubscriptionStatusCard />);
    await expect.element(page.getByTestId("cancellation-status")).toBeVisible();
    await expect.element(page.getByText(/2025-12-31/)).toBeVisible();
  });
});
