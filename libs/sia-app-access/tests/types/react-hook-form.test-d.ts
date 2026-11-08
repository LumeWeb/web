/** The mapper fits RHF errors without claiming form state or requiring callers to cast. */
import type { FieldError, UseFormReturn } from "react-hook-form";
import type { SubmitRecoveryPhraseResult } from "../../dist/index.js";
import { toRecoveryPhraseFieldError } from "../../dist/react-hook-form.js";

export function checkRecoveryPhraseFieldError(
  form: UseFormReturn<{ credentials: { phrase: string } }>,
  outcome: SubmitRecoveryPhraseResult,
): void {
  const messages = {
    invalidPhrase: "Invalid phrase",
    phraseMismatch: "Different account",
  };
  const error = toRecoveryPhraseFieldError(outcome, messages);
  if (error) {
    const compatible: FieldError = error;
    form.setError("credentials.phrase", compatible);
    // @ts-expect-error The application still chooses a valid field path.
    form.setError("credentials.missing", error);
  }
  // @ts-expect-error Non-field outcomes must be checked before setting a field error.
  form.setError("credentials.phrase", error);
  // @ts-expect-error Both correction messages belong to the application.
  toRecoveryPhraseFieldError(outcome, { invalidPhrase: "Invalid phrase" });
}
