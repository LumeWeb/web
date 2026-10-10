// @vitest-environment happy-dom

/**
 * DOM tests for the developer-options panel's native stream base URL
 * control. The control must explain in accessible text what it
 * configures (the optional demo-native streaming endpoint for
 * service-worker native playback) and what a blank value means (the
 * native option is disabled and the AUTO policy uses the media worker),
 * plus a placeholder showing the intended input shape. Typing must keep
 * writing the trimmed URL to the centralized developer-options store.
 */

import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useDeveloperOptionsStore } from "../stores/developerOptions";
import { DeveloperOptionsPanel } from "./DeveloperOptions";

const BASE_URL_INPUT_ID = "developer-options-native-stream-base-url";

let container: HTMLDivElement | null = null;
let root: null | Root = null;

beforeEach(() => {
  useDeveloperOptionsStore.setState({
    disableNativePlayback: false,
    nativeStreamBaseUrl: "",
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

function baseUrlInput(): HTMLInputElement {
  const input = document.getElementById(
    BASE_URL_INPUT_ID,
  ) as HTMLInputElement | null;
  expect(input).not.toBeNull();
  return input!;
}

async function flush(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 25));
}

async function renderPanel(): Promise<void> {
  root!.render(createElement(DeveloperOptionsPanel));
  await flush();
}

describe("DeveloperOptionsPanel native stream base URL control", () => {
  it("describes in accessible text what the control configures and what blank means", async () => {
    await renderPanel();

    const input = baseUrlInput();
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    const description = document.getElementById(describedBy!);
    expect(description).not.toBeNull();
    const text = description!.textContent?.toLowerCase() ?? "";
    expect(text).toContain("stream");
    expect(text).toContain("native");
    expect(text).toContain("blank");
    expect(text).toContain("media worker");
  });

  it("shows a placeholder with the intended URL shape", async () => {
    await renderPanel();

    const input = baseUrlInput();
    expect(input.placeholder).toMatch(/^https:\/\//);
  });

  it("still writes the trimmed URL to the centralized store on edit", async () => {
    await renderPanel();

    const input = baseUrlInput();
    // The native value setter bypasses React's input tracker, which would
    // otherwise swallow the dispatched input event.
    // oxlint-disable-next-line typescript/unbound-method
    const valueSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!;
    valueSetter.call(input, " https://stream.example/base ");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await flush();

    expect(useDeveloperOptionsStore.getState().nativeStreamBaseUrl).toBe(
      "https://stream.example/base",
    );
  });
});
