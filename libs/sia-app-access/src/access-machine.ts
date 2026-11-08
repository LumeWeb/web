/** Private lifecycle policy projects states and action availability without starting native work. */
import {
  createMachine,
  guard,
  interpret,
  reduce,
  state,
  transition,
} from "robot3";
import type { Guard, Reducer } from "robot3";
import {
  AccessFailure,
  AccessIntent,
  AccessOutcome,
  AccessPhase,
  ApprovalProgress,
  CredentialConfirmation,
  PhraseValidation,
  SaveRecoveryProgress,
} from "./access-types.ts";
import type {
  AccessFailureInfo,
  AccessInteractionIdentity,
  AccessPresentation,
  AccessState,
  RecoveryPhraseIssue,
} from "./access-types.ts";

export enum AccessEvent {
  Approved = "approved",
  Authorize = "authorize",
  Began = "began",
  Cancel = "cancel",
  Continue = "continue",
  Disconnect = "disconnect",
  Dispose = "dispose",
  Failed = "failed",
  Forget = "forget",
  Matched = "matched",
  Missing = "missing",
  Reconnect = "reconnect",
  Registered = "registered",
  Removed = "removed",
  Restored = "restored",
  Retry = "retry",
  Saved = "saved",
  Submit = "submit",
  Validated = "validated",
}
enum Lifecycle {
  Awaiting = "awaiting",
  CheckingExisting = "checking-existing",
  Disconnected = "disconnected",
  Disposed = "disposed",
  Failed = "failed",
  Forgetting = "forgetting",
  Phrase = "phrase",
  Ready = "ready",
  Registering = "registering",
  Requesting = "requesting",
  Restoring = "restoring",
  SaveFailed = "save-failed",
  Saving = "saving",
  Validating = "validating",
}
export type LifecycleEvent =
  | AuthorizeEvent
  | BeganEvent
  | FailureEvent
  | MatchedEvent
  | SignalEvent
  | ValidatedEvent;
interface AccessContext {
  readonly approvalUrl: string;
  readonly credentials: CredentialConfirmation;
  readonly failure: AccessFailureInfo | undefined;
  readonly intent: AccessIntent;
  readonly interaction: AccessInteractionIdentity | null;
  readonly issue: RecoveryPhraseIssue | undefined;
  readonly sequence: number;
}
interface AuthorizeEvent {
  readonly intent: AccessIntent;
  readonly type: AccessEvent.Authorize;
}
interface BeganEvent {
  readonly approvalUrl: string;
  readonly type: AccessEvent.Began;
}
interface FailureEvent extends AccessFailureInfo {
  readonly type: AccessEvent.Failed;
}
interface MatchedEvent {
  readonly matches: boolean;
  readonly type: AccessEvent.Matched;
}
type PolicyPart =
  Guard<AccessContext, LifecycleEvent> | Reducer<AccessContext, LifecycleEvent>;
