/** Authorization retains the approved connection through correction, then hands its session to saving. */
import { AccessEvent } from "./access-machine.ts";
import type { AccessMachine } from "./access-machine.ts";
import type { AccessEnvironment } from "./access-environment.ts";
import { waitForApproval } from "./approval-wait.ts";
import { unavailable } from "./command-scope.ts";
import type {
  AccessCommand,
  CommandAdmission,
  CommandScope,
} from "./command-scope.ts";
import type { SavedAccess } from "./credential-operations.ts";
import {
  AccessFailure,
  AccessIntent,
  AccessOutcome,
  AccessRecovery,
  PhraseValidation,
  RegistrationEffect,
} from "./access-types.ts";
import type {
  AccessApproved,
  AccessConnection,
  AccessInvalidPhrase,
  AccessPhraseMismatch,
  AccessSession,
  AuthorizeResult,
  SubmitRecoveryPhraseResult,
} from "./access-types.ts";

interface AuthorizationResources<Session> {
  admitAcquisition(): (cleanup?: Promise<void>) => void;
  readonly connection: AccessConnection<Session>;
  disposeConnection(connection: AccessConnection<Session>): Promise<void>;
  installConnection(connection: AccessConnection<Session>): void;
  installSession(resource: AccessSession<Session>): void;
  retireConnection(): void;
}
interface CredentialSaving {
  save(op: CommandScope<SavedAccess>): Promise<void>;
}
type PhraseResult = AccessInvalidPhrase | AccessPhraseMismatch | SavedAccess;
export class Authorization<Session> {
  constructor(
    private readonly environment: AccessEnvironment<Session>,
    private readonly machine: AccessMachine,
    private readonly commands: CommandAdmission,
    private readonly resources: AuthorizationResources<Session>,
    private readonly credentials: CredentialSaving,
    private readonly publish: () => void,
  ) {}
  authorize(intent: AccessIntent): Promise<AuthorizeResult> {
    if (!this.machine.allows(AccessEvent.Authorize))
      return Promise.resolve(unavailable);
    if (intent !== AccessIntent.Create && intent !== AccessIntent.Existing)
      throw new TypeError("Invalid intent");
    this.machine.send({ intent, type: AccessEvent.Authorize });
    const op = this.commands.begin<AccessApproved>();
    op.publish();
    void this.requestApproval(op);
    return op.promise;
  }
  submitRecoveryPhrase(phrase: string): Promise<SubmitRecoveryPhraseResult> {
    if (!this.machine.send({ type: AccessEvent.Submit }))
      return Promise.resolve(unavailable);
    const owned = this.resources.connection;
    const op = this.commands.begin<PhraseResult>();
    op.publish();
    void this.register(op, owned, phrase);
    return op.promise;
  }
  /** Invalid input stays on the approved connection instead of starting registration. */
  private async checkPhrase(
    op: AccessCommand<PhraseResult>,
    owned: AccessConnection<Session>,
    phrase: string,
  ): Promise<void> {
    if (!op.current) return;
    try {
      const valid =
        await this.environment.adapter.validateRecoveryPhrase(phrase);
      if (!op.current) return;
      if (
        valid !== PhraseValidation.Valid &&
        valid !== PhraseValidation.Invalid
      )
        throw new Error("Invalid validation response");
      this.machine.send({ type: AccessEvent.Validated, validation: valid });
      if (this.machine.allows(AccessEvent.Submit)) {
        op.finish({ kind: AccessOutcome.InvalidPhrase });
        this.publish();
        return;
      }
      if (this.machine.checkingExisting()) {
        const matches = await owned.matchesExistingAppKey(phrase);
        if (!op.current) return;
        this.machine.send({ matches, type: AccessEvent.Matched });
        if (this.machine.allows(AccessEvent.Submit)) {
          op.finish({ kind: AccessOutcome.PhraseMismatch });
          this.publish();
          return;
        }
      }
    } catch {
      op.fail(AccessFailure.PhraseCheck, AccessRecovery.Authorize);
      return;
    }
    this.publish();
  }
  private async register(
    op: AccessCommand<PhraseResult>,
    owned: AccessConnection<Session>,
    phrase: string,
  ): Promise<void> {
    await this.checkPhrase(op, owned, phrase);
    if (!op.current) return;
    op.registrationEffect = RegistrationEffect.Unknown;
    const finishAcquisition = this.resources.admitAcquisition();
    let resource: AccessSession<Session>;
    try {
      resource = await owned.register(phrase);
    } catch {
      finishAcquisition();
      op.fail(AccessFailure.Registration, AccessRecovery.Authorize);
      return;
    }
    try {
      if (!op.current) {
        resource.dispose();
        return;
      }
      op.registrationEffect = RegistrationEffect.Registered;
      this.resources.retireConnection();
      // Connection disposal may reenter the controller and cancel this registration.
      if (!op.current) {
        resource.dispose();
        return;
      }
      this.resources.installSession(resource);
      this.machine.send({ type: AccessEvent.Registered });
    } finally {
      finishAcquisition();
    }
    await this.credentials.save(op);
  }
  private async requestApproval(
    op: AccessCommand<AccessApproved>,
  ): Promise<void> {
    if (!op.current) return;
    const finishAcquisition = this.resources.admitAcquisition();
    let owned: AccessConnection<Session>;
    try {
      owned = await this.environment.adapter.begin(
        this.environment.scope,
        this.environment.application,
      );
    } catch {
      finishAcquisition();
      op.fail(AccessFailure.Connection, AccessRecovery.Authorize);
      return;
    }
    if (!op.current) {
      finishAcquisition(this.resources.disposeConnection(owned));
      return;
    }
    try {
      this.resources.installConnection(owned);
    } finally {
      finishAcquisition();
    }
    try {
      validateApprovalUrl(owned.approvalUrl);
    } catch {
      op.fail(AccessFailure.Approval, AccessRecovery.Authorize);
      return;
    }
    this.machine.send({
      approvalUrl: owned.approvalUrl,
      type: AccessEvent.Began,
    });
    this.publish();
    if (!op.current) return;
    try {
      const outcome = await waitForApproval(
        owned.waitForApproval(),
        op.promise,
        this.environment.approvalTimeoutMs,
      );
      if (outcome === "approved" && op.current)
        op.finish(
          { kind: AccessOutcome.Approved },
          { type: AccessEvent.Approved },
        );
      if (outcome !== "timed-out") return;
    } catch {
      op.fail(AccessFailure.Approval, AccessRecovery.Authorize);
      return;
    }
    op.fail(AccessFailure.ApprovalTimeout, AccessRecovery.Authorize);
  }
}
function validateApprovalUrl(value: string): void {
  const url = new URL(value);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password
  )
    throw new Error("Invalid approval URL");
}
