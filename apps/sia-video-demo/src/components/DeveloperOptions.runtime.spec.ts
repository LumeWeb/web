// @vitest-environment happy-dom

/**
 * DOM tests for the developer-options panel. The panel must render the
 * native-disable toggle and report the deterministic effective backend.
 */

import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useDeveloperOptionsStore } from "../stores/developerOptions";
import { DeveloperOptionsPanel } from "./DeveloperOptions";

let container: HTMLDivElement | null = null;
let root: null | Root = null;

beforeEach(() => {
  useDeveloperOptionsStore.setState({
    disableNativePlayback: false,
  });
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  root?.unmount();
  container?.remove();
  root = null;
  container = null;
});

async function flush(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 25));
}

async function renderPanel(): Promise<void> {
  root!.render(createElement(DeveloperOptionsPanel));
  await flush();
}

describe("DeveloperOptionsPanel", () => {
  it("renders the native-disable toggle", async () => {
    await renderPanel();

    const checkbox = container!.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement | null;
    expect(checkbox).not.toBeNull();
    expect(checkbox!.checked).toBe(false);
  });

  it("shows the effective backend as auto when native is enabled", async () => {
    await renderPanel();

    const text = container!.textContent ?? "";
    expect(text).toContain("auto");
  });

  it("shows the effective backend as media-worker when native is disabled", async () => {
    useDeveloperOptionsStore.getState().setDisableNativePlayback(true);
    await renderPanel();

    const text = container!.textContent ?? "";
    expect(text).toContain("media-worker");
  });
});
