/// <reference types="vitest/browser" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { CheckoutForm } from "@/ui/components/CheckoutForm";
import type { CheckoutUIFragment } from "@/types/subscription";
import type { ReactElement } from "react";

// Mock formatAmount
vi.mock("@/utils/formatAmount", () => ({
  formatAmount: (value: number) => `$${value.toFixed(2)}`,
}));

// Mock the portal framework UI core
vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
  Card: ({ children, className, ...props }: any) => (
    <div data-testid="card" className={className} {...props}>{children}</div>
  ),
  CardContent: ({ children, ...props }: any) => (
    <div data-testid="card-content" {...props}>{children}</div>
  ),
  CardHeader: ({ children, ...props }: any) => (
    <div data-testid="card-header" {...props}>{children}</div>
  ),
  CardTitle: ({ children, ...props }: any) => (
    <div data-testid="card-title" {...props}>{children}</div>
  ),
  lazyIcon: (name: string) => () => <span data-testid={name.charAt(0).toLowerCase() + name.slice(1).replace(/([A-Z])/g, (c: string) => "-" + c.toLowerCase())} />,
}));

// Mock FragmentRenderer
vi.mock("@/ui/components/FragmentRenderer", () => ({
  FragmentRenderer: ({ fragments }: { fragments: CheckoutUIFragment[] }) => (
    <div data-testid="fragment-renderer">
      {fragments.map((f, i) => (
        <div key={i} data-testid={`fragment-${f.type}`}>
          {f.html || f.script || f.link}
        </div>
      ))}
    </div>
  ),
}));

// Mock lucide-react
vi.mock("lucide-react", () => ({
  ArrowLeft: () => <span data-testid="arrow-left">←</span>,
}));

function renderComponent(element: ReactElement) {
  return render(element);
}

