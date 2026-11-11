// @vitest-environment happy-dom
/** Checks that picker cleanup failures do not escape its detached listing task. */
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";

const listing = vi.hoisted(() => ({ connect: vi.fn() }));
vi.mock("../../lib/storageBackend", () => ({
  connectSharedObjects: listing.connect,
}));

import { useEventLogStore } from "../../stores/eventLog";
import { SharedObjectPicker } from "./SharedObjectPicker";

const SEED = "d778398e336858ddc1a7de0c78ca22bbe9c821e2786d7b5a941c729e1e5ceb1f";

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  listing.connect.mockReset();
  document.body.replaceChildren();
});

it("a failing shared SDK dispose is reported without rejecting the picker task", async () => {
  useEventLogStore.setState({ lines: [] });
  const dispose = vi.fn(() => {
    throw new Error(SEED);
  });
  listing.connect.mockResolvedValue({
    free: dispose,
    objectSummaries: vi.fn(() => Promise.resolve([])),
  });
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    act(() => {
      root.render(
        createElement(SharedObjectPicker, {
          indexerUrl: "https://indexer.test",
          onSelectObject: () => undefined,
          selectedKey: null,
          sharingKeyHex: SEED,
        }),
      );
    });
    await vi.waitFor(() => expect(dispose).toHaveBeenCalledTimes(1));
    expect(container.textContent).toContain("No shared objects");
    expect(useEventLogStore.getState().lines[0]?.message).toBe(
      "Shared object SDK cleanup failed",
    );
    expect(JSON.stringify(useEventLogStore.getState().lines)).not.toContain(
      SEED,
    );
  } finally {
    act(() => root.unmount());
  }
});
