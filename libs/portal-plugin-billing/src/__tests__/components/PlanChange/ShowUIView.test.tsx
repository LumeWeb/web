/// <reference types="vitest/browser" />
import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";

import { ShowUIView } from "@/ui/components/PlanChange/ShowUIView";

describe("ShowUIView", () => {
  it("renders with canAbort true", async () => {
    const screen = await render(<ShowUIView canAbort={true} />);

    await expect.element(screen.getByText(/revert.*24 hours/i)).toBeInTheDocument();
  });

  it("renders with canAbort false", async () => {
    const screen = await render(<ShowUIView canAbort={false} />);

    // "revert" text should not be present
    const elements = screen.container.querySelectorAll("*");
    const hasRevertText = Array.from(elements).some(
      (el) => el.textContent && /revert/i.test(el.textContent),
    );
    expect(hasRevertText).toBe(false);
  });

  it("displays confirmation message when provided", async () => {
    const screen = await render(
      <ShowUIView
        canAbort={false}
        confirmationMessage="Your subscription has been updated"
      />,
    );

    await expect.element(screen.getByText("Your subscription has been updated")).toBeInTheDocument();
  });

  it("displays effective time when provided", async () => {
    const screen = await render(
      <ShowUIView
        canAbort={false}
        effectiveTime="2026-05-02T00:00:00Z"
      />,
    );

    await expect.element(screen.getByText(/Effective:/)).toBeInTheDocument();
  });

  it("renders all fields when provided", async () => {
    const screen = await render(
      <ShowUIView
        canAbort={true}
        confirmationMessage="Plan change confirmed"
        effectiveTime="2026-05-02T00:00:00Z"
      />,
    );

    await expect.element(screen.getByText("Plan change confirmed")).toBeInTheDocument();
    await expect.element(screen.getByText(/Effective:/)).toBeInTheDocument();
    await expect.element(screen.getByText(/revert.*24 hours/i)).toBeInTheDocument();
  });
});
