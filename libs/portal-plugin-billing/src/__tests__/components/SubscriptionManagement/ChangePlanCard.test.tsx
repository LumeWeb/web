/// <reference types="vitest/browser" />
import { describe, it, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { userEvent } from "vitest/browser";
import { ChangePlanCard } from "@/ui/components/SubscriptionManagement/ChangePlanCard";

const mockOnOpen = vi.fn();

vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}));

describe("ChangePlanCard", () => {
  it("renders change plan title", async () => {
    render(<ChangePlanCard onOpen={mockOnOpen} />);
    await expect.element(page.getByRole("heading", { name: "Change Plan" })).toBeVisible();
  });

  it("renders change plan description", async () => {
    render(<ChangePlanCard onOpen={mockOnOpen} />);
    await expect.element(page.getByText("Switch to a different plan")).toBeVisible();
  });

  it("renders change plan button", async () => {
    render(<ChangePlanCard onOpen={mockOnOpen} />);
    await expect.element(page.getByRole("button", { name: "Change Plan" })).toBeVisible();
  });

  it("calls onOpen when button clicked", async () => {
    render(<ChangePlanCard onOpen={mockOnOpen} />);
    const button = page.getByRole("button", { name: "Change Plan" });
    await userEvent.click(button);

    expect(mockOnOpen).toHaveBeenCalled();
  });
});
