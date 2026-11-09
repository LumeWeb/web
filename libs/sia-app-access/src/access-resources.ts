/** Native ownership survives retirement until synchronously admitted session work settles. */
import { createSiaSdkSession } from "@lumeweb/sia-session";
import { AccessErrorCode } from "./access-types.ts";
import type {
  AccessConnection,
  AccessSession,
  SessionWork,
} from "./access-types.ts";

/** A rejected installation leaves the incoming resource owned by its caller. */
export class AccessResources<Session> {
  get connection(): AccessConnection<Session> {
    if (!this.ownedConnection) throw new Error("Missing approved connection");
    return this.ownedConnection;
  }
  private ownedConnection: AccessConnection<Session> | undefined;

  private readonly sdkSession = createSiaSdkSession<Session>();
  private session: AccessSession<Session> | undefined;
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
    this.sdkSession.setHandle(resource);
    this.session = resource;
  }
  retire(): void {
    this.retireConnection();
    this.retireSession();
  }
  retireConnection(): void {
    const owned = this.ownedConnection;
    this.ownedConnection = undefined;
    owned?.dispose();
  }
  retireSession(): void {
    if (!this.session) return;
    this.session = undefined;
    // Clear denies new borrows before the old handle can run its disposer.
    void this.sdkSession.clear();
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
