import { beforeEach, describe, expect, it } from "vitest";
import { messageFromError, useEventLogStore } from "./eventLog";

/**
 * Node unit tests for the event-log zustand store: timestamped severity
 * entries, newest-first ordering, the 300-entry cap, the verbose toggle, and
 * `messageFromError`. The React `EventLog` component is kept presentation-only
 * (it reads these lines and filters via `visibleEventLogLines`), so the
 * store-level behaviors are pinned here against the singleton.
 */
const TIMESTAMP = /^\d{2}:\d{2}:\d{2}\.\d{3}$/;

describe("the event-log store", () => {
  beforeEach(() => {
    // Reset only the lines; `verbose` keeps its module default so the default
    // assertion below pins the real initial value.
    useEventLogStore.setState({ lines: [] });
  });

  it("pushes a timestamped line with the default milestone severity", () => {
    useEventLogStore.getState().push("source armed");
    const [line] = useEventLogStore.getState().lines;
    expect(line.level).toBe("milestone");
    expect(line.message).toBe("source armed");
    expect(line.time).toMatch(TIMESTAMP);
  });

  it("accepts an explicit severity level", () => {
    useEventLogStore.getState().push("something failed", "error");
    const [line] = useEventLogStore.getState().lines;
    expect(line.level).toBe("error");
    expect(line.message).toBe("something failed");
  });

  it("keeps the newest line at the front", () => {
    useEventLogStore.getState().push("first");
    useEventLogStore.getState().push("second");
    const lines = useEventLogStore.getState().lines;
    expect(lines.map((line) => line.message)).toEqual(["second", "first"]);
  });

  it("clear empties the log", () => {
    useEventLogStore.getState().push("one");
    useEventLogStore.getState().push("two");
    expect(useEventLogStore.getState().lines).toHaveLength(2);
    useEventLogStore.getState().clear();
    expect(useEventLogStore.getState().lines).toEqual([]);
  });

  it("caps the log at 300 entries and drops the oldest first", () => {
    useEventLogStore.getState().push("oldest");
    const firstId = useEventLogStore.getState().lines[0].id;
    for (let index = 0; index < 305; index += 1) {
      useEventLogStore.getState().push(`line ${index}`);
    }
    const lines = useEventLogStore.getState().lines;
    expect(lines).toHaveLength(300);
    expect(lines.some((line) => line.id === firstId)).toBe(false);
    // Newest-first: the surviving head is the last pushed line.
    expect(lines[0].message).toBe("line 304");
  });

  it("defaults verbose to off (quiet logging) and toggles it", () => {
    expect(useEventLogStore.getState().verbose).toBe(false);
    useEventLogStore.getState().setVerbose(true);
    expect(useEventLogStore.getState().verbose).toBe(true);
    useEventLogStore.getState().setVerbose(false);
    expect(useEventLogStore.getState().verbose).toBe(false);
  });

  it("messageFromError extracts the message from an Error and stringifies the rest", () => {
    expect(messageFromError(new Error("boom"))).toBe("boom");
    expect(messageFromError("plain")).toBe("plain");
    expect(messageFromError(42)).toBe("42");
    expect(messageFromError(null)).toBe("null");
    expect(messageFromError({ nested: true })).toBe("[object Object]");
  });
});
