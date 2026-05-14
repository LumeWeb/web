/// <reference types="vitest/browser" />
import { render } from "vitest-browser-react";
import { describe, expect, it, vi } from "vitest";

import { FeaturesSkeleton } from "@/ui/components/PricingTable/FeaturesSkeleton";

vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  Skeleton: ({ className }: { className?: string }) => <div data-testid="skeleton" className={className} />,
}));

describe("FeaturesSkeleton", () => {
  it("renders three skeleton loaders", async () => {
    const screen = await render(<FeaturesSkeleton />);

    const skeletons = screen.container.querySelectorAll('[data-testid="skeleton"]');
    expect(skeletons).toHaveLength(3);
  });

  it("applies full width class to first skeleton", async () => {
    const screen = await render(<FeaturesSkeleton />);

    const skeletons = screen.container.querySelectorAll('[data-testid="skeleton"]');
    expect(skeletons[0].className).toContain("w-full");
  });

  it("applies 3/4 width class to second skeleton", async () => {
    const screen = await render(<FeaturesSkeleton />);

    const skeletons = screen.container.querySelectorAll('[data-testid="skeleton"]');
    expect(skeletons[1].className).toContain("w-3/4");
  });

  it("applies 5/6 width class to third skeleton", async () => {
    const screen = await render(<FeaturesSkeleton />);

    const skeletons = screen.container.querySelectorAll('[data-testid="skeleton"]');
    expect(skeletons[2].className).toContain("w-5/6");
  });
});
