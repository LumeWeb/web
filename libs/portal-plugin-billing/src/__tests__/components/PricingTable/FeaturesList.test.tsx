/// <reference types="vitest/browser" />
import { render } from "vitest-browser-react";
import { describe, expect, it, vi } from "vitest";

import { FeaturesList } from "@/ui/components/PricingTable/FeaturesList";

vi.mock("@/ui/components/PricingTable/FeatureItem", () => ({
  FeatureItem: ({ text }: { text: string }) => <li data-testid="feature-item">{text}</li>,
}));

vi.mock("@/ui/components/PricingTable/FeaturesSkeleton", () => ({
  FeaturesSkeleton: () => <div data-testid="features-skeleton">Loading features...</div>,
}));

describe("FeaturesList", () => {
  it("renders list of features", async () => {
    const features = ["Feature 1", "Feature 2", "Feature 3"];
    const screen = await render(<FeaturesList features={features} />);

    const featureItems = screen.container.querySelectorAll('[data-testid="feature-item"]');
    expect(featureItems).toHaveLength(3);
    expect(featureItems[0].textContent).toBe("Feature 1");
    expect(featureItems[1].textContent).toBe("Feature 2");
    expect(featureItems[2].textContent).toBe("Feature 3");
  });

  it("renders skeleton when features is undefined", async () => {
    const screen = await render(<FeaturesList features={undefined} />);

    await expect.element(screen.getByTestId("features-skeleton")).toBeInTheDocument();
  });

  it("renders skeleton when features array is empty", async () => {
    const screen = await render(<FeaturesList features={[]} />);

    await expect.element(screen.getByTestId("features-skeleton")).toBeInTheDocument();
  });
});
