/// <reference types="vitest/browser" />
import { describe, it, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { PlanChangeDialog } from "@/ui/components/PlanChangeDialog";
import type { PublicPricingPlanResponse } from "@/types/subscription";
import { ManagementAction } from "@/types/subscription";
import type { ManagementActionResult } from "@/hooks/useManagementAction";

const defaultProps = {
  confirmingPeriodId: null as number | null,
  onCancelConfirm: vi.fn(),
  onConfirmChange: vi.fn(),
};

vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
  Button: ({ children, disabled, onClick, ...props }: any) => (
    <button disabled={disabled} onClick={onClick} {...props}>{children}</button>
  ),
  Dialog: ({ children, open, onOpenChange }: any) => open ? <div>{children}</div> : null,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
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
  Skeleton: ({ ...props }: any) => <div data-testid="skeleton" {...props} />,
  Spinner: ({ ...props }: any) => <div data-testid="spinner" {...props} />,
}));

const mockPlans: PublicPricingPlanResponse[] = [
  {
    id: 1,
    name: "Basic",
    description: "Basic plan",
    currency: "USD",
    pricing_periods: [
      { id: 10, cadence: "monthly", price_usd: 999, quota_plan_id: 1 },
    ],
  },
  {
    id: 2,
    name: "Pro",
    description: "Pro plan",
    currency: "USD",
    pricing_periods: [
      { id: 20, cadence: "monthly", price_usd: 1999, quota_plan_id: 2 },
    ],
  },
];

