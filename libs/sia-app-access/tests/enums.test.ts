/** Serialized enum values and declaration order form the public wire contract. */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  AccessErrorCode,
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

void test("public string enums retain the serialized contract", () => {
  assert.deepEqual(Object.values(AccessIntent), ["create", "existing"]);
  assert.deepEqual(Object.values(AccessPhase), [
    "ready",
    "failed",
    "awaiting-approval",
    "recovery-phrase",
    "registering",
    "requesting-approval",
    "saving",
    "validating-phrase",
    "disconnected",
    "disposed",
    "forgetting",
    "restoring",
  ]);
  assert.deepEqual(Object.values(AccessOutcome), [
    "failed",
    "cancelled",
    "unavailable",
    "ready",
    "approved",
    "missing-credentials",
    "invalid-phrase",
    "phrase-mismatch",
    "removed",
    "generated",
  ]);
  assert.deepEqual(Object.values(CredentialConfirmation), [
    "confirmed",
    "unconfirmed",
  ]);
  assert.deepEqual(Object.values(RegistrationEffect), [
    "none",
    "registered",
    "unknown",
    "rejected",
  ]);
  assert.deepEqual(Object.values(CredentialEffect), [
    "none",
    "write",
    "remove",
  ]);
  assert.deepEqual(Object.values(AccessRecovery), [
    "authorize",
    "forget",
    "reconnect",
    "save",
  ]);
  assert.deepEqual(Object.values(AccessFailure), [
    "approval",
    "approval-timeout",
    "connection",
    "credentials-read",
    "credentials-remove",
    "credentials-write",
    "phrase-check",
    "registration",
    "registration-limit",
    "session",
    "unregistered-key",
    "phrase-generation",
  ]);
  assert.deepEqual(Object.values(PhraseValidation), ["valid", "invalid"]);
  assert.deepEqual(Object.values(AccessErrorCode), ["SIA_SESSION_UNAVAILABLE"]);
  assert.deepEqual(Object.values(ApprovalProgress), ["requesting", "awaiting"]);
  assert.deepEqual(Object.values(SaveRecoveryProgress), ["idle", "pending"]);
});
