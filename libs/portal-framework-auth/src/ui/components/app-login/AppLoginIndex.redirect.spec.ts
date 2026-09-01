import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { createElement } from "react";
import {
  createMemoryRouter,
  MemoryRouter,
  Route,
  RouterProvider,
  Routes,
} from "react-router";
import AppLoginIndex from "./AppLoginIndex";

// --- captured callbacks from mocked useLogin ---
let capturedOnSuccess: ((result: any) => void) | undefined;
let capturedOnError: ((err: any) => void) | undefined;

const mockLoginMutate = vi.fn();

vi.mock("@refinedev/core", async () => {
  const actual = await vi.importActual("@refinedev/core");
  return {
    ...actual,
    useLogin: () => ({
      mutate: mockLoginMutate.mockImplementation((vars: any, opts: any) => {
        capturedOnSuccess = opts?.onSuccess;
        capturedOnError = opts?.onError;
      }),
      isPending: false,
    }),
    useParsed: () => ({ params: {} }),
    useGetIdentity: () => ({ data: null }),
    useIsAuthenticated: () => ({ data: { authenticated: false } }),
  };
});

vi.mock("@/hooks/useRedirectIfAuthenticated", () => ({
  useRedirectIfAuthenticated: vi.fn(),
}));

const oauthTo =
  "https://account.example.com/api/auth/oauth/authorize?response_type=code";

describe("AppLoginIndex redirect security", () => {
  let replaceSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    capturedOnSuccess = undefined;
    capturedOnError = undefined;
    // Set hostname so sia.example.com is considered same-root-domain
    window.location.hostname = "account.example.com";
    replaceSpy = vi
      .spyOn(window.location, "replace")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    replaceSpy.mockRestore();
    cleanup();
  });

  const fillAndSubmit = () => {
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "password123" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Sign in and continue/ }),
    );
  };

  const renderWithRouter = (initialEntry: string) => {
    // Use createElement to avoid JSX syntax in .ts file
    const appLoginRoute = createElement(Route, {
      path: "/app-login",
      element: createElement(AppLoginIndex),
    });
    const routes = createElement(Routes, null, appLoginRoute);
    const router = createElement(
      MemoryRouter,
      { initialEntries: [initialEntry] },
      routes,
    );
    render(router);
  };

  it("strips an absolute to param from the URL so Refine never consumes it", async () => {
    const router = createMemoryRouter(
      [{ path: "/app-login", element: createElement(AppLoginIndex) }],
      {
        initialEntries: [
          "/app-login?app=Example+App&to=" + encodeURIComponent(oauthTo),
        ],
      },
    );
    render(createElement(RouterProvider, { router }));

    await waitFor(() => {
      expect(router.state.location.search).not.toContain("to=");
    });
    // Other params are preserved.
    expect(router.state.location.search).toContain("app=");
  });

  it("keeps a relative to param in the URL", async () => {
    const router = createMemoryRouter(
      [{ path: "/app-login", element: createElement(AppLoginIndex) }],
      {
        initialEntries: ["/app-login?app=Example+App&to=/dashboard"],
      },
    );
    render(createElement(RouterProvider, { router }));

    await waitFor(() => {
      expect(router.state.location.search).toContain("to=/dashboard");
    });
  });

  it("onSuccess navigates to external same-root-domain URL via window.location.replace", async () => {
    const externalTo = "https://sia.example.com/auth/connect/abc123";
    renderWithRouter(
      "/app-login?app=TestApp&to=" + encodeURIComponent(externalTo),
    );

    fillAndSubmit();

    await waitFor(() => expect(capturedOnSuccess).toBeDefined());
    capturedOnSuccess!({ success: true, redirectTo: false });

    expect(replaceSpy).toHaveBeenCalledTimes(1);
    expect(replaceSpy).toHaveBeenCalledWith(externalTo);
  });

  it("onSuccess navigates to same-origin absolute OAuth URL via window.location.replace, not go()", async () => {
    // Same-origin absolute URL (account.example.com on account.example.com) — an
    // API/OAuth endpoint, not a React route. Must be a full browser navigation.
    renderWithRouter(
      "/app-login?app=Example+App&to=" + encodeURIComponent(oauthTo),
    );

    fillAndSubmit();

    await waitFor(() => expect(capturedOnSuccess).toBeDefined());
    capturedOnSuccess!({ success: true, redirectTo: false });

    expect(replaceSpy).toHaveBeenCalledTimes(1);
    expect(replaceSpy).toHaveBeenCalledWith(oauthTo);
  });

  it("onSuccess does NOT hard-navigate when the login result is an OTP hop", async () => {
    // 2FA account: login() returns redirectTo `/otp?to=...` (relative) so
    // Refine routes to the OTP page; the component must not replace to the
    // absolute target and skip OTP validation.
    renderWithRouter(
      "/app-login?app=Example+App&to=" + encodeURIComponent(oauthTo),
    );

    fillAndSubmit();

    await waitFor(() => expect(capturedOnSuccess).toBeDefined());
    capturedOnSuccess!({
      success: true,
      redirectTo: `/otp?to=${encodeURIComponent(oauthTo)}`,
    });

    expect(replaceSpy).not.toHaveBeenCalled();
  });

  it("onSuccess does NOT call window.location for internal relative redirect", async () => {
    renderWithRouter("/app-login?app=TestApp&to=/dashboard");

    fillAndSubmit();

    await waitFor(() => expect(capturedOnSuccess).toBeDefined());
    capturedOnSuccess!({ success: true, redirectTo: false });

    expect(replaceSpy).not.toHaveBeenCalled();
  });

  it("onSuccess blocks malicious external redirect", async () => {
    const evilTo = "https://evil.com/phish";
    renderWithRouter("/app-login?app=TestApp&to=" + encodeURIComponent(evilTo));

    fillAndSubmit();

    await waitFor(() => expect(capturedOnSuccess).toBeDefined());
    capturedOnSuccess!({ success: true, redirectTo: false });

    expect(replaceSpy).not.toHaveBeenCalled();
  });

  it("onSuccess blocks protocol-relative redirect", async () => {
    const evilTo = "//evil.com/phish";
    renderWithRouter("/app-login?app=TestApp&to=" + encodeURIComponent(evilTo));

    fillAndSubmit();

    await waitFor(() => expect(capturedOnSuccess).toBeDefined());
    capturedOnSuccess!({ success: true, redirectTo: false });

    expect(replaceSpy).not.toHaveBeenCalled();
  });

  it("cancel button navigates to sanitized redirect URL via window.location.replace", async () => {
    const externalTo = "https://sia.example.com/auth/connect/abc123";
    renderWithRouter(
      "/app-login?app=TestApp&to=" + encodeURIComponent(externalTo),
    );

    fireEvent.click(
      screen.getByRole("button", { name: /^Cancel and return to/ }),
    );

    expect(replaceSpy).toHaveBeenCalledTimes(1);
    expect(replaceSpy).toHaveBeenCalledWith(externalTo);
  });

  it("cancel button blocks protocol-relative redirect", async () => {
    renderWithRouter(
      "/app-login?app=TestApp&to=" + encodeURIComponent("//evil.com"),
    );

    fireEvent.click(
      screen.getByRole("button", { name: /^Cancel and return to/ }),
    );

    expect(replaceSpy).not.toHaveBeenCalled();
  });
});
