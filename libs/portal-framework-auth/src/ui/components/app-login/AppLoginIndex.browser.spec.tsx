import { afterEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { MemoryRouter, Route, Routes } from "react-router";

import AppLoginIndex from "./AppLoginIndex";

const mockLoginMutate = vi.fn();

vi.mock("@refinedev/core", async () => {
  const actual = await vi.importActual("@refinedev/core");
  return {
    ...actual,
    useGetIdentity: () => ({ data: null }),
    useGo: () => vi.fn(),
    useInvalidateAuthStore: () => () => undefined,
    useIsAuthenticated: () => ({ data: { authenticated: false } }),
    useLogin: () => ({
      isPending: false,
      mutate: mockLoginMutate.mockImplementation(
        (_vars: unknown) => {
          // Per-call onError surfaces its own errors; nothing to capture
          // hermetically here.
          return undefined;
        },
      ),
    }),
    useNotification: () => ({ close: vi.fn(), open: vi.fn() }),
    useParsed: () => ({ params: {} }),
    // The register step calls useRegister; stub the mutation so the
    // mode-aware heading tests can mount it hermetically.
    useRegister: () => ({ mutateAsync: vi.fn() }),
  };
});

vi.mock("@/hooks/useRedirectIfAuthenticated", () => ({
  useRedirectIfAuthenticated: vi.fn(),
}));

describe("AppLoginIndex", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the app login screen with app name from query param", async () => {
    render(
      <MemoryRouter initialEntries={["/app-login?app=TestApp&to=/callback"]}>
        <Routes>
          <Route element={<AppLoginIndex />} path="/app-login" />
        </Routes>
      </MemoryRouter>
    );

    await expect.element(page.getByText("Connect application")).toBeInTheDocument();
    // exact: true — the "Sign in to connect TestApp" h2 also contains the
    // app name, and role-name matching is substring-based by default.
    await expect.element(page.getByRole("heading", { exact: true, level: 2, name: "TestApp" })).toBeInTheDocument();
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
          <Route element={<AppLoginIndex />} path="/app-login" />
        </Routes>
      </MemoryRouter>
    );

    await expect.element(page.getByRole("heading", { exact: true, level: 2, name: "an application" })).toBeInTheDocument();
    await expect.element(page.getByRole("heading", { name: /Sign in to connect an application/ })).toBeInTheDocument();
  });

  it("shows mode-aware register heading and description on Create account face", async () => {
    render(
      <MemoryRouter initialEntries={["/app-login?app=TestApp"]}>
        <Routes>
          <Route element={<AppLoginIndex />} path="/app-login" />
        </Routes>
      </MemoryRouter>
    );

    await page.getByRole("tab", { name: "Create account" }).click();

    // exact: true — both h2s (app identity + page title) contain the app
    // name, and role-name matching is substring-based by default.
    await expect.element(
      page.getByRole("heading", { exact: true, name: "Create an account to connect TestApp" }),
    ).toBeInTheDocument();
    await expect.element(
      page.getByText("Sign up in a few seconds, then connect TestApp to your account."),
    ).toBeInTheDocument();
    await expect.element(
      page.getByRole("heading", { name: /Sign in to connect TestApp/ }),
    ).not.toBeInTheDocument();
  });

  it("shows register heading directly on ?mode=register deep link", async () => {
    render(
      <MemoryRouter initialEntries={["/app-login?app=TestApp&mode=register"]}>
        <Routes>
          <Route element={<AppLoginIndex />} path="/app-login" />
        </Routes>
      </MemoryRouter>
    );

    await expect.element(
      page.getByRole("heading", { exact: true, name: "Create an account to connect TestApp" }),
    ).toBeInTheDocument();
    await expect.element(
      page.getByText("Sign up in a few seconds, then connect TestApp to your account."),
    ).toBeInTheDocument();
  });

  it("styles the active stepper face as a darker filled pill (and the inactive face as muted)", async () => {
    render(
      <MemoryRouter initialEntries={["/app-login?app=TestApp"]}>
        <Routes>
          <Route element={<AppLoginIndex />} path="/app-login" />
        </Routes>
      </MemoryRouter>
    );

    const loginTab = page.getByRole("tab", { name: "Login" });
    const registerTab = page.getByRole("tab", { name: "Create account" });

    await expect.element(loginTab).toBeInTheDocument();
    await expect.element(registerTab).toBeInTheDocument();

    // Active face: filled `bg-primary` pill with `text-background` (the
    // contrast-compliant pairing on the mid-teal primary token); inactive
    // face: muted ghost, no fill.
    expect((loginTab.element() as HTMLElement).className).toContain("bg-primary");
    expect((loginTab.element() as HTMLElement).className).toContain("text-background");
    expect((loginTab.element() as HTMLElement).className).not.toContain("text-primary-foreground");
    expect((registerTab.element() as HTMLElement).className).not.toContain("bg-primary");
    expect((registerTab.element() as HTMLElement).className).toContain("text-muted-foreground");
    expect((registerTab.element() as HTMLElement).className).not.toContain("text-primary");
    expect((registerTab.element() as HTMLElement).className).not.toContain("text-background");

    await registerTab.click();
    expect((registerTab.element() as HTMLElement).className).toContain("bg-primary");
    expect((registerTab.element() as HTMLElement).className).toContain("text-background");
    expect((registerTab.element() as HTMLElement).className).not.toContain("text-primary-foreground");
    expect((loginTab.element() as HTMLElement).className).not.toContain("bg-primary");
    expect((loginTab.element() as HTMLElement).className).toContain("text-muted-foreground");
    expect((loginTab.element() as HTMLElement).className).not.toContain("text-background");

    await loginTab.click();
    expect((loginTab.element() as HTMLElement).className).toContain("bg-primary");
    expect((registerTab.element() as HTMLElement).className).not.toContain("bg-primary");
  });

  it("starts the active pill on the register face when deep-linked with ?mode=register", async () => {
    render(
      <MemoryRouter initialEntries={["/app-login?app=TestApp&mode=register"]}>
        <Routes>
          <Route element={<AppLoginIndex />} path="/app-login" />
        </Routes>
      </MemoryRouter>
    );

    const loginTab = page.getByRole("tab", { name: "Login" });
    const registerTab = page.getByRole("tab", { name: "Create account" });

    await expect.element(registerTab).toBeInTheDocument();

    expect((registerTab.element() as HTMLElement).className).toContain("bg-primary");
    expect((loginTab.element() as HTMLElement).className).not.toContain("bg-primary");
  });

  it("restores the login heading when toggling back to the Login face", async () => {
    render(
      <MemoryRouter initialEntries={["/app-login?app=TestApp"]}>
        <Routes>
          <Route element={<AppLoginIndex />} path="/app-login" />
        </Routes>
      </MemoryRouter>
    );

    await page.getByRole("tab", { name: "Create account" }).click();
    await expect.element(
      page.getByRole("heading", { exact: true, name: "Create an account to connect TestApp" }),
    ).toBeInTheDocument();

    await page.getByRole("tab", { name: "Login" }).click();
    await expect.element(
      page.getByRole("heading", { exact: true, name: "Sign in to connect TestApp" }),
    ).toBeInTheDocument();
  });

  it("shows error when submitting empty form", async () => {
    render(
      <MemoryRouter initialEntries={["/app-login?app=FailApp"]}>
        <Routes>
          <Route element={<AppLoginIndex />} path="/app-login" />
        </Routes>
      </MemoryRouter>
    );

    const submitButton = page.getByRole("button", { name: /Sign in and continue/ });
    await submitButton.click();

    await expect.element(page.getByText(/Please enter both email and password/)).toBeInTheDocument();
  });
});
