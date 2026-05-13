import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { FeatureItem } from "@/ui/components/PricingTable/FeatureItem";

describe("FeatureItem", () => {
  it("renders included feature with text", async () => {
    render(<FeatureItem text="Feature Text" included />);
    
    await expect.element(await page.getByText("Feature Text")).toBeInTheDocument();
  });

  it("renders excluded feature with text", async () => {
    render(<FeatureItem text="Not Included" included={false} />);
    
    await expect.element(await page.getByText("Not Included")).toBeInTheDocument();
  });

  it("defaults to included when prop not specified", async () => {
    render(<FeatureItem text="Default" />);
    
    await expect.element(await page.getByText("Default")).toBeInTheDocument();
  });
});
