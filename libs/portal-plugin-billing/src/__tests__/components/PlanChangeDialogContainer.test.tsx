/// <reference types="vitest/browser" />
import { render } from "vitest-browser-react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { PlanChangeDialogContainer } from "@/ui/components/PlanChangeDialogContainer";
import { ManagementAction } from "@/types/subscription";

// Mock hooks
const mockStartPlanChangeCheckout = vi.fn();
const mockExecute = vi.fn();
const mockSilentRefetch = vi.fn();

vi.mock("@/ui/context/BillingContext", () => ({
  useBillingContext: () => ({
    plans: {
      all: [
        {
          id: 1,
          name: "Basic",
          description: "Basic plan",
          pricing_periods: [{ id: 100, cadence: "monthly", price_usd: 5.0 }],
        },
        {
          id: 2,
          name: "Pro",
          description: "Pro plan",
          pricing_periods: [{ id: 201, cadence: "monthly", price_usd: 10.0 }],
        },
      ],
    },
    subscription: {
      data: { is_subscribed: true, pricing_plan_period_id: 100, gateway_type: "stripe" },
      silentRefetch: mockSilentRefetch,
    },
    startPlanChangeCheckout: mockStartPlanChangeCheckout,
  }),
}));

vi.mock("@/hooks/useManagementAction", () => ({
  useManagementAction: () => ({
    execute: mockExecute,
    isLoading: false,
    error: null,
    getOperationState: () => ({ isLoading: false, error: null }),
  }),
}));

vi.mock("@/hooks/useManagementCapabilities", () => ({
  useManagementCapabilities: () => ({
    data: { management_mode: "api" },
  }),
}));

vi.mock("@/hooks/useGateways", () => ({
  useGateways: () => ({
    data: { data: [{ id: "stripe", name: "Stripe", abilities: [], description: "", is_active: true }] },
    gateways: [{ id: "stripe", name: "Stripe", abilities: [], description: "", is_active: true }],
    activeGateways: [{ id: "stripe", name: "Stripe", abilities: [], description: "", is_active: true }],
  }),
}));

// Mock UI components
vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
  Dialog: ({ children, open }: { children: React.ReactNode; open?: boolean }) =>
    open ? <div role="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <header>{children}</header>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  AlertDialog: ({ children, open }: { children: React.ReactNode; open?: boolean }) =>
    open ? <div role="alertdialog">{children}</div> : null,
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogAction: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
  AlertDialogCancel: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
  cn: (...args: (string | undefined)[]) => args.filter(Boolean).join(" "),
  lazyIcon: (name: string) => () => <span data-testid={name.charAt(0).toLowerCase() + name.slice(1).replace(/([A-Z])/g, (c: string) => "-" + c.toLowerCase())} />,
}));

// Mock child components
vi.mock("@/ui/components/PlanChange/PlanList", () => ({
  PlanList: ({ currentPeriodId, onSelectPeriod, plans }: any) => (
    <div>
      {plans.flatMap((plan: any) =>
        plan.pricing_periods
          ?.filter((p: any) => p.id !== currentPeriodId)
          .map((p: any) => (
            <button key={p.id} onClick={() => onSelectPeriod(p.id)}>
              Select {plan.name}
            </button>
          )),
      )}
    </div>
  ),
}));

vi.mock("@/ui/components/PlanChange/CheckoutRequiredView", () => ({
  CheckoutRequiredView: ({ onContinueToCheckout }: { onContinueToCheckout: () => void }) => (
    <div>
      <p>Checkout Required</p>
      <button onClick={onContinueToCheckout}>Continue to Checkout</button>
    </div>
  ),
}));

vi.mock("@/ui/components/PlanChange/PortalView", () => ({
  PortalView: ({ loading, url }: { loading: boolean; url: string }) => (
    <div data-testid="portal-view">
      {loading ? <span>Loading portal...</span> : <span>Portal: {url}</span>}
    </div>
  ),
}));

vi.mock("@/ui/components/PlanChange/ShowUIView", () => ({
  ShowUIView: ({ canAbort, confirmationMessage }: any) => (
    <div data-testid="show-ui-view">
      {confirmationMessage && <p>{confirmationMessage}</p>}
      {canAbort && <button>Abort</button>}
    </div>
  ),
}));

