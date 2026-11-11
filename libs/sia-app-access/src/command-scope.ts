/** Command scopes correlate settlement and cancellation without owning lifecycle policy. */
import { AccessEvent } from "./access-machine.ts";
import type { LifecycleEvent } from "./access-machine.ts";
import {
  AccessFailure,
  AccessOutcome,
  CredentialEffect,
  RegistrationEffect,
} from "./access-types.ts";
import type {
  AccessCancelled,
  AccessEffects,
  AccessFailed,
  AccessFailureInfo,
  AccessRecovery,
  AccessUnavailable,
  CommandFailure,
  GeneratedRecoveryPhrase,
} from "./access-types.ts";

export const unavailable: AccessUnavailable = Object.freeze({
  kind: AccessOutcome.Unavailable,
});
export interface AccessCommand<Value> extends CommandScope<Value> {
  readonly promise: Promise<AccessCancelled | AccessFailed | Value>;
}
export interface CommandAdmission {
  /** Rejects overlapping admission without cancelling the active command. */
  begin<Value>(settled?: () => void): AccessCommand<Value>;
}
export interface CommandControl extends CommandAdmission {
  cancel(): void;
}
export interface CommandPublication {
  commit(event: LifecycleEvent): void;
  publish(): void;
}
export interface CommandScope<Value> {
  credentialEffect: CredentialEffect;
  readonly current: boolean;
  readonly effects: AccessEffects;
  fail(
    failure: CommandFailure,
    recovery: AccessRecovery,
    keepSession?: boolean,
    cause?: unknown,
  ): void;
  finish(result: AccessCancelled | Value, next?: LifecycleEvent): void;
  publish(): void;
  registrationEffect: RegistrationEffect;
}
export interface ResourceRetirement {
  retireConnection(): void;
  retireSession(): void;
}
interface PendingCommand {
  cancel(): void;
}
export class CommandCoordinator {
  private active: PendingCommand | undefined;
  private readonly generations = new Set<() => void>();
  constructor(
    private readonly publication: CommandPublication,
    private readonly resources: ResourceRetirement,
  ) {}

  begin<Value>(settled?: () => void): AccessCommand<Value> {
    if (this.active) throw new Error("A command is already active");
    this.cancelGenerations();
    let resolve!: (result: AccessCancelled | AccessFailed | Value) => void;
    const promise = new Promise<AccessCancelled | AccessFailed | Value>((r) => {
      resolve = r;
    });
    let effects: AccessEffects = Object.freeze({
      credentials: CredentialEffect.None,
      registration: RegistrationEffect.None,
    });
    const current = () => this.active === token;
    const settle = (
      result: AccessCancelled | AccessFailed | Value,
      next?: LifecycleEvent,
    ) => {
      if (!current()) return;
      // Release admission and capture completion before a subscriber can start another command.
      this.active = undefined;
      settled?.();
      resolve(Object.freeze(result));
      if (next) this.publication.commit(next);
    };
    const token: PendingCommand = {
      cancel() {
        settle({ effects, kind: AccessOutcome.Cancelled });
      },
    };
    this.active = token;
    // Callers publish only after recording their coalesced promise.
    return {
      get credentialEffect() {
        return effects.credentials;
      },
      set credentialEffect(credentials: CredentialEffect) {
        if (current()) effects = Object.freeze({ ...effects, credentials });
      },
      get current() {
        return current();
      },
      get effects() {
        return effects;
      },
      fail: (failure, recovery, keepSession = false, cause?: unknown) => {
        if (!current()) return;
        this.resources.retireConnection();
        if (!keepSession) this.resources.retireSession();
        const info: AccessFailureInfo = Object.freeze({
          effects,
          failure,
          recovery,
        });
        settle(
          {
            kind: AccessOutcome.Failed,
            ...info,
            ...(failure === AccessFailure.CredentialsRead ? { cause } : {}),
          },
          { type: AccessEvent.Failed, ...info },
        );
      },
      finish: settle,
      promise,
      publish: () => {
        if (current()) this.publication.publish();
      },
      get registrationEffect() {
        return effects.registration;
      },
      set registrationEffect(registration: RegistrationEffect) {
        if (current()) effects = Object.freeze({ ...effects, registration });
      },
    };
  }
  cancel(): void {
    this.active?.cancel();
    this.cancelGenerations();
  }
  generate(work: () => Promise<string>): Promise<GeneratedRecoveryPhrase> {
    let resolve!: (result: GeneratedRecoveryPhrase) => void;
    const promise = new Promise<GeneratedRecoveryPhrase>((r) => {
      resolve = r;
    });
    let pending = true;
    const finish = (result: GeneratedRecoveryPhrase) => {
      if (!pending) return;
      pending = false;
      this.generations.delete(cancel);
      resolve(Object.freeze(result));
    };
    const cancel = () => finish({ kind: AccessOutcome.Cancelled });
    this.generations.add(cancel);
    void (async () => {
      try {
        finish({ kind: AccessOutcome.Generated, phrase: await work() });
      } catch {
        finish({
          failure: AccessFailure.PhraseGeneration,
          kind: AccessOutcome.Failed,
        });
      }
    })();
    return promise;
  }
  private cancelGenerations(): void {
    const generations = [...this.generations];
    for (const cancel of generations) cancel();
  }
}
