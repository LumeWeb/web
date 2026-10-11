/**
 * Demo-side logging sink for `@lumeweb/sia-video-source`'s pluggable `Logger`
 * interface. Every record the host emits, worker milestone `LOG` events
 * (forwarded on `logger.child('worker')`) plus any host-side session lines, is
 * written into the eventLog zustand store as one timestamped line.
 *
 * The host derives the worker's HELLO `log` forwarding threshold from
 * `logger.level` at every (re)attach, so the demo singleton's `level` is a
 * LIVE read of the event-log store's verbose toggle: off (the default,
 * keeping logging quiet) is `'info'` and keeps only the session milestones
 * (`session.*`, `sdk.built`, `object.resolved`, `stream.*`); on is `'debug'`
 * and pulls the full wire including the per-read `read.window-*` /
 * `bytes.read` milestones. Toggling verbose therefore changes what the host
 * and worker log from the next record on, not just which already-logged lines
 * the panel shows.
 *
 * The `level` option also accepts a function, resolved at each write and each
 * `level` read, so one stable logger object can track a runtime toggle
 * without the host ever seeing a swapped reference.
 *
 * Seed-safety: the sink forwards ONLY the message and `fields` the library
 * logged. The library's `Logger` contract (libs/sia-video-source) keeps keys
 * and secrets out of every message and fields object, and this sink never
 * reads the auth store's seed state, so a seed can never ride along in a
 * line. Object facts are condensed, never dropped, so a line survives any
 * field shape without crashing.
 */

import {
  type LogFields,
  type Logger,
  type LogLevel,
  type LogLevelFilter,
  logLevelRank,
} from "@lumeweb/sia-video-source";
import { type EventLevel, useEventLogStore } from "../stores/eventLog";

/** Store severity per logger level: session `info` logs stay a visible `milestone`. */
const STORE_LEVEL: Record<LogLevel, EventLevel> = {
  debug: "debug",
  error: "error",
  info: "milestone",
  trace: "debug",
  warn: "warn",
};

/** Builds a `Logger` whose records land in the event log. Matches the library's
 * `Logger` contract (`libs/sia-video-source/src/log/logger.ts`): `child`
 * dot-joins scopes and each scope renders as a `[scope]` prefix on the line;
 * `level` is the minimum emitted severity, filtering both the host's
 * worker-wire threshold (read through the live `.level`) and this sink's own
 * writes. A function `level` is re-resolved on every write and every `level`
 * read, so the threshold can track a runtime toggle on one stable object.
 */
export function createEventLogLogger(
  options: { level?: (() => LogLevelFilter) | LogLevelFilter } = {},
): Logger {
  const resolveFilter = (): LogLevelFilter =>
    typeof options.level === "function"
      ? options.level()
      : (options.level ?? "info");

  const build = (scope: string): Logger => {
    const write =
      (methodLevel: LogLevel) =>
      (msg: string, fields?: LogFields): void => {
        const filter = resolveFilter();
        if (filter === "silent") return;
        if (logLevelRank(methodLevel) < logLevelRank(filter)) return;
        const prefix = scope === "" ? "" : `[${scope}] `;
        const facts = fields ? ` ${renderFacts(fields)}` : "";
        useEventLogStore
          .getState()
          .push(`${prefix}${msg}${facts}`, STORE_LEVEL[methodLevel]);
      };

    return {
      child: (childScope: string): Logger =>
        build(scope === "" ? childScope : `${scope}.${childScope}`),
      debug: write("debug"),
      error: write("error"),
      info: write("info"),
      get level(): LogLevelFilter {
        return resolveFilter();
      },
      trace: write("trace"),
      warn: write("warn"),
    };
  };

  return build("");
}

/**
 * The log threshold the verbose toggle maps onto: off keeps the quiet
 * `'info'` milestone view, on opens `'debug'` (the full wire).
 */
export function eventLogLevelForVerbose(verbose: boolean): LogLevelFilter {
  return verbose ? "debug" : "info";
}

/** Scalar facts stay scalar; nested/object values are condensed, not dropped. */
function fieldFact(value: unknown): string {
  if (value === undefined) return "";
  if (value === null) return "null";
  switch (typeof value) {
    case "boolean":
    case "number":
    case "string":
      return String(value);
    default:
      try {
        return JSON.stringify(value) ?? "";
      } catch {
        return "[unserializable]";
      }
  }
}

/**
 * `key=value` pairs from the protocol's scalar-only `fields`. The host never
 * logs credential material, so the facts that reach here are safe to render
 * inline; `object.resolved` only ever carries the `share: boolean` flag, never
 * a share-URL string.
 */
function renderFacts(fields: LogFields): string {
  return Object.entries(fields)
    .map(([key, value]) => `${key}=${fieldFact(value)}`)
    .join(" ");
}

/**
 * Demo-wide logger singleton. A stable reference matters: the player wiring
 * re-applies `media.logger = logger` on every render, so a constant reference
 * keeps the host and the worker-threshold derivation on one sink for the whole
 * session. Its `level` is the live verbose mapping: the checkbox drives what
 * the host logs and updates what the worker forwards without a reload.
 */
export const eventLogLogger: Logger = createEventLogLogger({
  level: () => eventLogLevelForVerbose(useEventLogStore.getState().verbose),
});
