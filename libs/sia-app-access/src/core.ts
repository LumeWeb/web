/** The public controller composes lifecycle policy, owned effects and immutable observations. */
import { AccessEvent, createAccessMachine } from "./access-machine.ts";
import type { AccessMachine, LifecycleEvent } from "./access-machine.ts";
import { createAccessEnvironment } from "./access-environment.ts";
import {
  AccessResources,
  SessionUnavailableError,
} from "./access-resources.ts";
import { Authorization } from "./authorization.ts";
import { CommandCoordinator, unavailable } from "./command-scope.ts";
import { CredentialOperations } from "./credential-operations.ts";
import { CredentialQueue } from "./credential-queue.ts";
import { AccessPhase } from "./access-types.ts";
import type {
  AccessInteractionSnapshot,
  SiaAccessInteractions,
  SiaAccessOptions,
} from "./access-types.ts";
import type { CredentialScope } from "./credentials.ts";
export { SessionUnavailableError } from "./access-resources.ts";

/** Publication follows command settlement; nested publication replaces the older notification. */
class AccessPublication {
  get snapshot(): AccessInteractionSnapshot {
    return this.publishedSnapshot;
  }
  private readonly listeners = new Set<() => void>();
  private publishedSnapshot: AccessInteractionSnapshot;
  constructor(
    private readonly scope: CredentialScope,
    private readonly machine: AccessMachine,
    private readonly activeSessionId: () => null | string,
    private readonly onError: ((error: unknown) => void) | undefined,
  ) {
    this.publishedSnapshot = this.project();
  }
  commit(event: LifecycleEvent): void {
    this.machine.send(event);
    this.publish();
  }
  publish(): void {
    const published = this.project();
    this.publishedSnapshot = published;
    // Subscriptions created by a callback belong to the next publication.
    const listeners = [...this.listeners];
    for (const listener of listeners) {
      // A reentrant publication already notified observers of the newer snapshot.
      if (this.publishedSnapshot !== published) break;
      try {
        listener();
      } catch (error) {
        try {
          this.onError?.(error);
        } catch {
          /* Error reporting cannot interrupt other subscribers. */
        }
      }
    }
    if (published.state.phase === AccessPhase.Disposed) this.listeners.clear();
  }
  subscribe(listener: () => void): () => void {
    if (this.publishedSnapshot.state.phase !== AccessPhase.Disposed)
      this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  private project(): AccessInteractionSnapshot {
    return Object.freeze({
      activeSessionId: this.machine.canBorrow() ? this.activeSessionId() : null,
      presentation: this.machine.presentation(),
      scope: this.scope,
      state: Object.freeze(this.machine.project()),
    });
  }
}

export function createSiaAccess<Session>(
  options: SiaAccessOptions<Session>,
): SiaAccessInteractions<Session> {
  const environment = createAccessEnvironment(options);
  const machine = createAccessMachine();
  const resources = new AccessResources<Session>(options.onResourceError);
  const publication = new AccessPublication(
    environment.scope,
    machine,
    () => resources.activeSessionId,
    options.onSubscriberError,
  );
  const commands = new CommandCoordinator(publication, resources);
  const publish = () => publication.publish();
  const queue = new CredentialQueue(environment.credentials, environment.scope);
  const credentials = new CredentialOperations(
    environment,
    machine,
    commands,
    resources,
    publish,
    queue,
  );
  const authorization = new Authorization(
    environment,
    machine,
    commands,
    resources,
    credentials,
    publish,
  );
  let cleanup: Promise<void> = Promise.resolve();
  function stop(
    event: AccessEvent.Cancel | AccessEvent.Disconnect | AccessEvent.Dispose,
  ): Promise<void> {
    if (!machine.send({ type: event })) return cleanup;
    commands.cancel();
    cleanup =
      event === AccessEvent.Dispose ? resources.dispose() : resources.retire();
    publication.publish();
    return cleanup;
  }
  return {
    activeAppKeyHex: () => {
      if (!machine.canBorrow()) return null;
      const id = resources.activeSessionId;
      const bytes = resources.exportAppKey();
      try {
        if (!machine.canBorrow() || resources.activeSessionId !== id)
          return null;
        return Array.from(bytes, (byte) =>
          byte.toString(16).padStart(2, "0"),
        ).join("");
      } finally {
        bytes.fill(0);
      }
    },
    authorize: (intent) => authorization.authorize(intent),
    cancel: () => {
      void stop(AccessEvent.Cancel);
    },
    continueWithoutSaving: () => credentials.continueWithoutSaving(),
    copyActiveAppKeySeed: () => {
      if (!machine.canBorrow()) throw new SessionUnavailableError();
      const id = resources.activeSessionId;
      const bytes = resources.exportAppKey();
      try {
        if (!machine.canBorrow() || resources.activeSessionId !== id)
          throw new SessionUnavailableError();
        return Uint8Array.from(bytes);
      } finally {
        bytes.fill(0);
      }
    },
    disconnect: () => stop(AccessEvent.Disconnect),
    dispose: () => stop(AccessEvent.Dispose),
    forget: () => credentials.forget(),
    generateRecoveryPhrase: () =>
      machine.canGenerate()
        ? commands.generate(() => environment.adapter.generateRecoveryPhrase())
        : Promise.resolve(unavailable),
    getSnapshot: () => publication.snapshot,
    openOperationScope: () => {
      if (!machine.canBorrow()) throw new SessionUnavailableError();
      const scope = resources.openOperationScope();
      return Object.freeze({
        close: () => scope.close(),
        closed: scope.closed,
        run: <Result>(work: (session: Session) => Promise<Result> | Result) =>
          scope.run((session) => work(session)),
      });
    },
    reconnect: () => credentials.reconnect(),
    retrySave: () => credentials.retrySave(),
    submitRecoveryPhrase: (phrase) =>
      authorization.submitRecoveryPhrase(phrase),
    subscribe: (listener) => publication.subscribe(listener),
    withSession: (work) =>
      machine.canBorrow()
        ? resources.run(work)
        : Promise.reject(new SessionUnavailableError()),
  };
}
