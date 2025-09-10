import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Import the mocked function after the mock is defined
import { useAccountSubdomain as mockedUseAccountSubdomain } from "@/hooks/useAccountSubdomain";

import { useResetPasswordUrl } from "./useResetPasswordUrl";

// Mock dependencies by defining the mock inside the factory
vi.mock("@/hooks/useAccountSubdomain", () => {
  const useAccountSubdomain = vi.fn();
  return {
    useAccountSubdomain,
  };
});

describe("useResetPasswordUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return the reset password URL using the account subdomain", () => {
    const mockSubdomain = "myaccount";
    vi.mocked(mockedUseAccountSubdomain).mockReturnValue(mockSubdomain);

    const { result } = renderHook(() => useResetPasswordUrl());

    expect(mockedUseAccountSubdomain).toHaveBeenCalled();
    expect(result.current).toBe(`https://${mockSubdomain}/reset-password`);
  });

  it("should handle an empty subdomain", () => {
    const mockSubdomain = "";
    vi.mocked(mockedUseAccountSubdomain).mockReturnValue(mockSubdomain);

    const { result } = renderHook(() => useResetPasswordUrl());

    expect(mockedUseAccountSubdomain).toHaveBeenCalled();
    expect(result.current).toBe(`https:///reset-password`); // This might result in an invalid URL, but matches the hook's logic
  });

  it("should handle a subdomain that includes a protocol (though useAccountSubdomain should prevent this)", () => {
    // This is testing against a potential unexpected input from the dependency
    const mockSubdomain = "https://myaccount.example.com";
    vi.mocked(mockedUseAccountSubdomain).mockReturnValue(mockSubdomain);

    const { result } = renderHook(() => useResetPasswordUrl());

    expect(mockedUseAccountSubdomain).toHaveBeenCalled();
    expect(result.current).toBe(`https://${mockSubdomain}/reset-password`); // Matches the hook's string concatenation
  });
});
