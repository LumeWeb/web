/** Public declarations must preserve owned buffers and generic session types without DOM or Node ambient types. */
import {
  AccessFailure,
  AccessIntent,
  AccessOutcome,
  AccessPhase,
  createSiaAccess,
  SessionUnavailableError,
  CredentialConfirmation,
  createMemoryCredentialStore,
  observeSiaAccess,
} from "../../dist/index.js";
import type {
  AccessEffects,
  AccessFailureInfo,
  AccessReady,
  CredentialScope,
  CredentialStore,
  MemoryCredentialStore,
  RecoveryPhraseIssue,
  SiaAccess,
  SiaAccessAdapter,
  SiaAccessInteractions,
  SubmitRecoveryPhraseResult,
} from "../../dist/index.js";

const memory: MemoryCredentialStore = createMemoryCredentialStore();
const credentials: CredentialStore = memory;
declare const scope: CredentialScope;
const read: Promise<Uint8Array | null> = credentials.read(scope);
const writePromise: Promise<void> = credentials.write(
  scope,
  new Uint8Array(32),
);
void read;
void writePromise;
// @ts-expect-error Credential scope identities are readonly.
scope.appId = "changed";

declare const access: SiaAccess<{ readonly id: string }>;
declare const interactions: SiaAccessInteractions<{ readonly id: string }>;
const stopBase = observeSiaAccess(access, (snapshot) => {
  // @ts-expect-error Base controllers need not expose interaction presentation.
  void snapshot.presentation;
});
const stopInteractions = observeSiaAccess(interactions, (snapshot) => {
  void snapshot.presentation;
});
stopBase();
stopInteractions();
const borrowed: Promise<string> = access.withSession((session) => session.id);
void borrowed;
const operation = access.openOperationScope();
const independent: Promise<string> = operation.run((session) => session.id);
void independent;
void operation.close();
void operation.closed;
const activeId: string | null = access.getSnapshot().activeSessionId;
const activeHex: string | null = access.activeAppKeyHex();
const activeBytes: Uint8Array = access.copyActiveAppKeySeed();
void activeId;
void activeHex;
void activeBytes;
// @ts-expect-error Account operation scopes do not expose a source.
operation.source;
// @ts-expect-error Account operation scopes do not expose an SDK value.
operation.value;
// @ts-expect-error The session type must not become any.
access.withSession((session) => session.unknownProperty);

interface Destination {
  write(content: Uint8Array): Promise<string>;
}
interface View {
  correctPhrase(issue: RecoveryPhraseIssue): void;
  explainEffects(effects: AccessEffects): void;
  offerConnection(): void;
  showFailure(failure: AccessFailureInfo): void;
  showSavedConfirmation(confirmation: CredentialConfirmation): void;
}

export function inspectCommandEffects(
  op: import("../../dist/command-scope.js").CommandScope<unknown>,
): void {
  // @ts-expect-error Raw effect snapshots cannot be edited.
  op.effects.credentials = op.credentialEffect;
  // @ts-expect-error Raw effect snapshots cannot be replaced.
  op.effects = {
    credentials: op.credentialEffect,
    registration: op.registrationEffect,
  };
}

export function inspectEnumDiscriminants(access: SiaAccess<Destination>): void {
  void access.authorize(AccessIntent.Create);
  // @ts-expect-error Domain inputs require the exported enum.
  void access.authorize("create");
  const state = access.getSnapshot().state;
  if (state.phase === AccessPhase.AwaitingApproval) {
    const url: string = state.approvalUrl;
    void url;
    // @ts-expect-error Approval is not session readiness.
    void state.credentials;
    // @ts-expect-error Snapshots remain readonly.
    state.approvalUrl = "https://other.test";
  }
  void access.reconnect().then((result) => {
    if (result.kind === AccessOutcome.Ready) {
      const confirmed: CredentialConfirmation.Confirmed = result.credentials;
      void confirmed;
      // @ts-expect-error Confirmed commands cannot become unconfirmed ready outcomes.
      const unconfirmed: AccessReady<CredentialConfirmation.Unconfirmed> =
        result;
      void unconfirmed;
      // @ts-expect-error Ready outcomes do not expose failure effects.
      void result.effects;
    }
    if (result.kind === AccessOutcome.Failed) {
      // @ts-expect-error Phrase generation failures are not primary command failures.
      const failure: AccessFailure.PhraseGeneration = result.failure;
      void failure;
    }
  });
}

export function inspectTypes(access: SiaAccess<Destination>): void {
  void access.withSession((destination) => {
    // @ts-expect-error Session inference must not admit unrelated SDK methods.
    return destination.unrelatedMethod();
  });
  void access.reconnect().then((result) => {
    if (result.kind === AccessOutcome.Ready) {
      const confirmed: "confirmed" = result.credentials;
      void confirmed;
      // @ts-expect-error Outcomes must not be rewritten after another command starts.
      result.kind = "missing-credentials";
    }
  });
  // @ts-expect-error A snapshot carries no session authority.
  void access.getSnapshot().session;
  // @ts-expect-error Intent must be explicit and supported.
  void access.authorize("automatic");
}

export async function restore(
  access: SiaAccess<Destination>,
  view: View,
): Promise<void> {
  const result = await access.reconnect();
  switch (result.kind) {
    case AccessOutcome.Cancelled:
      view.explainEffects(result.effects);
      return;
    case AccessOutcome.Failed:
      view.showFailure(result);
      return;
    case AccessOutcome.MissingCredentials:
      view.offerConnection();
      return;
    case AccessOutcome.Ready:
      view.showSavedConfirmation(result.credentials);
      return;
    case AccessOutcome.Unavailable:
      return;
  }
}

export async function submit(
  access: SiaAccess<Destination>,
  phrase: string,
  view: View,
): Promise<void> {
  const result = await access.submitRecoveryPhrase(phrase);
  switch (result.kind) {
    case AccessOutcome.Cancelled:
      view.explainEffects(result.effects);
      return;
    case AccessOutcome.Failed:
      view.showFailure(result);
      return;
    case AccessOutcome.InvalidPhrase:
    case AccessOutcome.PhraseMismatch:
      view.correctPhrase(result.kind);
      return;
    case AccessOutcome.Ready:
      view.showSavedConfirmation(result.credentials);
      return;
    case AccessOutcome.Unavailable:
      return;
  }
}

export async function write(
  access: SiaAccess<Destination>,
  content: Uint8Array,
): Promise<null | string> {
  try {
    return await access.withSession((destination) =>
      destination.write(content),
    );
  } catch (error) {
    if (error instanceof SessionUnavailableError) return null;
    throw error;
  }
}

declare const adapter: SiaAccessAdapter<{ readonly id: string }>;
const phrase: Promise<string> = adapter.generateRecoveryPhrase();
void phrase;

declare const result: SubmitRecoveryPhraseResult;
if (result.kind === AccessOutcome.Ready) {
  const confirmed: CredentialConfirmation.Confirmed = result.credentials;
  void confirmed;
}
