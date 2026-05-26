import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock @refinedev/core to avoid QueryClientProvider requirement
const mockUseCustom = vi.fn();

vi.mock("@refinedev/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@refinedev/core")>();
  return {
    ...actual,
    useCustom: (...args: any[]) => mockUseCustom(...args),
  };
});

// Mock portal-framework-auth to prevent loading portal-framework-ui -> indexedDB
vi.mock("@lumeweb/portal-framework-auth", () => ({
  DATA_PROVIDER_NAME: "account",
}));

// Mock portal-framework-ui to prevent indexedDB errors from saved-filters store
vi.mock("@lumeweb/portal-framework-ui", () => ({
  withTheme: (Component: any) => Component,
}));

import QuotaWidget from "../ui/widgets/quota";

// Mock UI components from portal-framework-ui-core
vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-title">{children}</div>
  ),
  Progress: (props: any) => (
    <div
      data-testid="progress"
      data-max={props.max}
      data-value={props.value}
    />
  ),
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}));

describe("QuotaWidget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCustom.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders 3 progress bars with data (Storage, Upload, Download labels visible)", () => {
    mockUseCustom.mockReturnValue({
      query: {
        isError: false,
        isLoading: false,
        isSuccess: true,
        refetch: vi.fn(),
      },
      result: {
        data: {
          download: {
            limit: 10737418240,
            percentage: 50,
            used: 5368709120,
          },
          storage: {
            limit: 107374182400,
            percentage: 50,
            used: 53687091200,
          },
          upload: {
            limit: 1073741824,
            percentage: 19.5,
            used: 209715200,
          },
        },
      },
    });

    render(<QuotaWidget />);

    expect(screen.getByText("Quota Usage")).toBeInTheDocument();
    expect(screen.getByText("Storage")).toBeInTheDocument();
    expect(screen.getByText("Upload")).toBeInTheDocument();
    expect(screen.getByText("Download")).toBeInTheDocument();

    const progressBars = screen.getAllByTestId("progress");
    expect(progressBars).toHaveLength(3);
  });

  it("shows loading skeleton while fetching", () => {
    mockUseCustom.mockReturnValue({
      query: {
        isError: false,
        isLoading: true,
        isSuccess: false,
        refetch: vi.fn(),
      },
      result: {
        data: undefined,
      },
    });

    render(<QuotaWidget />);

    expect(screen.getByText("Quota Usage")).toBeInTheDocument();
    const skeletons = screen.getAllByTestId("skeleton");
    expect(skeletons.length).toBeGreaterThan(0);

    // Progress bars should not be present during loading
    expect(screen.queryAllByTestId("progress")).toHaveLength(0);
  });

  it("shows error message on API failure", () => {
    mockUseCustom.mockReturnValue({
      query: {
        isError: true,
        isLoading: false,
        isSuccess: false,
        refetch: vi.fn(),
      },
      result: {
        data: undefined,
      },
    });

    render(<QuotaWidget />);

    expect(screen.getByText("Quota Usage")).toBeInTheDocument();
    expect(
      screen.getByText("Failed to load quota data"),
    ).toBeInTheDocument();

    // Progress bars should not be present on error
    expect(screen.queryAllByTestId("progress")).toHaveLength(0);
  });

  it("shows 'Unlimited' when limit is undefined", () => {
    mockUseCustom.mockReturnValue({
      query: {
        isError: false,
        isLoading: false,
        isSuccess: true,
        refetch: vi.fn(),
      },
      result: {
        data: {
          download: {
            limit: undefined,
            percentage: 0,
            used: 5368709120,
          },
          storage: {
            limit: 107374182400,
            percentage: 50,
            used: 53687091200,
          },
          upload: {
            limit: 1073741824,
            percentage: 19.5,
            used: 209715200,
          },
        },
      },
    });

    render(<QuotaWidget />);

    expect(screen.getByText("Unlimited")).toBeInTheDocument();

    // Only 2 progress bars should render (storage and upload; download is unlimited)
    const progressBars = screen.getAllByTestId("progress");
    expect(progressBars).toHaveLength(2);
  });

  it("renders null when not ready and not busy and no error", () => {
    mockUseCustom.mockReturnValue({
      query: {
        isError: false,
        isLoading: false,
        isSuccess: false,
        refetch: vi.fn(),
      },
      result: {
        data: undefined,
      },
    });

    const { container } = render(<QuotaWidget />);

    expect(container.firstChild).toBeNull();
  });
});
