/** Routes account phases to demo screens while giving sharing seeds their own entry path. */
import { AccessFailure, AccessPhase } from "@lumeweb/sia-app-access";
import type { AccessInteractionSnapshot } from "@lumeweb/sia-app-access";

export interface AuthFlowInput {
  readonly approvalContinueRequired?: boolean;
  readonly sharingKeyHex: null | string;
  readonly snapshot: null | Pick<AccessInteractionSnapshot, "state">;
}

export type AuthStep = "approve" | "gate" | "loading" | "player" | "recovery";

export interface AutoReconnectInput extends AuthFlowInput {
  readonly accountError: null | string;
  readonly reconnectError: null | string;
  readonly savedUserKeyHex: string;
}

export function selectAuthStep({
  approvalContinueRequired,
  sharingKeyHex,
  snapshot,
}: AuthFlowInput): AuthStep {
  if (sharingKeyHex) return "player";
  const state = snapshot?.state;
  switch (state?.phase) {
    case AccessPhase.AwaitingApproval:
      return "approve";
    case AccessPhase.Failed:
      return state.failure === AccessFailure.CredentialsWrite
        ? "recovery"
        : "gate";
    case AccessPhase.Ready:
      return "player";
    case AccessPhase.RecoveryPhrase:
      return approvalContinueRequired ? "approve" : "recovery";
    case AccessPhase.Registering:
      return "recovery";
    case AccessPhase.RequestingApproval:
      return "loading";
    case AccessPhase.Restoring:
      return "loading";
    case AccessPhase.Saving:
      return "recovery";
    case AccessPhase.ValidatingPhrase:
      return "recovery";
    default:
      return "gate";
  }
}

export function shouldAutoReconnect({
  accountError,
  reconnectError,
  savedUserKeyHex,
  sharingKeyHex,
  snapshot,
}: AutoReconnectInput): boolean {
  return (
    (!snapshot || snapshot.state.phase === AccessPhase.Disconnected) &&
    !!savedUserKeyHex &&
    !sharingKeyHex &&
    !reconnectError &&
    !accountError
  );
}
