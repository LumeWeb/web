/** Native ownership survives retirement until synchronously admitted session work settles. */
import { AccessErrorCode } from "./access-types.ts";
import type {
  AccessConnection,
  AccessSession,
  SessionWork,
} from "./access-types.ts";

interface HeldSession<Session> {
  borrows: number;
  readonly resource: AccessSession<Session>;
  retired: boolean;
}
export class AccessResources<Session> {
  get connection(): AccessConnection<Session> {
    if (!this.ownedConnection) throw new Error("Missing approved connection");
    return this.ownedConnection;
  }
  private ownedConnection: AccessConnection<Session> | undefined;

  private session: HeldSession<Session> | undefined;
  exportAppKey(): Uint8Array {
    if (!this.session) throw new SessionUnavailableError();
    const bytes = this.session.resource.exportAppKey();
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
    this.ownedConnection = connection;
  }
  installSession(resource: AccessSession<Session>): void {
    this.session = { borrows: 0, resource, retired: false };
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
    const owned = this.session;
    this.session = undefined;
    if (!owned) return;
    owned.retired = true;
    if (!owned.borrows) owned.resource.dispose();
  }
  run<Result>(work: SessionWork<Session, Result>): Promise<Result> {
    const owned = this.session;
    if (!owned) return Promise.reject(new SessionUnavailableError());
    owned.borrows++;
    let result: ReturnType<typeof work>;
    try {
      result = work(owned.resource.value);
    } catch (error) {
      // Application failures must reach the borrower unchanged, including non-Error values.
      // oxlint-disable-next-line typescript/prefer-promise-reject-errors
      result = Promise.reject(error);
    }
    return Promise.resolve(result).finally(() => {
      owned.borrows--;
      if (owned.retired && !owned.borrows) owned.resource.dispose();
    });
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