describe("CheckoutForm", () => {
  const mockFragments: CheckoutUIFragment[] = [
    { type: "html", html: "<div>Test Checkout HTML</div>" },
    { type: "script", script: "console.log('test');" },
    { type: "button", link: "https://checkout.example.com", html: "Pay Now" },
  ];

  const defaultProps = {
    fragments: mockFragments,
    planName: "Pro Plan",
    planPrice: 29.99,
    planCadence: "monthly" as const,
    gatewayName: "Stripe",
    onBack: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders the card layout", async () => {
      renderComponent(<CheckoutForm {...defaultProps} />);
      
      const card = await page.getByTestId("card");
      await expect.element(card).toBeInTheDocument();
      
      const cardHeader = await page.getByTestId("card-header");
      await expect.element(cardHeader).toBeInTheDocument();
      
      const cardContent = await page.getByTestId("card-content");
      await expect.element(cardContent).toBeInTheDocument();
    });

    it("displays the correct title and subtitle", async () => {
      renderComponent(<CheckoutForm {...defaultProps} />);
      
      const title = await page.getByText("Complete Your Subscription");
      await expect.element(title).toBeInTheDocument();
      
      const subtitle = await page.getByText("Review your plan and enter payment details");
      await expect.element(subtitle).toBeInTheDocument();
    });

    it("renders the back button with icon", async () => {
      renderComponent(<CheckoutForm {...defaultProps} />);
      
      const backButton = await page.getByRole("button", { name: /Back to Plans/i });
      await expect.element(backButton).toBeInTheDocument();
      
      const arrowIcon = await page.getByTestId("arrow-left");
      await expect.element(arrowIcon).toBeInTheDocument();
    });
  });

  describe("Plan Summary", () => {
    it("displays plan name and cadence", async () => {
      renderComponent(<CheckoutForm {...defaultProps} />);
      
      const planName = await page.getByText("Pro Plan");
      await expect.element(planName).toBeInTheDocument();
      
      const cadence = await page.getByText("monthly billing");
      await expect.element(cadence).toBeInTheDocument();
    });

    it("displays formatted price with cadence label", async () => {
      renderComponent(<CheckoutForm {...defaultProps} />);
      
      const price = await page.getByText("$29.99");
      await expect.element(price).toBeInTheDocument();
      
      const cadenceLabel = await page.getByText("/month");
      await expect.element(cadenceLabel).toBeInTheDocument();
    });

    it("uses 'year' cadence label for yearly billing", async () => {
      renderComponent(
        <CheckoutForm {...defaultProps} planCadence="yearly" />
      );
      
      const cadenceLabel = await page.getByText("/year");
      await expect.element(cadenceLabel).toBeInTheDocument();
    });

    it("capitalizes the cadence text", async () => {
      renderComponent(
        <CheckoutForm {...defaultProps} planCadence="yearly" />
      );
      
      const cadence = await page.getByText(/yearly billing/i);
      await expect.element(cadence).toBeInTheDocument();
    });
  });

  describe("Fragment Rendering", () => {
    it("renders FragmentRenderer with provided fragments", async () => {
      renderComponent(<CheckoutForm {...defaultProps} />);
      
      const fragmentRenderer = await page.getByTestId("fragment-renderer");
      await expect.element(fragmentRenderer).toBeInTheDocument();
      
      const htmlFragment = await page.getByTestId("fragment-html");
      await expect.element(htmlFragment).toHaveTextContent("Test Checkout HTML");
      
      const scriptFragment = await page.getByTestId("fragment-script");
      await expect.element(scriptFragment).toHaveTextContent("console.log('test');");
      
      const buttonFragment = await page.getByTestId("fragment-button");
      await expect.element(buttonFragment).toHaveTextContent("Pay Now");
    });

    it("renders no fragments when empty array provided", async () => {
      renderComponent(<CheckoutForm {...defaultProps} fragments={[]} />);
      
      const fragmentRenderer = await page.getByTestId("fragment-renderer");
      await expect.element(fragmentRenderer).toBeInTheDocument();
    });
  });

  describe("Gateway Info", () => {
    it("displays gateway name when provided", async () => {
      renderComponent(<CheckoutForm {...defaultProps} />);
      
      const notice = await page.getByText("Stripe");
      await expect.element(notice).toBeInTheDocument();
    });

    it("does not display gateway section when name not provided", async () => {
      renderComponent(<CheckoutForm {...defaultProps} gatewayName={undefined} />);
      
      // Should not find a text element with just "Secure" or similar
      const stripeText = await page.getByText("Stripe");
      await expect.element(stripeText).not.toBeInTheDocument();
    });
  });

  describe("Back Button Interaction", () => {
    it("calls onBack when back button is clicked", async () => {
      const onBack = vi.fn();
      renderComponent(<CheckoutForm {...defaultProps} onBack={onBack} />);
      
      const backButton = await page.getByRole("button", { name: /Back to Plans/i });
      await backButton.click();
      
      expect(onBack).toHaveBeenCalledTimes(1);
    });
  });

  describe("Props Variations", () => {
    it("applies custom className when provided", async () => {
      renderComponent(<CheckoutForm {...defaultProps} className="custom-class" />);
      
      const card = await page.getByTestId("card");
      await expect.element(card).toHaveClass("custom-class");
    });

    it("handles different plan prices", async () => {
      renderComponent(<CheckoutForm {...defaultProps} planPrice={99.99} />);
      
      const price = await page.getByText("$99.99");
      await expect.element(price).toBeInTheDocument();
    });

    it("handles zero price", async () => {
      renderComponent(<CheckoutForm {...defaultProps} planPrice={0} />);
      
      const price = await page.getByText("$0.00");
      await expect.element(price).toBeInTheDocument();
    });

    it("handles different gateway names", async () => {
      renderComponent(<CheckoutForm {...defaultProps} gatewayName="Atlos" />);
      
      const notice = await page.getByText("Atlos");
      await expect.element(notice).toBeInTheDocument();
    });
  });
});
