/// <reference types="vitest/browser" />
import { describe, it, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { FragmentRenderer } from "@/ui/components/FragmentRenderer";
import { FragmentQueueProvider } from "@/ui/context/FragmentQueueContext";
import type { CheckoutUIFragment } from "@/types/subscription";
import type { ReactElement } from "react";

vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

function renderWithQueue(element: ReactElement) {
  return render(<FragmentQueueProvider>{element}</FragmentQueueProvider>);
}

describe("FragmentRenderer", () => {
  it("renders link fragments", async () => {
    const fragments: CheckoutUIFragment[] = [
      { type: "link", link: "https://checkout.example.com", html: "Pay Now" },
    ];

    const screen = renderWithQueue(<FragmentRenderer fragments={fragments} sessionId="sess-1" />);

    await expect.element(page.getByText("Pay Now")).toBeVisible();
  });

  it("renders html fragments", async () => {
    const fragments: CheckoutUIFragment[] = [
      { type: "html", html: "<strong>Bold text</strong>" },
    ];

    const screen = renderWithQueue(<FragmentRenderer fragments={fragments} />);

    await expect.element(page.getByText("Bold text")).toBeVisible();
  });

  it("renders iframe fragments", async () => {
    const fragments: CheckoutUIFragment[] = [
      { type: "iframe", link: "https://checkout.example.com/embed" },
    ];

    const { container } = await renderWithQueue(<FragmentRenderer fragments={fragments} />);

    // Use CSS selector via querySelector to test iframe presence
    // Note: In browser tests, document may not include the rendered content directly
    const iframe = container.querySelector("iframe.fragment-iframe");
    expect(iframe).toBeTruthy();
    expect(iframe).toBeInstanceOf(HTMLIFrameElement);
    // The .src property returns the fully resolved URL with trailing slash
    expect((iframe as HTMLIFrameElement).src).toMatch(/^https:\/\/checkout\.example\.com\/embed\/?$/);
  });

  it("renders button fragments", async () => {
    const fragments: CheckoutUIFragment[] = [
      { type: "button", link: "https://pay.example.com", html: "Continue" },
    ];

    const screen = renderWithQueue(<FragmentRenderer fragments={fragments} />);

    await expect.element(page.getByText("Continue")).toBeVisible();
  });

  it("renders form fragments", async () => {
    const fragments: CheckoutUIFragment[] = [
      { type: "form", html: '<form><input name="token" /></form>' },
    ];

    const screen = renderWithQueue(<FragmentRenderer fragments={fragments} />);

    await expect.element(page.getByRole("textbox")).toBeVisible();
  });

  it("renders unknown type with console warning", async () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const fragments: CheckoutUIFragment[] = [
      { type: "custom_type" as any },
    ];

    renderWithQueue(<FragmentRenderer fragments={fragments} />);

    await vi.waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Unknown fragment type: custom_type");
    });

    consoleSpy.mockRestore();
  });

  it("handles undefined fragments gracefully", async () => {
    const screen = renderWithQueue(<FragmentRenderer fragments={undefined as any} />);

    // Should render without crashing
    const fragmentElements = document.querySelectorAll(".billing-fragment");
    expect(fragmentElements).toHaveLength(0);
  });

  it("injects CSS from fragments and cleans up on unmount", async () => {
    const fragments: CheckoutUIFragment[] = [
      { type: "html", html: "styled-content", css: ".test-class-vitest-xyz { color: red; }" },
    ];

    const { container, unmount } = await renderWithQueue(<FragmentRenderer fragments={fragments} />);

    await expect.element(page.getByText("styled-content")).toBeVisible();

    // Verify CSS was injected into document head
    const injectedStyle = document.querySelector('style[data-billing-fragments="true"]');
    expect(injectedStyle).toBeTruthy();
    expect(injectedStyle?.textContent).toContain(".test-class-vitest-xyz");

    await unmount();

    // Verify CSS was cleaned up from document head
    await vi.waitFor(() => {
      const remainingStyle = document.querySelector('style[data-billing-fragments="true"]');
      expect(remainingStyle).toBeFalsy();
    });
  });

  it("renders script fragments", async () => {
    const fragments: CheckoutUIFragment[] = [
      { type: "script", script: 'window.__testScript123 = true;' },
    ];

    const screen = renderWithQueue(<FragmentRenderer fragments={fragments} />);

    // Script fragments are wrapped in a container div with class fragment-script
    // Wait for useEffect to append script
    await vi.waitFor(() => {
      const scriptContainer = document.querySelector(".fragment-script");
      expect(scriptContainer).toBeTruthy();
      expect(scriptContainer?.querySelector("script")).toBeTruthy();
    });
  });

  it("removes appended script element on unmount for script fragments", async () => {
    const fragments: CheckoutUIFragment[] = [
      { type: "script", script: 'window.__cleanupTestScript = true;' },
    ];

    const screen = await renderWithQueue(<FragmentRenderer fragments={fragments} />);

    await vi.waitFor(() => {
      const scriptContainer = document.querySelector(".fragment-script");
      expect(scriptContainer).toBeTruthy();
      const scriptEl = scriptContainer?.querySelector("script");
      expect(scriptEl).toBeTruthy();
      expect(scriptEl?.textContent).toBe("window.__cleanupTestScript = true;");
    });

    await screen.unmount();

    // After unmount, the container and its script should be gone
    expect(document.querySelector(".fragment-script")).toBeFalsy();

    delete (window as any).__cleanupTestScript;
  });

  it("renders script_url fragments by appending to document.body", async () => {
    const fragments: CheckoutUIFragment[] = [
      { type: "script_url", script: "https://js.test.com/sdk.js" },
    ];

    renderWithQueue(<FragmentRenderer fragments={fragments} />);

    await vi.waitFor(() => {
      const script = document.querySelector('script[src="https://js.test.com/sdk.js"]');
      expect(script).toBeTruthy();
      expect(script).toBeInstanceOf(HTMLScriptElement);
    });
  });

  it("removes appended script element on unmount for script_url fragments", async () => {
    const fragments: CheckoutUIFragment[] = [
      { type: "script_url", script: "https://js.cleanup-test.com/cleanup.js" },
    ];

    const screen = await renderWithQueue(<FragmentRenderer fragments={fragments} />);

    // Wait for script to be appended
    await vi.waitFor(() => {
      const script = document.querySelector('script[src="https://js.cleanup-test.com/cleanup.js"]');
      expect(script).toBeTruthy();
    });

    // Wait for executeScript promise to resolve before unmounting
    await new Promise((resolve) => setTimeout(resolve, 100));

    await screen.unmount();

    // After unmount, the script should be removed from document.body
    await vi.waitFor(() => {
      const script = document.querySelector('script[src="https://js.cleanup-test.com/cleanup.js"]');
      expect(script).toBeFalsy();
    });
  });

  it("ignores non-http URLs in script_url fragments", async () => {
    const fragments: CheckoutUIFragment[] = [
      { type: "script_url", script: "javascript:alert('xss')" },
    ];

    renderWithQueue(<FragmentRenderer fragments={fragments} />);

    // Wait a tick to ensure useEffect ran
    await new Promise((resolve) => setTimeout(resolve, 50));

    // No script should be appended for non-http URLs
    const allScripts = Array.from(document.querySelectorAll('script'));
    const badScript = allScripts.find(s => s.src === "javascript:alert('xss')");
    expect(badScript).toBeFalsy();
  });

  it("sets async attribute on script_url fragments", async () => {
    const fragments: CheckoutUIFragment[] = [
      { type: "script_url", script: "https://js.async-test.com/async.js" },
    ];

    renderWithQueue(<FragmentRenderer fragments={fragments} />);

    await vi.waitFor(() => {
      const script = document.querySelector('script[src="https://js.async-test.com/async.js"]') as HTMLScriptElement;
      expect(script).toBeTruthy();
      expect(script.async).toBe(true);
    });
  });

  it("returns null for empty fragments", async () => {
    const screen = renderWithQueue(<FragmentRenderer fragments={[]} />);

    const wrapper = document.querySelector("[data-fragment-renderer]");
    expect(wrapper?.innerHTML ?? document.body.innerHTML).not.toContain("fragment");
  });

  it("renders modal fragments", async () => {
    const fragments: CheckoutUIFragment[] = [
      { type: "modal", html: "<p>Modal content</p>" },
    ];

    const screen = renderWithQueue(<FragmentRenderer fragments={fragments} />);

    await expect.element(page.getByText("Modal content")).toBeVisible();
  });

  describe("HTML entity decoding", () => {
    it("decodes HTML entities in html fragments", async () => {
      const fragments: CheckoutUIFragment[] = [
        { type: "html", html: "&lt;strong&gt;Bold text&lt;/strong&gt;" },
      ];

      const screen = renderWithQueue(<FragmentRenderer fragments={fragments} />);

      await expect.element(page.getByText("Bold text")).toBeVisible();
    });

    it("decodes HTML entities in modal fragments", async () => {
      const fragments: CheckoutUIFragment[] = [
        { type: "modal", html: "&lt;p&gt;Modal content&lt;/p&gt;" },
      ];

      const screen = renderWithQueue(<FragmentRenderer fragments={fragments} />);

      await expect.element(page.getByText("Modal content")).toBeVisible();
    });

    it("decodes HTML entities in form fragments", async () => {
      const fragments: CheckoutUIFragment[] = [
        { type: "form", html: '&lt;form&gt;&lt;input name="token" /&gt;&lt;/form&gt;' },
      ];

      const screen = renderWithQueue(<FragmentRenderer fragments={fragments} />);

      await expect.element(page.getByRole("textbox")).toBeVisible();
    });

    it("decodes HTML entities in link fragment text", async () => {
      const fragments: CheckoutUIFragment[] = [
        { type: "link", link: "https://checkout.example.com", html: "Pay &amp; Continue" },
      ];

      const screen = renderWithQueue(<FragmentRenderer fragments={fragments} />);

      await expect.element(page.getByText("Pay & Continue")).toBeVisible();
    });

    it("decodes HTML entities in button fragment text", async () => {
      const fragments: CheckoutUIFragment[] = [
        { type: "button", link: "https://pay.example.com", html: "Pay &amp; Subscribe" },
      ];

      const screen = renderWithQueue(<FragmentRenderer fragments={fragments} />);

      await expect.element(page.getByText("Pay & Subscribe")).toBeVisible();
    });

    it("decodes HTML entities in script fragments", async () => {
      const fragments: CheckoutUIFragment[] = [
        { type: "script", script: "window.__testDecode = &apos;hello&apos;;" },
      ];

      const screen = renderWithQueue(<FragmentRenderer fragments={fragments} />);

      await vi.waitFor(() => {
        const scriptContainer = document.querySelector(".fragment-script");
        expect(scriptContainer).toBeTruthy();
        const scriptEl = scriptContainer?.querySelector("script");
        expect(scriptEl).toBeTruthy();
        expect(scriptEl?.textContent).toBe("window.__testDecode = 'hello';");
      });
    });

    it("decodes numeric character references in html fragments", async () => {
      const fragments: CheckoutUIFragment[] = [
        { type: "html", html: "&#60;strong&#62;Decoded&#60;/strong&#62;" },
      ];

      const screen = renderWithQueue(<FragmentRenderer fragments={fragments} />);

      await expect.element(page.getByText("Decoded")).toBeVisible();
    });

    it("decodes hex character references in html fragments", async () => {
      const fragments: CheckoutUIFragment[] = [
        { type: "html", html: "&#x3C;strong&#x3E;Hex decoded&#x3C;/strong&#x3E;" },
      ];

      const screen = renderWithQueue(<FragmentRenderer fragments={fragments} />);

      await expect.element(page.getByText("Hex decoded")).toBeVisible();
    });

    it("handles mixed HTML entities like Stripe checkout response", async () => {
      const fragments: CheckoutUIFragment[] = [
        { type: "html", html: "&lt;div id=\"stripe-checkout\"&gt;&lt;/div&gt;" },
      ];

      renderWithQueue(<FragmentRenderer fragments={fragments} />);

      await vi.waitFor(() => {
        const div = document.querySelector("#stripe-checkout");
        expect(div).toBeTruthy();
      });
    });

    it("handles already-decoded HTML without double-encoding", async () => {
      const fragments: CheckoutUIFragment[] = [
        { type: "html", html: "<strong>Normal HTML</strong>" },
      ];

      const screen = renderWithQueue(<FragmentRenderer fragments={fragments} />);

      await expect.element(page.getByText("Normal HTML")).toBeVisible();
    });
  });

  describe("Inline script execution in HTML fragments", () => {
    it("executes inline scripts within html fragments", async () => {
      const fragments: CheckoutUIFragment[] = [
        {
          type: "html",
          html: '<div id="inline-script-target"></div><script>window.__inlineScriptRan = true;</script>',
        },
      ];

      renderWithQueue(<FragmentRenderer fragments={fragments} />);

      await vi.waitFor(() => {
        expect((window as any).__inlineScriptRan).toBe(true);
      });

      delete (window as any).__inlineScriptRan;
    });

    it("executes inline scripts with encoded HTML entities", async () => {
      const fragments: CheckoutUIFragment[] = [
        {
          type: "html",
          html: "&lt;div id=\"encoded-script-target\"&gt;&lt;/div&gt;&lt;script&gt;window.__encodedScriptRan = true;&lt;/script&gt;",
        },
      ];

      renderWithQueue(<FragmentRenderer fragments={fragments} />);

      await vi.waitFor(() => {
        expect((window as any).__encodedScriptRan).toBe(true);
      });

      delete (window as any).__encodedScriptRan;
    });

    it("preserves script src attributes when re-creating scripts", async () => {
      const fragments: CheckoutUIFragment[] = [
        {
          type: "html",
          html: '<div id="external-script-target"></div><script src="https://js.stripe.com/dahlia/stripe.js"></script>',
        },
      ];

      renderWithQueue(<FragmentRenderer fragments={fragments} />);

      await vi.waitFor(() => {
        const script = document.querySelector('.fragment-html script[src="https://js.stripe.com/dahlia/stripe.js"]');
        expect(script).toBeTruthy();
      });
    });

    it("executes Stripe-style checkout html fragment", async () => {
      const html = [
        '<div id="stripe-checkout-container">',
        '  <div id="stripe-checkout"></div>',
        '</div>',
        '<script>window.__stripeCheckoutInit = true;</script>',
      ].join("\n");

      const fragments: CheckoutUIFragment[] = [
        { type: "html", html },
      ];

      renderWithQueue(<FragmentRenderer fragments={fragments} />);

      await vi.waitFor(() => {
        expect(document.querySelector("#stripe-checkout")).toBeTruthy();
        expect((window as any).__stripeCheckoutInit).toBe(true);
      });

      delete (window as any).__stripeCheckoutInit;
    });
  });


});
