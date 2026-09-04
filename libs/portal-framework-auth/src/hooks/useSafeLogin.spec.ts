import { type AuthActionResponse } from "@refinedev/core";
import { renderHook, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useSafeLogin } from "./useSafeLogin";

let capturedMutationOptions:
  | { onSuccess?: (data: AuthActionResponse) => void }
  | undefined;

const mockInvalidate = vi.fn();
const mockOpen = vi.fn();
const mockClose = vi.fn();
const mockGo = vi.fn();

vi.mock("@refinedev/core", async () => {
  const actual = await vi.importActual("@refinedev/core");
  return {
    ...actual,
    useLogin: (opts?: {
      mutationOptions?: { onSuccess?: (data: AuthActionResponse) => void };
    }) => {
      capturedMutationOptions = opts?.mutationOptions;
      return { mutate: vi.fn(), isPending: false };
    },
    useInvalidateAuthStore: () => mockInvalidate,
    useNotification: () => ({ open: mockOpen, close: mockClose }),
    useGo: () => mockGo,
  };
});

describe("useSafeLogin — destination authority = authProvider's sanitized redirectTo", () => {
  let assignSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    capturedMutationOptions = undefined;
    mockInvalidate.mockClear();
    mockOpen.mockClear();
    mockClose.mockClear();
    mockGo.mockClear();
    // Set the hostname before spying on href — mutating hostname in happy-dom
    // rewrites location.href and would pollute the spy.
    window.location.hostname = "account.example.com";
    vi.useFakeTimers();
    assignSpy = vi
      .spyOn(window.location, "href", "set")
      .mockImplementation(() => {});
    renderHook(() => useSafeLogin());
  });

  afterEach(() => {
    vi.useRealTimers();
    assignSpy.mockRestore();
  });

  it("replaces Refine's built-in onSuccess (mutationOptions are hooked in)", () => {
    expect(capturedMutationOptions?.onSuccess).toBeDefined();
  });

  it("navigates internal redirectTo through go({ to, type: 'replace' })", () => {
    act(() => {
      capturedMutationOptions!.onSuccess!({
        redirectTo: "/dashboard",
        success: true,
      });
    });
    expect(mockGo).toHaveBeenCalledWith({
      to: "/dashboard",
      type: "replace",
    });
    expect(assignSpy).not.toHaveBeenCalled();
  });

  it("hard-navigates external redirectTo via window.location.href", () => {
    const external = "https://sia.example.com/auth/connect/abc123";
    act(() => {
      capturedMutationOptions!.onSuccess!({
        redirectTo: external,
        success: true,
      });
    });
    expect(assignSpy).toHaveBeenCalledWith(external);
    expect(mockGo).not.toHaveBeenCalled();
  });

  it("OTP pin: external ?to= + OTP-enabled response ends at /otp?to=…, never past it", () => {
    // The authProvider's login() response shape when the account has 2FA:
    // success:true + redirectTo:/otp?to=<single-encoded target>. Refine's
    // built-in onSuccess would have preferred the raw parsed.params.to and
    // skipped the OTP step entirely; useSafeLogin must follow the provider.
    const externalTo = "https://sia.example.com/auth/connect/abc123";
    const otpRedirect = `/otp?to=${encodeURIComponent(externalTo)}`;

    act(() => {
      capturedMutationOptions!.onSuccess!({
        redirectTo: otpRedirect,
        success: true,
        successNotification: {
          description: "Please enter your 2FA code to complete login.",
          message: "Two-Factor Authentication Required",
        },
      });
    });

    expect(mockGo).toHaveBeenCalledWith({
      to: otpRedirect,
      type: "replace",
    });
    // The external target must not be reached while the OTP step is pending.
    expect(assignSpy).not.toHaveBeenCalled();
  });

  it("opens the provider's success notification and skips navigation without redirectTo", () => {
    const notification = {
      description: "You have successfully logged in.",
      message: "Login Successful",
    };
    act(() => {
      capturedMutationOptions!.onSuccess!({
        redirectTo: undefined,
        success: true,
        successNotification: notification,
      } as AuthActionResponse);
    });
    expect(mockClose).toHaveBeenCalledWith("login-error");
    expect(mockOpen).toHaveBeenCalledWith({
      description: notification.description,
      key: "login-success",
      message: notification.message,
      type: "success",
    });
    expect(mockGo).not.toHaveBeenCalled();
    expect(assignSpy).not.toHaveBeenCalled();
  });

  it("opens the error notification when login fails", () => {
    const error = { message: "Invalid credentials", name: "Login Error" };
    act(() => {
      capturedMutationOptions!.onSuccess!({
        error,
        success: false,
      } as AuthActionResponse);
    });
    expect(mockOpen).toHaveBeenCalledWith({
      description: "Invalid credentials",
      key: "login-error",
      message: "Login Error",
      type: "error",
    });
    expect(mockGo).not.toHaveBeenCalled();
  });

  it("invalidates the auth store ~32ms after success", () => {
    act(() => {
      capturedMutationOptions!.onSuccess!({
        redirectTo: "/dashboard",
        success: true,
      });
    });
    expect(mockInvalidate).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(40);
    });
    expect(mockInvalidate).toHaveBeenCalledTimes(1);
  });
});
