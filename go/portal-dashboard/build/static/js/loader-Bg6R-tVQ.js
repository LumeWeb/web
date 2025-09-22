class AppLoader {
  #isComplete = false;
  #loadingMessage = document.querySelector(".loading-message");
  #loadingOverlay = document.querySelector(".loading-overlay");
  #messageInterval = null;
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
    "Finalizing privacy-preserving setup..."
  ];
  #previousMessageIndex = null;
  constructor() {
    this.#init();
  }
  #getRandomMessageIndex() {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * this.#messages.length);
    } while (this.#messages.length > 1 && randomIndex === this.#previousMessageIndex);
    this.#previousMessageIndex = randomIndex;
    return randomIndex;
  }
  #cycleMessage() {
    if (this.#isComplete) return;
    this.#loadingMessage.style.opacity = "0";
    setTimeout(() => {
      const randomIndex = this.#getRandomMessageIndex();
      this.#loadingMessage.textContent = this.#messages[randomIndex];
      this.#loadingMessage.style.opacity = "1";
    }, 250);
  }
  #init() {
    this.#startMessageCycling();
    this.#listenReady();
    this.#listenBootComplete();
  }
  #listenBootComplete() {
    document.addEventListener("portal:boot:complete", () => {
      this.#handleBootComplete();
    });
  }
  #handleBootComplete() {
    if (this.#isComplete) return;
    this.#isComplete = true;
    if (this.#messageInterval) {
      clearInterval(this.#messageInterval);
      this.#messageInterval = null;
    }
    if (this.#loadingOverlay) {
      this.#loadingOverlay.remove();
      console.log("App loading complete - framework initialization finished");
    }
    document.documentElement.classList.remove("is-loading");
  }
  #listenReady() {
    if (this.#loadingOverlay) {
      this.#loadingOverlay.addEventListener("transitionend", (event) => {
        if (event.propertyName === "opacity" && this.#loadingOverlay instanceof HTMLElement) {
          const computedStyle = getComputedStyle(this.#loadingOverlay);
          if (computedStyle.opacity === "1") {
            return;
          }
          if (!this.#isComplete) {
            this.#handleBootComplete();
          }
        }
      });
    }
  }
  #startMessageCycling() {
    this.#messageInterval = setInterval(() => this.#cycleMessage(), 1500);
    this.#cycleMessage();
  }
}
document.addEventListener("DOMContentLoaded", () => {
  new AppLoader();
});
