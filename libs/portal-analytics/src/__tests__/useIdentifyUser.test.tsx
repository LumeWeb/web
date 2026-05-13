import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useIdentifyUser } from "../useIdentifyUser";

const mockUseGetIdentity = vi.fn();
vi.mock("@refinedev/core", () => ({
  useGetIdentity: () => mockUseGetIdentity(),
}));

const mockIdentify = vi.fn();
const mockReset = vi.fn();
vi.mock("@lumeweb/analytics", () => ({
  useAnalytics: () => ({
    identify: mockIdentify,
    reset: mockReset,
    capture: vi.fn(),
  }),
}));

describe("useIdentifyUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGetIdentity.mockReturnValue({ data: undefined });
  });

  it("should call identify with user id only", () => {
    mockUseGetIdentity.mockReturnValue({
      data: {
        id: "user-123",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
      },
    });

    renderHook(() => useIdentifyUser());

    expect(mockIdentify).toHaveBeenCalledWith("user-123");
  });

  it("should not call identify twice for same user", () => {
    const identity = {
      data: {
        id: "user-123",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
      },
    };
    mockUseGetIdentity.mockReturnValue(identity);

    const { rerender } = renderHook(() => useIdentifyUser());
    rerender();
    rerender();

    expect(mockIdentify).toHaveBeenCalledTimes(1);
  });

  it("should call reset when identity is cleared (logout)", () => {
    const { rerender } = renderHook(() => useIdentifyUser());

    mockUseGetIdentity.mockReturnValue({
      data: { id: "user-123", email: "test@example.com", firstName: "John" },
    });
    rerender();
    expect(mockIdentify).toHaveBeenCalledWith("user-123");

    mockUseGetIdentity.mockReturnValue({ data: null });
    rerender();
    expect(mockReset).toHaveBeenCalled();
  });

  it("should not call identify when identity has no id", () => {
    mockUseGetIdentity.mockReturnValue({
      data: { email: "test@example.com" },
    });

    renderHook(() => useIdentifyUser());

    expect(mockIdentify).not.toHaveBeenCalled();
  });

  it("should handle undefined identity gracefully", () => {
    mockUseGetIdentity.mockReturnValue({ data: undefined });

    renderHook(() => useIdentifyUser());

    expect(mockIdentify).not.toHaveBeenCalled();
    expect(mockReset).not.toHaveBeenCalled();
  });
});
