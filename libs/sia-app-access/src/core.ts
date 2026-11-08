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
import {
  CredentialOperations,
  CredentialQueue,
} from "./credential-operations.ts";
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
  const publication = new AccessPublication(
    environment.scope,
    machine,
    options.onSubscriberError,
  );
  const resources = new AccessResources<Session>();
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
  function stop(
    event: AccessEvent.Cancel | AccessEvent.Disconnect | AccessEvent.Dispose,
  ): void {
    if (!machine.send({ type: event })) return;
    commands.cancel();
    resources.retire();
    publication.publish();
  }
  return {
    authorize: (intent) => authorization.authorize(intent),
    cancel: () => stop(AccessEvent.Cancel),
    continueWithoutSaving: () => credentials.continueWithoutSaving(),
    disconnect: () => stop(AccessEvent.Disconnect),
    dispose: () => stop(AccessEvent.Dispose),
    forget: () => credentials.forget(),
    generateRecoveryPhrase: () =>
      machine.canGenerate()
        ? commands.generate(() => environment.adapter.generateRecoveryPhrase())
        : Promise.resolve(unavailable),
    getSnapshot: () => publication.snapshot,
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
