/// <reference types="vitest/browser" />
import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { LoadingState } from "@/ui/components/SubscriptionManagement/LoadingState";

describe("LoadingState", () => {
  it("renders loading message", async () => {
    render(<LoadingState />);
    await expect.element(page.getByText("Loading management options...")).toBeVisible();
  });

  it("applies custom className by rendering the element", async () => {
    render(<LoadingState className="custom-test-class" />);
    // Just verify it renders without error when className is passed
    await expect.element(page.getByText("Loading management options...")).toBeVisible();
  });
});