interface SignalEvent {
  readonly type: Exclude<
    AccessEvent,
    | AccessEvent.Authorize
    | AccessEvent.Began
    | AccessEvent.Failed
    | AccessEvent.Matched
    | AccessEvent.Validated
  >;
}
interface ValidatedEvent {
  readonly type: AccessEvent.Validated;
  readonly validation: PhraseValidation;
}
// Robot3 accepts arbitrary payloads and string targets. These wrappers close that boundary.
function route(event: AccessEvent, target: Lifecycle, ...parts: PolicyPart[]) {
  return transition(event, target, ...parts);
}
const remember = reduce<AccessContext, LifecycleEvent>((context, event) => {
  switch (event.type) {
    case AccessEvent.Authorize:
      if (context.sequence === Number.MAX_SAFE_INTEGER)
        throw new Error("Access interaction sequence exhausted");
      return {
        ...context,
        failure: undefined,
        intent: event.intent,
        interaction: Object.freeze({ sequence: context.sequence + 1 }),
        issue: undefined,
        sequence: context.sequence + 1,
      };
    case AccessEvent.Began:
      return { ...context, approvalUrl: event.approvalUrl };
    case AccessEvent.Cancel:
    case AccessEvent.Disconnect:
    case AccessEvent.Dispose:
    case AccessEvent.Forget:
    case AccessEvent.Reconnect:
      return { ...context, interaction: null };
    case AccessEvent.Continue:
      return { ...context, credentials: CredentialConfirmation.Unconfirmed };
    case AccessEvent.Failed:
      return {
        ...context,
        failure: {
          effects: event.effects,
          failure: event.failure,
          recovery: event.recovery,
        },
      };
    case AccessEvent.Matched:
      return {
        ...context,
        issue: event.matches ? undefined : AccessOutcome.PhraseMismatch,
      };
    case AccessEvent.Restored:
    case AccessEvent.Saved:
      return { ...context, credentials: CredentialConfirmation.Confirmed };
    case AccessEvent.Validated:
      return {
        ...context,
        issue:
          event.validation === PhraseValidation.Invalid
            ? AccessOutcome.InvalidPhrase
            : undefined,
      };
    default:
      return context;
  }
});
const invalid = guard<AccessContext, LifecycleEvent>(
  (_context, event) =>
    event.type === AccessEvent.Validated &&
    event.validation === PhraseValidation.Invalid,
);
const existing = guard<AccessContext, LifecycleEvent>(
  (context) => context.intent === AccessIntent.Existing,
);
const mismatch = guard<AccessContext, LifecycleEvent>(
  (_context, event) => event.type === AccessEvent.Matched && !event.matches,
);
const saveFailure = guard<AccessContext, LifecycleEvent>(
  (_context, event) =>
    event.type === AccessEvent.Failed &&
    event.failure === AccessFailure.CredentialsWrite,
);
function idle() {
  return [
    ...pending(),
    route(AccessEvent.Authorize, Lifecycle.Requesting, remember),
    route(AccessEvent.Reconnect, Lifecycle.Restoring, remember),
  ];
}
function pending() {
  return [
    ...teardown(),
    route(AccessEvent.Cancel, Lifecycle.Disconnected, remember),
    route(AccessEvent.Failed, Lifecycle.Failed, remember),
  ];
}
function teardown() {
  return [
    route(AccessEvent.Disconnect, Lifecycle.Disconnected, remember),
    route(AccessEvent.Dispose, Lifecycle.Disposed, remember),
    route(AccessEvent.Forget, Lifecycle.Forgetting, remember),
  ];
}
const policy = createMachine(
  Lifecycle.Disconnected,
  {
    [Lifecycle.Awaiting]: state(
      ...pending(),
      route(AccessEvent.Approved, Lifecycle.Phrase),
    ),
    [Lifecycle.CheckingExisting]: state(
      ...pending(),
      route(AccessEvent.Matched, Lifecycle.Phrase, mismatch, remember),
      route(AccessEvent.Matched, Lifecycle.Registering, remember),
    ),
    [Lifecycle.Disconnected]: state(...idle()),
    [Lifecycle.Disposed]: state(),
    [Lifecycle.Failed]: state(...idle()),
    [Lifecycle.Forgetting]: state(
      ...pending(),
      route(AccessEvent.Removed, Lifecycle.Disconnected),
    ),
    [Lifecycle.Phrase]: state(
      ...pending(),
      route(AccessEvent.Submit, Lifecycle.Validating),
    ),
    [Lifecycle.Ready]: state(...teardown()),
    [Lifecycle.Registering]: state(
      ...pending(),
      route(AccessEvent.Registered, Lifecycle.Saving),
    ),
    [Lifecycle.Requesting]: state(
      ...pending(),
      route(AccessEvent.Began, Lifecycle.Awaiting, remember),
    ),
    [Lifecycle.Restoring]: state(
      ...pending(),
      route(AccessEvent.Missing, Lifecycle.Disconnected),
      route(AccessEvent.Restored, Lifecycle.Ready, remember),
    ),
    [Lifecycle.SaveFailed]: state(
      ...pending(),
      route(AccessEvent.Retry, Lifecycle.Saving),
      route(AccessEvent.Continue, Lifecycle.Ready, remember),
    ),
    [Lifecycle.Saving]: state(
      route(AccessEvent.Failed, Lifecycle.SaveFailed, saveFailure, remember),
      ...pending(),
      route(AccessEvent.Saved, Lifecycle.Ready, remember),
    ),
    [Lifecycle.Validating]: state(
      ...pending(),
      route(AccessEvent.Validated, Lifecycle.Phrase, invalid, remember),
      route(
        AccessEvent.Validated,
        Lifecycle.CheckingExisting,
        existing,
        remember,
      ),
      route(AccessEvent.Validated, Lifecycle.Registering, remember),
    ),
  },
  (): AccessContext => ({
    approvalUrl: "",
    credentials: CredentialConfirmation.Confirmed,
    failure: undefined,
    intent: AccessIntent.Create,
    interaction: null,
    issue: undefined,
    sequence: 0,
  }),
);

