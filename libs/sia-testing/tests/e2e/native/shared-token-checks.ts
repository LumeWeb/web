/**
 * Checks delivered token deadlines and revokes the test's sharing key before
 * account cleanup. Only a recognized expired-key response counts as absence;
 * other failures retain recovery details even when account cleanup succeeds.
 */
import type { SharedTokenObserver } from "../support/shared-token-observer.js";
import { withCleanup } from "../../../src/e2e/internal/lifecycle.mjs";

export interface TokenEvidence {
  authorizationEndedAtMs: number;
  firstRejectingReadStartedAtMs: number;
  maximumDeliveredExpiryMs: number;
}

/** Returns a public classification without exposing the SDK's private diagnostics. */
export function classifySharingKeyCleanup(
  error: unknown,
  expired: boolean,
): "already-expired" | "failure" {
  const message = error instanceof Error ? error.message : "";
  return expired &&
    /\b(401|404|500)\b/.exec(message)?.[1] === "404" &&
    message.includes("404 Not Found") &&
    message.includes("sharing key not found")
    ? "already-expired"
    : "failure";
}

/** Accepts only redacted local timestamps from the private child channel. */
export function tokenEvidence(input: unknown): TokenEvidence {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Invalid final token evidence");
  if (
    Object.keys(input).sort().join(",") !==
    "authorizationEndedAtMs,firstRejectingReadStartedAtMs,maximumDeliveredExpiryMs"
  )
    throw new Error("Invalid final token evidence");
  const {
    authorizationEndedAtMs,
    firstRejectingReadStartedAtMs,
    maximumDeliveredExpiryMs,
  } = input as Record<string, unknown>;
  if (
    typeof authorizationEndedAtMs !== "number" ||
    typeof firstRejectingReadStartedAtMs !== "number" ||
    typeof maximumDeliveredExpiryMs !== "number" ||
    ![
      authorizationEndedAtMs,
      firstRejectingReadStartedAtMs,
      maximumDeliveredExpiryMs,
    ].every((item) => Number.isSafeInteger(item) && item >= 0) ||
    authorizationEndedAtMs > firstRejectingReadStartedAtMs
  )
    throw new Error("Invalid final token evidence");
  return {
    authorizationEndedAtMs,
    firstRejectingReadStartedAtMs,
    maximumDeliveredExpiryMs,
  };
}

/** Checks every response delivered before owned child teardown. Stopping the child
 * must not hide a later token delivery that extends the expiry bound.
 */
export function validateFinalSnapshot(
  snapshot: ReturnType<SharedTokenObserver["snapshot"]>,
  input: unknown,
): void {
  const evidence = tokenEvidence(input);
  if (
    snapshot.conservativeMaximumDeliveredExpiryMs !==
      evidence.maximumDeliveredExpiryMs ||
    evidence.firstRejectingReadStartedAtMs <=
      evidence.maximumDeliveredExpiryMs + 1000 ||
    snapshot.observations.some(
      (item) =>
        item.kind === "delivered" &&
        item.requestStartedAtMs > evidence.authorizationEndedAtMs,
    )
  )
    throw new Error("Invalid final token evidence");
}

/** Account cleanup still runs after a business or revocation failure, preserving each original error. */
export async function withTokenCleanup(
  operation: () => Promise<void>,
  {
    cleanup,
    confirm,
    expired,
    revoke,
  }: {
    cleanup: () => Promise<void>;
    confirm: () => Promise<void>;
    expired: () => boolean;
    revoke: () => Promise<void>;
  },
): Promise<void> {
  let revokeFailed = false;
  await withCleanup(operation, [
    async () => {
      try {
        await revoke();
      } catch (error) {
        if (classifySharingKeyCleanup(error, expired()) === "already-expired")
          return;
        revokeFailed = true;
        throw error;
      }
    },
    async () => {
      await cleanup();
      if (!revokeFailed) await confirm();
    },
  ]);
}