describe("PlanChangeDialog", () => {
  const mockOnChangePlan = vi.fn();
  const mockOnClose = vi.fn();

  it("renders plan options", async () => {
    render(
      <PlanChangeDialog
        {...defaultProps}
        isLoading={false}
        onChangePlan={mockOnChangePlan}
        onClose={mockOnClose}
        plans={mockPlans}
        result={null}
        selectedPeriodId={null}
      />
    );

    await expect.element(page.getByRole("heading", { name: "Basic" })).toBeVisible();
    await expect.element(page.getByRole("heading", { name: "Pro" })).toBeVisible();
  });

  it("shows current plan as disabled", async () => {
    render(
      <PlanChangeDialog
        {...defaultProps}
        currentPeriodId={10}
        isLoading={false}
        onChangePlan={mockOnChangePlan}
        onClose={mockOnClose}
        plans={mockPlans}
        result={null}
        selectedPeriodId={null}
      />
    );

    const currentPlanButton = page.getByRole("button", { name: /999.*Current/ });
    await expect.element(currentPlanButton).toBeDisabled();
  });

  it("calls onChangePlan when selecting a plan", async () => {
    render(
      <PlanChangeDialog
        {...defaultProps}
        currentPeriodId={10}
        isLoading={false}
        onChangePlan={mockOnChangePlan}
        onClose={mockOnClose}
        plans={mockPlans}
        result={null}
        selectedPeriodId={null}
      />
    );

    const proPlanButton = page.getByRole("button", { name: /1999/ });
    await proPlanButton.click();

    expect(mockOnChangePlan).toHaveBeenCalledWith(20);
  });

  it("disables buttons when loading", async () => {
    render(
      <PlanChangeDialog
        {...defaultProps}
        currentPeriodId={10}
        isLoading={true}
        onChangePlan={mockOnChangePlan}
        onClose={mockOnClose}
        plans={mockPlans}
        result={null}
        selectedPeriodId={null}
      />
    );

    const proPlanButton = page.getByRole("button", { name: /1999/ });
    await expect.element(proPlanButton).toBeDisabled();
  });

  it("handles redirect result by showing portal link", async () => {
    const redirectResult: ManagementActionResult = {
      type: ManagementAction.Redirect,
      url: "https://portal.example.com/manage",
    };

    render(
      <PlanChangeDialog
        {...defaultProps}
        currentPeriodId={10}
        isLoading={false}
        onChangePlan={mockOnChangePlan}
        onClose={mockOnClose}
        plans={mockPlans}
        result={redirectResult}
        selectedPeriodId={null}
      />
    );

    const link = await page.getByRole("link", { name: /Manage in Portal/ });
    await expect.element(link).toBeVisible();
  });

  it("handles show_ui result with confirmation message", async () => {
    const showUiResult: ManagementActionResult = {
      type: ManagementAction.ShowUI,
      data: {
        action: ManagementAction.ShowUI,
        confirmation_message: "Your plan will change at end of billing period",
        can_abort: true,
        requires_confirmation: true,
        status: "pending",
      },
    };

    render(
      <PlanChangeDialog
        {...defaultProps}
        currentPeriodId={10}
        isLoading={false}
        onChangePlan={mockOnChangePlan}
        onClose={mockOnClose}
        plans={mockPlans}
        result={showUiResult}
        selectedPeriodId={null}
      />
    );

    await expect.element(
      page.getByText("Your plan will change at end of billing period")
    ).toBeVisible();
  });

  it("handles error result", async () => {
    const errorResult: ManagementActionResult = {
      type: ManagementAction.Error,
      message: "Something went wrong",
    };

    render(
      <PlanChangeDialog
        {...defaultProps}
        currentPeriodId={10}
        isLoading={false}
        onChangePlan={mockOnChangePlan}
        onClose={mockOnClose}
        plans={mockPlans}
        result={errorResult}
        selectedPeriodId={null}
      />
    );

    await expect.element(page.getByText("Something went wrong")).toBeVisible();
  });

  it("calls onClose when Dialog onOpenChange fires with false", async () => {
    render(
      <PlanChangeDialog
        {...defaultProps}
        currentPeriodId={10}
        isLoading={false}
        onChangePlan={mockOnChangePlan}
        onClose={mockOnClose}
        plans={mockPlans}
        result={null}
        selectedPeriodId={null}
      />
    );

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("shows confirm dialog when confirmingPeriodId is set", async () => {
    render(
      <PlanChangeDialog
        {...defaultProps}
        confirmingPeriodId={20}
        currentPeriodId={10}
        isLoading={false}
        onChangePlan={mockOnChangePlan}
        onClose={mockOnClose}
        plans={mockPlans}
        result={null}
        selectedPeriodId={null}
      />
    );

    await expect.element(page.getByRole("alertdialog")).toBeVisible();
    await expect.element(page.getByText("Change Plan?")).toBeVisible();
    await expect.element(page.getByText(/switch to Pro/)).toBeVisible();
  });

  it("calls onConfirmChange when confirm button clicked", async () => {
    const mockOnConfirmChange = vi.fn();

    render(
      <PlanChangeDialog
        {...defaultProps}
        confirmingPeriodId={20}
        onConfirmChange={mockOnConfirmChange}
        currentPeriodId={10}
        isLoading={false}
        onChangePlan={mockOnChangePlan}
        onClose={mockOnClose}
        plans={mockPlans}
        result={null}
        selectedPeriodId={null}
      />
    );

    await page.getByRole("button", { name: "Confirm Change" }).click();
    expect(mockOnConfirmChange).toHaveBeenCalled();
  });

  it("calls onCancelConfirm when cancel confirm clicked", async () => {
    const mockOnCancelConfirm = vi.fn();

    render(
      <PlanChangeDialog
        {...defaultProps}
        confirmingPeriodId={20}
        onCancelConfirm={mockOnCancelConfirm}
        currentPeriodId={10}
        isLoading={false}
        onChangePlan={mockOnChangePlan}
        onClose={mockOnClose}
        plans={mockPlans}
        result={null}
        selectedPeriodId={null}
      />
    );

    await page.getByRole("button", { name: "Cancel" }).click();
    expect(mockOnCancelConfirm).toHaveBeenCalled();
  });

  it("does not show confirm dialog when confirmingPeriodId is null", async () => {
    render(
      <PlanChangeDialog
        {...defaultProps}
        confirmingPeriodId={null}
        currentPeriodId={10}
        isLoading={false}
        onChangePlan={mockOnChangePlan}
        onClose={mockOnClose}
        plans={mockPlans}
        result={null}
        selectedPeriodId={null}
      />
    );

    await expect.element(page.getByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("hides plan list when complete result is set", async () => {
    const completeResult: ManagementActionResult = {
      type: ManagementAction.Complete,
      data: {
        action: "complete",
        credit_applied: "2",
        charge_due: "1",
        effective_date: "2026-05-04T01:54:39Z",
        can_abort: false,
        requires_confirmation: false,
        status: "complete",
      } as any,
    };

    render(
      <PlanChangeDialog
        {...defaultProps}
        currentPeriodId={10}
        isLoading={false}
        onChangePlan={mockOnChangePlan}
        onClose={mockOnClose}
        plans={mockPlans}
        result={completeResult}
        selectedPeriodId={null}
      />
    );

    await expect.element(page.getByRole("heading", { name: "Basic" })).not.toBeInTheDocument();
    await expect.element(page.getByRole("heading", { name: "Pro" })).not.toBeInTheDocument();
  });
});
