/** Native ownership survives retirement until synchronously admitted session work settles. */
import {
  createSiaSdkSession,
  openSiaSdkOperationScope,
} from "@lumeweb/sia-session";
import type { SdkOperationScope } from "@lumeweb/sia-session";
import { AccessErrorCode } from "./access-types.ts";
import type {
  AccessConnection,
  AccessSession,
  SessionWork,
} from "./access-types.ts";

let nextActiveSessionId = 0;

/** A rejected installation leaves the incoming resource owned by its caller. */
export class AccessResources<Session> {
  get activeSessionId(): null | string {
    return this.currentSessionId;
  }
  get connection(): AccessConnection<Session> {
    if (!this.ownedConnection) throw new Error("Missing approved connection");
    return this.ownedConnection;
  }
  private currentSessionId: null | string = null;
  private ownedConnection: AccessConnection<Session> | undefined;
  private readonly pendingConnections = new Set<Promise<void>>();
  private readonly sdkSession;
  private session: AccessSession<Session> | undefined;
  constructor(private readonly onResourceError?: (error: unknown) => void) {
    this.sdkSession = createSiaSdkSession<Session>({
      onError: (issue) => onResourceError?.(issue.error),
    });
  }
  dispose(): Promise<void> {
    const connection = this.retireConnection();
    this.session = undefined;
    this.currentSessionId = null;
    return waitForCleanup(connection, this.sdkSession.close());
  }
  disposeConnection(owned: AccessConnection<Session>): void {
    let completion: Promise<void>;
    try {
      completion = Promise.resolve(owned.dispose());
    } catch (error) {
      // A custom adapter may throw a non-Error value; preserve its cleanup failure.
      // oxlint-disable-next-line typescript/prefer-promise-reject-errors
      completion = Promise.reject(error);
    }
    this.pendingConnections.add(completion);
    void completion.then(
      () => this.pendingConnections.delete(completion),
      (error: unknown) => {
        this.pendingConnections.delete(completion);
        try {
          this.onResourceError?.(error);
        } catch {
          // Reporting cannot strand another resource's cleanup.
        }
      },
    );
  }
  exportAppKey(): Uint8Array {
    if (!this.session) throw new SessionUnavailableError();
    const bytes = this.session.exportAppKey();
    if (!(bytes instanceof Uint8Array) || bytes.length !== 32) {
      bytes?.fill(0);
      throw new Error("Invalid app key");
    }
    return bytes;
  }
  hasSession(): boolean {
    return this.session !== undefined;
  }
  installConnection(connection: AccessConnection<Session>): void {
    if (this.ownedConnection)
      throw new Error("A connection is already installed");
    this.ownedConnection = connection;
  }
  installSession(resource: AccessSession<Session>): void {
    if (this.session) throw new Error("A session is already installed");
    if (nextActiveSessionId === Number.MAX_SAFE_INTEGER)
      throw new Error("Active session identity exhausted");
    this.sdkSession.setHandle(resource, { valueOwnership: "shared" });
    this.session = resource;
    this.currentSessionId = `access:${++nextActiveSessionId}`;
  }
  openOperationScope(): SdkOperationScope<Session> {
    if (!this.session) throw new SessionUnavailableError();
    return openSiaSdkOperationScope(this.sdkSession.source);
  }
  retire(): Promise<void> {
    const connection = this.retireConnection();
    return waitForCleanup(connection, this.retireSession());
  }
  retireConnection(): Promise<void> {
    const owned = this.ownedConnection;
    this.ownedConnection = undefined;
    if (owned) this.disposeConnection(owned);
    return waitForCleanup(...this.pendingConnections);
  }
  retireSession(): Promise<void> {
    if (!this.session) return this.sdkSession.drain();
    this.session = undefined;
    this.currentSessionId = null;
    // Clear denies new borrows before the old handle can run its disposer.
    return this.sdkSession.clear();
  }
  run<Result>(work: SessionWork<Session, Result>): Promise<Result> {
    if (!this.session) return Promise.reject(new SessionUnavailableError());
    const lease = this.sdkSession.source.acquire();
    let result: ReturnType<typeof work>;
    try {
      result = work(lease.value);
    } catch (error) {
      // Application failures must reach the borrower unchanged, including non-Error values.
      // oxlint-disable-next-line typescript/prefer-promise-reject-errors
      result = Promise.reject(error);
    }
    return Promise.resolve(result).finally(() => lease.release());
  }
}

/** Denied admission is distinguishable from an unchanged application-work error. */
export class SessionUnavailableError extends Error {
  readonly code = AccessErrorCode.SiaSessionUnavailable;
  constructor() {
    super("Session unavailable");
    this.name = "SessionUnavailableError";
  }
}

/** Capture every cleanup before awaiting so one rejection cannot end the drain early. */
function waitForCleanup(...operations: Promise<void>[]): Promise<void> {
  const done = Promise.allSettled(operations).then((results) => {
    const failures = results.flatMap((result): unknown[] => {
      if (result.status === "fulfilled") return [];
      const reason: unknown = result.reason;
      return reason instanceof AggregateError
        ? (reason.errors as unknown[])
        : [reason];
    });
    if (failures.length)
      throw new AggregateError(failures, "Access cleanup failed");
  });
  void done.catch(() => undefined);
  return done;
}
