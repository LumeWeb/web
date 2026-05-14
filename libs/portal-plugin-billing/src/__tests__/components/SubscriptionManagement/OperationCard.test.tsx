/// <reference types="vitest/browser" />
import { render } from "vitest-browser-react";
import { describe, expect, it, vi } from "vitest";

import { OperationCard } from "@/ui/components/SubscriptionManagement/OperationCard";

vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  Button: ({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
}));

describe("OperationCard", () => {
  it("renders cancel subscription card", async () => {
    const screen = await render(
      <OperationCard
        operation="cancel"
        onExecute={vi.fn()}
        isLoading={false}
      />,
    );

    await expect.element(screen.getByRole("heading", { name: "Cancel Subscription" })).toBeInTheDocument();
    await expect.element(screen.getByText("Cancel your current subscription")).toBeInTheDocument();
  });

  it("renders customer portal card", async () => {
    const screen = await render(
      <OperationCard
        operation="customer_portal"
        onExecute={vi.fn()}
        isLoading={false}
      />,
    );

    await expect.element(screen.getByRole("heading", { name: "Manage in Portal" })).toBeInTheDocument();
    await expect.element(screen.getByText("Access full subscription management in your customer portal")).toBeInTheDocument();
  });

  it("renders pause subscription card", async () => {
    const screen = await render(
      <OperationCard
        operation="pause"
        onExecute={vi.fn()}
        isLoading={false}
      />,
    );

    await expect.element(screen.getByRole("heading", { name: "Pause Subscription" })).toBeInTheDocument();
    await expect.element(screen.getByText("Temporarily pause your subscription")).toBeInTheDocument();
  });

  it("renders resume subscription card", async () => {
    const screen = await render(
      <OperationCard
        operation="resume"
        onExecute={vi.fn()}
        isLoading={false}
      />,
    );

    await expect.element(screen.getByRole("heading", { name: "Resume Subscription" })).toBeInTheDocument();
    await expect.element(screen.getByText("Resume your paused subscription")).toBeInTheDocument();
  });

  it("calls onExecute when button is clicked", async () => {
    const handleExecute = vi.fn();
    const screen = await render(
      <OperationCard
        operation="cancel"
        onExecute={handleExecute}
        isLoading={false}
      />,
    );

    await screen.getByRole("button").click();
    expect(handleExecute).toHaveBeenCalledWith("cancel");
  });

  it("shows processing state when isLoading is true", async () => {
    const screen = await render(
      <OperationCard
        operation="cancel"
        onExecute={vi.fn()}
        isLoading
      />,
    );

    const button = screen.getByRole("button");
    await expect.element(button).toBeDisabled();
    await expect.element(button).toHaveTextContent("Processing...");
  });

  it("renders unknown operation with operation name", async () => {
    const screen = await render(
      <OperationCard
        operation="custom_operation"
        onExecute={vi.fn()}
        isLoading={false}
      />,
    );

    await expect.element(screen.getByRole("heading", { name: "custom_operation" })).toBeInTheDocument();
    await expect.element(screen.getByText("Manage custom_operation")).toBeInTheDocument();
  });
});
