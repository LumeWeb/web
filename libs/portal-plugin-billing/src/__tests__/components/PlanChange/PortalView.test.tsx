/// <reference types="vitest/browser" />
import { render } from "vitest-browser-react";
import { describe, expect, it, vi } from "vitest";

import { PortalView } from "@/ui/components/PlanChange/PortalView";

vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  Button: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
    asChild ? children : <button>{children}</button>
  ),
  Skeleton: () => <span>Loading...</span>,
}));

vi.mock("lucide-react", () => ({
  ExternalLink: () => <svg data-testid="external-icon" />,
}));

describe("PortalView", () => {
  it("renders portal message with link", async () => {
    const screen = await render(<PortalView loading={false} url="https://portal.example.com" />);

    await expect.element(screen.getByText(/external payment portal/i)).toBeInTheDocument();
    await expect.element(screen.getByText(/Open Payment Portal/)).toBeInTheDocument();
  });

  it("shows loading state when loading is true", async () => {
    const screen = await render(<PortalView loading url={null} />);

    await expect.element(screen.getByText(/Loading/)).toBeInTheDocument();
  });

  it("links to provided url", async () => {
    const screen = await render(<PortalView loading={false} url="https://portal.example.com" />);

    const link = screen.getByRole("link");
    await expect.element(link).toHaveAttribute("href", "https://portal.example.com");
    await expect.element(link).toHaveAttribute("target", "_blank");
  });
});