export interface AccessMachine {
  allows(event: AccessEvent): boolean;
  canBorrow(): boolean;
  canGenerate(): boolean;
  checkingExisting(): boolean;
  presentation(): AccessPresentation;
  project(): AccessState;
  send(event: LifecycleEvent): boolean;
}
export function createAccessMachine(): AccessMachine {
  // Publication is a controller commit boundary, never an interpreter callback.
  const service = interpret(policy, () => {
    return;
  });
  function send(event: LifecycleEvent): boolean {
    const before = service.machine;
    service.send(event);
    return service.machine !== before;
  }
  function allows(event: AccessEvent): boolean {
    return service.machine.state.value.transitions.has(event);
  }
  function project(): AccessState {
    const context = service.context;
    switch (service.machine.current) {
      case Lifecycle.Awaiting:
        return {
          approvalUrl: context.approvalUrl,
          intent: context.intent,
          phase: AccessPhase.AwaitingApproval,
        };
      case Lifecycle.CheckingExisting:
      case Lifecycle.Validating:
        return { intent: context.intent, phase: AccessPhase.ValidatingPhrase };
      case Lifecycle.Disconnected:
        return { phase: AccessPhase.Disconnected };
      case Lifecycle.Disposed:
        return { phase: AccessPhase.Disposed };
      case Lifecycle.Failed:
      case Lifecycle.SaveFailed:
        if (!context.failure) throw new Error("Missing lifecycle failure");
        return { phase: AccessPhase.Failed, ...context.failure };
      case Lifecycle.Forgetting:
        return { phase: AccessPhase.Forgetting };
      case Lifecycle.Phrase:
        return {
          intent: context.intent,
          phase: AccessPhase.RecoveryPhrase,
          ...(context.issue ? { issue: context.issue } : {}),
        };
      case Lifecycle.Ready:
        return { credentials: context.credentials, phase: AccessPhase.Ready };
      case Lifecycle.Registering:
        return { intent: context.intent, phase: AccessPhase.Registering };
      case Lifecycle.Requesting:
        return {
          intent: context.intent,
          phase: AccessPhase.RequestingApproval,
        };
      case Lifecycle.Restoring:
        return { phase: AccessPhase.Restoring };
      case Lifecycle.Saving:
        return { intent: context.intent, phase: AccessPhase.Saving };
    }
    throw new Error("Unknown lifecycle state");
  }
  function canGenerate() {
    return (
      service.machine.current === Lifecycle.Disconnected ||
      service.machine.current === Lifecycle.Phrase
    );
  }
  function canBorrow() {
    return service.machine.current === Lifecycle.Ready;
  }
  function presentation(): AccessPresentation {
    const current = service.machine.current;
    const { approvalUrl, failure, intent, interaction } = service.context;
    const approval =
      interaction && current === Lifecycle.Requesting
        ? Object.freeze({
            interaction,
            progress: ApprovalProgress.Requesting,
            url: null,
          })
        : interaction && current === Lifecycle.Awaiting
          ? Object.freeze({
              interaction,
              progress: ApprovalProgress.Awaiting,
              url: approvalUrl,
            })
          : null;
    const phrase =
      interaction &&
      (current === Lifecycle.Phrase ||
        current === Lifecycle.Validating ||
        current === Lifecycle.CheckingExisting)
        ? Object.freeze({ intent, interaction })
        : null;
    const saveRecovery =
      interaction &&
      failure?.failure === AccessFailure.CredentialsWrite &&
      (current === Lifecycle.SaveFailed || current === Lifecycle.Saving)
        ? Object.freeze({
            effects: failure.effects,
            interaction,
            progress:
              current === Lifecycle.Saving
                ? SaveRecoveryProgress.Pending
                : SaveRecoveryProgress.Idle,
          })
        : null;
    return Object.freeze({
      approval,
      availability: Object.freeze({
        authorize: allows(AccessEvent.Authorize),
        cancel: allows(AccessEvent.Cancel),
        continueWithoutSaving: allows(AccessEvent.Continue),
        disconnect: allows(AccessEvent.Disconnect),
        forget: allows(AccessEvent.Forget),
        generateRecoveryPhrase: canGenerate(),
        reconnect: allows(AccessEvent.Reconnect),
        retrySave: allows(AccessEvent.Retry),
        submitRecoveryPhrase: allows(AccessEvent.Submit),
        withSession: canBorrow(),
      }),
      interaction,
      phrase,
      saveRecovery,
    });
  }
  return {
    allows,
    canBorrow,
    canGenerate,
    checkingExisting: () =>
      service.machine.current === Lifecycle.CheckingExisting,
    presentation,
    project,
    send,
  };
}
