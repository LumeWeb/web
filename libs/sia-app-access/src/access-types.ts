/** Public lifecycle models expose state without transferring controller resource ownership. */
// Enum declaration order is observable through Object.values and remains part of this API.
/* oxlint-disable perfectionist/sort-enums */
import type { CredentialScope, CredentialStore } from "./credentials.ts";
export enum AccessErrorCode {
  SiaSessionUnavailable = "SIA_SESSION_UNAVAILABLE",
}

export enum AccessFailure {
  Approval = "approval",
  ApprovalTimeout = "approval-timeout",
  Connection = "connection",
  CredentialsRead = "credentials-read",
  CredentialsRemove = "credentials-remove",
  CredentialsWrite = "credentials-write",
  PhraseCheck = "phrase-check",
  Registration = "registration",
  RegistrationLimit = "registration-limit",
  Session = "session",
  UnregisteredKey = "unregistered-key",
  PhraseGeneration = "phrase-generation",
}

export enum AccessIntent {
  Create = "create",
  Existing = "existing",
}

export enum AccessOutcome {
  Failed = "failed",
  Cancelled = "cancelled",
  Unavailable = "unavailable",
  Ready = "ready",
  Approved = "approved",
  MissingCredentials = "missing-credentials",
  InvalidPhrase = "invalid-phrase",
  PhraseMismatch = "phrase-mismatch",
  Removed = "removed",
  Generated = "generated",
}

export enum AccessPhase {
  Ready = "ready",
  Failed = "failed",
  AwaitingApproval = "awaiting-approval",
  RecoveryPhrase = "recovery-phrase",
  Registering = "registering",
  RequestingApproval = "requesting-approval",
  Saving = "saving",
  ValidatingPhrase = "validating-phrase",
  Disconnected = "disconnected",
  Disposed = "disposed",
  Forgetting = "forgetting",
  Restoring = "restoring",
}

export enum AccessRecovery {
  Authorize = "authorize",
  Forget = "forget",
  Reconnect = "reconnect",
  Save = "save",
}

export enum ApprovalProgress {
  Requesting = "requesting",
  Awaiting = "awaiting",
}

/** Confirmation from a read or acknowledged write is not a durability guarantee. */
export enum CredentialConfirmation {
  Confirmed = "confirmed",
  Unconfirmed = "unconfirmed",
}

export enum CredentialEffect {
  None = "none",
  Write = "write",
  Remove = "remove",
}

export enum PhraseValidation {
  Valid = "valid",
  Invalid = "invalid",
}

export enum RegistrationEffect {
  None = "none",
  Registered = "registered",
  Unknown = "unknown",
}
export enum SaveRecoveryProgress {
  Idle = "idle",
  Pending = "pending",
}
export type AccessApprovalPresentation =
  AccessAwaitingApprovalPresentation | AccessRequestingApprovalPresentation;
export interface AccessApproved {
  readonly kind: AccessOutcome.Approved;
}
export interface AccessAvailability {
  readonly authorize: boolean;
  readonly cancel: boolean;
  readonly continueWithoutSaving: boolean;
  readonly disconnect: boolean;
  readonly forget: boolean;
  readonly generateRecoveryPhrase: boolean;
  readonly reconnect: boolean;
  readonly retrySave: boolean;
  readonly submitRecoveryPhrase: boolean;
  readonly withSession: boolean;
}
export interface AccessAwaitingApprovalPresentation {
  readonly interaction: AccessInteractionIdentity;
  readonly progress: ApprovalProgress.Awaiting;
  readonly url: string;
}
export interface AccessAwaitingApprovalState extends AccessIntentState {
  readonly approvalUrl: string;
  readonly phase: AccessPhase.AwaitingApproval;
}
export interface AccessCancelled {
  readonly effects: AccessEffects;
  readonly kind: AccessOutcome.Cancelled;
}
/** Connection ownership transfers on return, including a late return after cancellation.
 * The controller waits once, checks phrases sequentially and registers at most once.
 */
