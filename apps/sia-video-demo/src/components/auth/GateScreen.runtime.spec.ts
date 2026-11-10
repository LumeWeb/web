// @vitest-environment happy-dom

/** Checks that account entry offers saved-key reconnect after account setup fails. */
import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "../../stores/auth";
import { GateScreen } from "./GateScreen";

let container: HTMLDivElement;
let root: Root;
const originalReconnect = useAuthStore.getState().reconnect;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  root.unmount();
  container.remove();
  useAuthStore.setState({
    accountError: null,
    reconnect: originalReconnect,
    savedUserKeyHex: "",
  });
});

async function renderGate(): Promise<void> {
  root.render(createElement(GateScreen));
  await new Promise((resolve) => setTimeout(resolve, 25));
}

describe("account entry after a failed request", () => {
  it("lets the user reconnect a saved account", async () => {
    const reconnect = vi.fn().mockResolvedValue(undefined);
    useAuthStore.setState({
      accountError: "Could not register the account. Start again.",
      reconnect,
      savedUserKeyHex: "a1".repeat(32),
      status: "disconnected",
    });
    await renderGate();

    const button = [...container.querySelectorAll("button")].find(
      (element) => element.textContent === "Reconnect saved account",
    );
    expect(button).toBeDefined();
    button!.click();
    expect(reconnect).toHaveBeenCalledTimes(1);
  });

  it("does not offer saved-account reconnect without a saved key", async () => {
    useAuthStore.setState({
      accountError: "Could not connect to the indexer. Try again.",
      savedUserKeyHex: "",
      status: "disconnected",
    });
    await renderGate();

    expect(container.textContent).toContain("Could not connect to the indexer");
    expect(container.textContent).not.toContain("Reconnect saved account");
  });
});
