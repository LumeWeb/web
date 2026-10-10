import { describe, expect, it } from "vitest";
import { visibleEventLogLines } from "./EventLog";
import type { EventLine } from "../../stores/eventLog";

/**
 * Node unit tests for the event-log panel's pure visible-line derivation. The
 * React component only renders `visibleEventLogLines(lines, verbose)` — no DOM,
 * timers, or store wiring is exercised here, matching how the player panel
 * specs pin pure typed derivations only.
 */
function line(message: string, level: EventLine["level"]): EventLine {
  return {
    id: level.length + message.length,
    level,
    message,
    time: "00:00:00.000",
  };
}

const lines: EventLine[] = [
  line("media playing", "debug"),
  line("source armed", "milestone"),
  line("ssl renegotiation", "warn"),
  line("read failed", "error"),
];

describe("visibleEventLogLines", () => {
  it("keeps every line while verbose is enabled", () => {
    const visible = visibleEventLogLines(lines, true);
    expect(visible).toHaveLength(4);
    expect(visible.map((entry) => entry.message)).toEqual([
      "media playing",
      "source armed",
      "ssl renegotiation",
      "read failed",
    ]);
  });

  it("hides only debug lines while verbose is disabled", () => {
    const visible = visibleEventLogLines(lines, false);
    expect(visible.map((entry) => entry.message)).toEqual([
      "source armed",
      "ssl renegotiation",
      "read failed",
    ]);
  });

  it("preserves order and does not mutate the input", () => {
    const snapshot = [...lines];
    const visible = visibleEventLogLines(lines, false);
    expect(visible.map((entry) => entry.id)).toEqual([
      lines[1].id,
      lines[2].id,
      lines[3].id,
    ]);
    expect(lines).toEqual(snapshot);
  });

  it("returns the same entries (not copies) by reference", () => {
    const visible = visibleEventLogLines(lines, true);
    expect(visible).toEqual(lines);
  });
});
