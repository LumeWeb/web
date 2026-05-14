/// <reference types="vitest/browser" />
import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "vitest-browser-react";
import { usePaymentEvents } from "@/ui/hooks/usePaymentEvents";
import { FragmentQueueProvider, useFragmentQueue } from "@/ui/context/FragmentQueueContext";
import { useEffect } from "react";
import type { ReactElement } from "react";

function TestComponent({
  sessionId,
  onCheckoutComplete,
  onPaymentSuccess,
  onPaymentCanceled,
  onPaymentError,
}: {
  sessionId?: string;
  onCheckoutComplete?: (sessionId: string) => void;
  onPaymentSuccess?: () => void;
  onPaymentCanceled?: () => void;
  onPaymentError?: (error: string) => void;
}) {
  usePaymentEvents({
    sessionId,
    onCheckoutComplete,
    onPaymentSuccess,
    onPaymentCanceled,
    onPaymentError,
  });
  return <div data-testid="test-component" />;
}

function renderWithQueue(element: ReactElement) {
  return render(<FragmentQueueProvider>{element}</FragmentQueueProvider>);
}

describe("usePaymentEvents", () => {
  afterEach(() => {
    delete (window as any).__eventTestSuccess;
    delete (window as any).__eventTestCanceled;
    delete (window as any).__eventTestError;
  });

  it("calls onPaymentSuccess callback on paymentSuccess event", async () => {
    const onPaymentSuccess = vi.fn();

    await renderWithQueue(
      <TestComponent
        onPaymentSuccess={onPaymentSuccess}
      />,
    );

    window.dispatchEvent(new CustomEvent("paymentSuccess", { bubbles: true }));

    await vi.waitFor(() => {
      expect(onPaymentSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it("calls onPaymentCanceled callback on paymentCanceled event", async () => {
    const onPaymentCanceled = vi.fn();

    await renderWithQueue(
      <TestComponent
        onPaymentCanceled={onPaymentCanceled}
      />,
    );

    window.dispatchEvent(new CustomEvent("paymentCanceled", { bubbles: true }));

    await vi.waitFor(() => {
      expect(onPaymentCanceled).toHaveBeenCalledTimes(1);
    });
  });

  it("calls onPaymentError callback with error on paymentError event", async () => {
    const onPaymentError = vi.fn();

    await renderWithQueue(
      <TestComponent
        onPaymentError={onPaymentError}
      />,
    );

    window.dispatchEvent(
      new CustomEvent("paymentError", {
        bubbles: true,
        detail: { error: "card_declined" },
      }),
    );

    await vi.waitFor(() => {
      expect(onPaymentError).toHaveBeenCalledTimes(1);
      expect(onPaymentError).toHaveBeenCalledWith("card_declined");
    });
  });

  it("calls onCheckoutComplete on paymentCompleted event", async () => {
    const onCheckoutComplete = vi.fn();

    await renderWithQueue(
      <TestComponent
        sessionId="sess-123"
        onCheckoutComplete={onCheckoutComplete}
      />,
    );

    await new Promise((resolve) => setTimeout(resolve, 10));
    window.dispatchEvent(new CustomEvent("paymentCompleted", { bubbles: true }));

    await vi.waitFor(() => {
      expect(onCheckoutComplete).toHaveBeenCalledTimes(1);
      expect(onCheckoutComplete).toHaveBeenCalledWith("sess-123");
    });
  });

  it("removes all payment event listeners on unmount", async () => {
    const onPaymentSuccess = vi.fn();
    const onPaymentCanceled = vi.fn();
    const onPaymentError = vi.fn();

    const screen = await renderWithQueue(
      <TestComponent
        onPaymentSuccess={onPaymentSuccess}
        onPaymentCanceled={onPaymentCanceled}
        onPaymentError={onPaymentError}
      />,
    );

    await screen.unmount();

    window.dispatchEvent(new CustomEvent("paymentSuccess", { bubbles: true }));
    window.dispatchEvent(new CustomEvent("paymentCanceled", { bubbles: true }));
    window.dispatchEvent(
      new CustomEvent("paymentError", {
        bubbles: true,
        detail: { error: "test" },
      }),
    );

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(onPaymentSuccess).not.toHaveBeenCalled();
    expect(onPaymentCanceled).not.toHaveBeenCalled();
    expect(onPaymentError).not.toHaveBeenCalled();
  });

  it("runs runCleanup on paymentCompleted through context", async () => {
    const cleanupCalled = { current: false };

    function TestCleanupComponent() {
      const { registerCleanup } = useFragmentQueue();
      useEffect(() => {
        registerCleanup(() => {
          cleanupCalled.current = true;
        });
      }, [registerCleanup]);
      return null;
    }

    await render(
      <FragmentQueueProvider>
        <TestCleanupComponent />
        <TestComponent sessionId="sess-cleanup" />
      </FragmentQueueProvider>,
    );

    await new Promise((resolve) => setTimeout(resolve, 10));
    window.dispatchEvent(new CustomEvent("paymentCompleted", { bubbles: true }));

    await vi.waitFor(() => {
      expect(cleanupCalled.current).toBe(true);
    });
  });
});
