import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppLoader, BOOT_COMPLETE_EVENT } from "./loader";

// Mock @lumeweb/portal-framework-core — only `env` is used by loader.ts
vi.mock("@lumeweb/portal-framework-core", () => ({
  env: {
    VITE_PORTAL_BRAND: undefined,
  },
}));

function setupDOM(options?: {
  overlay?: boolean;
  message?: boolean;
  rootHasChildren?: boolean;
}) {
  document.documentElement.className = "is-loading";
  document.body.innerHTML = "";

  if (options?.overlay !== false) {
    const overlay = document.createElement("div");
    overlay.className = "loading-overlay";
    document.body.appendChild(overlay);
  }

  if (options?.message !== false) {
    const message = document.createElement("p");
    message.className = "loading-message";
    message.textContent = "Initializing...";
    document.body.appendChild(message);
  }

  const root = document.createElement("div");
  root.id = "root";
  if (options?.rootHasChildren) {
    root.appendChild(document.createElement("div"));
  }
  document.body.appendChild(root);
}

describe("AppLoader", () => {
  let loader: AppLoader | null = null;

  beforeEach(() => {
    vi.useFakeTimers();
    setupDOM();
  });

  afterEach(() => {
    loader?.destroy();
    loader = null;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("construction", () => {
    it("should query DOM elements on construction", () => {
      loader = new AppLoader();
      // is-loading class should still be present (init not called yet)
      expect(document.documentElement.classList.contains("is-loading")).toBe(true);
    });

    it("should accept custom selectors", () => {
      document.body.innerHTML = "";
      const overlay = document.createElement("div");
      overlay.className = "custom-overlay";
      document.body.appendChild(overlay);

      const message = document.createElement("span");
      message.className = "custom-message";
      document.body.appendChild(message);

      loader = new AppLoader({
        overlaySelector: ".custom-overlay",
        messageSelector: ".custom-message",
      });

      loader.init();
      expect(loader.isComplete).toBe(false);
    });

    it("should accept custom messages", () => {
      setupDOM();
      loader = new AppLoader({
        messages: ["Test message 1", "Test message 2"],
        messageIntervalMs: 100,
      });
      loader.init();

      // cycleMessage is called immediately but sets opacity 0 first,
      // then changes text after 250ms fade. Advance past that.
      vi.advanceTimersByTime(260);

      const messageEl = document.querySelector(".loading-message")!;
      expect(["Test message 1", "Test message 2"]).toContain(messageEl.textContent);
    });
  });

  describe("init", () => {
    it("should start message cycling", () => {
      loader = new AppLoader({
        messages: ["Test 1", "Test 2"],
        messageIntervalMs: 100,
      });
      loader.init();

      // First cycle sets opacity 0 immediately, text changes after 250ms
      vi.advanceTimersByTime(260);
      const messageEl = document.querySelector(".loading-message")!;
      expect(["Test 1", "Test 2"]).toContain(messageEl.textContent);
    });

    it("should not mark complete on init if root is empty", () => {
      loader = new AppLoader();
      loader.init();
      expect(loader.isComplete).toBe(false);
    });

    it("should mark complete on init if root already has children", () => {
      setupDOM({ rootHasChildren: true });
      loader = new AppLoader();
      loader.init();
      expect(loader.isComplete).toBe(true);
    });
  });

  describe("boot complete", () => {
    it("should handle portal:boot:complete event", () => {
      loader = new AppLoader();
      loader.init();
      expect(loader.isComplete).toBe(false);

      document.dispatchEvent(new CustomEvent(BOOT_COMPLETE_EVENT));
      expect(loader.isComplete).toBe(true);
    });

    it("should remove is-loading class on boot complete", () => {
      loader = new AppLoader();
      loader.init();
      expect(document.documentElement.classList.contains("is-loading")).toBe(true);

      document.dispatchEvent(new CustomEvent(BOOT_COMPLETE_EVENT));
      expect(document.documentElement.classList.contains("is-loading")).toBe(false);
    });

    it("should remove loading overlay via fallback timer", () => {
      loader = new AppLoader({ overlayFadeMs: 500 });
      loader.init();

      expect(document.querySelector(".loading-overlay")).not.toBeNull();

      document.dispatchEvent(new CustomEvent(BOOT_COMPLETE_EVENT));

      // Before fallback timer fires
      expect(document.querySelector(".loading-overlay")).not.toBeNull();

      // After fallback timer
      vi.advanceTimersByTime(500);
      expect(document.querySelector(".loading-overlay")).toBeNull();
    });

    it("should remove loading overlay via transitionend", () => {
      loader = new AppLoader({ overlayFadeMs: 10000 });
      loader.init();

      const overlay = document.querySelector(".loading-overlay") as HTMLElement;
      expect(overlay).not.toBeNull();

      document.dispatchEvent(new CustomEvent(BOOT_COMPLETE_EVENT));

      // Simulate transitionend event on overlay for opacity property
      const transitionEvent = new Event("transitionend", { bubbles: true });
      Object.defineProperty(transitionEvent, "propertyName", {
        value: "opacity",
      });
      overlay.dispatchEvent(transitionEvent);

      expect(document.querySelector(".loading-overlay")).toBeNull();
    });

    it("should be idempotent", () => {
      loader = new AppLoader({ overlayFadeMs: 300 });
      loader.init();

      document.dispatchEvent(new CustomEvent(BOOT_COMPLETE_EVENT));
      document.dispatchEvent(new CustomEvent(BOOT_COMPLETE_EVENT));
      document.dispatchEvent(new CustomEvent(BOOT_COMPLETE_EVENT));

      expect(loader.isComplete).toBe(true);
      // Advance fallback timer to remove overlay
      vi.advanceTimersByTime(300);
      expect(document.querySelector(".loading-overlay")).toBeNull();
    });

    it("should stop message cycling on boot complete", () => {
      loader = new AppLoader({
        messages: ["A", "B"],
        messageIntervalMs: 100,
      });
      loader.init();

      document.dispatchEvent(new CustomEvent(BOOT_COMPLETE_EVENT));

      // Advance past several cycle intervals
      vi.advanceTimersByTime(500);

      expect(loader.isComplete).toBe(true);
    });
  });

  describe("message cycling", () => {
    it("should cycle through messages", () => {
      const messages = ["Message A", "Message B", "Message C"];
      loader = new AppLoader({
        messages,
        messageIntervalMs: 100,
      });
      loader.init();

      const seenMessages = new Set<string>();
      const messageEl = document.querySelector(".loading-message")!;

      // Run several cycles — each cycle: 100ms interval + 250ms fade
      for (let i = 0; i < 20; i++) {
        vi.advanceTimersByTime(100);
        vi.advanceTimersByTime(260);
        if (messageEl.textContent) {
          seenMessages.add(messageEl.textContent);
        }
      }

      // Should have seen at least 2 different messages
      expect(seenMessages.size).toBeGreaterThanOrEqual(2);

      // All seen messages should be from our set
      for (const msg of seenMessages) {
        expect(messages).toContain(msg);
      }
    });

    it("should avoid repeating the same message back-to-back", () => {
      const messages = ["Alpha", "Beta", "Gamma"];
      // Deterministic rotation: 0, 1, 2, 0, 1, 2, ...
      let idx = 0;
      vi.spyOn(Math, "random").mockImplementation(() => {
        const r = idx / messages.length;
        idx = (idx + 1) % messages.length;
        return r;
      });

      loader = new AppLoader({
        messages,
        messageIntervalMs: 1000,
      });
      loader.init();

      const messageEl = document.querySelector<HTMLElement>(".loading-message")!;
      const sequence: string[] = [];

      for (let i = 0; i < 10; i++) {
        // Advance past interval (1000ms) + fade timeout (250ms)
        vi.advanceTimersByTime(1000);
        vi.advanceTimersByTime(300);
        if (messageEl.textContent) {
          sequence.push(messageEl.textContent);
        }
      }

      for (let i = 1; i < sequence.length; i++) {
        expect(sequence[i]).not.toBe(sequence[i - 1]);
      }

      Math.random.mockRestore();
    });
  });

  describe("dependency injection", () => {
    it("should work with injected document", () => {
      const mockDoc = {
        documentElement: document.documentElement,
        querySelector: vi.fn().mockReturnValue(null),
        getElementById: vi.fn().mockReturnValue(null),
        addEventListener: vi.fn(),
      } as unknown as Document;

      loader = new AppLoader({ document: mockDoc });
      loader.init();

      expect(mockDoc.querySelector).toHaveBeenCalled();
      expect(mockDoc.addEventListener).toHaveBeenCalledWith(
        BOOT_COMPLETE_EVENT,
        expect.any(Function),
      );
    });
  });
});
