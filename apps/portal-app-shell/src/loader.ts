class AppLoader {
  #isComplete = false;
  #loadingMessage: HTMLElement = document.querySelector(".loading-message")!;
  #loadingOverlay: HTMLElement = document.querySelector(".loading-overlay")!;
  #messageInterval: null | number = null;
  #messages = [
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
    this.#listenReady();
  }

  #listenReady(): void {
    // Add transitionend listener to remove overlay from DOM
    if (this.#loadingOverlay) {
      this.#loadingOverlay.addEventListener("transitionend", (event) => {
        if (
          event.propertyName === "opacity" &&
          this.#loadingOverlay instanceof HTMLElement
        ) {
          const computedStyle = getComputedStyle(this.#loadingOverlay);
          if (computedStyle.opacity === "1") {
            return;
          }

          this.#loadingOverlay.remove();

          // Clear the message cycling interval
          if (this.#messageInterval) {
            clearInterval(this.#messageInterval);
            this.#messageInterval = null;
            console.log("App loading complete - transitioned to main content");
          }
        }
      });
    }

  }

  #startMessageCycling(): void {
    // Cycle every 1.5 seconds
    this.#messageInterval = setInterval(() => this.#cycleMessage(), 1500);
    this.#cycleMessage(); // Start immediately
  }
}
document.addEventListener("DOMContentLoaded", () => {
  new AppLoader();
});
