/// <reference types="vitest/browser" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { SubscriptionManagement } from "@/ui/components/SubscriptionManagement";
import type { ManagementActionResult } from "@/hooks/useManagementAction";
import { ManagementAction } from "@/types/subscription";

const mockExecute = vi.fn().mockResolvedValue({ type: ManagementAction.Complete, data: {} });
const mockSilentRefetch = vi.fn();

vi.mock("@/hooks/useManagementCapabilities", () => ({
  useManagementCapabilities: vi.fn(() => ({
    data: { management_mode: "portal" },
    isLoading: false,
    operations: {
      cancel: true,
      pause: true,
      customer_portal: true,
    },
    canCancel: true,
    canPause: true,
    canChangePlan: true,
  })),
}));

vi.mock("@/hooks/useManagementAction", () => ({
  useManagementAction: vi.fn(() => ({
    execute: mockExecute,
    isLoading: false,
    getOperationState: () => ({ isLoading: false, error: null }),
  })),
}));

vi.mock("@/ui/context/BillingContext", () => ({
  useBillingContext: vi.fn(() => ({
    subscription: { data: null, silentRefetch: mockSilentRefetch },
  })),
}));

vi.mock("@/ui/components/PlanChangeDialogContainer", () => ({
  PlanChangeDialogContainer: ({ onClose }: any) => <div data-testid="plan-change-dialog">Plan Change Dialog</div>,
}));

vi.mock("@/ui/components/SubscriptionManagement/LoadingState", () => ({
  LoadingState: () => <div data-testid="loading-state">Loading</div>,
}));

vi.mock("@/ui/components/SubscriptionManagement/ManagementGrid", () => ({
  ManagementGrid: ({ operations, hasCustomerPortal, canChangePlan, onExecute }: any) => (
    <div data-testid="management-grid">
      <span data-testid="ops-count">{operations.length}</span>
      <span data-testid="has-portal">{String(hasCustomerPortal)}</span>
      <span data-testid="can-change">{String(canChangePlan)}</span>
      <button data-testid="cancel-btn" onClick={() => onExecute("cancel")}>Cancel</button>
    </div>
  ),
}));

vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
  AlertDialog: ({ children, open }: any) => open ? <div role="alertdialog">{children}</div> : null,
  AlertDialogContent: ({ children }: any) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: any) => <h3>{children}</h3>,
  AlertDialogDescription: ({ children }: any) => <p>{children}</p>,
  AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
  AlertDialogAction: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
  AlertDialogCancel: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}));

