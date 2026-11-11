/** Account access follows controller state; profile setup remains application state. */
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  AccessFailure,
  AccessIntent,
  AccessOutcome,
  AccessPhase,
  CredentialConfirmation,
  RegistrationEffect,
} from "@lumeweb/sia-app-access";
import type {
  AccessInteractionSnapshot,
  SiaAccessInteractions,
} from "@lumeweb/sia-app-access";
import {
  useSiaAccessInteractions,
  useSiaApproval,
  useSiaRecoveryPhrase,
  useSiaSaveRecovery,
} from "@lumeweb/sia-app-access/react";
import { createAccountService } from "./account-service.ts";
import { RecoveryForm } from "./recovery-form.tsx";

interface AccountAppProps<Session> {
  readonly access: SiaAccessInteractions<Session>;
  readonly allowExistingPhrase?: boolean;
  readonly renderApproval?: (url: string) => ReactNode;
}

/** A reconnect keeps the profile from the last established authorization. */
interface AccountProfile<Session> {
  readonly access: SiaAccessInteractions<Session>;
  readonly name: string;
  // A replacement controller can reuse a sequence, so drafts need a separate reset key.
  readonly revision: number;
  readonly sequence: null | number;
}

interface ProfileSetupProps {
  readonly onComplete: (name: string) => void;
}

