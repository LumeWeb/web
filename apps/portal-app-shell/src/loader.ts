import { env } from "@lumeweb/portal-framework-core";

const DEFAULT_MESSAGES = [
  "Securing decentralized storage...",
  "Verifying cryptographic keys...",
  "Establishing privacy-first connections...",
  "Loading distributed network protocols...",
  "Encrypting user data workspace...",
  "Initializing zero-knowledge architecture...",
  "Configuring censorship-resistant services...",
  "Setting up peer-to-peer infrastructure...",
  "Preparing blockchain-verified storage...",
  "Finalizing privacy-preserving setup...",
];

export const BOOT_COMPLETE_EVENT = "portal:boot:complete";

/**
 * Options for constructing an AppLoader instance.
 * All DOM dependencies are injected so the class is testable
 * without a real document.
 */
export interface AppLoaderOptions {
  /** The document element to toggle `is-loading` on. */
  documentElement?: HTMLElement;
  /** Query selector for the loading overlay element. */
  overlaySelector?: string;
  /** Query selector for the loading message element. */
  messageSelector?: string;
  /** Messages to cycle through. Falls back to env or DEFAULT_MESSAGES. */
  messages?: string[];
  /** Interval between message changes, in ms. */
  messageIntervalMs?: number;
  /** Transition duration for overlay fade-out, in ms (fallback timer). */
  overlayFadeMs?: number;
  /** Document to query for elements. Defaults to global `document`. */
  document?: Document;
}

export class AppLoader {
  #isComplete = false;
  #loadingMessage: HTMLElement | null;
  #loadingOverlay: HTMLElement | null;
  #messageInterval: null | ReturnType<typeof setInterval> = null;
  #messages: string[];
  #previousMessageIndex: number | null = null;
  #messageIntervalMs: number;
  #overlayFadeMs: number;
  #documentElement: HTMLElement;
  #doc: Document;

  constructor(options: AppLoaderOptions = {}) {
    const doc = options.document ?? document;
    this.#doc = doc;
    this.#documentElement = options.documentElement ?? doc.documentElement;
    this.#loadingOverlay = this.#doc.querySelector<HTMLElement>(
      options.overlaySelector ?? ".loading-overlay",
    );
    this.#loadingMessage = this.#doc.querySelector<HTMLElement>(
      options.messageSelector ?? ".loading-message",
    );
    this.#messages =
      options.messages ??
      (env.VITE_PORTAL_BRAND?.loadingMessages?.length
        ? env.VITE_PORTAL_BRAND.loadingMessages
        : DEFAULT_MESSAGES);
    this.#messageIntervalMs = options.messageIntervalMs ?? 1500;
    this.#overlayFadeMs = options.overlayFadeMs ?? 600;
  }

  #getRandomMessageIndex(): number {
    let randomIndex: number;
    do {
      randomIndex = Math.floor(Math.random() * this.#messages.length);
    } while (this.#messages.length > 1 && randomIndex === this.#previousMessageIndex);

    this.#previousMessageIndex = randomIndex;
    return randomIndex;
  }

  #cycleMessage(): void {
    if (this.#isComplete || !this.#loadingMessage) return;

    // Fade out current message
    this.#loadingMessage.style.opacity = "0";

    setTimeout(() => {
      if (this.#isComplete || !this.#loadingMessage) return;
      // Change message
      const randomIndex = this.#getRandomMessageIndex();
      this.#loadingMessage.textContent = this.#messages[randomIndex];

      // Fade in new message
      this.#loadingMessage.style.opacity = "1";
    }, 250);
  }

  init(): void {
    // Start the loading sequence
    this.#startMessageCycling();
    this.#listenBootComplete();

    // If React already rendered and dispatched portal:boot:complete
    // before this script loaded (module federation timing), the event
    // was missed. Check if #root already has content and handle it.
    const root = this.#doc.getElementById("root");
    if (root && root.children.length > 0) {
      this.#handleBootComplete();
    }
  }

  #listenBootComplete(): void {
    this.#doc.addEventListener(BOOT_COMPLETE_EVENT, () => {
      this.#handleBootComplete();
    });
  }

  #handleBootComplete(): void {
    if (this.#isComplete) return;

    this.#isComplete = true;

    // Clear the message cycling interval
    if (this.#messageInterval) {
      clearInterval(this.#messageInterval);
      this.#messageInterval = null;
    }

    // Remove is-loading first so the CSS fade-out transition triggers
    // (opacity: 0 with 0.5s ease-out), then remove from DOM after it ends.
    this.#documentElement.classList.remove("is-loading");

    if (this.#loadingOverlay) {
      this.#loadingOverlay.addEventListener(
        "transitionend",
        (event) => {
          if (event.propertyName === "opacity") {
            this.#loadingOverlay?.remove();
          }
        },
        { once: true },
      );

      // Fallback in case transitionend doesn't fire
      setTimeout(() => {
        this.#loadingOverlay?.remove();
      }, this.#overlayFadeMs);
    }
  }

  #startMessageCycling(): void {
    // Cycle every N seconds
    this.#messageInterval = setInterval(
      () => this.#cycleMessage(),
      this.#messageIntervalMs,
    );
    this.#cycleMessage(); // Start immediately
  }

  /** Exposed for testing. */
  get isComplete(): boolean {
    return this.#isComplete;
  }

  /** Exposed for testing. */
  destroy(): void {
    if (this.#messageInterval) {
      clearInterval(this.#messageInterval);
      this.#messageInterval = null;
    }
  }
}

let loader: AppLoader | null = null;

export function getLoader(): AppLoader | null {
  return loader;
}

export function initLoader(): AppLoader {
  if (loader) return loader;
  loader = new AppLoader();
  loader.init();
  return loader;
}

// Auto-initialize on import only in browser context (not tests).
// Tests import { AppLoader } directly and control instantiation.
if (typeof document !== "undefined" && !import.meta.env?.VITEST) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initLoader();
    });
  } else {
    initLoader();
  }
}
