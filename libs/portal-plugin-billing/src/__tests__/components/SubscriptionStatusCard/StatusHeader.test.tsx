/// <reference types="vitest/browser" />
import { describe, it, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { StatusHeader } from "@/ui/components/SubscriptionStatusCard/StatusHeader";

vi.mock("@/ui/components/SubscriptionStatusCard/GatewayBadge", () => ({
  GatewayBadge: ({ gatewayType, managementMode }: any) => (
    <span data-testid="gateway-badge">{gatewayType}-{managementMode}</span>
  ),
}));

describe("StatusHeader", () => {
  it("renders subscription title", async () => {
    render(<StatusHeader gatewayType="stripe" />);
    await expect.element(page.getByText("Subscription")).toBeVisible();
  });

  it("renders gateway badge", async () => {
    render(<StatusHeader gatewayType="stripe" managementMode="portal" />);
    await expect.element(page.getByTestId("gateway-badge")).toBeVisible();
    await expect.element(page.getByText("stripe-portal")).toBeVisible();
  });

  it("renders loading indicator when loading", async () => {
    render(<StatusHeader isLoading={true} />);
    // When loading, the component renders a skeleton instead of badge
    // Verify badge is NOT shown when loading
    await expect.element(page.getByTestId("gateway-badge")).not.toBeInTheDocument();
  });

  it("renders gateway badge when not loading", async () => {
    render(<StatusHeader gatewayType="stripe" managementMode="portal" isLoading={false} />);
    await expect.element(page.getByTestId("gateway-badge")).toBeVisible();
  });
});
