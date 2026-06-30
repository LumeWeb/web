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

class AppLoader {
  #isComplete = false;
  #loadingMessage: HTMLElement = document.querySelector(".loading-message")!;
  #loadingOverlay: HTMLElement = document.querySelector(".loading-overlay")!;
  #messageInterval: null | ReturnType<typeof setInterval> = null;
  #messages = env.VITE_PORTAL_BRAND?.loadingMessages ?? DEFAULT_MESSAGES;
  #previousMessageIndex: number | null = null;
  constructor() {
    this.#init();
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
    if (this.#isComplete) return;

    // Fade out current message
    this.#loadingMessage.style.opacity = "0";

    setTimeout(() => {
      // Change message
      const randomIndex = this.#getRandomMessageIndex();
      this.#loadingMessage.textContent = this.#messages[randomIndex];

      // Fade in new message
      this.#loadingMessage.style.opacity = "1";
    }, 250);
  }

  #init(): void {
    // Start the loading sequence
    this.#startMessageCycling();
    this.#listenBootComplete();

    // If React already rendered and dispatched portal:boot:complete
    // before this script loaded (module federation timing), the event
    // was missed. Check if #root already has content and handle it.
    const root = document.getElementById("root");
    if (root && root.children.length > 0) {
      this.#handleBootComplete();
    }
  }

  #listenBootComplete(): void {
    // Listen for the portal boot completion event.
    // On both success and error, remove the overlay so the React tree
    // (which renders ErrorDisplay on failure) becomes visible.
    document.addEventListener('portal:boot:complete', () => {
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
    document.documentElement.classList.remove('is-loading');

    if (this.#loadingOverlay) {
      this.#loadingOverlay.addEventListener("transitionend", (event) => {
        if (event.propertyName === "opacity") {
          this.#loadingOverlay.remove();
        }
      }, { once: true });

      // Fallback in case transitionend doesn't fire
      setTimeout(() => {
        this.#loadingOverlay?.remove();
      }, 600);

      console.log("App loading complete - framework initialization finished");
    }
  }

  #startMessageCycling(): void {
    // Cycle every 1.5 seconds
    this.#messageInterval = setInterval(() => this.#cycleMessage(), 1500);
    this.#cycleMessage(); // Start immediately
  }
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new AppLoader();
  });
} else {
  new AppLoader();
}
