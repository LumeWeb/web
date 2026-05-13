/// <reference types="vitest/browser" />
import { render } from "vitest-browser-react";
import { describe, expect, it, vi } from "vitest";

import { CadenceToggle } from "@/ui/components/PricingTable/CadenceToggle";

vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  Label: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <label className={className}>{children}</label>
  ),
  Switch: ({ checked, onCheckedChange }: { checked?: boolean; onCheckedChange?: (checked: boolean) => void }) => (
    <input
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      role="switch"
      type="checkbox"
    />
  ),
}));

describe("CadenceToggle", () => {
  it("renders Monthly and Yearly labels", async () => {
    const screen = await render(<CadenceToggle cadence="monthly" onChange={vi.fn()} />);

    await expect.element(screen.getByText("Monthly")).toBeInTheDocument();
    await expect.element(screen.getByText("Yearly")).toBeInTheDocument();
  });

  it("switch is unchecked when cadence is monthly", async () => {
    const screen = await render(<CadenceToggle cadence="monthly" onChange={vi.fn()} />);

    const switchEl = screen.getByRole("switch");
    await expect.element(switchEl).not.toBeChecked();
  });

  it("switch is checked when cadence is yearly", async () => {
    const screen = await render(<CadenceToggle cadence="yearly" onChange={vi.fn()} />);

    const switchEl = screen.getByRole("switch");
    await expect.element(switchEl).toBeChecked();
  });

  it("calls onChange with 'yearly' when switch is turned on", async () => {
    const handleChange = vi.fn();
    const screen = await render(<CadenceToggle cadence="monthly" onChange={handleChange} />);

    await screen.getByRole("switch").click();

    expect(handleChange).toHaveBeenCalledWith("yearly");
  });

  it("calls onChange with 'monthly' when switch is turned off", async () => {
    const handleChange = vi.fn();
    const screen = await render(<CadenceToggle cadence="yearly" onChange={handleChange} />);

    await screen.getByRole("switch").click();

    expect(handleChange).toHaveBeenCalledWith("monthly");
  });
});
