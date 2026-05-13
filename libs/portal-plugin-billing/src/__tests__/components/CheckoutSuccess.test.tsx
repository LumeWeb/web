/// <reference types="vitest/browser" />
import { render } from "vitest-browser-react";
import { describe, expect, it, vi } from "vitest";

import { CheckoutSuccess } from "@/ui/components/CheckoutSuccess";

vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  cn: (...args: (string | undefined)[]) => args.filter(Boolean).join(" "),
}));

vi.mock("lucide-react", () => ({
  CheckCircle: () => <svg data-testid="check-icon" />,
}));

describe("CheckoutSuccess", () => {
  const mockSubscription = {
    is_subscribed: true,
    pricing_plan_period_id: 1,
    gateway_type: "stripe",
  };

  const mockCurrentPlan = {
    plan: { name: "Pro Plan" },
    period: { cadence: "monthly" },
  };

  it("renders success card with plan name", async () => {
    const screen = await render(
      <CheckoutSuccess
        currentPlan={mockCurrentPlan}
        onBackToDashboard={() => {}}
        subscription={mockSubscription}
      />,
    );

    await expect.element(screen.getByText("Subscription Activated!")).toBeInTheDocument();
    await expect.element(screen.getByText("Pro Plan")).toBeInTheDocument();
  });

  it("calls onBackToDashboard when button is clicked", async () => {
    const handleBack = vi.fn();
    const screen = await render(
      <CheckoutSuccess
        currentPlan={mockCurrentPlan}
        onBackToDashboard={handleBack}
        subscription={mockSubscription}
      />,
    );

    await screen.getByRole("button").click();

    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it("renders with subscription data", async () => {
    const screen = await render(
      <CheckoutSuccess
        currentPlan={null}
        onBackToDashboard={() => {}}
        subscription={mockSubscription}
      />,
    );

    await expect.element(screen.getByText("Subscription Activated!")).toBeInTheDocument();
    await expect.element(screen.getByTestId("check-icon")).toBeInTheDocument();
  });
});