describe("SubscriptionManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state when loading", async () => {
    const { useManagementCapabilities } = await import("@/hooks/useManagementCapabilities");
    (useManagementCapabilities as any).mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(<SubscriptionManagement />);
    await expect.element(page.getByTestId("loading-state")).toBeVisible();
  });

  it("renders nothing when no capabilities", async () => {
    const { useManagementCapabilities } = await import("@/hooks/useManagementCapabilities");
    (useManagementCapabilities as any).mockReturnValue({
      data: null,
      isLoading: false,
    });

    render(<SubscriptionManagement />);
    await expect.element(page.getByText("Subscription Management")).not.toBeInTheDocument();
  });

  it("renders management grid with title", async () => {
    const { useManagementCapabilities } = await import("@/hooks/useManagementCapabilities");
    (useManagementCapabilities as any).mockReturnValue({
      data: { management_mode: "portal" },
      isLoading: false,
      operations: {
        cancel: true,
        pause: true,
        customer_portal: true,
      },
      canChangePlan: true,
    });

    render(<SubscriptionManagement />);
    await expect.element(page.getByText("Subscription Management")).toBeVisible();
    await expect.element(page.getByTestId("management-grid")).toBeVisible();
  });

  it("passes correct props to ManagementGrid", async () => {
    const { useManagementCapabilities } = await import("@/hooks/useManagementCapabilities");
    (useManagementCapabilities as any).mockReturnValue({
      data: { management_mode: "portal" },
      isLoading: false,
      operations: {
        cancel: true,
        pause: true,
        change_plan: true,
        customer_portal: true,
      },
      canChangePlan: true,
    });

    render(<SubscriptionManagement />);

    await expect.element(page.getByTestId("ops-count")).toHaveTextContent("2");
    await expect.element(page.getByTestId("has-portal")).toHaveTextContent("true");
    await expect.element(page.getByTestId("can-change")).toHaveTextContent("true");
  });

  it("filters change_plan and customer_portal from operations", async () => {
    const { useManagementCapabilities } = await import("@/hooks/useManagementCapabilities");
    (useManagementCapabilities as any).mockReturnValue({
      data: { management_mode: "portal" },
      isLoading: false,
      operations: {
        cancel: true,
        pause: true,
        resume: false,
        change_plan: true,
        customer_portal: true,
      },
      canChangePlan: false,
    });

    render(<SubscriptionManagement />);
    await expect.element(page.getByTestId("ops-count")).toHaveTextContent("2");
    await expect.element(page.getByTestId("has-portal")).toHaveTextContent("true");
    await expect.element(page.getByTestId("can-change")).toHaveTextContent("false");
  });

  it("hides cancel operation when cancellation is already scheduled", async () => {
    const { useManagementCapabilities } = await import("@/hooks/useManagementCapabilities");
    (useManagementCapabilities as any).mockReturnValue({
      data: { management_mode: "api" },
      isLoading: false,
      operations: {
        cancel: true,
        pause: true,
      },
      canChangePlan: false,
    });

    const { useBillingContext } = await import("@/ui/context/BillingContext");
    (useBillingContext as any).mockReturnValue({
      subscription: {
        data: { will_cancel_at: "2026-06-03T22:46:31Z", is_subscribed: true },
        isReady: true,
        isBusy: false,
        hasError: false,
        error: null,
        refetch: vi.fn(),
        silentRefetch: vi.fn(),
      },
    });

    render(<SubscriptionManagement />);
    await expect.element(page.getByTestId("ops-count")).toHaveTextContent("1");
  });

  it("shows cancel operation when no cancellation is scheduled", async () => {
    const { useManagementCapabilities } = await import("@/hooks/useManagementCapabilities");
    (useManagementCapabilities as any).mockReturnValue({
      data: { management_mode: "api" },
      isLoading: false,
      operations: {
        cancel: true,
        pause: true,
      },
      canChangePlan: false,
    });

    const { useBillingContext } = await import("@/ui/context/BillingContext");
    (useBillingContext as any).mockReturnValue({
      subscription: {
        data: { is_subscribed: true },
        isReady: true,
        isBusy: false,
        hasError: false,
        error: null,
        refetch: vi.fn(),
        silentRefetch: vi.fn(),
      },
    });

    render(<SubscriptionManagement />);
    await expect.element(page.getByTestId("ops-count")).toHaveTextContent("2");
  });

  describe("cancel confirmation", () => {
    it("shows confirm dialog when cancel is triggered", async () => {
      const { useManagementCapabilities } = await import("@/hooks/useManagementCapabilities");
      (useManagementCapabilities as any).mockReturnValue({
        data: { management_mode: "api" },
        isLoading: false,
        operations: { cancel: true, pause: true },
        canChangePlan: false,
      });

      const { useBillingContext } = await import("@/ui/context/BillingContext");
      (useBillingContext as any).mockReturnValue({
        subscription: { data: { is_subscribed: true }, silentRefetch: mockSilentRefetch },
      });

      render(<SubscriptionManagement />);

      // Cancel not yet triggered
      await expect.element(page.getByRole("alertdialog")).not.toBeInTheDocument();

      // Click cancel in grid
      await page.getByTestId("cancel-btn").click();

      // Confirm dialog should appear
      await expect.element(page.getByRole("alertdialog")).toBeVisible();
      await expect.element(page.getByText("Cancel Subscription?")).toBeVisible();
    });

    it("calls execute when confirm is clicked", async () => {
      const { useManagementCapabilities } = await import("@/hooks/useManagementCapabilities");
      (useManagementCapabilities as any).mockReturnValue({
        data: { management_mode: "api" },
        isLoading: false,
        operations: { cancel: true, pause: true },
        canChangePlan: false,
      });

      const { useBillingContext } = await import("@/ui/context/BillingContext");
      (useBillingContext as any).mockReturnValue({
        subscription: { data: { is_subscribed: true }, silentRefetch: mockSilentRefetch },
      });

      render(<SubscriptionManagement />);

      // Trigger cancel and confirm
      await page.getByTestId("cancel-btn").click();
      await page.getByRole("button", { name: "Yes, Cancel" }).click();

      expect(mockExecute).toHaveBeenCalledWith("cancel");
    });

    it("does not call execute when confirm is dismissed", async () => {
      const { useManagementCapabilities } = await import("@/hooks/useManagementCapabilities");
      (useManagementCapabilities as any).mockReturnValue({
        data: { management_mode: "api" },
        isLoading: false,
        operations: { cancel: true, pause: true },
        canChangePlan: false,
      });

      const { useBillingContext } = await import("@/ui/context/BillingContext");
      (useBillingContext as any).mockReturnValue({
        subscription: { data: { is_subscribed: true }, silentRefetch: mockSilentRefetch },
      });

      render(<SubscriptionManagement />);

      // Trigger cancel but dismiss
      await page.getByTestId("cancel-btn").click();
      await page.getByRole("button", { name: "Keep Subscription" }).click();

      expect(mockExecute).not.toHaveBeenCalled();
    });
  });
});
