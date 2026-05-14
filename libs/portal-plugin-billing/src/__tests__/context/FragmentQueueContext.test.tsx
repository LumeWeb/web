/// <reference types="vitest/browser" />
import { describe, it, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import { FragmentQueueProvider, useFragmentQueue } from "@/ui/context/FragmentQueueContext";
import { useEffect, useRef } from "react";

type QueueReadyCallback = (queue: ReturnType<typeof useFragmentQueue>) => void;

interface TestComponentProps {
  onQueueReady?: QueueReadyCallback;
  testScriptExecution?: boolean;
  testInlineScripts?: boolean;
}

function TestComponent({
  onQueueReady,
  testScriptExecution,
  testInlineScripts,
}: TestComponentProps) {
  const queue = useFragmentQueue();
  const containerRef = useRef<HTMLDivElement>(null);
  const executedRef = useRef(false);

  useEffect(() => {
    if (onQueueReady && !executedRef.current) {
      executedRef.current = true;
      onQueueReady(queue);
    }
  }, [onQueueReady, queue]);

  useEffect(() => {
    if (testScriptExecution && containerRef.current) {
      const script = document.createElement("script");
      script.textContent = "window.__queueTestScript = true;";
      queue.executeScript(script, containerRef.current);
    }
  }, [testScriptExecution, queue]);

  useEffect(() => {
    if (testInlineScripts && containerRef.current) {
      containerRef.current.innerHTML =
        '<script>window.__queueInlineTest = true;</script><script>window.__queueSecondTest = true;</script>';
      queue.executeInlineScripts(containerRef.current);
    }
  }, [testInlineScripts, queue]);

  return <div ref={containerRef} data-testid="script-container" />;
}

describe("FragmentQueueContext", () => {
  it("provides queue to children", async () => {
    const onQueueReady = vi.fn();

    render(
      <FragmentQueueProvider>
        <TestComponent onQueueReady={onQueueReady} />
      </FragmentQueueProvider>,
    );

    await vi.waitFor(() => {
      expect(onQueueReady).toHaveBeenCalledWith(
        expect.objectContaining({
          queue: expect.any(Object),
          executeScript: expect.any(Function),
          executeInlineScripts: expect.any(Function),
        }),
      );
    });
  });

  it("throws when useFragmentQueue is called outside provider", async () => {
    function ComponentWithoutProvider() {
      try {
        useFragmentQueue();
        return null;
      } catch (error) {
        return <div data-testid="error">{String(error)}</div>;
      }
    }

    const screen = render(<ComponentWithoutProvider />);

    await vi.waitFor(() => {
      const errorEl = document.querySelector('[data-testid="error"]');
      expect(errorEl?.textContent).toContain(
        "useFragmentQueue must be used within FragmentQueueProvider",
      );
    });
  });

  it("executes scripts sequentially via queue", async () => {
    const executionOrder: number[] = [];

    function SequentialTest() {
      const queue = useFragmentQueue();
      const containerRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
        if (!containerRef.current) return;

        const script1 = document.createElement("script");
        script1.textContent = "window.__seq1 = true;";

        const script2 = document.createElement("script");
        script2.textContent = "window.__seq2 = true;";

        Promise.all([
          queue
            .executeScript(script1, containerRef.current)
            .then(() => executionOrder.push(1)),
          queue
            .executeScript(script2, containerRef.current)
            .then(() => executionOrder.push(2)),
        ]);
      }, [queue]);

      return <div ref={containerRef} data-testid="container" />;
    }

    render(
      <FragmentQueueProvider>
        <SequentialTest />
      </FragmentQueueProvider>,
    );

    await vi.waitFor(() => {
      expect(executionOrder).toHaveLength(2);
    });

    expect(executionOrder[0]).toBe(1);
    expect(executionOrder[1]).toBe(2);

    delete (window as any).__seq1;
    delete (window as any).__seq2;
  });

  it("executes inline scripts in order via executeInlineScripts", async () => {
    (window as any).__inlineOrder = [];

    function InlineScriptTest() {
      const queue = useFragmentQueue();
      const containerRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
        if (!containerRef.current) return;

        containerRef.current.innerHTML = [
          '<script>window.__inlineOrder.push(1)</script>',
          '<script>window.__inlineOrder.push(2)</script>',
          '<script>window.__inlineOrder.push(3)</script>',
        ].join("");

        queue.executeInlineScripts(containerRef.current);
      }, [queue]);

      return <div ref={containerRef} data-testid="inline-container" />;
    }

    render(
      <FragmentQueueProvider>
        <InlineScriptTest />
      </FragmentQueueProvider>,
    );

    await vi.waitFor(() => {
      expect((window as any).__inlineOrder).toEqual([1, 2, 3]);
    });

    delete (window as any).__inlineOrder;
  });

  it("preserves script attributes when executing", async () => {
    function ScriptAttributesTest() {
      const queue = useFragmentQueue();
      const containerRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
        if (!containerRef.current) return;

        const script = document.createElement("script");
        script.setAttribute("data-test", "value123");
        script.setAttribute("type", "module");
        script.textContent = "window.__attrTest = true;";

        queue.executeScript(script, containerRef.current);
      }, [queue]);

      return <div ref={containerRef} data-testid="attr-container" />;
    }

    render(
      <FragmentQueueProvider>
        <ScriptAttributesTest />
      </FragmentQueueProvider>,
    );

    await vi.waitFor(() => {
      const container = document.querySelector('[data-testid="attr-container"]');
      const script = container?.querySelector("script");
      expect(script).toBeTruthy();
      expect(script?.getAttribute("data-test")).toBe("value123");
      expect(script?.getAttribute("type")).toBe("module");
    });

    delete (window as any).__attrTest;
  });

  it("handles external script loading with src attribute", async () => {
    function ExternalScriptTest() {
      const queue = useFragmentQueue();
      const containerRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
        if (!containerRef.current) return;

        const script = document.createElement("script");
        script.src = "data:text/javascript,window.__externalScriptTest=true";

        queue.executeScript(script, containerRef.current);
      }, [queue]);

      return <div ref={containerRef} data-testid="external-container" />;
    }

    render(
      <FragmentQueueProvider>
        <ExternalScriptTest />
      </FragmentQueueProvider>,
    );

    await vi.waitFor(
      () => {
        const container = document.querySelector('[data-testid="external-container"]');
        const script = container?.querySelector("script");
        expect(script).toBeTruthy();
        expect(script?.hasAttribute("src")).toBe(true);
      },
      { timeout: 5000 },
    );
  });

  it("executes scripts when mounted and provider exists", async () => {
    const executionLog: string[] = [];

    function RemovableComponent() {
      const queue = useFragmentQueue();
      const containerRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
        if (!containerRef.current) return;

        const script = document.createElement("script");
        script.textContent = "window.__mountTest = true;";

        queue.executeScript(script, containerRef.current).then(() => {
          executionLog.push("script-executed");
        });
      }, [queue]);

      return <div ref={containerRef} data-testid="cleanup-container" />;
    }

    await render(
      <FragmentQueueProvider>
        <RemovableComponent />
      </FragmentQueueProvider>,
    );

    await vi.waitFor(() => {
      expect(executionLog).toContain("script-executed");
    });

    delete (window as any).__mountTest;
  });

  it("prevents script execution after provider unmount", async () => {
    let queueRef: ReturnType<typeof useFragmentQueue> | null = null;

    function CaptureQueueComponent() {
      const queue = useFragmentQueue();
      const containerRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
        queueRef = queue;
      }, [queue]);

      return <div ref={containerRef} data-testid="unmount-container" />;
    }

    const screen = await render(
      <FragmentQueueProvider>
        <CaptureQueueComponent />
      </FragmentQueueProvider>,
    );

    await vi.waitFor(() => {
      expect(queueRef).toBeTruthy();
    });

    await screen.unmount();

    // After unmount, attempt to execute a script via the captured queue reference.
    // The abortedRef should prevent DOM mutations.
    const orphanDiv = document.createElement("div");
    orphanDiv.setAttribute("data-testid", "orphan-container");
    document.body.appendChild(orphanDiv);

    const script = document.createElement("script");
    script.textContent = "window.__shouldNeverRun = true;";

    queueRef!.executeScript(script, orphanDiv);

    // Give a tick for any potential execution
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect((window as any).__shouldNeverRun).toBeUndefined();
    expect(orphanDiv.querySelector("script")).toBeFalsy();

    orphanDiv.remove();
  });

  it("prevents inline script execution after provider unmount", async () => {
    let queueRef: ReturnType<typeof useFragmentQueue> | null = null;

    function CaptureQueueComponent() {
      const queue = useFragmentQueue();
      const containerRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
        queueRef = queue;
      }, [queue]);

      return <div ref={containerRef} data-testid="unmount-inline-container" />;
    }

    const screen = await render(
      <FragmentQueueProvider>
        <CaptureQueueComponent />
      </FragmentQueueProvider>,
    );

    await vi.waitFor(() => {
      expect(queueRef).toBeTruthy();
    });

    await screen.unmount();

    // After unmount, attempt inline script execution via the captured queue.
    const orphanDiv = document.createElement("div");
    orphanDiv.innerHTML = '<script>window.__inlineShouldNeverRun = true;</script>';
    document.body.appendChild(orphanDiv);

    queueRef!.executeInlineScripts(orphanDiv);

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect((window as any).__inlineShouldNeverRun).toBeUndefined();
    orphanDiv.remove();
  });

  it("executes and clears global cleanup functions from globalThis.__PAYMENT_CLEANUP", async () => {
    const globalCleanupFn1 = vi.fn();
    const globalCleanupFn2 = vi.fn();
    let queueRef: ReturnType<typeof useFragmentQueue> | null = null;

    function TestGlobalCleanupComponent() {
      const queue = useFragmentQueue();

      useEffect(() => {
        queueRef = queue;
        // Simulate gateway templates pushing cleanup functions to global array
        (globalThis as any).__PAYMENT_CLEANUP = [globalCleanupFn1, globalCleanupFn2];
      }, [queue]);

      return <div data-testid="global-cleanup" />;
    }

    render(
      <FragmentQueueProvider>
        <TestGlobalCleanupComponent />
      </FragmentQueueProvider>,
    );

    // Wait for component to mount and queueRef to be set
    await vi.waitFor(() => {
      expect(queueRef).toBeTruthy();
    });

    // Verify the global array has the cleanup functions
    expect((globalThis as any).__PAYMENT_CLEANUP).toHaveLength(2);

    // Run cleanup
    queueRef!.runCleanup();

    // Verify global cleanup functions were called
    await vi.waitFor(() => {
      expect(globalCleanupFn1).toHaveBeenCalledTimes(1);
      expect(globalCleanupFn2).toHaveBeenCalledTimes(1);
    });

    // Verify the global array was cleared
    expect((globalThis as any).__PAYMENT_CLEANUP).toEqual([]);

    // Clean up global state
    delete (globalThis as any).__PAYMENT_CLEANUP;
  });

  it("passes abort signal to executeScript and respects pre-aborted state", async () => {
    const controller = new AbortController();
    controller.abort(); // Pre-abort

    let queueRef: ReturnType<typeof useFragmentQueue> | null = null;
    let scriptExecuted = false;

    function PreAbortTest() {
      const queue = useFragmentQueue();
      const containerRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
        queueRef = queue;
        if (!containerRef.current) return;

        const script = document.createElement("script");
        script.textContent = "window.__preAbortExecuted = true;";

        queue.executeScript(script, containerRef.current, controller.signal).then(() => {
          scriptExecuted = true;
        });
      }, [queue]);

      return <div ref={containerRef} data-testid="pre-abort-container" />;
    }

    render(
      <FragmentQueueProvider>
        <PreAbortTest />
      </FragmentQueueProvider>,
    );

    await vi.waitFor(() => {
      expect(queueRef).toBeTruthy();
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    // Script should not have executed
    expect(scriptExecuted).toBe(true); // Promise resolves but script not appended
    expect((window as any).__preAbortExecuted).toBeUndefined();
    expect(document.querySelector('[data-testid="pre-abort-container"]')?.querySelector("script")).toBeFalsy();

    delete (window as any).__preAbortExecuted;
  });

  it("passes abort signal to executeInlineScripts and respects pre-aborted state", async () => {
    const controller = new AbortController();
    controller.abort(); // Pre-abort

    let queueRef: ReturnType<typeof useFragmentQueue> | null = null;
    let executionFinished = false;

    function PreAbortInlineTest() {
      const queue = useFragmentQueue();
      const containerRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
        queueRef = queue;
        if (!containerRef.current) return;

        containerRef.current.innerHTML = '<script>window.__preAbortInline = true;</script>';

        queue.executeInlineScripts(containerRef.current, controller.signal).then(() => {
          executionFinished = true;
        });
      }, [queue]);

      return <div ref={containerRef} data-testid="pre-abort-inline-container" />;
    }

    render(
      <FragmentQueueProvider>
        <PreAbortInlineTest />
      </FragmentQueueProvider>,
    );

    await vi.waitFor(() => {
      expect(queueRef).toBeTruthy();
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    // Script should not have executed
    expect(executionFinished).toBe(true); // Promise resolves but script not replaced/executed
    expect((window as any).__preAbortInline).toBeUndefined();
    expect(document.querySelector('[data-testid="pre-abort-inline-container"]')?.querySelector("script")).toBeFalsy();

    delete (window as any).__preAbortInline;
  });
});
