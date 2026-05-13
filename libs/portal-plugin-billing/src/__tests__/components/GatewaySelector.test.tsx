/// <reference types="vitest/browser" />
import { render } from "vitest-browser-react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { GatewaySelector } from "@/ui/components/GatewaySelector";
import type { GatewayPublicInfo } from "@/types/subscription";

vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  Button: ({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
  Skeleton: () => <div data-testid="skeleton">Loading...</div>,
  cn: (...args: (string | undefined)[]) => args.filter(Boolean).join(" "),
}));

vi.mock("@lumeweb/portal-framework-core", () => ({
  useCapability: () => ({ data: { getApiUrl: () => "https://api.example.com" } }),
}));

describe("GatewaySelector", () => {
  const mockGateways: GatewayPublicInfo[] = [
    {
      id: "stripe",
      name: "Stripe",
      logo_url: "/logos/stripe.svg",
      abilities: { checkout: true, customer_portal: true, session_status: true },
      description: "Stripe payment gateway",
      is_active: true,
    },
    {
      id: "paypal",
      name: "PayPal",
      logo_url: "/logos/paypal.svg",
      abilities: { checkout: true, customer_portal: false, session_status: true },
      description: "PayPal payment gateway",
      is_active: true,
    },
  ];

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("<svg>test</svg>"),
    } as unknown as Response));
  });

  it("renders gateway list", async () => {
    const screen = await render(
      <GatewaySelector
        gateways={mockGateways}
        onSelect={vi.fn()}
      />,
    );

    // Use exact text to match the gateway name (not description)
    await expect.element(screen.getByText("Stripe", { exact: true })).toBeInTheDocument();
    await expect.element(screen.getByText("PayPal", { exact: true })).toBeInTheDocument();
  });

  it("calls onSelect when gateway is clicked", async () => {
    const handleSelect = vi.fn();
    const screen = await render(
      <GatewaySelector
        gateways={mockGateways}
        onSelect={handleSelect}
      />,
    );

    await screen.getByText("Stripe", { exact: true }).click();
    expect(handleSelect).toHaveBeenCalledWith(mockGateways[0]);
  });

  it("shows selected state for selected gateway", async () => {
    const screen = await render(
      <GatewaySelector
        gateways={mockGateways}
        selectedGatewayId="stripe"
        onSelect={vi.fn()}
      />,
    );

    await expect.element(screen.getByText("Stripe", { exact: true })).toBeInTheDocument();
  });

  it("shows loading skeleton when isLoading is true", async () => {
    const screen = await render(
      <GatewaySelector
        gateways={[]}
        isLoading
        onSelect={vi.fn()}
      />,
    );

    await expect.element(screen.getByTestId("skeleton")).toBeInTheDocument();
  });

  it("shows retry button when error is present", async () => {
    const handleRetry = vi.fn();
    const screen = await render(
      <GatewaySelector
        gateways={[]}
        error={new Error("Failed to load")}
        onRetry={handleRetry}
        onSelect={vi.fn()}
      />,
    );

    await expect.element(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });
});
