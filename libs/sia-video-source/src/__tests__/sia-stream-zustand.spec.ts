/* oxlint-disable perfectionist/sort-objects */
import { describe, expect, it } from "vitest";
import { createSiaStreamAuthSource } from "../sia-stream-zustand.ts";

describe("createSiaStreamAuthSource", () => {
  it("projects credentials and ignores unrelated store changes", () => {
    let state = {
      indexerUrl: "a",
      sharingKeyHex: null as null | string,
      userKeyHex: "u",
      theme: "dark",
    };
    let listener = (_state: typeof state) => {
      void _state;
    };
    const store = {
      getState: () => state,
      subscribe: (next: typeof listener) => {
        listener = next;
        return () => undefined;
      },
    };
    const source = createSiaStreamAuthSource(store);
    let count = 0;
    source.subscribe?.(() => {
      count++;
    });
    state = { ...state, theme: "light" };
    listener(state);
    expect(count).toBe(0);
    state = { ...state, userKeyHex: "rotated" };
    listener(state);
    expect(count).toBe(1);
    expect(source.get!()).toEqual({
      indexerUrl: "a",
      userKeyHex: "rotated",
      sharingKeyHex: null,
    });
  });
});
