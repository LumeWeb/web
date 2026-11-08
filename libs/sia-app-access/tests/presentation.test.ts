/** Published task models retain interaction identity and save effects during correction and recovery. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { AccessEvent, createAccessMachine } from "@/access-machine";
import { AccessIntent, PhraseValidation } from "@/index";

void test("presentation identity detects same-phase restarts and retains correction ownership", () => {
  const machine = createAccessMachine();
  assert.equal(machine.presentation().availability.authorize, true);
  machine.send({ intent: AccessIntent.Create, type: AccessEvent.Authorize });
  const first = machine.presentation().interaction;
  assert.ok(first);
  machine.send({
    approvalUrl: "https://approval.test/",
    type: AccessEvent.Began,
  });
  machine.send({ type: AccessEvent.Approved });
  machine.send({ type: AccessEvent.Submit });
  machine.send({
    type: AccessEvent.Validated,
    validation: PhraseValidation.Invalid,
  });
  assert.equal(machine.presentation().phrase?.interaction, first);
  machine.send({ type: AccessEvent.Cancel });
  assert.equal(machine.presentation().interaction, null);
  machine.send({ intent: AccessIntent.Create, type: AccessEvent.Authorize });
  assert.ok(machine.presentation().interaction!.sequence > first.sequence);
  const second = machine.presentation().interaction;
  assert.equal(
    machine.send({ intent: AccessIntent.Create, type: AccessEvent.Authorize }),
    false,
  );
  assert.equal(machine.presentation().interaction, second);
  assert.equal(Object.isFrozen(second), true);
});

import { credentialStore, fixture } from "./helpers/core-fixture.ts";
import {
  AccessOutcome,
  CredentialConfirmation,
  CredentialEffect,
  RegistrationEffect,
  SaveRecoveryProgress,
} from "@/index";

void test("published task policy is immutable, secret-free and retains save recovery without registering twice", async () => {
  let writes = 0;
  const f = fixture(
    credentialStore({
      async write() {
        if (++writes === 1) throw Error("unacknowledged");
      },
    }),
  );
  await f.access.authorize(AccessIntent.Create);
  const phrase = f.access.getSnapshot();
  assert.ok(phrase.presentation.phrase);
  assert.equal(phrase.presentation.availability.submitRecoveryPhrase, true);
  assert.equal(phrase.presentation.availability.withSession, false);
  const submitted = await f.access.submitRecoveryPhrase("private input");
  assert.equal(submitted.kind, AccessOutcome.Failed);
  const recovery = f.access.getSnapshot().presentation;
  assert.equal(recovery.interaction, phrase.presentation.interaction);
  assert.equal(recovery.phrase, null);
  assert.deepEqual(recovery.saveRecovery?.effects, {
    credentials: CredentialEffect.Write,
    registration: RegistrationEffect.Registered,
  });
  assert.equal(recovery.availability.retrySave, true);
  assert.equal(recovery.availability.continueWithoutSaving, true);
  assert.ok(Object.isFrozen(recovery));
  assert.ok(Object.isFrozen(recovery.availability));
  assert.ok(Object.isFrozen(recovery.saveRecovery));
  assert.equal(
    JSON.stringify(f.access.getSnapshot()).includes("private"),
    false,
  );
  assert.deepEqual(await f.access.retrySave(), {
    credentials: CredentialConfirmation.Confirmed,
    kind: AccessOutcome.Ready,
  });
  assert.equal(f.counts().registrations, 1);
  assert.equal(
    f.access.getSnapshot().presentation.availability.withSession,
    true,
  );
  assert.equal(
    f.access.getSnapshot().presentation.interaction,
    recovery.interaction,
  );
  f.access.disconnect();
  assert.equal(f.access.getSnapshot().presentation.interaction, null);
  f.access.dispose();
  assert.ok(
    Object.values(f.access.getSnapshot().presentation.availability).every(
      (value) => value === false,
    ),
  );
});

void test("save recovery explicitly reports a pending retry while retaining originating effects", async () => {
  let finish!: () => void;
  let writes = 0;
  const f = fixture(
    credentialStore({
      async write() {
        if (++writes === 1) throw Error("unacknowledged");
        await new Promise<void>((resolve) => {
          finish = resolve;
        });
      },
    }),
  );
  await f.access.authorize(AccessIntent.Create);
  const failed = await f.access.submitRecoveryPhrase("private input");
  const originating = JSON.stringify(failed);
  const recovery = f.access.getSnapshot().presentation.saveRecovery!;
  assert.equal(recovery.progress, SaveRecoveryProgress.Idle);
  const retry = f.access.retrySave();
  await Promise.resolve();
  const pending = f.access.getSnapshot().presentation;
  assert.equal(pending.saveRecovery?.progress, SaveRecoveryProgress.Pending);
  assert.equal(pending.availability.retrySave, false);
  assert.equal(pending.availability.continueWithoutSaving, false);
  assert.deepEqual(pending.saveRecovery?.effects, recovery.effects);
  assert.equal(recovery.progress, SaveRecoveryProgress.Idle);
  finish();
  assert.equal((await retry).kind, AccessOutcome.Ready);
  assert.equal(failed.kind, AccessOutcome.Failed);
  assert.equal(JSON.stringify(failed), originating);
  assert.equal(f.counts().registrations, 1);
  f.access.dispose();
});
