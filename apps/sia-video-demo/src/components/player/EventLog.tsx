/**
 * Debug event-log panel. It reads the eventLog store's timestamped severity
 * lines straight from the typed store (no worker-log parsing, timers, or DOM
 * listeners) and renders them in a fixed-height list.
 *
 * The verbose toggle is the store-backed debug filter: verbose shows the full
 * wire (including the per-event media trace), non-verbose hides only `debug`
 * lines. `Clear` empties the store; the store caps the list at 300 entries.
 * The visible-line derivation is a pure exported function so the filtering is
 * pinned in a Node spec without rendering the component.
 */

import { useStore } from "zustand";
import { cn } from "../../lib/utils";
import { type EventLine, useEventLogStore } from "../../stores/eventLog";

export function EventLog() {
  const lines = useStore(useEventLogStore, (s) => s.lines);
  const verbose = useStore(useEventLogStore, (s) => s.verbose);
  const clear = useStore(useEventLogStore, (s) => s.clear);
  const setVerbose = useStore(useEventLogStore, (s) => s.setVerbose);

  const visible = visibleEventLogLines(lines, verbose);

  return (
    <section
      aria-label="Event log"
      className="border-border-default mt-4 flex flex-col rounded-lg border">
      <div className="border-b-border-default flex items-center justify-between gap-3 border-b px-3 py-2">
        <h3 className="text-fg-default m-0 text-xs font-semibold tracking-wide uppercase">
          Event log
        </h3>
        <div className="flex items-center gap-3">
          <label className="text-fg-muted flex cursor-pointer items-center gap-1.5 text-xs">
            <input
              checked={verbose}
              onChange={(event) => setVerbose(event.target.checked)}
              type="checkbox"
            />
            Verbose
          </label>
          <button
            className="px-2.5 py-[5px] text-xs"
            onClick={clear}
            type="button">
            Clear
          </button>
        </div>
      </div>
      <ol className="bg-canvas-subtle m-0 max-h-60 list-none overflow-y-auto p-0">
        {visible.length === 0 ? (
          <li className="text-fg-muted px-3 py-2 text-xs">
            No events logged yet.
          </li>
        ) : (
          visible.map((line) => (
            <li
              className={cn(
                "flex items-baseline gap-2 px-3 py-1 font-mono text-xs",
                levelClass(line.level),
              )}
              key={line.id}>
              <time className="text-fg-muted shrink-0 tabular-nums">
                {line.time}
              </time>
              <span className="min-w-0 break-words">{line.message}</span>
            </li>
          ))
        )}
      </ol>
    </section>
  );
}

/**
 * The lines the panel shows for the given store state: everything when verbose
 * is on, otherwise every severity except `debug`. Pure and deterministic.
 */
export function visibleEventLogLines(
  lines: readonly EventLine[],
  verbose: boolean,
): EventLine[] {
  return verbose ? [...lines] : lines.filter((line) => line.level !== "debug");
}

/** Per-severity message tint on the ledger rows. */
function levelClass(level: EventLine["level"]): string {
  switch (level) {
    case "debug":
      return "text-fg-muted";
    case "error":
      return "text-danger";
    case "milestone":
      return "text-fg-default";
    case "warn":
      return "text-accent";
  }
}
