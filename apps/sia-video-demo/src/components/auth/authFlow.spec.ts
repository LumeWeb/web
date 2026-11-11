import { AccessFailure, AccessPhase } from "@lumeweb/sia-app-access";
import type { AccessState } from "@lumeweb/sia-app-access";
import { describe, expect, it } from "vitest";
import {
  type AuthFlowInput,
  selectAuthStep,
  shouldAutoReconnect,
} from "./authFlow";

const gate: AuthFlowInput = { sharingKeyHex: null, snapshot: null };
function at(phase: AccessPhase): AuthFlowInput["snapshot"] {
  return { state: { phase } as AccessState };
}

describe("automatic account reconnect", () => {
  const saved = {
    accountError: null,
    reconnectError: null,
    savedUserKeyHex: "a1".repeat(32),
    sharingKeyHex: null,
    snapshot: null,
  };

  it("starts from a saved key on initial entry", () => {
    expect(shouldAutoReconnect(saved)).toBe(true);
  });

  it("keeps a failed account entry visible until the user retries", () => {
    expect(
      shouldAutoReconnect({ ...saved, accountError: "Could not register" }),
    ).toBe(false);
    expect(
      shouldAutoReconnect({ ...saved, snapshot: at(AccessPhase.Failed) }),
    ).toBe(false);
  });

  it("does not retry an automatic reconnect error or a sharing session", () => {
    expect(
      shouldAutoReconnect({ ...saved, reconnectError: "Could not reconnect" }),
    ).toBe(false);
    expect(
      shouldAutoReconnect({ ...saved, sharingKeyHex: "b2".repeat(32) }),
    ).toBe(false);
  });
});

describe("selectAuthStep", () => {
  it("lands on the gate without account access or a sharing key", () => {
    expect(selectAuthStep(gate)).toBe("gate");
  });

  it("routes a persisted sharing key straight to the player", () => {
    expect(selectAuthStep({ ...gate, sharingKeyHex: "a1".repeat(32) })).toBe(
      "player",
    );
  });

  it("keeps sharing playback available during approval and reconnect", () => {
    for (const phase of [AccessPhase.AwaitingApproval, AccessPhase.Restoring]) {
      expect(
        selectAuthStep({
          sharingKeyHex: "a1".repeat(32),
          snapshot: at(phase),
        }),
      ).toBe("player");
    }
  });

  it("shows loading while reconnecting or requesting approval", () => {
    expect(
      selectAuthStep({ ...gate, snapshot: at(AccessPhase.Restoring) }),
    ).toBe("loading");
    expect(
      selectAuthStep({ ...gate, snapshot: at(AccessPhase.RequestingApproval) }),
    ).toBe("loading");
  });

  it("routes live approval to the approval screen", () => {
    expect(
      selectAuthStep({ ...gate, snapshot: at(AccessPhase.AwaitingApproval) }),
    ).toBe("approve");
  });

  it("removes the approval screen when approval fails", () => {
    expect(selectAuthStep({ ...gate, snapshot: at(AccessPhase.Failed) })).toBe(
      "gate",
    );
  });

  it("keeps failed credential saving on the recovery screen", () => {
    expect(
      selectAuthStep({
        ...gate,
        snapshot: {
          state: {
            failure: AccessFailure.CredentialsWrite,
            phase: AccessPhase.Failed,
          } as AccessState,
        },
      }),
    ).toBe("recovery");
  });

  it("keeps approved access on the approval screen until the user continues", () => {
    expect(
      selectAuthStep({
        ...gate,
        approvalContinueRequired: true,
        snapshot: at(AccessPhase.RecoveryPhrase),
      }),
    ).toBe("approve");
  });

  it("routes phrase entry and registration to recovery", () => {
    expect(
      selectAuthStep({ ...gate, snapshot: at(AccessPhase.RecoveryPhrase) }),
    ).toBe("recovery");
    expect(
      selectAuthStep({ ...gate, snapshot: at(AccessPhase.Registering) }),
    ).toBe("recovery");
  });

  it("routes a ready account to the player", () => {
    expect(selectAuthStep({ ...gate, snapshot: at(AccessPhase.Ready) })).toBe(
      "player",
    );
  });
});
