import { createStore } from "zustand";

/** Severity of a log line; the non-verbose view hides only `debug` lines. */
export type EventLevel = "debug" | "error" | "milestone" | "warn";

/** One timestamped event-log line. */
export interface EventLine {
  /** Monotonic id so React can key the fixed-height list stably. */
  id: number;
  level: EventLevel;
  message: string;
  /** Local wall-clock `HH:MM:SS.mmm` stamp rendered by the panel. */
  time: string;
}

interface EventLogState {
  clear: () => void;
  lines: EventLine[];
  /**
   * Appends a line. Defaults to `milestone` so single-argument call sites
   * (auth steps, source loads) stay visible when verbose is off; media-event
   * tracing and the logger sink pass an explicit level.
   */
  push: (message: string, level?: EventLevel) => void;
  setVerbose: (verbose: boolean) => void;
  verbose: boolean;
}

/** Bounds the fixed-height dev console so a chatty media event cannot grow memory. */
const MAX_LINES = 300;

let nextId = 1;

export function messageFromError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function timestamp(): string {
  const now = new Date();
  const pad = (value: number): string => String(value).padStart(2, "0");
  const ms = String(now.getMilliseconds()).padStart(3, "0");
  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.${ms}`;
}

export const useEventLogStore = createStore<EventLogState>()((set) => ({
  clear: () => set({ lines: [] }),
  lines: [],
  push: (message, level = "milestone") =>
    set((state) => ({
      lines: [
        { id: nextId++, level, message, time: timestamp() },
        ...state.lines,
      ].slice(0, MAX_LINES),
    })),
  setVerbose: (verbose) => set({ verbose }),
  // Quiet by default: the panel hides `debug` lines until a developer
  // explicitly turns verbose on (developer tools are opt-in).
  verbose: false,
}));
