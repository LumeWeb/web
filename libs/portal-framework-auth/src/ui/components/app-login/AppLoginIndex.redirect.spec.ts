import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { createElement } from "react";
import { MemoryRouter, Route, Routes } from "react-router";
import AppLoginIndex from "./AppLoginIndex";

// --- captured callbacks from mocked useLogin / useRegister / useGo ---
let capturedMutationOptions: { onSuccess?: (result: any) => void } | undefined;
let capturedOnError: ((err: any) => void) | undefined;
let capturedRegisterMutationOptions:
  | { onSuccess?: (result: any) => void }
  | undefined;
const mockLoginMutate = vi.fn();
const mockRegisterMutateAsync = vi.fn();
const mockGo = vi.fn();

vi.mock("@refinedev/core", async () => {
  const actual = await vi.importActual("@refinedev/core");
  return {
    ...actual,
    useLogin: (opts?: { mutationOptions?: { onSuccess?: (result: any) => void } }) => {
      capturedMutationOptions = opts?.mutationOptions;
      return {
        mutate: mockLoginMutate.mockImplementation((_vars: unknown, perCall: any) => {
          capturedOnError = perCall?.onError;
        }),
        isPending: false,
      };
    },
    useRegister: (opts?: {
      mutationOptions?: { onSuccess?: (result: any) => void };
    }) => {
      capturedRegisterMutationOptions = opts?.mutationOptions;
      return {
        mutateAsync: mockRegisterMutateAsync.mockImplementation(
          async (vars: { redirectTo?: string }) => {
            // Emulate authProvider.register(): internal targets are echoed
            // back verbatim as the post-register redirectTo.
            const data: { success: boolean; redirectTo?: string } = {
              success: true,
              redirectTo: vars.redirectTo,
            };
            // Emulate Refine's built-in useRegister onSuccess: destination
            // authority = the provider's (sanitized) redirectTo, via go().
            capturedRegisterMutationOptions?.onSuccess?.(data);
            mockGo({ to: data.redirectTo, type: "replace" });
            return data;
          },
        ),
        isPending: false,
      };
    },
    useInvalidateAuthStore: () => () => {},
    useNotification: () => ({ open: vi.fn(), close: vi.fn() }),
    useGo: () => mockGo,
    useParsed: () => ({ params: {} }),
    useGetIdentity: () => ({ data: null }),
    useIsAuthenticated: () => ({ data: { authenticated: false } }),
  };
});

vi.mock("@/hooks/useRedirectIfAuthenticated", () => ({
  useRedirectIfAuthenticated: vi.fn(),
}));

// AppRegisterStep reuses the standard register form (getRegisterForm +
// SchemaForm). Replace only SchemaForm with a submit-proxy button so the
// redirect semantics (not the form internals) are under test; everything
// else in portal-framework-ui stays real.
// AppRegisterStep reuses the standard register form (getRegisterForm +
// SchemaForm). Replace only SchemaForm with a submit-proxy button so the
// redirect semantics (not the form internals) are under test. The mock is
// self-contained (no importOriginal) because the framework-ui barrel pulls
// @refinedev/react-table, whose lodash deep-import is not resolvable in the
// node test environment.
vi.mock("@lumeweb/portal-framework-ui", async () => {
  const { createElement } = await import("react");
  const MockSchemaForm = (props: {
    config: {
      onSubmit: (values: Record<string, string>) => Promise<void>;
    };
  }) =>
    createElement(
      "button",
      {
        "data-testid": "register-form-submit",
        onClick: () =>
          props.config.onSubmit({
            email: "reg@example.com",
            firstName: "Test",
            lastName: "User",
            password: "password123",
          }),
        type: "button",
      },
      "Register submit proxy",
    );
  // Enum-ish consts the real getRegisterForm builder reads (its output is
  // consumed only by the mocked SchemaForm, so opaque strings suffice).
  return {
    ActionItemType: { SUBMIT: "SUBMIT" },
    FormFieldType: {
      CHECKBOX: "CHECKBOX",
      EMAIL: "EMAIL",
      PASSWORD: "PASSWORD",
      TEXT: "TEXT",
    },
    GroupOrder: { GROUPS_FIRST: "GROUPS_FIRST" },
    InlineAuthLinkBanner: (props: Record<string, unknown>) =>
      createElement("div", props),
    Input: (props: Record<string, unknown>) =>
      createElement("input", props),
    LumeLogo: (props: Record<string, unknown>) =>
      createElement("div", props),
    SchemaForm: MockSchemaForm,
    useFeatureFlag: () => false,
    usePluginMeta: () => undefined,
  };
});

