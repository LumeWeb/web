/** Distinct application layouts share task behavior; the dialog owns its custom form. */
import {
  createElement as h,
  StrictMode,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createRoot } from "react-dom/client";
import type { SiaAccessInteractions } from "@/index";
import { AccessIntent, AccessOutcome, createSiaAccess } from "@/index";
import {
  useSiaAccess,
  useSiaAccessInteractions,
  useSiaApproval,
  useSiaRecoveryPhrase,
  useSiaSaveRecovery,
} from "@/react";
import type { SaveRecoveryTask } from "@/react";
import { toRecoveryPhraseFieldError } from "@/react-hook-form";
import type { MockConnection } from "@lumeweb/sia-testing/client";
import { sharedAdapter } from "../helpers/shared-adapter.ts";
import { fixture } from "../helpers/core-fixture.ts";
import { deferred } from "../helpers/core-async.ts";
import type { TestSession } from "../helpers/core-fixture.ts";

interface Input {
  readonly owner: MockConnection;
  readonly phrase: string;
  readonly registration: MockConnection;
}
// Deferred native-port probes only exercise timing unsupported by shared managed auth.
const narrow = fixture();
let generation = deferred<string>();
let validation = deferred<import("@/index").PhraseValidation>();
let delayValidation = false;
let generationCalls = 0;
narrow.adapter.generateRecoveryPhrase = () => {
  generationCalls++;
  return generation.promise;
};
narrow.adapter.validateRecoveryPhrase = (phrase) =>
  delayValidation
    ? validation.promise
    : Promise.resolve(phrase === "bad" ? importInvalid() : importValid());
import { PhraseValidation } from "@/index";
function importInvalid() {
  return PhraseValidation.Invalid;
}
function importValid() {
  return PhraseValidation.Valid;
}
const input: Input | undefined = Reflect.get(window, "fixtureInput");
let writes = 0;
const shared = input
  ? createSiaAccess({
      adapter: sharedAdapter(input.registration, input.phrase, input.owner),
      application: {
        appId: "a".repeat(64),
        description: "Synthetic browser checks",
        name: "Browser access",
        serviceUrl: "https://app.test",
      },
      credentials: {
        async read() {
          return null;
        },
        async remove() {
          return;
        },
        async write() {
          if (++writes === 1) throw Error("unacknowledged write");
        },
      },
      indexerUrl: input.registration.url,
    })
  : null;