export interface AccessConnection<Session> {
  readonly approvalUrl: string;
  /** Denies new work without throwing; return completion if native cleanup must drain. */
  dispose(): Promise<void> | void;
  matchesExistingAppKey(phrase: string): Promise<boolean>;
  register(phrase: string): Promise<AccessSession<Session>>;
  waitForApproval(): Promise<void>;
}
/** Effects concern this command, not global account state or other commands. */
export interface AccessEffects {
  /** A dispatched or irreversibly queued mutation may complete after cancellation. */
  readonly credentials: CredentialEffect;
  /** Unknown means registration was dispatched without a confirmed outcome. */
  readonly registration: RegistrationEffect;
}
export interface AccessFailed extends AccessFailureInfo {
  /** A reconnect credential-read error is available only on that command's result. */
  readonly cause?: unknown;
  readonly kind: AccessOutcome.Failed;
}
export interface AccessFailedState extends AccessFailureInfo {
  readonly phase: AccessPhase.Failed;
}
export interface AccessFailureInfo {
  readonly effects: AccessEffects;
  readonly failure: CommandFailure;
  readonly recovery: AccessRecovery;
}
export interface AccessGeneratedPhrase {
  readonly kind: AccessOutcome.Generated;
  readonly phrase: string;
}
export interface AccessGenerationCancelled {
  readonly kind: AccessOutcome.Cancelled;
}
export interface AccessGenerationFailed {
  readonly failure: AccessFailure.PhraseGeneration;
  readonly kind: AccessOutcome.Failed;
}
export type AccessIncomplete =
  AccessCancelled | AccessFailed | AccessUnavailable;
export interface AccessIntentState {
  readonly intent: AccessIntent;
}
/** Presentation identity is local to one controller, never session authority. */
export interface AccessInteractionIdentity {
  readonly sequence: number;
}
export interface AccessInteractionSnapshot extends AccessSnapshot {
  readonly presentation: AccessPresentation;
}
export interface AccessInvalidPhrase {
  readonly kind: AccessOutcome.InvalidPhrase;
}
export type AccessLifecyclePhase =
  | AccessPhase.Disconnected
  | AccessPhase.Disposed
  | AccessPhase.Forgetting
  | AccessPhase.Restoring;
export interface AccessLifecycleState {
  readonly phase: AccessLifecyclePhase;
}
export interface AccessMissingCredentials {
  readonly kind: AccessOutcome.MissingCredentials;
}
/** Independent account work without a second SDK owner or an exposed session source. */
export interface AccessOperationScope<Session> {
  /** Denies new work and waits for admitted work before releasing its parent borrow. */
  close(): Promise<void>;
  readonly closed: Promise<void>;
  /** Admits work before returning its promise; adapters own their native child handles. */
  run<Result>(work: SessionWork<Session, Result>): Promise<Result>;
}
export interface AccessPhraseMismatch {
  readonly kind: AccessOutcome.PhraseMismatch;
}
export interface AccessPhrasePresentation {
  readonly intent: AccessIntent;
  readonly interaction: AccessInteractionIdentity;
}
export interface AccessPresentation {
  readonly approval: AccessApprovalPresentation | null;
  readonly availability: AccessAvailability;
  readonly interaction: AccessInteractionIdentity | null;
  readonly phrase: AccessPhrasePresentation | null;
  readonly saveRecovery: AccessSaveRecoveryPresentation | null;
}
export interface AccessReady<
  Confirmation extends CredentialConfirmation = CredentialConfirmation,
> {
  readonly credentials: Confirmation;
  readonly kind: AccessOutcome.Ready;
}
export interface AccessReadyState {
  readonly credentials: CredentialConfirmation;
  readonly phase: AccessPhase.Ready;
}
export interface AccessRecoveryPhraseState extends AccessIntentState {
  readonly issue?: RecoveryPhraseIssue;
  readonly phase: AccessPhase.RecoveryPhrase;
}
export interface AccessRemoved {
  readonly kind: AccessOutcome.Removed;
}
export interface AccessRequestingApprovalPresentation {
  readonly interaction: AccessInteractionIdentity;
  readonly progress: ApprovalProgress.Requesting;
  readonly url: null;
}
export interface AccessSaveRecoveryPresentation {
  readonly effects: AccessEffects;
  readonly interaction: AccessInteractionIdentity;
  readonly progress: SaveRecoveryProgress;
}
export interface AccessSession<Session> {
  /** Releases ownership idempotently without throwing; the controller delays this until admitted work settles. */
  dispose(): void;
  /** Returns a fresh caller-owned 32-byte app key, never retained session memory. */
  exportAppKey(): Uint8Array;
  /** A shared object value must outlive every handle and admitted use that still needs it. */
  readonly value: Session;
}
export interface AccessSnapshot {
  /** Nonsecret identity of the ready account SDK, distinct across controller instances. */
  readonly activeSessionId: null | string;
  readonly scope: CredentialScope;
  readonly state: AccessState;
}
export type AccessState =
  | AccessAwaitingApprovalState
  | AccessFailedState
  | AccessLifecycleState
  | AccessReadyState
  | AccessRecoveryPhraseState
  | AccessWorkingState;
