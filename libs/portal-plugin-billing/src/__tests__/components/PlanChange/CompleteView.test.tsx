/// <reference types="vitest/browser" />
import { render } from "vitest-browser-react";
import { describe, expect, it, vi } from "vitest";

import { CompleteView } from "@/ui/components/PlanChange/CompleteView";

vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

describe("CompleteView", () => {
  it("renders completion summary with charge and credit", async () => {
    const screen = await render(
      <CompleteView
        chargeDue="1.00"
        creditApplied="2.00"
        effectiveDate="2026-05-04T01:54:39Z"
        onClose={vi.fn()}
      />,
    );

    await expect.element(screen.getByText("Plan change complete")).toBeInTheDocument();
    await expect.element(screen.getByText("Amount due")).toBeInTheDocument();
    await expect.element(screen.getByText("$1.00")).toBeInTheDocument();
    await expect.element(screen.getByText("Credit applied")).toBeInTheDocument();
    await expect.element(screen.getByText("-$2.00")).toBeInTheDocument();
    await expect.element(screen.getByText("Effective")).toBeInTheDocument();
  });

  it("renders Done button that calls onClose", async () => {
    const handleClose = vi.fn();
    const screen = await render(
      <CompleteView
        chargeDue="1.00"
        onClose={handleClose}
      />,
    );

    await screen.getByRole("button", { name: "Done" }).click();
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("does not show credit when credit is zero", async () => {
    const screen = await render(
      <CompleteView
        chargeDue="1.00"
        creditApplied="0.00"
        onClose={vi.fn()}
      />,
    );

    const creditElements = screen.container.querySelectorAll("*");
    const hasCreditText = Array.from(creditElements).some(
      (el) => el.textContent === "Credit applied",
    );
    expect(hasCreditText).toBe(false);
  });

  it("does not show charge due when not provided", async () => {
    const screen = await render(
      <CompleteView
        creditApplied="2.00"
        onClose={vi.fn()}
      />,
    );

    await expect.element(screen.getByText("Amount due")).not.toBeInTheDocument();
    await expect.element(screen.getByText("Credit applied")).toBeInTheDocument();
  });

  it("shows effective date when provided", async () => {
    const screen = await render(
      <CompleteView
        chargeDue="1.00"
        effectiveDate="2026-05-04T01:54:39Z"
        onClose={vi.fn()}
      />,
    );

    await expect.element(screen.getByText("Effective")).toBeInTheDocument();
  });
});
