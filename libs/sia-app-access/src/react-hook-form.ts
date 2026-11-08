/** Phrase correction errors fit application-owned RHF forms without importing a form runtime. */
import { AccessOutcome } from "./access-types.ts";
import type {
  RecoveryPhraseIssue,
  SubmitRecoveryPhraseResult,
} from "./access-types.ts";

export interface RecoveryPhraseFieldError {
  readonly message: string;
  readonly type: RecoveryPhraseIssue;
}
export interface RecoveryPhraseFieldMessages {
  readonly invalidPhrase: string;
  readonly phraseMismatch: string;
}
export function toRecoveryPhraseFieldError(
  outcome: SubmitRecoveryPhraseResult,
  messages: RecoveryPhraseFieldMessages,
): RecoveryPhraseFieldError | undefined {
  switch (outcome.kind) {
    case AccessOutcome.InvalidPhrase:
      return { message: messages.invalidPhrase, type: outcome.kind };
    case AccessOutcome.PhraseMismatch:
      return { message: messages.phraseMismatch, type: outcome.kind };
    default:
      return undefined;
  }
}