describe("AppLoginIndex redirect security", () => {
  let assignSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    capturedMutationOptions = undefined;
    capturedOnError = undefined;
    capturedRegisterMutationOptions = undefined;
    mockGo.mockClear();
    mockRegisterMutateAsync.mockClear();
    // Set hostname so sia.example.com is considered same-root-domain
    window.location.hostname = "account.example.com";
    assignSpy = vi
      .spyOn(window.location, "href", "set")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    assignSpy.mockRestore();
    cleanup();
  });

  const fillAndSubmit = () => {
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Sign in and continue/ }));
  };

  const renderWithRouter = (initialEntry: string) => {
    // Keep the real window.location in sync with the router entry so the
    // URL-surgery paths (stepper toggle, register chain URL) read the same
    // address the user would see.
    window.history.replaceState(null, "", initialEntry);
    // Use createElement to avoid JSX syntax in .ts file
    const appLoginRoute = createElement(
      Route,
      { path: "/app-login", element: createElement(AppLoginIndex) }
    );
    const routes = createElement(Routes, null, appLoginRoute);
    const router = createElement(MemoryRouter, { initialEntries: [initialEntry] }, routes);
    render(router);
  };

  /**
   * The useSafeLogin hook replaces Refine's built-in useLogin onSuccess, so
   * the simulated provider response flows through
   * `capturedMutationOptions.onSuccess` (destination authority = the
   * provider's sanitized redirectTo).
   */
  const runLoginSuccess = (result: { success: boolean; redirectTo?: string }) => {
    expect(capturedMutationOptions?.onSuccess).toBeDefined();
    capturedMutationOptions!.onSuccess!(result);
  };

  it("surfaces the provider's redirectTo as the single destination authority (external URL via window.location)", async () => {
    const externalTo = "https://sia.example.com/auth/connect/abc123";
    renderWithRouter("/app-login?app=TestApp&to=" + encodeURIComponent(externalTo));

    fillAndSubmit();
    await waitFor(() => expect(capturedMutationOptions).toBeDefined());

    runLoginSuccess({ success: true, redirectTo: externalTo });

    expect(assignSpy).toHaveBeenCalledTimes(1);
    expect(assignSpy).toHaveBeenCalledWith(externalTo);
    expect(mockGo).not.toHaveBeenCalled();
  });

  it("D with its own query (?next=%2Fsettings) is preserved level-for-level through terminal nav", async () => {
    // D was written (encoded once) with its own inner percent-encoded query;
    // the once-decoded read must keep `?next=%2Fsettings` intact — byte-exact.
    const externalTo = "https://sia.example.com/auth/connect/abc?next=%2Fsettings";
    renderWithRouter("/app-login?app=TestApp&to=" + encodeURIComponent(externalTo));

    fillAndSubmit();
    await waitFor(() => expect(capturedMutationOptions).toBeDefined());

    runLoginSuccess({ success: true, redirectTo: externalTo });

    expect(assignSpy).toHaveBeenCalledWith(externalTo);
  });

  it("login hard-nav ignores the raw ?to= and follows the provider redirectTo (OTP shape)", async () => {
    // Pin: an OTP-enabled-shaped response ends at the /otp step, not a
    // hard-nav to the external ?to= target.
    const externalTo = "https://sia.example.com/auth/connect/abc123";
    const otpRedirect = `/otp?to=${encodeURIComponent(externalTo)}`;
    renderWithRouter("/app-login?app=TestApp&to=" + encodeURIComponent(externalTo));

    fillAndSubmit();
    await waitFor(() => expect(capturedMutationOptions).toBeDefined());

    runLoginSuccess({ success: true, redirectTo: otpRedirect });

    expect(mockGo).toHaveBeenCalledWith(
      expect.objectContaining({ to: otpRedirect, type: "replace" }),
    );
    expect(assignSpy).not.toHaveBeenCalled();
  });

  it("onSuccess navigates internal provider redirectTo through go() instead of window.location", async () => {
    renderWithRouter("/app-login?app=TestApp&to=%2Fdashboard");

    fillAndSubmit();
    await waitFor(() => expect(capturedMutationOptions).toBeDefined());

    runLoginSuccess({ success: true, redirectTo: "/dashboard" });

    expect(assignSpy).not.toHaveBeenCalled();
    expect(mockGo).toHaveBeenCalledWith(
      expect.objectContaining({ to: "/dashboard", type: "replace" }),
    );
  });

  it("mutate() still forwards provider-level error to local error state", async () => {
    renderWithRouter("/app-login?app=TestApp&to=%2Fdashboard");

    fillAndSubmit();
    await waitFor(() => expect(mockLoginMutate).toHaveBeenCalled());
    expect(capturedOnError).toBeDefined();

    capturedOnError!({ message: "Invalid credentials" });
    await waitFor(() =>
      expect(screen.getByText(/Invalid credentials/i)).toBeDefined(),
    );
  });

  it("E2: double-encoded input is rejected loudly when a single decode-repair is insufficient", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const realTo = "https://sia.example.com/auth/connect/abc123";
    // Double-encode: URLSearchParams.get yields the once-decoded
    // double-encoded value; sanitize decodes once more but the residual
    // value ("https%3A%2F%2F…") is still unparseable → loud rejection.
    // (Decode exactly once — no repeated repair attempts.)
    const doubleEncoded = encodeURIComponent(realTo).replace(/%/g, "%25");
    renderWithRouter("/app-login?to=" + encodeURIComponent(doubleEncoded));

    fillAndSubmit();
    await waitFor(() => expect(mockLoginMutate).toHaveBeenCalled());
    expect(mockLoginMutate.mock.calls[0][0].redirectTo).toBe("/dashboard");
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("redirect"));
    warnSpy.mockRestore();
  });

  it("E2 (repaired): double-encoded input whose once-decoded value is a valid target is repaired", async () => {
    // sanitizeRedirectUrl decode-retries once; input below decodes to
    // "https://sia.example.com/invite?next=%2Fsettings" which is a valid
    // same-root URL with its own percent-sequences preserved.
    const repaired = "https://sia.example.com/invite?next=%2Fsettings";
    renderWithRouter(
      "/app-login?to=" + encodeURIComponent(encodeURIComponent(repaired)),
    );

    fillAndSubmit();
    await waitFor(() => expect(mockLoginMutate).toHaveBeenCalled());
    expect(mockLoginMutate.mock.calls[0][0].redirectTo).toBe(repaired);
  });

  it("onSuccess blocks malicious external redirect (provider never returns one)", async () => {
    const evilTo = "https://evil.com/phish";
    renderWithRouter("/app-login?app=TestApp&to=" + encodeURIComponent(evilTo));

    fillAndSubmit();
    await waitFor(() => expect(capturedMutationOptions).toBeDefined());

    runLoginSuccess({ success: true, redirectTo: "/dashboard" });

    expect(assignSpy).not.toHaveBeenCalled();
    expect(mockGo).toHaveBeenCalledWith(
      expect.objectContaining({ to: "/dashboard", type: "replace" }),
    );
  });

  it("onSuccess blocks protocol-relative redirect", async () => {
    renderWithRouter("/app-login?app=TestApp&to=" + encodeURIComponent("//evil.com/phish"));

    fillAndSubmit();
    await waitFor(() => expect(mockLoginMutate).toHaveBeenCalled());
    // sanitizeRedirectUrl maps protocol-relative to /dashboard before login
    expect(mockLoginMutate.mock.calls[0][0].redirectTo).toBe("/dashboard");

    runLoginSuccess({ success: true, redirectTo: "/dashboard" });
    expect(assignSpy).not.toHaveBeenCalled();
  });

  it("cancel button navigates to sanitized external redirect URL", async () => {
    const externalTo = "https://sia.example.com/auth/connect/abc123";
    renderWithRouter("/app-login?app=TestApp&to=" + encodeURIComponent(externalTo));

    fireEvent.click(screen.getByRole("button", { name: /^Cancel and return to/ }));

    expect(assignSpy).toHaveBeenCalledTimes(1);
    expect(assignSpy).toHaveBeenCalledWith(externalTo);
  });

  it("cancel button with internal ?to= goes through go() (D-with-own-query preserved level-for-level)", async () => {
    const internalTo = "/app?next=%2Fsettings";
    renderWithRouter("/app-login?app=TestApp&to=" + encodeURIComponent(internalTo));

    fireEvent.click(screen.getByRole("button", { name: /^Cancel and return to/ }));

    expect(assignSpy).not.toHaveBeenCalled();
    expect(mockGo).toHaveBeenCalledWith(
      expect.objectContaining({ to: internalTo, type: "replace" }),
    );
  });

  it("cancel button without any ?to= falls back to history.back()", async () => {
    const backSpy = vi.spyOn(window.history, "back").mockImplementation(() => {});
    // happy-dom history stack can be length 1 — the component only backs out
    // when there is somewhere to back to.
    Object.defineProperty(window.history, "length", {
      value: 5,
      configurable: true,
    });
    renderWithRouter("/app-login?app=TestApp");

    fireEvent.click(screen.getByRole("button", { name: /^Cancel and return to/ }));

    expect(assignSpy).not.toHaveBeenCalled();
    expect(mockGo).not.toHaveBeenCalled();
    expect(backSpy).toHaveBeenCalled();
    backSpy.mockRestore();
  });

  it("cancel button blocks protocol-relative redirect", async () => {
    renderWithRouter("/app-login?app=TestApp&to=" + encodeURIComponent("//evil.com"));

    fireEvent.click(screen.getByRole("button", { name: /^Cancel and return to/ }));

    expect(assignSpy).not.toHaveBeenCalled();
  });

  it("stepper toggle preserves `to` byte-exact — app/to untouched, mode added/removed surgically", () => {
    // `to` carries its own inner percent-encoding (D-level): any
    // re-serialization through URLSearchParams would corrupt it. The toggle
    // must therefore operate on the raw search string.
    const externalTo = "https://sia.example.com/auth/connect/abc?next=%2Fsettings";
    const search = "?app=TestApp&to=" + encodeURIComponent(externalTo);
    renderWithRouter("/app-login" + search);

    fireEvent.click(screen.getByRole("tab", { name: "Create account" }));
    expect(window.location.search).toBe(search + "&mode=register");

    // Toggling back removes the step param and nothing else.
    fireEvent.click(screen.getByRole("tab", { name: "Login" }));
    expect(window.location.search).toBe(search);
    expect(mockGo).not.toHaveBeenCalled(); // replaceState, no navigation
  });

  it("deep-linking ?mode=register opens the register face directly", () => {
    const externalTo = "https://sia.example.com/auth/connect/abc123";
    renderWithRouter("/app-login?app=TestApp&mode=register&to=" + encodeURIComponent(externalTo));

    // Register face mounted (proxy button present) and `to` still intact.
    expect(screen.getByTestId("register-form-submit")).toBeDefined();
    expect(window.location.search).toContain(
      "to=" + encodeURIComponent(externalTo),
    );
  });

  it("register step returns to the level-preserved app-login chain, never to the external app directly", async () => {
    const externalTo = "https://sia.example.com/auth/connect/abc123";
    const chain = "/app-login?app=TestApp&to=" + encodeURIComponent(externalTo);
    renderWithRouter(chain);

    fireEvent.click(screen.getByRole("tab", { name: "Create account" }));
    fireEvent.click(screen.getByTestId("register-form-submit"));

    await waitFor(() =>
      expect(mockRegisterMutateAsync).toHaveBeenCalledTimes(1),
    );

    // authProvider.register() receives the internal chain URL (app + exactly
    // once-encoded `to`, byte-exact), not the raw external target — external
    // targets would be rerouted through /login and drop the chain.
    expect(mockRegisterMutateAsync.mock.calls[0][0].redirectTo).toBe(chain);

    // Refine's built-in useRegister onSuccess (emulated in the mock) brings
    // the user back into the chain — the app-login page then performs its
    // consent → app terminal nav on the login face. No hard-nav here.
    expect(mockGo).toHaveBeenCalledWith(
      expect.objectContaining({ to: chain, type: "replace" }),
    );
    expect(assignSpy).not.toHaveBeenCalled();
  });
});
