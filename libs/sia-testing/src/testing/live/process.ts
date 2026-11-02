/** Owned RPC processes are stopped before a timeout or cancellation is returned to the caller. */
import { fork } from "node:child_process";
export interface OwnedProcess {
  close(): Promise<void>;
  readonly pid: number;
  request(
    operation: string,
    value: unknown,
    options?: { readonly deadlineMs?: number; readonly signal?: AbortSignal },
  ): Promise<unknown>;
}
export interface ProcessEvent {
  readonly name: string;
  readonly requestId: string;
  readonly value: unknown;
}
interface Pending {
  detach(): void;
  reject(error: Error): void;
  resolve(value: unknown): void;
  timer: ReturnType<typeof setTimeout>;
}
export function startOwnedProcess(options: {
  readonly cleanupDeadlineMs: number;
  readonly deadlineMs: number;
  readonly entrypoint: URL;
  readonly onEvent?: (event: ProcessEvent) => Promise<void>;
}): OwnedProcess {
  if (!positive(options.deadlineMs) || !positive(options.cleanupDeadlineMs))
    throw failure("invalid-input");
  const environment: NodeJS.ProcessEnv = {};
  for (const key of [
    "PATH",
    "HOME",
    "TMPDIR",
    "TEMP",
    "TMP",
    "LANG",
    "SYSTEMROOT",
  ])
    if (process.env[key] !== undefined) environment[key] = process.env[key];
  const child = fork(options.entrypoint, [], {
    env: environment,
    execArgv: [],
    serialization: "advanced",
    stdio: ["ignore", "ignore", "ignore", "ipc"],
  });
  const pending = new Map<string, Pending>();
  let dead = false;
  let closing = false;
  let online = false;
  let reason: string | undefined;
  let stopped: Promise<void> | undefined;
  let ready!: () => void;
  let exited!: () => void;
  const readiness = new Promise<void>((resolve) => {
    ready = resolve;
  });
  const exit = new Promise<void>((resolve) => {
    exited = resolve;
  });
  function rejectAll(code: string) {
    for (const [id, request] of pending) {
      pending.delete(id);
      clearTimeout(request.timer);
      request.detach();
      request.reject(failure(code));
    }
  }
  function finish() {
    if (dead) return;
    dead = true;
    closing = true;
    ready();
    rejectAll(reason ?? "agent-exit");
    exited();
  }
  child.once("exit", finish);
  child.on("error", () => {
    if (child.pid === undefined) {
      reason ??= "agent-start";
      finish();
    } else if (!closing) abort("agent-protocol");
  });
  child.on("disconnect", () => {
    if (!closing && !dead) abort("agent-exit");
  });
  function stop(code = "closed"): Promise<void> {
    reason ??= code;
    closing = true;
    if (dead) return Promise.resolve();
    if (stopped) return stopped;
    stopped = new Promise<void>((resolve, reject) => {
      const force = setTimeout(
        () => child.kill("SIGKILL"),
        Math.min(200, Math.floor(options.cleanupDeadlineMs / 2)),
      );
      const deadline = setTimeout(() => {
        rejectAll("agent-termination");
        reject(failure("agent-termination"));
      }, options.cleanupDeadlineMs);
      void exit.then(() => {
        clearTimeout(force);
        clearTimeout(deadline);
        resolve();
      });
      child.kill("SIGTERM");
    });
    return stopped;
  }
  function abort(code: string) {
    void stop(code).catch(() => undefined);
  }
  child.on("message", (message: unknown) => {
    if (closing || dead) return;
    if (
      !message ||
      typeof message !== "object" ||
      Array.isArray(message) ||
      !("type" in message)
    ) {
      abort("agent-protocol");
      return;
    }
    if (message.type === "ready") {
      if (online) {
        abort("agent-protocol");
        return;
      }
      online = true;
      ready();
      return;
    }
    if (!online) {
      abort("agent-protocol");
      return;
    }
    if (message.type === "event") {
      if (
        !("requestId" in message) ||
        typeof message.requestId !== "string" ||
        !pending.has(message.requestId) ||
        !("name" in message) ||
        typeof message.name !== "string" ||
        !("value" in message) ||
        !options.onEvent
      ) {
        abort("agent-protocol");
        return;
      }
      const event: ProcessEvent = {
        name: message.name,
        requestId: message.requestId,
        value: message.value,
      };
      void Promise.resolve()
        .then(() => options.onEvent!(event))
        .catch(() => abort("agent-event"));
      return;
    }
    if (!("id" in message) || typeof message.id !== "string") {
      abort("agent-protocol");
      return;
    }
    const request = pending.get(message.id);
    if (!request) {
      abort("agent-protocol");
      return;
    }
    if (message.type === "error") {
      const known = new Set([
        "approval-denied",
        "authentication",
        "denied",
        "invalid-approval",
        "invalid-input",
        "missing-hosts",
        "not-found",
        "not-ready",
        "quota",
        "resource-error",
        "sdk-error",
        "sdk-version",
      ]);
      abort(
        "code" in message &&
          typeof message.code === "string" &&
          known.has(message.code)
          ? message.code
          : "sdk-error",
      );
      return;
    }
    if (message.type !== "result" || !("value" in message)) {
      abort("agent-protocol");
      return;
    }
    pending.delete(message.id);
    clearTimeout(request.timer);
    request.detach();
    request.resolve(message.value);
  });
  return {
    close: () => stop(),
    pid: child.pid ?? -1,
    request(operation, value, call = {}) {
      if (closing || dead) return Promise.reject(failure("closed"));
      const deadline = call.deadlineMs ?? options.deadlineMs;
      if (!positive(deadline) || !/^[a-z][a-z-]{0,63}$/.test(operation))
        return Promise.reject(failure("invalid-input"));
      const id = crypto.randomUUID();
      return new Promise<unknown>((resolve, reject) => {
        const cancelled = () => abort("cancelled");
        pending.set(id, {
          detach: () => call.signal?.removeEventListener("abort", cancelled),
          reject,
          resolve,
          timer: setTimeout(() => abort("deadline"), deadline),
        });
        call.signal?.addEventListener("abort", cancelled, { once: true });
        if (call.signal?.aborted) cancelled();
        void readiness.then(() => {
          if (closing || dead || !pending.has(id)) return;
          try {
            child.send({ id, operation, type: "request", value }, (error) => {
              if (error) abort("agent-protocol");
            });
          } catch {
            abort("agent-protocol");
          }
        });
      });
    },
  };
}
function failure(code: string): Error & { code: string; uncertain: boolean } {
  return Object.assign(new Error("Sia SDK process failed"), {
    code,
    phase: "execution",
    uncertain: code === "agent-termination",
  });
}
function positive(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0 && value <= 120_000;
}
