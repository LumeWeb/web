/// <reference types="vitest/browser" />
import { render } from "vitest-browser-react";
import { describe, expect, it, vi } from "vitest";

import { UrlActionDialog } from "@/ui/components/dialogs/UrlActionDialog";

vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  Button: ({ children, onClick, variant }: { children: React.ReactNode; onClick?: () => void; variant?: string }) => (
    <button data-variant={variant} onClick={onClick}>{children}</button>
  ),
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) => (
    open ? <div role="dialog">{children}</div> : null
  ),
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <footer>{children}</footer>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <header>{children}</header>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

describe("UrlActionDialog", () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    title: "External Action",
    description: "You will be redirected to complete this action.",
    url: "https://external.example.com/action",
  };

  it("renders dialog with title and description", async () => {
    const screen = await render(<UrlActionDialog {...defaultProps} />);

    await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
    await expect.element(screen.getByText("External Action")).toBeInTheDocument();
    await expect.element(screen.getByText("You will be redirected to complete this action.")).toBeInTheDocument();
  });

  it("opens url in new window when continue is clicked", async () => {
    const windowOpen = vi.spyOn(window, "open").mockReturnValue(null);
    const screen = await render(<UrlActionDialog {...defaultProps} />);

    await screen.getByRole("button", { name: /continue/i }).click();

    expect(windowOpen).toHaveBeenCalledWith(
      "https://external.example.com/action",
      "_blank",
      "noopener,noreferrer",
    );
    windowOpen.mockRestore();
  });

  it("calls onClose when continue is clicked", async () => {
    const handleClose = vi.fn();
    vi.spyOn(window, "open").mockReturnValue(null);
    const screen = await render(<UrlActionDialog {...defaultProps} onClose={handleClose} />);

    await screen.getByRole("button", { name: /continue/i }).click();

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when cancel is clicked", async () => {
    const handleClose = vi.fn();
    const screen = await render(<UrlActionDialog {...defaultProps} onClose={handleClose} />);

    await screen.getByRole("button", { name: /cancel/i }).click();

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("does not render when open is false", async () => {
    const screen = await render(<UrlActionDialog {...defaultProps} open={false} />);

    // Dialog should not be in the DOM when open=false
    const dialogs = screen.container.querySelectorAll('[role="dialog"]');
    expect(dialogs).toHaveLength(0);
  });

  it("uses custom confirm and cancel text", async () => {
    const screen = await render(
      <UrlActionDialog
        {...defaultProps}
        confirmText="Go to PayPal"
        cancelText="Go Back"
      />,
    );

    await expect.element(screen.getByRole("button", { name: "Go to PayPal" })).toBeInTheDocument();
    await expect.element(screen.getByRole("button", { name: "Go Back" })).toBeInTheDocument();
  });
});
