/** Field errors describe phrase corrections without interpreting other Sia outcomes as input failures. */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  AccessFailure,
  AccessOutcome,
  AccessRecovery,
  CredentialConfirmation,
  CredentialEffect,
  RegistrationEffect,
} from "@/index";
import type { SubmitRecoveryPhraseResult } from "@/index";
import { toRecoveryPhraseFieldError } from "@/react-hook-form";

const messages = Object.freeze({
  invalidPhrase: "Enter a valid phrase.",
  phraseMismatch: "Use the phrase for this account.",
});

void test("invalid phrases use the application message and retain the semantic error type", () => {
  const outcome = Object.freeze({ kind: AccessOutcome.InvalidPhrase });
  assert.deepEqual(toRecoveryPhraseFieldError(outcome, messages), {
    message: "Enter a valid phrase.",
    type: AccessOutcome.InvalidPhrase,
  });
});

void test("phrase mismatches use their own application message", () => {
  assert.deepEqual(
    toRecoveryPhraseFieldError(
      { kind: AccessOutcome.PhraseMismatch },
      messages,
    ),
    {
      message: "Use the phrase for this account.",
      type: AccessOutcome.PhraseMismatch,
    },
  );
});

const otherOutcomes: readonly SubmitRecoveryPhraseResult[] = [
  { credentials: CredentialConfirmation.Confirmed, kind: AccessOutcome.Ready },
  {
    effects: {
      credentials: CredentialEffect.None,
      registration: RegistrationEffect.Unknown,
    },
    kind: AccessOutcome.Cancelled,
  },
  { kind: AccessOutcome.Unavailable },
  {
    effects: {
      credentials: CredentialEffect.Write,
      registration: RegistrationEffect.Registered,
    },
    failure: AccessFailure.CredentialsWrite,
    kind: AccessOutcome.Failed,
    recovery: AccessRecovery.Save,
  },
];
for (const outcome of otherOutcomes) {
  void test(`${outcome.kind} does not produce a recovery phrase field error`, () => {
    assert.equal(
      toRecoveryPhraseFieldError(Object.freeze(outcome), messages),
      undefined,
    );
  });
}

void test("empty application messages are preserved without a library fallback", () => {
  assert.deepEqual(
    toRecoveryPhraseFieldError(
      { kind: AccessOutcome.InvalidPhrase },
      { invalidPhrase: "", phraseMismatch: "" },
    ),
    {
      message: "",
      type: AccessOutcome.InvalidPhrase,
    },
  );
});
