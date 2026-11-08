/** Task actions belong to committed live observations, never serialized server presentation. */
import { useEffect, useLayoutEffect, useMemo } from "react";
import { AccessOutcome } from "@/access-types";
import type {
  AccessApprovalPresentation,
  AccessIntent,
  AccessInteractionIdentity,
  AccessInteractionSnapshot,
  AccessSaveRecoveryPresentation,
  ContinueWithoutSavingResult,
  GeneratedRecoveryPhrase,
  RetrySaveResult,
  SiaAccessInteractions,
  SubmitRecoveryPhraseResult,
} from "@/access-types";
import { useSiaAccessInteractions } from "./observation.ts";
import type { SiaAccessInteractionReactOptions } from "./observation.ts";

export type ApprovalTask = AccessApprovalPresentation & ApprovalTaskActions;
export interface ApprovalTaskActions {
  readonly canCancel: boolean;
  cancel(): void;
}
export interface RecoveryPhraseTask {
  readonly canCancel: boolean;
  cancel(): void;
  readonly canGenerate: boolean;
  readonly canSubmit: boolean;
  generate(): Promise<GeneratedRecoveryPhrase>;
  readonly intent: AccessIntent;
  readonly interaction: AccessInteractionIdentity;
  submit(phrase: string): Promise<SubmitRecoveryPhraseResult>;
}
export interface SaveRecoveryTask extends AccessSaveRecoveryPresentation {
  readonly canCancel: boolean;
  cancel(): void;
  readonly canContinueWithoutSaving: boolean;
  readonly canRetrySave: boolean;
  continueWithoutSaving(): ContinueWithoutSavingResult;
  retrySave(): Promise<RetrySaveResult>;
}
const unavailable = Object.freeze({ kind: AccessOutcome.Unavailable });
export function useSiaApproval<Session>(
  access: SiaAccessInteractions<Session>,
  options?: SiaAccessInteractionReactOptions,
): ApprovalTask | null {
  const snapshot = useSnapshot(access, options);
  const { presentation } = snapshot;
  const task = presentation.approval;
  const lease = useActionLease(access, task?.interaction, snapshot);
  if (!task) return null;
  return Object.freeze({
    ...task,
    canCancel: presentation.availability.cancel,
    cancel() {
      if (
        lease.isCurrent() &&
        access.getSnapshot().presentation.approval !== null
      )
        access.cancel();
    },
  });
}
/** Input and returned outcomes belong to the originating application handler. */
export function useSiaRecoveryPhrase<Session>(
  access: SiaAccessInteractions<Session>,
  options?: SiaAccessInteractionReactOptions,
): null | RecoveryPhraseTask {
  const snapshot = useSnapshot(access, options);
  const phrase = snapshot.presentation.phrase;
  const lease = useActionLease(access, phrase?.interaction, snapshot);
  if (!phrase) return null;
  const current = () => {
    const live = access.getSnapshot();
    return lease.isCurrent() && live.presentation.phrase !== null;
  };
  return Object.freeze({
    canCancel: snapshot.presentation.availability.cancel,
    cancel() {
      if (current()) access.cancel();
    },
    canGenerate: snapshot.presentation.availability.generateRecoveryPhrase,
    canSubmit: snapshot.presentation.availability.submitRecoveryPhrase,
    generate: () =>
      current()
        ? access.generateRecoveryPhrase()
        : Promise.resolve(unavailable),
    intent: phrase.intent,
    interaction: phrase.interaction,
    submit: (value: string) =>
      current()
        ? access.submitRecoveryPhrase(value)
        : Promise.resolve(unavailable),
  });
}
export function useSiaSaveRecovery<Session>(
  access: SiaAccessInteractions<Session>,
  options?: SiaAccessInteractionReactOptions,
): null | SaveRecoveryTask {
  const snapshot = useSnapshot(access, options);
  const { presentation } = snapshot;
  const task = presentation.saveRecovery;
  const lease = useActionLease(access, task?.interaction, snapshot);
  if (!task) return null;
  const current = () =>
    lease.isCurrent() &&
    access.getSnapshot().presentation.saveRecovery !== null;
  return Object.freeze({
    ...task,
    canCancel: presentation.availability.cancel,
    cancel() {
      if (current()) access.cancel();
    },
    canContinueWithoutSaving: presentation.availability.continueWithoutSaving,
    canRetrySave: presentation.availability.retrySave,
    continueWithoutSaving: () =>
      current() ? access.continueWithoutSaving() : unavailable,
    retrySave: () =>
      current() ? access.retrySave() : Promise.resolve(unavailable),
  });
}
function useActionLease<Session>(
  access: SiaAccessInteractions<Session>,
  interaction: AccessInteractionIdentity | undefined,
  snapshot: AccessInteractionSnapshot,
) {
  // getSnapshot returns the controller-owned object; hydration data may repeat its sequence.
  const liveObservation = snapshot === access.getSnapshot();
  const { appId, indexerUrl } = snapshot.scope;
  const sequence = interaction?.sequence;
  const lease = useMemo(() => {
    const owned = {
      active: false,
      isCurrent(): boolean {
        const live = access.getSnapshot();
        return (
          owned.active &&
          liveObservation &&
          live.scope.appId === appId &&
          live.scope.indexerUrl === indexerUrl &&
          live.presentation.interaction?.sequence === sequence
        );
      },
    };
    return owned;
  }, [access, sequence, appId, indexerUrl, liveObservation]);
  // Layout cleanup revokes old actions before replacement layout effects can call them.
  useLayoutEffect(
    () => () => {
      lease.active = false;
    },
    [lease],
  );
  useEffect(() => {
    lease.active = liveObservation;
    return () => {
      lease.active = false;
    };
  }, [lease, liveObservation]);
  return lease;
}
function useSnapshot<Session>(
  access: SiaAccessInteractions<Session>,
  options?: SiaAccessInteractionReactOptions,
) {
  return useSiaAccessInteractions(access, options).snapshot;
}