export function AccountApp<Session>({
  access,
  allowExistingPhrase = true,
  renderApproval,
}: AccountAppProps<Session>) {
  const { commands, snapshot } = useSiaAccessInteractions(access);
  const accountService = useMemo(() => createAccountService(access), [access]);
  const approval = useSiaApproval(access);
  const phrase = useSiaRecoveryPhrase(access);
  const saving = useSiaSaveRecovery(access);
  const [profile, setProfile] = useState<AccountProfile<Session>>({
    access,
    name: "",
    revision: 0,
    sequence: null,
  });
  const [status, setStatus] = useState("");
  const state = snapshot.state;
  const ready = state.phase === AccessPhase.Ready;
  const currentProfile = profileFor(
    profile,
    access,
    establishedSequence(snapshot),
  );
  // Reset before committing children so a new session never displays the previous profile.
  if (currentProfile !== profile) setProfile(currentProfile);
  const name = currentProfile.name;
  useEffect(() => {
    // Passive subscriptions remain active while Suspense hides the UI, unlike layout effects.
    const observe = () => {
      const sequence = establishedSequence(access.getSnapshot());
      if (sequence === null) return;
      setProfile((current) =>
        current.access === access
          ? profileFor(current, access, sequence)
          : current,
      );
    };
    const unsubscribe = access.subscribe(observe);
    observe();
    return unsubscribe;
  }, [access]);
  const setName = (value: string) => {
    setProfile((current) => ({ ...current, name: value }));
  };
  let content: ReactNode;

  if (ready && !name) {
    content = (
      <ProfileSetup key={currentProfile.revision} onComplete={setName} />
    );
  } else if (ready) {
    content = (
      <>
        <h1>Welcome, {name}</h1>
        <p>
          You&apos;re signed in. You can check your connection or sign out
          below.
        </p>
        <div className="account-summary">
          <span className="avatar">{name.substring(0, 1).toUpperCase()}</span>
          <div>
            <strong>{name}</strong>
            <small>Signed in</small>
          </div>
        </div>
        <button
          onClick={() => {
            void accountService.checkConnection().then(
              () => setStatus("Your account is connected."),
              () =>
                setStatus(
                  "You're no longer connected. Sign in again to continue.",
                ),
            );
          }}>
          Check connection
        </button>
        <button
          className="secondary"
          onClick={() => {
            setStatus("");
            void commands.disconnect();
          }}>
          Sign out
        </button>
        <button
          className="text-button"
          onClick={() => {
            void commands.forget().then((outcome) => {
              if (outcome.kind === AccessOutcome.Removed) {
                setName("");
                setStatus("Your saved sign-in was removed.");
              }
            });
          }}>
          Remove saved sign-in
        </button>
      </>
    );
  } else if (saving) {
    content = (
      <>
        <h1>Save this sign-in</h1>
        <p>
          You&apos;re connected, but we couldn&apos;t confirm that your sign-in
          was saved. Try saving again, or continue. You may need your recovery
          phrase next time.
        </p>
        <button
          disabled={!saving.canRetrySave}
          onClick={() => {
            void saving.retrySave();
          }}>
          Try saving again
        </button>
        <button
          className="secondary"
          disabled={!saving.canContinueWithoutSaving}
          onClick={() => saving.continueWithoutSaving()}>
          Continue anyway
        </button>
        <button
          className="text-button"
          disabled={!saving.canCancel}
          onClick={() => saving.cancel()}>
          Cancel connection
        </button>
      </>
    );
  } else if (phrase) {
    content = <RecoveryForm access={access} task={phrase} />;
  } else if (approval) {
    content = (
      <>
        <h1>Approve this application</h1>
        <p>
          Allow this application to connect before entering your recovery
          phrase.
        </p>
        {approval.url ? (
          (renderApproval?.(approval.url) ?? (
            <a
              className="button"
              href={approval.url}
              rel="noreferrer"
              target="_blank">
              Open approval page
            </a>
          ))
        ) : (
          <p>Requesting approval…</p>
        )}
        <button
          className="text-button"
          disabled={!approval.canCancel}
          onClick={() => approval.cancel()}>
          Cancel connection
        </button>
      </>
    );
  } else if (state.phase === AccessPhase.Failed) {
    content = (
      <>
        <h1>Try connecting again</h1>
        <p className="error" role="alert">
          {state.failure === AccessFailure.Approval
            ? "The connection wasn't approved. You can try again."
            : "We couldn't connect your account. Please try again."}
        </p>
        <button
          onClick={() => {
            void commands.disconnect();
          }}>
          Start again
        </button>
      </>
    );
  } else if (state.phase === AccessPhase.Disposed) {
    content = (
      <>
        <h1>Connection closed</h1>
        <p>Reload this page to start again.</p>
      </>
    );
  } else if (state.phase !== AccessPhase.Disconnected) {
    content = (
      <>
        <h1>Connecting your account</h1>
        <p>Please wait while we finish connecting.</p>
        <button
          className="text-button"
          disabled={!snapshot.presentation.availability.cancel}
          onClick={() => commands.cancel()}>
          Cancel connection
        </button>
      </>
    );
  } else {
    content = (
      <>
        <h1>Connect your account</h1>
        <p>
          {allowExistingPhrase
            ? "Use your recovery phrase to sign in, or create an account."
            : "Create an account, or sign in with details saved on this page."}
        </p>
        <button
          disabled={!snapshot.presentation.availability.authorize}
          onClick={() => {
            setStatus("");
            void commands.authorize(AccessIntent.Create);
          }}>
          Create account
        </button>
        {allowExistingPhrase && (
          <button
            className="secondary"
            disabled={!snapshot.presentation.availability.authorize}
            onClick={() => {
              setStatus("");
              void commands.authorize(AccessIntent.Existing);
            }}>
            Connect existing account
          </button>
        )}
        <button
          className="secondary"
          disabled={!snapshot.presentation.availability.reconnect}
          onClick={() => {
            void commands
              .reconnect()
              .then((outcome) =>
                setStatus(
                  outcome.kind === AccessOutcome.MissingCredentials
                    ? "There's no saved sign-in on this page. Choose how to connect."
                    : "",
                ),
              );
          }}>
          Sign in again
        </button>
      </>
    );
  }

  return (
    <section aria-label="Account access" className="account-card">
      <div aria-label="Account steps" className="steps">
        <span className={!ready ? "active" : ""}>Connect</span>
        <span className={ready && !name ? "active" : ""}>Profile</span>
        <span className={ready && name ? "active" : ""}>Workspace</span>
      </div>
      {content}
      {ready && state.credentials === CredentialConfirmation.Unconfirmed && (
        <p className="notice">
          Saving wasn&apos;t confirmed. Keep your recovery phrase for your next
          sign-in.
        </p>
      )}
      <p className="status" role="status">
        {status}
      </p>
      <footer data-phase={state.phase} data-testid="access-phase">
        {ready
          ? "Connected"
          : saving
            ? "Saving needs attention"
            : state.phase === AccessPhase.Disconnected
              ? "Not connected"
              : state.phase === AccessPhase.Failed
                ? "Connection stopped"
                : state.phase === AccessPhase.Disposed
                  ? "Connection closed"
                  : "Connecting…"}
      </footer>
    </section>
  );
}
/** Saving publishes before a credential write can outlive cancellation. */
function establishedSequence(
  snapshot: AccessInteractionSnapshot,
): null | number {
  const established =
    snapshot.state.phase === AccessPhase.Ready ||
    snapshot.state.phase === AccessPhase.Saving ||
    snapshot.presentation.saveRecovery?.effects.registration ===
      RegistrationEffect.Registered;
  return established
    ? (snapshot.presentation.interaction?.sequence ?? null)
    : null;
}

/** Reconnect has no interaction sequence and must retain the established profile. */
function profileFor<Session>(
  profile: AccountProfile<Session>,
  access: SiaAccessInteractions<Session>,
  sequence: null | number,
): AccountProfile<Session> {
  // React can replay a queued publication after a newer render has reset the profile.
  if (
    profile.access === access &&
    (sequence === null ||
      (profile.sequence !== null && sequence <= profile.sequence))
  )
    return profile;
  return { access, name: "", revision: profile.revision + 1, sequence };
}

function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const [name, setName] = useState("");
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (name.trim()) onComplete(name.trim());
      }}>
      <h1>Set up your profile</h1>
      <p>Choose a name for your profile.</p>
      <label htmlFor="display-name">Display name</label>
      <input
        autoComplete="nickname"
        id="display-name"
        onChange={(event) => setName(event.currentTarget.value)}
        value={name}
      />
      <button disabled={!name.trim()} type="submit">
        Continue to workspace
      </button>
    </form>
  );
}