export interface AccessUnavailable {
  readonly kind: AccessOutcome.Unavailable;
}
export type AccessWorkingPhase =
  | AccessPhase.Registering
  | AccessPhase.RequestingApproval
  | AccessPhase.Saving
  | AccessPhase.ValidatingPhrase;
export interface AccessWorkingState extends AccessIntentState {
  readonly phase: AccessWorkingPhase;
}
export type AuthorizeResult = AccessApproved | AccessIncomplete;
export type CommandFailure = Exclude<
  AccessFailure,
  AccessFailure.PhraseGeneration
>;
export type ContinueWithoutSavingResult =
  AccessReady<CredentialConfirmation.Unconfirmed> | AccessUnavailable;
export type ForgetResult = AccessIncomplete | AccessRemoved;

export type GeneratedRecoveryPhrase =
  | AccessGeneratedPhrase
  | AccessGenerationCancelled
  | AccessGenerationFailed
  | AccessUnavailable;
export type ReconnectResult =
  | AccessIncomplete
  | AccessMissingCredentials
  | AccessReady<CredentialConfirmation.Confirmed>;
export type RecoveryPhraseIssue =
  AccessOutcome.InvalidPhrase | AccessOutcome.PhraseMismatch;
export type RetrySaveResult =
  AccessIncomplete | AccessReady<CredentialConfirmation.Confirmed>;
export type SessionWork<Session, Result> = (
  session: Session,
) => Promise<Result> | Result;
export interface SiaAccess<Session> extends SiaAccessOperations<Session> {
  /** Returns a string for the existing native stream auth source, or null when not ready. */
  activeAppKeyHex(): null | string;
  /** Returns a fresh caller-owned copy while ready; callers must clear their copy. */
  copyActiveAppKeySeed(): Uint8Array;
  /** Terminally stops admission, then waits for accepted work and SDK cleanup. */
  dispose(): Promise<void>;
  getSnapshot(): AccessSnapshot;
  /** Opens a generation-bound work handle only while ready. */
  openOperationScope(): AccessOperationScope<Session>;
  subscribe(listener: () => void): () => void;
}
export interface SiaAccessAdapter<Session> {
  begin(
    scope: CredentialScope,
    application: SiaApplication,
  ): Promise<AccessConnection<Session>>;
  generateRecoveryPhrase(): Promise<string>;
  /** Borrows appKey until settlement; null means an unrecognized key, while operational failures reject. */
  reconnect(
    scope: CredentialScope,
    application: SiaApplication,
    appKey: Uint8Array,
  ): Promise<AccessSession<Session> | null>;
  /** Invalid input resolves; unavailable validation rejects as an operational failure. */
  validateRecoveryPhrase(phrase: string): Promise<PhraseValidation>;
}
export interface SiaAccessInteractions<Session> extends SiaAccess<Session> {
  getSnapshot(): AccessInteractionSnapshot;
}
export interface SiaAccessOperations<Session> {
  authorize(intent: AccessIntent): Promise<AuthorizeResult>;
  cancel(): void;
  continueWithoutSaving(): ContinueWithoutSavingResult;
  disconnect(): Promise<void>;
  forget(): Promise<ForgetResult>;
  generateRecoveryPhrase(): Promise<GeneratedRecoveryPhrase>;
  reconnect(): Promise<ReconnectResult>;
  retrySave(): Promise<RetrySaveResult>;
  submitRecoveryPhrase(phrase: string): Promise<SubmitRecoveryPhraseResult>;
  withSession<Result>(work: SessionWork<Session, Result>): Promise<Result>;
}
export interface SiaAccessOptions<Session> {
  readonly adapter: SiaAccessAdapter<Session>;
  readonly application: SiaApplication;
  readonly approvalTimeoutMs?: number;
  readonly credentials?: CredentialStore;
  readonly indexerUrl: string;
  /** Observes detached SDK disposal failures without replacing a work failure. */
  readonly onResourceError?: (error: unknown) => void;
  readonly onSubscriberError?: (error: unknown) => void;
}
export interface SiaApplication {
  readonly appId: string;
  readonly callbackUrl?: string;
  readonly description: string;
  readonly logoUrl?: string;
  readonly name: string;
  readonly serviceUrl: string;
}
export type SubmitRecoveryPhraseResult =
  | AccessIncomplete
  | AccessInvalidPhrase
  | AccessPhraseMismatch
  | AccessReady<CredentialConfirmation.Confirmed>;

export class RegistrationLimitError extends Error {
  constructor() {
    super("Connect key has no remaining app registrations");
    this.name = "RegistrationLimitError";
  }
}
