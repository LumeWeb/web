/// <reference types="vitest/browser" />
import { render } from "vitest-browser-react";
import { describe, expect, it, vi } from "vitest";

import { RedirectView } from "@/ui/components/PlanChange/RedirectView";

vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  Button: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
    asChild ? children : <button>{children}</button>
  ),
}));

vi.mock("lucide-react", () => ({
  ExternalLink: () => <svg data-testid="external-icon" />,
}));

describe("RedirectView", () => {
  it("renders redirect message", async () => {
    const screen = await render(<RedirectView url="https://portal.example.com/manage" />);

    await expect.element(screen.getByText(/payment provider/i)).toBeInTheDocument();
    await expect.element(screen.getByText(/Manage in Portal/)).toBeInTheDocument();
  });

  it("provides external link to url", async () => {
    const screen = await render(<RedirectView url="https://stripe.com/portal" />);

    const link = screen.getByRole("link");
    await expect.element(link).toHaveAttribute("href", "https://stripe.com/portal");
    await expect.element(link).toHaveAttribute("target", "_blank");
    await expect.element(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
