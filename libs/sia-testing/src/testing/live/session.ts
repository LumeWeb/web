/** Authenticated sessions keep SDK credentials behind identity-bound Node handles. */
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { approveLiveConnection } from "./approval.js";
import { profileDocument } from "./profile.js";
import { type OwnedProcess, startOwnedProcess } from "./process.js";
import type { LiveProfile } from "./types.js";
declare const privateSession: unique symbol;
export interface LiveSession {
  readonly [privateSession]: true;
}
export interface LiveSessionInfo {
  readonly accountKey: string;
  readonly appId: string;
  readonly appKeyHex: string;
  readonly maxPinnedData: bigint;
  readonly ready: boolean;
  readonly remainingStorage: bigint;
}
interface SessionState {
  readonly abort: AbortController;
  readonly agent: OwnedProcess;
  close?: Promise<void>;
  info: LiveSessionInfo | undefined;
}
const sessions = new WeakMap<LiveSession, SessionState>();
export function closeLiveSession(session: LiveSession): Promise<void> {
  const state = sessions.get(session);
  if (!state) return Promise.reject(failure("foreign-handle"));
  if (state.close) return state.close;
  state.info = undefined;
  state.abort.abort();
  state.close = state.agent.close();
  return state.close;
}
export async function openLiveSession(
  profile: LiveProfile,
  options: { readonly agentModule?: URL; readonly signal?: AbortSignal } = {},
): Promise<LiveSession> {
  const document = profileDocument(profile);
  options.signal?.throwIfAborted();
  const abort = new AbortController();
  const signal = options.signal
    ? AbortSignal.any([options.signal, abort.signal])
    : abort.signal;
  const agent = startOwnedProcess({
    cleanupDeadlineMs: document.limits.cleanupDeadlineMs,
    deadlineMs: document.limits.deadlineMs,
    entrypoint:
      options.agentModule ??
      new URL(
        "./dist/esm/testing/live/agent.js",
        pathToFileURL(
          createRequire(import.meta.url).resolve(
            "@lumeweb/sia-testing/package.json",
          ),
        ),
      ),
    async onEvent(event) {
      if (
        event.name !== "approval" ||
        typeof event.value !== "string" ||
        document.auth.kind !== "register"
      )
        throw failure("agent-protocol");
      await approveLiveConnection(profile, event.value, true, signal);
    },
  });
  let primary: unknown;
  try {
    const response = await agent.request("authenticate", document, { signal });
    const info = parseInfo(response);
    if (info.appId !== document.app.id || !info.ready)
      throw failure("not-ready");
    if (
      document.auth.kind === "app-key" &&
      info.appKeyHex !== document.auth.appKeyHex
    )
      throw failure("authentication");
    signal.throwIfAborted();
    const session = Object.freeze(
      Object.defineProperties(Object.create(null), {
        [Symbol.for("nodejs.util.inspect.custom")]: {
          value: () => "[Sia live session]",
        },
        toJSON: { value: () => "[Sia live session]" },
      }),
    ) as LiveSession;
    sessions.set(session, { abort, agent, info });
    return session;
  } catch (error) {
    primary = error;
  }
  abort.abort();
  const errors: unknown[] = [primary];
  try {
    await agent.close();
  } catch (cleanup) {
    errors.push(cleanup);
  }
  if (errors.length > 1)
    throw new AggregateError(errors, "SDK authentication and shutdown failed", {
      cause: primary,
    });
  throw primary;
}
export function sessionInfo(session: LiveSession): LiveSessionInfo {
  const state = sessions.get(session);
  if (!state?.info) throw failure("closed");
  return state.info;
}
export function sessionProcess(session: LiveSession): OwnedProcess {
  const state = sessions.get(session);
  if (!state?.info) throw failure("closed");
  return state.agent;
}
function failure(code: string) {
  return Object.assign(new Error("Sia SDK authentication failed"), {
    code,
    phase: "authentication",
  });
}
function parseInfo(value: unknown): LiveSessionInfo {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw failure("agent-protocol");
  const info = value as Record<string, unknown>;
  if (
    typeof info.appKeyHex !== "string" ||
    !/^[a-f0-9]{64}$/.test(info.appKeyHex) ||
    typeof info.accountKey !== "string" ||
    !/^(?:ed25519:)?[a-f0-9]{64}$/.test(info.accountKey) ||
    typeof info.appId !== "string" ||
    !/^[a-f0-9]{64}$/.test(info.appId) ||
    typeof info.ready !== "boolean" ||
    typeof info.remainingStorage !== "bigint" ||
    info.remainingStorage < 0n ||
    typeof info.maxPinnedData !== "bigint" ||
    info.maxPinnedData < 0n
  )
    throw failure("agent-protocol");
  return Object.freeze({
    accountKey: info.accountKey,
    appId: info.appId,
    appKeyHex: info.appKeyHex,
    maxPinnedData: info.maxPinnedData,
    ready: info.ready,
    remainingStorage: info.remainingStorage,
  });
}
