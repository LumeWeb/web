/// <reference types="vitest/browser" />
import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { PausedStatus } from "@/ui/components/SubscriptionStatusCard/PausedStatus";

describe("PausedStatus", () => {
  it("renders paused status with formatted date", async () => {
    const pausedAt = "2025-06-15T10:30:00Z";
    render(<PausedStatus pausedAt={pausedAt} />);

    await expect.element(page.getByText("Status")).toBeVisible();
    await expect.element(page.getByText(/Paused since/)).toBeVisible();
  });

  it("formats the paused date correctly", async () => {
    const pausedAt = "2025-03-20T00:00:00Z";
    render(<PausedStatus pausedAt={pausedAt} />);

    const expectedDate = new Date(pausedAt).toLocaleDateString();
    await expect.element(page.getByText(`Paused since ${expectedDate}`)).toBeVisible();
  });
});
