# React Hook Form

Use React Hook Form for recovery phrase input, validation, and field errors. Access keeps the account session and command results; it does not keep form values. Install `react-hook-form` in your application. The optional `/react-hook-form` entry exports `toRecoveryPhraseFieldError`; importing that entry does not load React Hook Form.

The parent calls `useSiaRecoveryPhrase` and passes its task to the form. The form maps only invalid phrases and phrase mismatches to field errors. Edits, unmounts, and replacement interactions prevent an older result from changing the form.

```tsx
import { useLayoutEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { AccessOutcome, type SiaAccessInteractions } from "@lumeweb/sia-app-access";
import { useSiaRecoveryPhrase, type RecoveryPhraseTask } from "@lumeweb/sia-app-access/react";
import { toRecoveryPhraseFieldError } from "@lumeweb/sia-app-access/react-hook-form";

interface PhraseFields {
  phrase: string;
}

export function RecoveryFields<Session>({ access }: { readonly access: SiaAccessInteractions<Session> }) {
  const task = useSiaRecoveryPhrase(access);
  return task ? <PhraseForm access={access} task={task} /> : null;
}

function PhraseForm<Session>({ access, task }: { readonly access: SiaAccessInteractions<Session>; readonly task: RecoveryPhraseTask }) {
  const revision = useRef(0);
  useLayoutEffect(
    () => () => {
      revision.current++;
    },
    [access, task.interaction.sequence],
  );

  const {
    clearErrors,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<PhraseFields>({ defaultValues: { phrase: "" } });

  const submit = handleSubmit(async ({ phrase }) => {
    const submitted = ++revision.current;
    const outcome = await task.submit(phrase);
    if (submitted !== revision.current) return;

    const error = toRecoveryPhraseFieldError(outcome, {
      invalidPhrase: "Enter a valid recovery phrase.",
      phraseMismatch: "Use the recovery phrase for this account.",
    });
    if (error) setError("phrase", error);
    if (outcome.kind === AccessOutcome.Ready) reset();
  });

  return (
    <form
      onSubmit={(event) => {
        void submit(event);
      }}>
      <label htmlFor="phrase">Recovery phrase</label>
      <input
        id="phrase"
        type="password"
        autoComplete="off"
        aria-invalid={Boolean(errors.phrase)}
        {...register("phrase", {
          required: "Enter a recovery phrase.",
          onChange() {
            revision.current++;
            clearErrors("phrase");
          },
        })}
      />
      {errors.phrase && <p role="alert">{errors.phrase.message}</p>}
      <button type="submit" disabled={!task.canSubmit}>
        Connect account
      </button>
    </form>
  );
}
```

`submit` can register an account and save credentials, so call it from the submit handler, not a field validator. `toRecoveryPhraseFieldError` returns `undefined` for ready, failed, cancelled, and unavailable outcomes; the application handles those outcomes separately. Do not clear the form or treat an unmapped outcome as success. See [save recovery](react.md#task-hooks) for a failed credential write and [form ownership](react.md#keep-forms-application-owned) for the plain React approach.
