import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies by defining the mock inside the factory
vi.mock("@/hooks/usePluginMeta", () => {
  const usePluginMeta = vi.fn(); // Define the mock inside the factory
  return {
    usePluginMeta,
  };
});

vi.mock("@/hooks/useProtocolDomain", () => {
  const useProtocolDomain = vi.fn(); // Define the mock inside the factory
  return {
    useProtocolDomain,
  };
});

// Import the mocked functions after the mocks are defined
import { useAccountSubdomain } from "./useAccountSubdomain";
import { usePluginMeta as mockedUsePluginMeta } from "@/hooks/usePluginMeta";
import { useProtocolDomain as mockedUseProtocolDomain } from "@/hooks/useProtocolDomain";

describe("useAccountSubdomain", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mock implementations for each test
    vi.mocked(mockedUsePluginMeta).mockReset();
    vi.mocked(mockedUseProtocolDomain).mockReset();
    // Set default mock return values if needed for most tests
    vi.mocked(mockedUsePluginMeta).mockReturnValue("test-subdomain");
    vi.mocked(mockedUseProtocolDomain).mockReturnValue("test-subdomain.example.com");
  });

  it("should get dashboard subdomain from plugin meta", () => {
    renderHook(() => useAccountSubdomain());
    expect(mockedUsePluginMeta).toHaveBeenCalledWith("dashboard", "subdomain");
  });

  it("should use useProtocolDomain with the subdomain from plugin meta", () => {
    const mockSubdomain = "myaccount";
    vi.mocked(mockedUsePluginMeta).mockReturnValue(mockSubdomain);

    renderHook(() => useAccountSubdomain());

    expect(mockedUseProtocolDomain).toHaveBeenCalledWith(mockSubdomain);
  });


  it("should return the result from useProtocolDomain when subdomain is found", () => {
    const mockSubdomain = "myaccount";
    const mockProtocolDomain = "myaccount.example.com";
    vi.mocked(mockedUsePluginMeta).mockReturnValue(mockSubdomain);
    vi.mocked(mockedUseProtocolDomain).mockReturnValue(mockProtocolDomain);

    const { result } = renderHook(() => useAccountSubdomain());

    expect(result.current).toBe(mockProtocolDomain);
  });

  it("should return current hostname when no subdomain is found in plugin meta", () => {
    // Simulate usePluginMeta returning undefined or empty string
    vi.mocked(mockedUsePluginMeta).mockReturnValue(undefined);
    // Ensure useProtocolDomain is NOT called in this case
    vi.mocked(mockedUseProtocolDomain).mockReset(); // Reset to check it's not called

    const { result } = renderHook(() => useAccountSubdomain());

    expect(mockedUsePluginMeta).toHaveBeenCalledWith("dashboard", "subdomain");
    expect(mockedUseProtocolDomain).not.toHaveBeenCalled();
    expect(result.current).toBe(window.location.hostname);
  });

  it("should return current hostname when plugin meta returns empty string for subdomain", () => {
    vi.mocked(mockedUsePluginMeta).mockReturnValue('');
    vi.mocked(mockedUseProtocolDomain).mockReset(); // Ensure useProtocolDomain is NOT called

    const { result } = renderHook(() => useAccountSubdomain());

    expect(mockedUsePluginMeta).toHaveBeenCalledWith("dashboard", "subdomain");
    expect(mockedUseProtocolDomain).not.toHaveBeenCalled();
    expect(result.current).toBe(window.location.hostname);
  });
});
