/// <reference types="vitest/browser" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { CancelAbortButton } from "@/ui/components/CancelAbortButton";

const { mockMutateAsync } = vi.hoisted(() => ({
  mockMutateAsync: vi.fn(),
}));

vi.mock("@refinedev/core", () => ({
  useCustomMutation: () => ({
    mutateAsync: mockMutateAsync,
    isLoading: false,
    error: null,
  }),
}));

vi.mock("@lumeweb/portal-framework-auth", () => ({
  DATA_PROVIDER_NAME: "dashboard",
}));

vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
  Button: ({ children, disabled, onClick, ...props }: any) => (
    <button disabled={disabled} onClick={onClick} {...props}>{children}</button>
  ),
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

describe("CancelAbortButton", () => {
  beforeEach(() => {
    mockMutateAsync.mockReset();
  });

  it("renders abort button when will_cancel_at is set", async () => {
    render(<CancelAbortButton willCancelAt="2025-12-31T00:00:00Z" />);
    await expect.element(page.getByText("Abort Cancellation")).toBeVisible();
  });

  it("is hidden when will_cancel_at is not set", async () => {
    render(<CancelAbortButton />);
    await expect.element(page.getByText("Abort Cancellation")).not.toBeInTheDocument();
  });

  it("is hidden when will_cancel_at is undefined", async () => {
    render(<CancelAbortButton willCancelAt={undefined} />);
    await expect.element(page.getByText("Abort Cancellation")).not.toBeInTheDocument();
  });

  it("shows confirm dialog when abort button is clicked", async () => {
    render(<CancelAbortButton willCancelAt="2025-12-31T00:00:00Z" />);

    // Confirm not shown yet
    await expect.element(page.getByRole("alertdialog")).not.toBeInTheDocument();

    await page.getByText("Abort Cancellation").click();

    // Confirm dialog appears
    await expect.element(page.getByRole("alertdialog")).toBeVisible();
    await expect.element(page.getByText("Abort Cancellation?")).toBeVisible();
  });

  it("calls cancel/abort endpoint when confirm is clicked", async () => {
    mockMutateAsync.mockResolvedValueOnce({ data: {} });
    render(<CancelAbortButton willCancelAt="2025-12-31T00:00:00Z" />);

    await page.getByText("Abort Cancellation").click();
    await page.getByRole("button", { name: "Yes, Keep Active" }).click();

    expect(mockMutateAsync).toHaveBeenCalledWith({
      url: "/account/billing/cancel/abort",
      method: "post",
      values: {},
      dataProviderName: "dashboard",
    });
  });

  it("does not call abort endpoint when confirm is dismissed", async () => {
    render(<CancelAbortButton willCancelAt="2025-12-31T00:00:00Z" />);

    await page.getByText("Abort Cancellation").click();
    await page.getByRole("button", { name: "Leave Cancelled" }).click();

    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it("calls onAborted callback after confirmed abort", async () => {
    mockMutateAsync.mockResolvedValueOnce({ data: {} });
    const onAborted = vi.fn();
    render(<CancelAbortButton willCancelAt="2025-12-31T00:00:00Z" onAborted={onAborted} />);

    await page.getByText("Abort Cancellation").click();
    await page.getByRole("button", { name: "Yes, Keep Active" }).click();

    expect(onAborted).toHaveBeenCalledTimes(1);
  });

  it("does not call onAborted when abort fails", async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error("Network error"));
    const onAborted = vi.fn();
    render(<CancelAbortButton willCancelAt="2025-12-31T00:00:00Z" onAborted={onAborted} />);

    await page.getByText("Abort Cancellation").click();
    await page.getByRole("button", { name: "Yes, Keep Active" }).click();

    expect(onAborted).not.toHaveBeenCalled();
  });

  it("shows error on failure", async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error("Network error"));
    render(<CancelAbortButton willCancelAt="2025-12-31T00:00:00Z" />);

    await page.getByText("Abort Cancellation").click();
    await page.getByRole("button", { name: "Yes, Keep Active" }).click();

    await expect.element(page.getByText(/network error/i)).toBeVisible();
  });

  it("disappears after successful confirmed abort", async () => {
    mockMutateAsync.mockResolvedValueOnce({ data: {} });
    render(<CancelAbortButton willCancelAt="2025-12-31T00:00:00Z" />);

    await page.getByText("Abort Cancellation").click();
    await page.getByRole("button", { name: "Yes, Keep Active" }).click();

    await expect.element(page.getByText("Abort Cancellation")).not.toBeInTheDocument();
  });
});