describe("PlanChangeDialogContainer", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders dialog with plan list", async () => {
    const screen = await render(<PlanChangeDialogContainer onClose={mockOnClose} />);

    await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
    await expect.element(screen.getByText("Select Pro")).toBeInTheDocument();
  });

  it("shows confirm dialog when a plan is selected", async () => {
    const screen = await render(<PlanChangeDialogContainer onClose={mockOnClose} />);

    await screen.getByText("Select Pro").click();

    await expect.element(screen.getByRole("alertdialog")).toBeInTheDocument();
    await expect.element(screen.getByText("Change Plan?")).toBeInTheDocument();
  });

  it("calls execute only after confirm is clicked", async () => {
    mockExecute.mockResolvedValue({
      type: ManagementAction.CheckoutRequired,
      data: {
        checkout_link: "session_123",
        fragments: [],
      },
    });

    const screen = await render(<PlanChangeDialogContainer onClose={mockOnClose} />);

    // Select plan — should NOT execute yet
    await screen.getByText("Select Pro").click();
    expect(mockExecute).not.toHaveBeenCalled();

    // Confirm — should now execute
    await screen.getByRole("button", { name: "Confirm Change" }).click();

    await vi.waitFor(() => {
      expect(mockExecute).toHaveBeenCalledWith("change_plan", { period_id: 201 });
    });
  });

  it("does not call execute when confirm is cancelled", async () => {
    const screen = await render(<PlanChangeDialogContainer onClose={mockOnClose} />);

    await screen.getByText("Select Pro").click();

    // Cancel the confirm
    await screen.getByRole("button", { name: "Cancel" }).click();

    expect(mockExecute).not.toHaveBeenCalled();
  });

  it("auto-closes dialog and refetches subscription on complete result", async () => {
    mockExecute.mockResolvedValue({
      type: ManagementAction.Complete,
      data: {
        action: "complete",
        credit_applied: "2",
        charge_due: "1",
        effective_date: "2026-05-04T01:54:39Z",
      },
    });

    const screen = await render(<PlanChangeDialogContainer onClose={mockOnClose} />);

    await screen.getByText("Select Pro").click();
    await screen.getByRole("button", { name: "Confirm Change" }).click();

    await vi.waitFor(() => {
      expect(mockExecute).toHaveBeenCalledWith("change_plan", { period_id: 201 });
    });

    await vi.waitFor(() => {
      expect(mockSilentRefetch).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("handles checkout required result after confirm", async () => {
    mockExecute.mockResolvedValue({
      type: ManagementAction.CheckoutRequired,
      data: {
        checkout_link: "session_123",
        fragments: [],
      },
    });

    const screen = await render(<PlanChangeDialogContainer onClose={mockOnClose} />);

    await screen.getByText("Select Pro").click();
    await screen.getByRole("button", { name: "Confirm Change" }).click();

    await vi.waitFor(() => {
      expect(mockExecute).toHaveBeenCalledWith("change_plan", { period_id: 201 });
    });
  });

  it("calls onClose and startPlanChangeCheckout when continue to checkout is clicked", async () => {
    mockExecute.mockResolvedValue({
      type: ManagementAction.CheckoutRequired,
      data: {
        checkout_link: "session_123",
        fragments: [{ type: "html", content: "<form>card</form>" }],
      },
    });

    const screen = await render(<PlanChangeDialogContainer onClose={mockOnClose} />);

    await screen.getByText("Select Pro").click();
    await screen.getByRole("button", { name: "Confirm Change" }).click();

    // Wait for checkout required view to render
    await vi.waitFor(() => {
      expect(screen.getByText("Continue to Checkout")).toBeInTheDocument();
    });

    await screen.getByText("Continue to Checkout").click();

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockStartPlanChangeCheckout).toHaveBeenCalledTimes(1);
    expect(mockStartPlanChangeCheckout).toHaveBeenCalledWith({
      fragments: [{ type: "html", content: "<form>card</form>" }],
      sessionId: "session_123",
      gateway: { id: "stripe", name: "Stripe", abilities: [], description: "", is_active: true },
    });
  });

  it("handles external redirect after confirm", async () => {
    const windowOpen = vi.spyOn(window, "open").mockReturnValue(null);
    mockExecute.mockResolvedValue({
      type: "redirect",
      url: "https://portal.example.com",
    });

    const screen = await render(<PlanChangeDialogContainer onClose={mockOnClose} />);

    await screen.getByText("Select Pro").click();
    await screen.getByRole("button", { name: "Confirm Change" }).click();

    await vi.waitFor(() => {
      expect(windowOpen).toHaveBeenCalledWith("https://portal.example.com", "_blank");
    });

    windowOpen.mockRestore();
  });
});