import { useForm } from "react-hook-form";
function Choices({ task }: { readonly task: null | SaveRecoveryTask }) {
  return (
    task && (
      <aside>
        <output data-testid="effects">{JSON.stringify(task.effects)}</output>
        <output>{task.progress}</output>
        <button
          disabled={!task.canRetrySave}
          onClick={() => void task.retrySave()}>
          Retry saving
        </button>
        <button
          disabled={!task.canContinueWithoutSaving}
          onClick={() => task.continueWithoutSaving()}>
          Continue unconfirmed
        </button>
      </aside>
    )
  );
}
function Dialog<Session>({
  access,
}: {
  readonly access: SiaAccessInteractions<Session>;
}) {
  const { commands, snapshot } = useSiaAccessInteractions(access);
  const phrase = useSiaRecoveryPhrase(access);
  const approval = useSiaApproval(access);
  const recovery = useSiaSaveRecovery(access);
  // Edits and committed form identity changes invalidate pending UI writes,
  // even if the user later restores the same text. Controller outcomes stay intact.
  const revision = useRef(0);
  const sequence = snapshot.presentation.interaction?.sequence;
  useLayoutEffect(
    () => () => {
      revision.current++;
    },
    [access, sequence],
  );
  const {
    clearErrors,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
  } = useForm<{ phrase: string }>({ defaultValues: { phrase: "" } });
  return (
    <div aria-label="Application connection" role="dialog">
      <header>Connect this application</header>
      <button
        disabled={!snapshot.presentation.availability.authorize}
        onClick={() => void commands.authorize(AccessIntent.Create)}>
        Authorize dialog
      </button>
      <button
        disabled={!snapshot.presentation.availability.reconnect}
        onClick={() => void commands.reconnect()}>
        Reconnect dialog
      </button>
      {approval && <p>{approval.url ?? "Waiting for approval"}</p>}
      {phrase && (
        <form
          onSubmit={(event) => {
            void handleSubmit(async (values) => {
              const submittedRevision = ++revision.current;
              const outcome = await phrase.submit(values.phrase);
              if (submittedRevision !== revision.current) return;
              const error = toRecoveryPhraseFieldError(outcome, {
                invalidPhrase: "Enter a valid recovery phrase.",
                phraseMismatch: "Use the recovery phrase for this account.",
              });
              if (error) setError("phrase", error);
              if (outcome.kind === AccessOutcome.Ready) reset();
            })(event);
          }}>
          <fieldset>
            <legend>Application credentials</legend>
            <input
              aria-label="dialog"
              type="password"
              {...register("phrase", {
                onChange() {
                  revision.current++;
                  clearErrors("phrase");
                },
              })}
            />
            <output data-testid="dialog-issue">{errors.phrase?.message}</output>
            <button disabled={!phrase.canSubmit}>Submit dialog</button>
            <button
              disabled={!phrase.canGenerate}
              onClick={() => {
                const generatedRevision = ++revision.current;
                void phrase.generate().then((result) => {
                  if (generatedRevision !== revision.current) return;
                  if (result.kind === AccessOutcome.Generated)
                    setValue("phrase", result.phrase);
                });
              }}
              type="button">
              Generate dialog
            </button>
          </fieldset>
        </form>
      )}
      <footer>
        <Choices task={recovery} />
      </footer>
    </div>
  );
}
function Settings<Session>({
  access,
}: {
  readonly access: SiaAccessInteractions<Session>;
}) {
  const { commands, snapshot } = useSiaAccessInteractions(access);
  const phrase = useSiaRecoveryPhrase(access);
  const approval = useSiaApproval(access);
  const recovery = useSiaSaveRecovery(access);
  // Edits and committed form identity changes invalidate pending UI writes,
  // even if the user later restores the same text. Controller outcomes stay intact.
  const revision = useRef(0);
  const sequence = snapshot.presentation.interaction?.sequence;
  useLayoutEffect(
    () => () => {
      revision.current++;
    },
    [access, sequence],
  );
  const [value, setValue] = useState("");
  const [issue, setIssue] = useState("");
  return (
    <section aria-label="Inline settings">
      <h2>Storage settings</h2>
      <button
        disabled={!snapshot.presentation.availability.authorize}
        onClick={() => void commands.authorize(AccessIntent.Create)}>
        Authorize settings
      </button>
      <button
        disabled={!snapshot.presentation.availability.reconnect}
        onClick={() => void commands.reconnect()}>
        Reconnect settings
      </button>
      {approval && (
        <a data-testid="approval" href={approval.url ?? undefined}>
          {approval.url ?? "Requesting"}
        </a>
      )}
      {phrase && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const submittedRevision = ++revision.current;
            void phrase.submit(value).then((outcome) => {
              if (submittedRevision !== revision.current) return;
              if (
                outcome.kind === AccessOutcome.InvalidPhrase ||
                outcome.kind === AccessOutcome.PhraseMismatch
              )
                setIssue(outcome.kind);
              if (outcome.kind === AccessOutcome.Ready) {
                setValue("");
                setIssue("");
              }
            });
          }}>
          <label>
            settings
            <input
              aria-label="settings"
              onChange={(event) => {
                revision.current++;
                setValue(event.currentTarget.value);
                setIssue("");
              }}
              type="password"
              value={value}
            />
          </label>
          <output data-testid="settings-issue">{issue}</output>
          <button disabled={!phrase.canSubmit}>Submit settings</button>
          <button
            disabled={!phrase.canGenerate}
            onClick={() => {
              const generatedRevision = ++revision.current;
              void phrase.generate().then((result) => {
                if (generatedRevision !== revision.current) return;
                if (result.kind === AccessOutcome.Generated)
                  setValue(result.phrase);
              });
            }}
            type="button">
            Generate settings
          </button>
        </form>
      )}
      <Choices task={recovery} />
    </section>
  );
}
let replaceController: () => Promise<void> = async () => {
  return;
};
let hideDialog: () => void = () => {
  return;
};
let showDialog: () => void = () => {
  return;
};
function App<Session>({
  initial,
}: {
  readonly initial: SiaAccessInteractions<Session>;
}) {
  const [access, setAccess] = useState(initial);
  const [dialog, setDialog] = useState(true);
  const replacementCommitted = useRef<(() => void) | undefined>(undefined);
  // Deferred outcomes must settle after the replacement commits.
  useLayoutEffect(() => {
    replacementCommitted.current?.();
    replacementCommitted.current = undefined;
  }, [access]);
  replaceController = () =>
    new Promise<void>((resolve) => {
      replacementCommitted.current = resolve;
      setAccess({ ...initial });
    });
  hideDialog = () => setDialog(false);
  showDialog = () => setDialog(true);
  const { snapshot } = useSiaAccess(access);
  return h(
    "main",
    null,
    h(
      "button",
      { onClick: () => void access.authorize(AccessIntent.Create) },
      "Start access",
    ),
    h("button", { onClick: () => access.cancel() }, "Cancel access"),
    h("output", { "data-testid": "phase" }, snapshot.state.phase),
    h(Settings<Session>, { access }),
    dialog && h(Dialog<Session>, { access }),
  );
}
const root = createRoot(document.getElementById("root")!);
if (shared) root.render(h(StrictMode, null, h(App, { initial: shared })));
else
  root.render(
    h(StrictMode, null, h(App<TestSession>, { initial: narrow.access })),
  );
Object.assign(window, {
  interactionProbe: {
    counts() {
      return { ...narrow.counts(), generationCalls };
    },
    delayValidation() {
      delayValidation = true;
    },
    hide() {
      hideDialog();
    },
    invalid() {
      validation.resolve(PhraseValidation.Invalid);
      validation = deferred<PhraseValidation>();
    },
    mismatch() {
      delayValidation = false;
      narrow.connection.matchesExistingAppKey = async () => false;
    },
    replace() {
      return replaceController();
    },
    resolveGeneration() {
      generation.resolve("generated private phrase");
      generation = deferred<string>();
    },
    async restart() {
      narrow.access.cancel();
      await narrow.access.authorize(AccessIntent.Existing);
    },
    show() {
      showDialog();
    },
    async start() {
      await narrow.access.authorize(AccessIntent.Existing);
    },
  },
});
