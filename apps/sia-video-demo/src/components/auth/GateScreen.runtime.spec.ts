// @vitest-environment happy-dom

/** Checks that account entry offers saved-key reconnect after account setup fails. */
import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { demoAccount } from "../../stores/auth";
import { demoSettingsStore } from "../../stores/authSettings";
import { GateScreen } from "./GateScreen";

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  root.unmount();
  container.remove();
  vi.restoreAllMocks();
  demoSettingsStore.setState({ accountError: null, savedUserKeyHex: "" });
});

async function renderGate(): Promise<void> {
  root.render(createElement(GateScreen));
  await new Promise((resolve) => setTimeout(resolve, 25));
}

describe("account entry after a failed request", () => {
  it("lets the user reconnect a saved account", async () => {
    const reconnect = vi.spyOn(demoAccount, "reconnect").mockResolvedValue();
    demoSettingsStore.setState({
      accountError: "Could not register the account. Start again.",
      savedUserKeyHex: "a1".repeat(32),
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
    demoSettingsStore.setState({
      accountError: "Could not connect to the indexer. Try again.",
      savedUserKeyHex: "",
    });
    await renderGate();

    expect(container.textContent).toContain("Could not connect to the indexer");
    expect(container.textContent).not.toContain("Reconnect saved account");
  });
});
