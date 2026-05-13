/// <reference types="vitest/browser" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { PricingTable } from "@/ui/components/PricingTable";
import type { PublicPricingPlansListResponse, SubscriptionStatusResponse } from "@/types/subscription";

// Mock data matching real API response (is_active not included)
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
        { id: 11, cadence: "yearly", price_usd: 99.99, quota_plan_id: 2 },
      ],
    },
    {
      id: 2,
      name: "Pro",
      description: "Pro plan",
      currency: "USD",
      features: ["Feature 1", "Feature 2", "Feature 3"],
      pricing_periods: [
        { id: 20, cadence: "monthly", price_usd: 19.99, quota_plan_id: 3 },
      ],
    },
  ],
  total: 2,
};

const mockSubscription: { data: SubscriptionStatusResponse } = {
  data: {
    is_subscribed: true,
    pricing_plan_period_id: 10,
    gateway_type: "stripe",
    created_at: "2025-01-01",
    updated_at: "2025-01-01",
  },
};

vi.mock("@/hooks/usePricingPlans", () => ({
  usePricingPlans: () => ({
    data: mockPlans,
    isReady: true,
    isBusy: false,
    hasError: false,
    error: null,
    result: { result: { data: mockPlans }, query: { isLoading: false, isError: false } },
  }),
}));

vi.mock("@/hooks/useSubscriptionStatus", () => ({
  useSubscriptionStatus: () => ({
    data: mockSubscription.data,
    isReady: true,
    isBusy: false,
    hasError: false,
    error: null,
    result: { result: mockSubscription, query: { isLoading: false, isError: false } },
  }),
}));

const mockUseCheckout = vi.fn<(config?: unknown) => any>(() => ({
  data: undefined,
  isReady: false,
  isBusy: false,
  hasError: false,
  error: null,
  result: { result: { data: null }, query: { isLoading: false, isError: false } },
}));

vi.mock("@/hooks/useCheckout", () => ({
  useCheckout: (config?: unknown) => mockUseCheckout(config),
}));

vi.mock("@/hooks/useCheckoutSessionStatus", () => ({
  useCheckoutSessionStatus: () => ({
    data: undefined,
    isReady: false,
    isBusy: false,
    hasError: false,
    error: null,
    result: { result: { data: null }, query: { isLoading: false, isError: false } },
  }),
}));

vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
  Button: ({ children, disabled, onClick, variant, className }: any) => (
    <button disabled={disabled} onClick={onClick} className={className} data-variant={variant}>{children}</button>
  ),
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
  Label: ({ children, className }: any) => <label className={className}>{children}</label>,
  Switch: ({ checked, onCheckedChange }: any) => (
    <input type="checkbox" role="switch" checked={checked} onChange={(e: any) => onCheckedChange?.(e.target.checked)} />
  ),
  Skeleton: ({ className }: any) => <div data-testid="skeleton" className={className} />,
}));

vi.mock("@/ui/components/FragmentRenderer", () => ({
  FragmentRenderer: ({ fragments }: any) => <div data-testid="fragment-renderer">{JSON.stringify(fragments)}</div>,
}));



beforeEach(() => {
  vi.clearAllMocks();
});

describe("PricingTable", () => {
  it("renders plans from mock data", async () => {
    const screen = render(<PricingTable />);

    await expect.element(page.getByRole("heading", { name: "Basic" })).toBeVisible();
    await expect.element(page.getByRole("heading", { name: "Pro" })).toBeVisible();
  });

  it("shows monthly prices by default", async () => {
    const screen = render(<PricingTable />);

    await expect.element(page.getByText(/\$9.99/)).toBeVisible();
    await expect.element(page.getByText(/\$19.99/)).toBeVisible();
  });

  it("toggles to yearly when clicked", async () => {
    const screen = render(<PricingTable />);

    await page.getByRole("switch").click();

    await expect.element(page.getByText(/\$99.99/)).toBeVisible();
  });

  it("highlights current plan", async () => {
    const screen = render(<PricingTable />);

    const currentPlanButton = page.getByText("Current Plan");
    await expect.element(currentPlanButton).toBeVisible();
  });

  it("shows subscribe button for non-current plans", async () => {
    const screen = render(<PricingTable />);

    await expect.element(page.getByText("Subscribe")).toBeVisible();
  });

  it("calls useCheckout with correct period_id when Subscribe is clicked", async () => {
    render(<PricingTable />);

    await page.getByText("Subscribe").click();

    // Should be called with planId=2 (Pro) and periodId=20 (monthly period for Pro)
    expect(mockUseCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        planId: "2",
        periodId: 20,
      }),
    );
  });
});
