/** Credential workflows preserve store order and separate session readiness from acknowledged saving. */
import { AccessEvent } from "./access-machine.ts";
import type { AccessMachine } from "./access-machine.ts";
import type { AccessEnvironment } from "./access-environment.ts";
import { unavailable } from "./command-scope.ts";
import type {
  AccessCommand,
  CommandControl,
  CommandScope,
} from "./command-scope.ts";
import type { CredentialScope, CredentialStore } from "./credentials.ts";
import {
  AccessFailure,
  AccessOutcome,
  AccessRecovery,
  CredentialConfirmation,
  CredentialEffect,
} from "./access-types.ts";
import type {
  AccessMissingCredentials,
  AccessReady,
  AccessRemoved,
  AccessSession,
  ContinueWithoutSavingResult,
  ForgetResult,
  ReconnectResult,
  RetrySaveResult,
} from "./access-types.ts";

/** Scoped operations serialize mutations and check read admission at dispatch.
 * Writes own their input until settlement, then clear it even after rejection.
 */
export interface CredentialStorage {
  read(current: () => boolean): Promise<null | Uint8Array>;
  remove(): Promise<void>;
  write(bytes: Uint8Array): Promise<void>;
}
export type SavedAccess = AccessReady<CredentialConfirmation.Confirmed>;
interface CredentialResources<Session> {
  exportAppKey(): Uint8Array;
  hasSession(): boolean;
  installSession(resource: AccessSession<Session>): void;
  retire(): void;
}

type RestoredAccess = AccessMissingCredentials | SavedAccess;
export class CredentialOperations<Session> {
  private forgetting: Promise<ForgetResult> | undefined;
  private reconnecting: Promise<ReconnectResult> | undefined;
  constructor(
    private readonly environment: AccessEnvironment<Session>,
    private readonly machine: AccessMachine,
    private readonly commands: CommandControl,
    private readonly resources: CredentialResources<Session>,
    private readonly publish: () => void,
    private readonly queue: CredentialStorage,
  ) {}
  continueWithoutSaving(): ContinueWithoutSavingResult {
    if (!this.machine.send({ type: AccessEvent.Continue })) return unavailable;
    const result: ContinueWithoutSavingResult = Object.freeze({
      credentials: CredentialConfirmation.Unconfirmed,
      kind: AccessOutcome.Ready,
    });
    this.publish();
    return result;
  }
  forget(): Promise<ForgetResult> {
    if (this.forgetting) return this.forgetting;
    if (!this.machine.send({ type: AccessEvent.Forget }))
      return Promise.resolve(unavailable);
    this.commands.cancel();
    const op = this.commands.begin<AccessRemoved>(() => {
      this.forgetting = undefined;
    });
    // Disposal can reenter forget(), so record its command before retiring resources.
    this.forgetting = op.promise;
    this.resources.retire();
    if (!op.current) return op.promise;
    op.publish();
    if (op.current) {
      op.credentialEffect = CredentialEffect.Remove;
      void this.queue.remove().then(
        () => {
          if (op.current)
            op.finish(
              { kind: AccessOutcome.Removed },
              { type: AccessEvent.Removed },
            );
        },
        () => op.fail(AccessFailure.CredentialsRemove, AccessRecovery.Forget),
      );
    }
    return op.promise;
  }
  reconnect(): Promise<ReconnectResult> {
    if (this.reconnecting) return this.reconnecting;
    if (!this.machine.send({ type: AccessEvent.Reconnect }))
      return Promise.resolve(unavailable);
    const op = this.commands.begin<RestoredAccess>(() => {
      this.reconnecting = undefined;
    });
    this.reconnecting = op.promise;
    op.publish();
    void this.restore(op);
    return op.promise;
  }
  retrySave(): Promise<RetrySaveResult> {
    if (!this.machine.send({ type: AccessEvent.Retry }))
      return Promise.resolve(unavailable);
    const op = this.commands.begin<SavedAccess>();
    op.publish();
    void this.save(op);
    return op.promise;
  }
  async save(op: CommandScope<SavedAccess>): Promise<void> {
    if (!op.current || !this.resources.hasSession()) return;
    let bytes: Uint8Array;
    try {
      bytes = this.resources.exportAppKey();
    } catch {
      op.fail(AccessFailure.Session, AccessRecovery.Authorize);
      return;
    }
    if (!op.current) {
      bytes.fill(0);
      return;
    }
    op.publish();
    if (!op.current) {
      bytes.fill(0);
      return;
    }
    op.credentialEffect = CredentialEffect.Write;
    try {
      await this.queue.write(bytes);
      if (op.current)
        op.finish(
          {
            credentials: CredentialConfirmation.Confirmed,
            kind: AccessOutcome.Ready,
          },
          { type: AccessEvent.Saved },
        );
    } catch {
      op.fail(AccessFailure.CredentialsWrite, AccessRecovery.Save, true);
    }
  }
  private async restore(op: AccessCommand<RestoredAccess>): Promise<void> {
    if (!op.current) return;
    // JavaScript stores can return values outside their declared contract.
    let bytes: unknown;
    try {
      bytes = await this.queue.read(() => op.current);
    } catch {
      op.fail(AccessFailure.CredentialsRead, AccessRecovery.Reconnect);
      return;
    }
    if (!op.current) {
      if (bytes instanceof Uint8Array && bytes.byteLength > 0) bytes.fill(0);
      return;
    }
    if (bytes === null) {
      op.finish(
        { kind: AccessOutcome.MissingCredentials },
        { type: AccessEvent.Missing },
      );
      return;
    }
    let resource;
    try {
      if (!(bytes instanceof Uint8Array) || bytes.length !== 32) {
        op.fail(AccessFailure.UnregisteredKey, AccessRecovery.Authorize);
        return;
      }
      resource = await this.environment.adapter.reconnect(
        this.environment.scope,
        this.environment.application,
        bytes,
      );
    } catch {
      op.fail(AccessFailure.Connection, AccessRecovery.Reconnect);
      return;
    } finally {
      // Detached views have no remaining bytes and reject fill().
      if (bytes instanceof Uint8Array && bytes.byteLength > 0) bytes.fill(0);
    }
    if (!op.current) {
      resource?.dispose();
      return;
    }
    if (!resource) {
      op.fail(AccessFailure.UnregisteredKey, AccessRecovery.Authorize);
      return;
    }
    this.resources.installSession(resource);
    op.finish(
      {
        credentials: CredentialConfirmation.Confirmed,
        kind: AccessOutcome.Ready,
      },
      { type: AccessEvent.Restored },
    );
  }
}
/** Once admitted, mutations keep their position even if their caller is cancelled. */
export class CredentialQueue {
  private tail = Promise.resolve();
  constructor(
    private readonly store: CredentialStore,
    private readonly scope: CredentialScope,
  ) {}
  read(current: () => boolean): Promise<null | Uint8Array> {
    return this.enqueue(() =>
      current() ? this.store.read(this.scope) : Promise.resolve(null),
    );
  }
  remove(): Promise<void> {
    return this.enqueue(() => this.store.remove(this.scope));
  }
  write(bytes: Uint8Array): Promise<void> {
    return this.enqueue(async () => {
      try {
        await this.store.write(this.scope, bytes);
      } finally {
        bytes.fill(0);
      }
    });
  }
  private enqueue<Value>(work: () => Promise<Value>): Promise<Value> {
    const pending = this.tail.then(work);
    this.tail = pending.then(
      () => undefined,
      () => undefined,
    );
    return pending;
  }
}
