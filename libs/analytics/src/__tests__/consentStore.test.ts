import { describe, it, expect, beforeEach, vi } from "vitest";
import { useConsentStore, CONSENT_VERSION, CONSENT_EXPIRY_MS } from "../consentStore";
import type { ConsentCategory } from "../consentStore";

describe("consentStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useConsentStore.setState({
      status: "pending",
      categories: { analytics: false, marketing: false, functional: false },
      timestamp: null,
      version: CONSENT_VERSION,
    });
  });

  it("fresh state has status=pending, all categories=false, timestamp=null", () => {
    const state = useConsentStore.getState();
    expect(state.status).toBe("pending");
    expect(state.categories).toEqual({
      analytics: false,
      marketing: false,
      functional: false,
    });
    expect(state.timestamp).toBeNull();
  });

  it("acceptAll sets status=accepted, all categories=true, timestamp set", () => {
    useConsentStore.getState().acceptAll();
    const state = useConsentStore.getState();

    expect(state.status).toBe("accepted");
    expect(state.categories).toEqual({
      analytics: true,
      marketing: true,
      functional: true,
    });
    expect(state.timestamp).not.toBeNull();
    expect(typeof state.timestamp).toBe("number");
  });

  it("rejectAll sets status=rejected, all categories=false, timestamp set", () => {
    useConsentStore.getState().rejectAll();
    const state = useConsentStore.getState();

    expect(state.status).toBe("rejected");
    expect(state.categories).toEqual({
      analytics: false,
      marketing: false,
      functional: false,
    });
    expect(state.timestamp).not.toBeNull();
    expect(typeof state.timestamp).toBe("number");
  });

  it("customize sets specific categories and status=customized", () => {
    useConsentStore
      .getState()
      .customize({ analytics: true, marketing: false, functional: true });
    const state = useConsentStore.getState();

    expect(state.status).toBe("customized");
    expect(state.categories).toEqual({
      analytics: true,
      marketing: false,
      functional: true,
    });
    expect(state.timestamp).not.toBeNull();
  });

  it("6-month expiry detection — timestamp 7 months ago returns true", () => {
    const sevenMonthsAgo = Date.now() - CONSENT_EXPIRY_MS - 30 * 24 * 60 * 60 * 1000;
    useConsentStore.setState({ timestamp: sevenMonthsAgo });

    expect(useConsentStore.getState().isConsentExpired()).toBe(true);
  });

  it("non-expired consent returns false from isConsentExpired", () => {
    useConsentStore.setState({ timestamp: Date.now() });

    expect(useConsentStore.getState().isConsentExpired()).toBe(false);
  });

  it("isConsentExpired returns false when timestamp is null", () => {
    useConsentStore.setState({ timestamp: null });

    expect(useConsentStore.getState().isConsentExpired()).toBe(false);
  });

  it("withdrawConsent resets to pending with null timestamp", () => {
    useConsentStore.getState().acceptAll();
    expect(useConsentStore.getState().status).toBe("accepted");

    useConsentStore.getState().withdrawConsent();
    const state = useConsentStore.getState();

    expect(state.status).toBe("pending");
    expect(state.categories).toEqual({
      analytics: false,
      marketing: false,
      functional: false,
    });
    expect(state.timestamp).toBeNull();
  });

  it("persist config: localStorage key is lumeweb-consent", () => {
    useConsentStore.getState().acceptAll();

    const stored = localStorage.getItem("lumeweb-consent");
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored!);
    expect(parsed.state.status).toBe("accepted");
  });

  it("persist config: version is 1", () => {
    useConsentStore.getState().acceptAll();

    const stored = localStorage.getItem("lumeweb-consent");
    const parsed = JSON.parse(stored!);
    expect(parsed.version).toBe(1);
  });

  it("cross-tab sync: storage event triggers rehydration", () => {
    useConsentStore.getState().acceptAll();

    const stored = localStorage.getItem("lumeweb-consent")!;
    const parsed = JSON.parse(stored);
    parsed.state.status = "rejected";
    parsed.state.categories = { analytics: false, marketing: false, functional: false };
    localStorage.setItem("lumeweb-consent", JSON.stringify(parsed));

    const storageEvent = new StorageEvent("storage", {
      key: "lumeweb-consent",
      newValue: JSON.stringify(parsed),
      storageArea: localStorage,
    });
    window.dispatchEvent(storageEvent);

    expect(useConsentStore.getState().status).toBe("rejected");
  });
});
