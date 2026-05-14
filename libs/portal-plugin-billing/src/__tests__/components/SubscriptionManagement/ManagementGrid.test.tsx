/// <reference types="vitest/browser" />
import { describe, it, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { ManagementGrid } from "@/ui/components/SubscriptionManagement/ManagementGrid";
import type { ManagementActionResult } from "@/hooks/useManagementAction";
import type { ManagementOperation } from "@/types/subscription";

const mockExecute = vi.fn().mockResolvedValue(undefined);
const mockOnChangePlan = vi.fn();
const mockGetOperationState = () => ({ isLoading: false, result: null, error: null });

vi.mock("@/ui/components/SubscriptionManagement/OperationCard", () => ({
  OperationCard: ({ operation }: any) => <div data-testid={`operation-${operation}`}>{operation}</div>,
}));

vi.mock("@/ui/components/SubscriptionManagement/CustomerPortalCard", () => ({
  CustomerPortalCard: () => <div data-testid="customer-portal-card">Customer Portal</div>,
}));

vi.mock("@/ui/components/SubscriptionManagement/ChangePlanCard", () => ({
  ChangePlanCard: () => <div data-testid="change-plan-card">Change Plan Card</div>,
}));

vi.mock("@/ui/components/dialogs/UrlActionDialog", () => ({
  UrlActionDialog: () => <div data-testid="url-action-dialog">URL Dialog</div>,
}));

describe("ManagementGrid", () => {
  const defaultProps = {
    operations: [] as string[],
    hasCustomerPortal: false,
    canChangePlan: false,
    onExecute: mockExecute,
    getOperationState: mockGetOperationState,
    onChangePlan: mockOnChangePlan,
  };

  it("renders operations in the grid", async () => {
    render(
      <ManagementGrid
        {...defaultProps}
        operations={["cancel", "pause"]}
      />
    );
    await expect.element(page.getByTestId("operation-cancel")).toBeVisible();
    await expect.element(page.getByTestId("operation-pause")).toBeVisible();
  });

  it("renders customer portal card when hasCustomerPortal is true", async () => {
    render(
      <ManagementGrid
        {...defaultProps}
        hasCustomerPortal={true}
      />
    );
    await expect.element(page.getByTestId("customer-portal-card")).toBeVisible();
  });

  it("does not render customer portal card when hasCustomerPortal is false", async () => {
    render(
      <ManagementGrid
        {...defaultProps}
        hasCustomerPortal={false}
      />
    );
    await expect.element(page.getByTestId("customer-portal-card")).not.toBeInTheDocument();
  });

  it("renders change plan card when canChangePlan is true", async () => {
    render(
      <ManagementGrid
        {...defaultProps}
        canChangePlan={true}
      />
    );
    await expect.element(page.getByTestId("change-plan-card")).toBeVisible();
  });

  it("does not render change plan card when canChangePlan is false", async () => {
    render(
      <ManagementGrid
        {...defaultProps}
        canChangePlan={false}
      />
    );
    await expect.element(page.getByTestId("change-plan-card")).not.toBeInTheDocument();
  });

  it("renders all components when all conditions are true", async () => {
    render(
      <ManagementGrid
        {...defaultProps}
        operations={["cancel", "resume"]}
        hasCustomerPortal={true}
        canChangePlan={true}
      />
    );
    await expect.element(page.getByTestId("operation-cancel")).toBeVisible();
    await expect.element(page.getByTestId("operation-resume")).toBeVisible();
    await expect.element(page.getByTestId("customer-portal-card")).toBeVisible();
    await expect.element(page.getByTestId("change-plan-card")).toBeVisible();
  });
});
