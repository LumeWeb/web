import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { OnboardingIntent } from "@/types";
import { OnboardingChecklist } from "@/ui/components/OnboardingChecklist";

const mockStepsPinning = [
  { id: "cli", isComplete: false, label: "Install CLI", description: "Copy the command below, paste it into your terminal, and run it to install the Pinner CLI", ctaLabel: "Copy install command", ctaRoute: null },
  { id: "subscribe", isComplete: false, label: "Subscribe", description: "Choose a plan to start pinning content to the IPFS network", ctaLabel: "View plans", ctaRoute: "/account/subscription" },
  { id: "upload", isComplete: false, label: "Upload Content", description: "Pin your first file or directory to IPFS", ctaLabel: "Upload files", ctaRoute: "/services/ipfs/files" },
];

const mockStepsHosting = [
  { id: "cli", isComplete: false, label: "Install CLI", description: "Copy the command below, paste it into your terminal, and run it to install the Pinner CLI", ctaLabel: "Copy install command", ctaRoute: null },
  { id: "subscribe", isComplete: false, label: "Subscribe", description: "Choose a plan to start hosting websites on IPFS", ctaLabel: "View plans", ctaRoute: "/account/subscription" },
  { id: "deploy", isComplete: false, label: "Deploy Website", description: "Deploy your first website to IPFS", ctaLabel: "Create website", ctaRoute: "/websites" },
];

const mockStepsComplete = [
  { id: "cli", isComplete: true, label: "Install CLI", description: "Copy the command below, paste it into your terminal, and run it to install the Pinner CLI", ctaLabel: "Copy install command", ctaRoute: null },
  { id: "subscribe", isComplete: true, label: "Subscribe", description: "Choose a plan to start pinning content to the IPFS network", ctaLabel: "View plans", ctaRoute: "/account/subscription" },
  { id: "upload", isComplete: true, label: "Upload Content", description: "Pin your first file or directory to IPFS", ctaLabel: "Upload files", ctaRoute: "/services/ipfs/files" },
];

vi.mock("@/hooks", () => ({
  useOnboardingStatus: vi.fn(),
}));

vi.mock("@/analytics/useOnboardingAnalytics", () => ({
  useOnboardingAnalytics: vi.fn(),
}));

vi.mock("react-router", () => ({
  useNavigate: vi.fn(),
}));

vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  Card: ({ children, className, onClick }: any) => (
    <div data-testid="card" className={className} onClick={onClick}>{children}</div>
  ),
  CardContent: ({ children, className }: any) => (
    <div data-testid="card-content" className={className}>{children}</div>
  ),
  CardHeader: ({ children, className }: any) => (
    <div data-testid="card-header" className={className}>{children}</div>
  ),
  CardTitle: ({ children, className }: any) => (
    <div data-testid="card-title" className={className}>{children}</div>
  ),
  Progress: ({ value, className }: any) => (
    <div data-testid="progress" data-value={value} className={className} />
  ),
  Button: ({ children, onClick, variant, size, className }: any) => (
    <button data-testid="button" onClick={onClick} className={className}>{children}</button>
  ),
  Skeleton: ({ className }: any) => (
    <div data-testid="skeleton" className={className} />
  ),
  lazyIcon: (name: string) => {
    const icons: Record<string, () => any> = {
      X: () => <span data-testid="icon-x">X</span>,
      ChevronRight: () => <span data-testid="icon-chevron">→</span>,
      Check: () => <span data-testid="icon-check">✓</span>,
    };
    return icons[name] ?? (() => null);
  },
}));

vi.mock("lucide-react", () => ({
  X: () => <span data-testid="icon-x">X</span>,
  ChevronRight: () => <span data-testid="icon-chevron">→</span>,
  Check: () => <span data-testid="icon-check">✓</span>,
}));

vi.mock("@/ui/components/OnboardingStepCard", () => ({
  OnboardingStepCard: ({ step, stepNumber, isExpanded, ctaLabel }: any) => (
    <div data-testid={`step-${step.id}`}>
      <span>{step.label}</span>
      <span>{step.isComplete ? "complete" : "incomplete"}</span>
      <span>{isExpanded ? "expanded" : "collapsed"}</span>
      <span>{ctaLabel}</span>
    </div>
  ),
}));

import { useOnboardingStatus } from "@/hooks";
import { useOnboardingAnalytics } from "@/analytics/useOnboardingAnalytics";

const mockUseOnboardingStatus = vi.mocked(useOnboardingStatus);
const mockUseOnboardingAnalytics = vi.mocked(useOnboardingAnalytics);

