import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import PQueue from "p-queue";
import { copyScriptAttributes, attachScriptHandlers } from "./FragmentQueueHelpers";

interface FragmentQueueContextValue {
  queue: PQueue;
  executeScript: (scriptElement: HTMLScriptElement, mountPoint: HTMLElement, signal?: AbortSignal) => Promise<HTMLScriptElement | void>;
  executeInlineScripts: (container: HTMLElement, signal?: AbortSignal) => Promise<void>;
  registerCleanup: (cleanup: () => void) => void;
  runCleanup: () => void;
}

const FragmentQueueContext = createContext<FragmentQueueContextValue | null>(null);

export function FragmentQueueProvider({ children }: { children: ReactNode }) {
  const queueRef = useRef<PQueue | null>(null);
  const abortedRef = useRef(false);
  const cleanupRef = useRef<Set<() => void>>(new Set());

  if (!queueRef.current) {
    queueRef.current = new PQueue({ concurrency: 1 });
  }

  const registerCleanup = (cleanup: () => void): void => {
    cleanupRef.current.add(cleanup);
  };

  const runCleanup = () => {
    // Run registered cleanup functions
    cleanupRef.current.forEach(fn => fn());
    cleanupRef.current.clear();
    
    // Also run global cleanup for backward compatibility
    const globalCleanup = (globalThis as any).__PAYMENT_CLEANUP || [];
    globalCleanup.forEach((fn: () => void) => fn());
    (globalThis as any).__PAYMENT_CLEANUP = [];
  };

  useEffect(() => {
    // Reset aborted state on mount (handles StrictMode remounts)
    abortedRef.current = false;

    return () => {
      runCleanup();
      abortedRef.current = true;
      queueRef.current?.clear();
      queueRef.current = null;
    };
  }, []);

  const queue = queueRef.current!;

  function isAborted(signal?: AbortSignal): boolean {
    return abortedRef.current || !!signal?.aborted;
  }

  async function executeScript(scriptElement: HTMLScriptElement, mountPoint: HTMLElement, signal?: AbortSignal): Promise<HTMLScriptElement | void> {
    return queue.add(() => {
      if (isAborted(signal)) return Promise.resolve();

      return new Promise<HTMLScriptElement | void>((resolve) => {
        const script = document.createElement("script");
        copyScriptAttributes(scriptElement, script);
        script.textContent = scriptElement.textContent;

        attachScriptHandlers(script, () => resolve(script), signal);

        if (!script.src) {
          // Inline scripts execute synchronously but don't fire load events
          mountPoint.appendChild(script);
          // Manually trigger resolution for inline scripts after append
          if (!isAborted(signal)) {
            resolve(script);
          }
        } else {
          mountPoint.appendChild(script);
        }
      });
    });
  }

  async function executeInlineScripts(container: HTMLElement, signal?: AbortSignal): Promise<void> {
    const scripts = container.querySelectorAll("script");
    for (const script of scripts) {
      await executeScript(script as HTMLScriptElement, container, signal);
    }
    // Clean up any remaining scripts if aborted
    if (isAborted(signal)) {
      container.querySelectorAll("script").forEach(s => s.remove());
    }
  }

  return (
    <FragmentQueueContext.Provider value={{ queue, executeScript, executeInlineScripts, registerCleanup, runCleanup }}>
      {children}
    </FragmentQueueContext.Provider>
  );
}

export function useFragmentQueue(): FragmentQueueContextValue {
  const context = useContext(FragmentQueueContext);
  if (!context) {
    throw new Error("useFragmentQueue must be used within FragmentQueueProvider");
  }
  return context;
}
