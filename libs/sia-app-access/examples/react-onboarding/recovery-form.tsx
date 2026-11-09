/** The application keeps phrase input and rejects async results after edits or replacement. */
import { useLayoutEffect, useRef, useState } from "react";
import { AccessIntent, AccessOutcome } from "@lumeweb/sia-app-access";
import type { SiaAccessInteractions } from "@lumeweb/sia-app-access";
import type { RecoveryPhraseTask } from "@lumeweb/sia-app-access/react";
import { toRecoveryPhraseFieldError } from "@lumeweb/sia-app-access/react-hook-form";

interface RecoveryFormProps<Session> {
  readonly access: SiaAccessInteractions<Session>;
  readonly task: RecoveryPhraseTask;
}

export function RecoveryForm<Session>({
  access,
  task,
}: RecoveryFormProps<Session>) {
  const creating = task.intent === AccessIntent.Create;
  const [phrase, setPhrase] = useState("");
  const [issue, setIssue] = useState("");
  const [saved, setSaved] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const revision = useRef(0);
  const sequence = task.interaction.sequence;
  // Cleanup runs before replacement layout effects can resolve an older request.
  useLayoutEffect(
    () => () => {
      revision.current++;
    },
    [access, sequence],
  );

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const submitted = ++revision.current;
        void task.submit(phrase).then((outcome) => {
          if (submitted !== revision.current) return;
          const error = toRecoveryPhraseFieldError(outcome, {
            invalidPhrase: "This phrase isn't valid. Check it and try again.",
            phraseMismatch:
              "This phrase doesn't match the account you approved.",
          });
          if (error) setIssue(error.message);
        });
      }}>
      <h1>
        {creating ? "Keep your recovery phrase" : "Enter your recovery phrase"}
      </h1>
      <p>
        {creating
          ? "Generate your recovery phrase, then write it down and keep it private."
          : "Enter the recovery phrase you saved for this account."}
      </p>
      <label htmlFor="recovery-phrase">Recovery phrase</label>
      <input
        aria-describedby={issue ? "phrase-issue" : undefined}
        aria-invalid={Boolean(issue)}
        autoComplete="off"
        id="recovery-phrase"
        onChange={(event) => {
          revision.current++;
          setPhrase(event.currentTarget.value);
          setSaved(false);
          setIssue("");
        }}
        type={revealed ? "text" : "password"}
        value={phrase}
      />
      {issue && (
        <p className="error" id="phrase-issue" role="alert">
          {issue}
        </p>
      )}
      {creating && (
        <button
          className="secondary"
          disabled={!task.canGenerate}
          onClick={() => {
            const generated = ++revision.current;
            void task.generate().then((outcome) => {
              if (
                generated !== revision.current ||
                outcome.kind !== AccessOutcome.Generated
              )
                return;
              setPhrase(outcome.phrase);
              setSaved(false);
              setIssue("");
            });
          }}
          type="button">
          Generate phrase
        </button>
      )}
      <button
        aria-pressed={revealed}
        className="secondary"
        disabled={!phrase}
        onClick={() => setRevealed(!revealed)}
        type="button">
        {revealed ? "Hide phrase" : "Show phrase"}
      </button>
      {creating && (
        <label className="check">
          <input
            checked={saved}
            onChange={(event) => setSaved(event.currentTarget.checked)}
            type="checkbox"
          />
          I saved my recovery phrase
        </label>
      )}
      <button
        disabled={!task.canSubmit || (creating && !saved) || !phrase.trim()}
        type="submit">
        {creating ? "Finish account setup" : "Connect account"}
      </button>
      <button
        className="text-button"
        disabled={!task.canCancel}
        onClick={() => task.cancel()}
        type="button">
        Cancel connection
      </button>
      <p className="fine-print">
        This is a demo. Don&apos;t enter a real recovery phrase.
      </p>
    </form>
  );
}
