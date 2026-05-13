/// <reference types="vitest/browser" />
import { describe, it, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { userEvent } from "vitest/browser";
import { CustomerPortalCard } from "@/ui/components/SubscriptionManagement/CustomerPortalCard";

const mockOnOpenDialog = vi.fn();

vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  Button: ({ children, disabled, onClick, ...props }: any) => (
    <button disabled={disabled} onClick={onClick} {...props}>{children}</button>
  ),
}));

describe("CustomerPortalCard", () => {
  const defaultProps = {
    onOpenDialog: mockOnOpenDialog,
    getOperationState: () => ({ isLoading: false, result: null, error: null }),
  };

  it("renders portal card title", async () => {
    render(<CustomerPortalCard {...defaultProps} />);
    await expect.element(page.getByText("Manage Subscription")).toBeVisible();
  });

  it("renders portal description", async () => {
    render(<CustomerPortalCard {...defaultProps} />);
    await expect.element(page.getByText(/View invoices, update payment methods/)).toBeVisible();
  });

  it("renders open portal button when not loading", async () => {
    render(<CustomerPortalCard {...defaultProps} />);
    await expect.element(page.getByText("Open Portal")).toBeVisible();
  });

  it("shows loading text when loading", async () => {
    render(
      <CustomerPortalCard
        {...defaultProps}
        getOperationState={() => ({ isLoading: true, result: null, error: null })}
      />
    );
    await expect.element(page.getByText("Loading...")).toBeVisible();
  });

  it("calls onOpenDialog when button clicked", async () => {
    render(<CustomerPortalCard {...defaultProps} />);
    const button = page.getByText("Open Portal");
    await userEvent.click(button);

    expect(mockOnOpenDialog).toHaveBeenCalled();
  });

  it("disables button when loading", async () => {
    render(
      <CustomerPortalCard
        {...defaultProps}
        getOperationState={() => ({ isLoading: true, result: null, error: null })}
      />
    );
    const button = page.getByRole("button", { name: /Loading/ });
    await expect.element(button).toBeDisabled();
  });
});
