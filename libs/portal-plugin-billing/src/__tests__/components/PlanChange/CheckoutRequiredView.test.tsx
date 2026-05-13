/// <reference types="vitest/browser" />
import { render } from "vitest-browser-react";
import { describe, expect, it, vi } from "vitest";

import { CheckoutRequiredView } from "@/ui/components/PlanChange/CheckoutRequiredView";

vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

describe("CheckoutRequiredView", () => {
  it("renders charge summary when data is provided", async () => {
    const screen = await render(
      <CheckoutRequiredView
        chargeDue="1.00"
        creditApplied="0.50"
        effectiveDate="2026-05-02T00:00:00Z"
        gatewayName="Stripe"
        onContinueToCheckout={vi.fn()}
      />,
    );

    await expect.element(screen.getByText("Prorated charge")).toBeInTheDocument();
    await expect.element(screen.getByText("$1.00")).toBeInTheDocument();
    await expect.element(screen.getByText("Credit applied")).toBeInTheDocument();
    await expect.element(screen.getByText("-$0.50")).toBeInTheDocument();
    await expect.element(screen.getByText("Effective")).toBeInTheDocument();
    await expect.element(screen.getByText(/5\/2\/2026/)).toBeInTheDocument();
  });

  it("calls onContinueToCheckout when button is clicked", async () => {
    const handleContinue = vi.fn();
    const screen = await render(
      <CheckoutRequiredView
        chargeDue="1.00"
        creditApplied="0"
        gatewayName="Stripe"
        onContinueToCheckout={handleContinue}
      />,
    );

    await screen.getByRole("button", { name: /continue to checkout/i }).click();

    expect(handleContinue).toHaveBeenCalledTimes(1);
  });

  it("displays gateway name when provided", async () => {
    const screen = await render(
      <CheckoutRequiredView
        chargeDue="1.00"
        gatewayName="PayPal"
        onContinueToCheckout={vi.fn()}
      />,
    );

    await expect.element(screen.getByText(/Securely powered by PayPal/)).toBeInTheDocument();
  });

  it("does not render summary section when no data provided", async () => {
    const screen = await render(<CheckoutRequiredView onContinueToCheckout={vi.fn()} />);

    await expect.element(screen.getByText("Prorated charge")).not.toBeInTheDocument();
    await expect.element(screen.getByRole("button", { name: /continue to checkout/i })).toBeInTheDocument();
  });

  it("does not show zero credit applied", async () => {
    const screen = await render(
      <CheckoutRequiredView
        chargeDue="1.00"
        creditApplied="0.00"
        onContinueToCheckout={vi.fn()}
      />,
    );

    // Credit row should not be shown when it's 0
    const creditElements = screen.container.querySelectorAll("*");
    const hasCreditText = Array.from(creditElements).some(
      (el) => el.textContent === "Credit applied",
    );
    expect(hasCreditText).toBe(false);
  });
});
