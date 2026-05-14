/// <reference types="vitest/browser" />
import { describe, it, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { CancellationStatus } from "@/ui/components/SubscriptionStatusCard/CancellationStatus";

vi.mock("@/ui/components/CancelAbortButton", () => ({
  CancelAbortButton: ({ willCancelAt, onAborted }: any) => (
    <button data-testid="abort-button" onClick={onAborted}>Abort Cancellation</button>
  ),
}));

describe("CancellationStatus", () => {
  it("renders cancel date label", async () => {
    render(<CancellationStatus willCancelAt="2025-12-31T00:00:00Z" />);
    await expect.element(page.getByText("Cancels")).toBeVisible();
  });

  it("formats and displays the cancel date", async () => {
    const willCancelAt = "2025-12-31T00:00:00Z";
    render(<CancellationStatus willCancelAt={willCancelAt} />);

    const expectedDate = new Date(willCancelAt).toLocaleDateString();
    await expect.element(page.getByText(expectedDate)).toBeVisible();
  });

  it("renders abort button", async () => {
    render(<CancellationStatus willCancelAt="2025-12-31T00:00:00Z" />);
    await expect.element(page.getByTestId("abort-button")).toBeVisible();
  });

  it("forwards onAborted callback to CancelAbortButton", async () => {
    const onAborted = vi.fn();
    render(<CancellationStatus willCancelAt="2025-12-31T00:00:00Z" onAborted={onAborted} />);

    await page.getByTestId("abort-button").click();

    expect(onAborted).toHaveBeenCalledTimes(1);
  });
});