describe("OnboardingChecklist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    mockUseOnboardingAnalytics.mockReturnValue({
      captureStepViewed: vi.fn(),
      captureStepCompleted: vi.fn(),
      captureDismissed: vi.fn(),
      captureOnboardingCompleted: vi.fn(),
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("returns null when isComplete is true", async () => {
    mockUseOnboardingStatus.mockReturnValue({
      steps: mockStepsComplete,
      completedCount: 3,
      isComplete: true,
      isBusy: false,
      intent: null,
    });

    render(<OnboardingChecklist />);
    await expect.element(page.getByText("Get Started")).not.toBeInTheDocument();
  });

  it("shows Skeleton when isBusy is true", async () => {
    mockUseOnboardingStatus.mockReturnValue({
      steps: mockStepsPinning,
      completedCount: 0,
      isComplete: false,
      isBusy: true,
      intent: null,
    });

    render(<OnboardingChecklist />);
    await expect.element(page.getByTestId("skeleton").first()).toBeInTheDocument();
  });

  it("shows error message when steps are empty", async () => {
    mockUseOnboardingStatus.mockReturnValue({
      steps: [],
      completedCount: 0,
      isComplete: false,
      isBusy: false,
      intent: null,
    });

    render(<OnboardingChecklist />);
    await expect.element(page.getByText("Unable to load onboarding status")).toBeVisible();
  });

  it("shows full checklist with 3 steps for pinning intent", async () => {
    mockUseOnboardingStatus.mockReturnValue({
      steps: mockStepsPinning,
      completedCount: 0,
      isComplete: false,
      isBusy: false,
      intent: OnboardingIntent.Pinning,
    });

    render(<OnboardingChecklist />);
    await expect.element(page.getByTestId("step-cli")).toBeVisible();
    await expect.element(page.getByTestId("step-subscribe")).toBeVisible();
    await expect.element(page.getByTestId("step-upload")).toBeVisible();
    await expect.element(page.getByText("0 of 3")).toBeVisible();
  });

  it("shows 3 steps for hosting intent", async () => {
    mockUseOnboardingStatus.mockReturnValue({
      steps: mockStepsHosting,
      completedCount: 0,
      isComplete: false,
      isBusy: false,
      intent: OnboardingIntent.Hosting,
    });

    render(<OnboardingChecklist />);
    await expect.element(page.getByTestId("step-cli")).toBeVisible();
    await expect.element(page.getByTestId("step-subscribe")).toBeVisible();
    await expect.element(page.getByTestId("step-deploy")).toBeVisible();
    await expect.element(page.getByText("0 of 3")).toBeVisible();
  });

  it("shows compact banner when dismissed", async () => {
    localStorage.setItem("pinner_onboarding", JSON.stringify({ dismissed: true }));

    mockUseOnboardingStatus.mockReturnValue({
      steps: mockStepsPinning,
      completedCount: 0,
      isComplete: false,
      isBusy: false,
      intent: null,
    });

    render(<OnboardingChecklist />);
    await expect.element(page.getByText(/step.*remaining/)).toBeVisible();
  });

  it("dismiss button sets localStorage", async () => {
    mockUseOnboardingStatus.mockReturnValue({
      steps: mockStepsPinning,
      completedCount: 0,
      isComplete: false,
      isBusy: false,
      intent: null,
    });

    render(<OnboardingChecklist />);
    await page.getByTestId("icon-x").click();

    const stored = JSON.parse(localStorage.getItem("pinner_onboarding")!);
    expect(stored.dismissed).toBe(true);
  });

  it("shows 'Upload files' CTA for pinning intent", async () => {
    mockUseOnboardingStatus.mockReturnValue({
      steps: mockStepsPinning,
      completedCount: 0,
      isComplete: false,
      isBusy: false,
      intent: OnboardingIntent.Pinning,
    });

    render(<OnboardingChecklist />);
    await expect.element(page.getByTestId("step-upload")).toHaveTextContent("Upload files");
  });

  it("shows 'Create website' CTA for hosting intent", async () => {
    mockUseOnboardingStatus.mockReturnValue({
      steps: mockStepsHosting,
      completedCount: 0,
      isComplete: false,
      isBusy: false,
      intent: OnboardingIntent.Hosting,
    });

    render(<OnboardingChecklist />);
    await expect.element(page.getByTestId("step-deploy")).toHaveTextContent("Create website");
  });

  it("shows 'Upload files' CTA when intent is null (default)", async () => {
    mockUseOnboardingStatus.mockReturnValue({
      steps: mockStepsPinning,
      completedCount: 0,
      isComplete: false,
      isBusy: false,
      intent: null,
    });

    render(<OnboardingChecklist />);
    await expect.element(page.getByTestId("step-upload")).toHaveTextContent("Upload files");
  });
});
