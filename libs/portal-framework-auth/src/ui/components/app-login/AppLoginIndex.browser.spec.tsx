/// <reference types="vitest/browser" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { MemoryRouter, Route, Routes } from "react-router";

import AppLoginIndex from "./AppLoginIndex";

// --- spies ---
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

describe("AppLoginIndex", () => {
  beforeEach(() => {
    capturedOnSuccess = undefined;
    capturedOnError = undefined;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the app login screen with app name from query param", async () => {
    render(
      <MemoryRouter initialEntries={["/app-login?app=TestApp&to=/callback"]}>
        <Routes>
          <Route path="/app-login" element={<AppLoginIndex />} />
        </Routes>
      </MemoryRouter>
    );

    await expect.element(page.getByText("Connect application")).toBeInTheDocument();
    await expect.element(page.getByRole("heading", { name: "TestApp", level: 2 })).toBeInTheDocument();
    await expect.element(page.getByRole("heading", { name: /Sign in to connect TestApp/ })).toBeInTheDocument();
    await expect.element(page.getByPlaceholder("you@example.com")).toBeInTheDocument();
    await expect.element(page.getByRole("button", { name: "Cancel and return to TestApp" })).toBeInTheDocument();
    await expect.element(
      page.getByText(/Your password is entered only on this portal and is never shared with TestApp/),
    ).toBeInTheDocument();
  });

  it("renders with default app name when no query param", async () => {
    render(
      <MemoryRouter initialEntries={["/app-login"]}>
        <Routes>
          <Route path="/app-login" element={<AppLoginIndex />} />
        </Routes>
      </MemoryRouter>
    );

    await expect.element(page.getByRole("heading", { name: "an application", level: 2 })).toBeInTheDocument();
    await expect.element(page.getByRole("heading", { name: /Sign in to connect an application/ })).toBeInTheDocument();
  });

  it("shows error when submitting empty form", async () => {
    render(
      <MemoryRouter initialEntries={["/app-login?app=FailApp"]}>
        <Routes>
          <Route path="/app-login" element={<AppLoginIndex />} />
        </Routes>
      </MemoryRouter>
    );

    const submitButton = page.getByRole("button", { name: /Sign in and continue/ });
    await submitButton.click();

    await expect.element(page.getByText(/Please enter both email and password/)).toBeInTheDocument();
  });
});
