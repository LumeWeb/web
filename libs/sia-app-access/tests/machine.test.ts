/** Direct policy tests separate lifecycle admission from protocol promises and publication. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { AccessEvent, createAccessMachine } from "@/access-machine";
import type { AccessMachine, LifecycleEvent } from "@/access-machine";
import {
  AccessFailure,
  AccessIntent,
  AccessOutcome,
  AccessPhase,
  AccessRecovery,
  ApprovalProgress,
  CredentialConfirmation,
  CredentialEffect,
  PhraseValidation,
  RegistrationEffect,
  SaveRecoveryProgress,
} from "@/index";

const writeFailure: LifecycleEvent = {
  effects: Object.freeze({
    credentials: CredentialEffect.Write,
    registration: RegistrationEffect.Registered,
  }),
  failure: AccessFailure.CredentialsWrite,
  recovery: AccessRecovery.Save,
  type: AccessEvent.Failed,
};

function phraseMachine(
  intent: AccessIntent = AccessIntent.Create,
): AccessMachine {
  const machine = createAccessMachine();
  sendAll(machine, [
    { intent, type: AccessEvent.Authorize },
    { approvalUrl: "https://approval.example/", type: AccessEvent.Began },
    { type: AccessEvent.Approved },
  ]);
  return machine;
}

function savingMachine(): AccessMachine {
  const machine = phraseMachine();
  sendAll(machine, [
    { type: AccessEvent.Submit },
    { type: AccessEvent.Validated, validation: PhraseValidation.Valid },
    { type: AccessEvent.Registered },
  ]);
  return machine;
}

function sendAll(
  machine: AccessMachine,
  events: readonly LifecycleEvent[],
): void {
  for (const event of events) assert.equal(machine.send(event), true);
}

void test("disconnected policy rejects protocol completion without admitting work", () => {
  const machine = createAccessMachine();
  assert.deepEqual(machine.project(), { phase: AccessPhase.Disconnected });
  assert.equal(machine.allows(AccessEvent.Authorize), true);
  assert.equal(machine.allows(AccessEvent.Reconnect), true);
  assert.equal(machine.allows(AccessEvent.Submit), false);
  assert.equal(machine.canGenerate(), true);
  assert.equal(machine.canBorrow(), false);
  assert.equal(machine.send({ type: AccessEvent.Registered }), false);
  assert.equal(
    machine.send({
      approvalUrl: "https://late.example/",
      type: AccessEvent.Began,
    }),
    false,
  );
  assert.deepEqual(machine.project(), { phase: AccessPhase.Disconnected });
  assert.equal(machine.presentation().interaction, null);
});

void test("approval projection retains one frozen interaction until cancellation", () => {
  const machine = createAccessMachine();
  assert.equal(
    machine.send({ intent: AccessIntent.Create, type: AccessEvent.Authorize }),
    true,
  );
  const requesting = machine.presentation();
  assert.deepEqual(requesting.approval, {
    interaction: { sequence: 1 },
    progress: ApprovalProgress.Requesting,
    url: null,
  });
  assert.equal(Object.isFrozen(requesting), true);
  assert.equal(Object.isFrozen(requesting.availability), true);
  assert.equal(Object.isFrozen(requesting.approval), true);
  assert.equal(Object.isFrozen(requesting.interaction), true);
  assert.equal(
    machine.send({
      intent: AccessIntent.Existing,
      type: AccessEvent.Authorize,
    }),
    false,
  );
  assert.equal(machine.presentation().interaction, requesting.interaction);
  assert.equal(
    machine.send({
      approvalUrl: "https://approval.example/",
      type: AccessEvent.Began,
    }),
    true,
  );
  assert.deepEqual(machine.project(), {
    approvalUrl: "https://approval.example/",
    intent: AccessIntent.Create,
    phase: AccessPhase.AwaitingApproval,
  });
  assert.deepEqual(machine.presentation().approval, {
    interaction: requesting.interaction,
    progress: ApprovalProgress.Awaiting,
    url: "https://approval.example/",
  });
  assert.equal(machine.send({ type: AccessEvent.Cancel }), true);
  assert.equal(machine.presentation().interaction, null);
  assert.equal(machine.send({ type: AccessEvent.Approved }), false);
  assert.equal(
    machine.send({ intent: AccessIntent.Create, type: AccessEvent.Authorize }),
    true,
  );
  assert.deepEqual(machine.presentation().interaction, { sequence: 2 });
  assert.notEqual(machine.presentation().interaction, requesting.interaction);
});

void test("invalid phrase correction retains the interaction and permits another submission", () => {
  const machine = phraseMachine();
  const interaction = machine.presentation().interaction;
  assert.equal(Object.isFrozen(machine.presentation().phrase), true);
  assert.equal(machine.send({ type: AccessEvent.Submit }), true);
  assert.equal(machine.project().phase, AccessPhase.ValidatingPhrase);
  assert.equal(machine.presentation().availability.submitRecoveryPhrase, false);
  assert.equal(
    machine.send({
      type: AccessEvent.Validated,
      validation: PhraseValidation.Invalid,
    }),
    true,
  );
  assert.deepEqual(machine.project(), {
    intent: AccessIntent.Create,
    issue: AccessOutcome.InvalidPhrase,
    phase: AccessPhase.RecoveryPhrase,
  });
  assert.equal(machine.presentation().interaction, interaction);
  assert.equal(machine.canGenerate(), true);
  assert.equal(machine.presentation().availability.submitRecoveryPhrase, true);
  sendAll(machine, [
    { type: AccessEvent.Submit },
    { type: AccessEvent.Validated, validation: PhraseValidation.Valid },
  ]);
  assert.deepEqual(machine.project(), {
    intent: AccessIntent.Create,
    phase: AccessPhase.Registering,
  });
  assert.equal(machine.canGenerate(), false);
  assert.equal(machine.presentation().phrase, null);
});

void test("existing phrases require a match before registration and permit mismatch correction", () => {
  const machine = phraseMachine(AccessIntent.Existing);
  sendAll(machine, [
    { type: AccessEvent.Submit },
    { type: AccessEvent.Validated, validation: PhraseValidation.Valid },
  ]);
  assert.equal(machine.checkingExisting(), true);
  assert.equal(machine.project().phase, AccessPhase.ValidatingPhrase);
  assert.equal(machine.send({ type: AccessEvent.Registered }), false);
  assert.equal(
    machine.send({ matches: false, type: AccessEvent.Matched }),
    true,
  );
  assert.deepEqual(machine.project(), {
    intent: AccessIntent.Existing,
    issue: AccessOutcome.PhraseMismatch,
    phase: AccessPhase.RecoveryPhrase,
  });
  sendAll(machine, [
    { type: AccessEvent.Submit },
    { type: AccessEvent.Validated, validation: PhraseValidation.Valid },
    { matches: true, type: AccessEvent.Matched },
  ]);
  assert.deepEqual(machine.project(), {
    intent: AccessIntent.Existing,
    phase: AccessPhase.Registering,
  });
});

void test("failed saving offers retry and confirms credentials after acknowledgement", () => {
  const machine = savingMachine();
  assert.equal(machine.send(writeFailure), true);
  const recovery = machine.presentation().saveRecovery;
  assert.ok(recovery);
  assert.equal(Object.isFrozen(recovery), true);
  assert.equal(recovery.progress, SaveRecoveryProgress.Idle);
  assert.deepEqual(recovery.effects, {
    credentials: CredentialEffect.Write,
    registration: RegistrationEffect.Registered,
  });
  assert.equal(machine.presentation().availability.retrySave, true);
  assert.equal(machine.presentation().availability.authorize, false);
  assert.equal(machine.canBorrow(), false);
  assert.equal(machine.send({ type: AccessEvent.Retry }), true);
  assert.equal(
    machine.presentation().saveRecovery?.progress,
    SaveRecoveryProgress.Pending,
  );
  assert.equal(machine.presentation().availability.retrySave, false);
  assert.equal(machine.send({ type: AccessEvent.Saved }), true);
  assert.deepEqual(machine.project(), {
    credentials: CredentialConfirmation.Confirmed,
    phase: AccessPhase.Ready,
  });
  assert.equal(machine.presentation().saveRecovery, null);
  assert.equal(machine.canBorrow(), true);
});

void test("continuing after a failed save leaves credentials unconfirmed", () => {
  const machine = savingMachine();
  sendAll(machine, [writeFailure, { type: AccessEvent.Continue }]);
  assert.deepEqual(machine.project(), {
    credentials: CredentialConfirmation.Unconfirmed,
    phase: AccessPhase.Ready,
  });
  assert.equal(machine.canBorrow(), true);
  assert.equal(machine.allows(AccessEvent.Reconnect), false);
  assert.equal(machine.allows(AccessEvent.Authorize), false);
  assert.equal(machine.presentation().saveRecovery, null);
});

void test("approval failures allow new authorization without save recovery", () => {
  const machine = createAccessMachine();
  assert.equal(
    machine.send({ intent: AccessIntent.Create, type: AccessEvent.Authorize }),
    true,
  );
  const failure: LifecycleEvent = {
    effects: Object.freeze({
      credentials: CredentialEffect.None,
      registration: RegistrationEffect.None,
    }),
    failure: AccessFailure.Connection,
    recovery: AccessRecovery.Authorize,
    type: AccessEvent.Failed,
  };
  assert.equal(machine.send(failure), true);
  assert.equal(machine.project().phase, AccessPhase.Failed);
  assert.equal(machine.presentation().saveRecovery, null);
  assert.equal(machine.allows(AccessEvent.Retry), false);
  assert.equal(machine.allows(AccessEvent.Authorize), true);
});

void test("reconnect and removal project their distinct lifecycle states", () => {
  const machine = createAccessMachine();
  assert.equal(machine.send({ type: AccessEvent.Reconnect }), true);
  assert.deepEqual(machine.project(), { phase: AccessPhase.Restoring });
  assert.equal(machine.canBorrow(), false);
  assert.equal(machine.send({ type: AccessEvent.Missing }), true);
  assert.deepEqual(machine.project(), { phase: AccessPhase.Disconnected });
  sendAll(machine, [
    { type: AccessEvent.Reconnect },
    { type: AccessEvent.Restored },
  ]);
  assert.deepEqual(machine.project(), {
    credentials: CredentialConfirmation.Confirmed,
    phase: AccessPhase.Ready,
  });
  assert.equal(machine.canBorrow(), true);
  assert.equal(machine.send({ type: AccessEvent.Forget }), true);
  assert.deepEqual(machine.project(), { phase: AccessPhase.Forgetting });
  assert.equal(machine.canBorrow(), false);
  assert.equal(machine.presentation().interaction, null);
  assert.equal(machine.send({ type: AccessEvent.Removed }), true);
  assert.deepEqual(machine.project(), { phase: AccessPhase.Disconnected });
});

void test("disposal denies every event and clears interactive authority", () => {
  const machine = phraseMachine();
  assert.equal(machine.send({ type: AccessEvent.Dispose }), true);
  assert.deepEqual(machine.project(), { phase: AccessPhase.Disposed });
  for (const event of Object.values(AccessEvent))
    assert.equal(machine.allows(event), false);
  assert.equal(machine.canBorrow(), false);
  assert.equal(machine.canGenerate(), false);
  assert.equal(machine.presentation().interaction, null);
  assert.equal(machine.presentation().approval, null);
  assert.equal(machine.presentation().phrase, null);
  assert.equal(machine.presentation().saveRecovery, null);
  assert.equal(
    machine.send({ intent: AccessIntent.Create, type: AccessEvent.Authorize }),
    false,
  );
  assert.equal(machine.send({ type: AccessEvent.Dispose }), false);
});
