import { describe, expect, it } from "vitest";
import {
  type AuthFlowInput,
  selectAuthStep,
  shouldAutoReconnect,
} from "./authFlow";

const gate: AuthFlowInput = {
  reconnecting: false,
  sharingKeyHex: null,
  status: "disconnected",
};

describe("automatic account reconnect", () => {
  const saved = {
    accountError: null,
    reconnectError: null,
    savedUserKeyHex: "a1".repeat(32),
    sharingKeyHex: null,
    status: "disconnected" as const,
  };

  it("starts from a saved key on initial entry", () => {
    expect(shouldAutoReconnect(saved)).toBe(true);
  });

  it("keeps a failed account entry visible until the user retries", () => {
    expect(
      shouldAutoReconnect({ ...saved, accountError: "Could not register" }),
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
  it("lands on the gate by default (disconnected, no sharing key)", () => {
    expect(selectAuthStep(gate)).toBe("gate");
  });

  it("routes a persisted sharing key straight to the player, bypassing SSO", () => {
    expect(selectAuthStep({ ...gate, sharingKeyHex: "a1".repeat(32) })).toBe(
      "player",
    );
  });

  it("lets a sharing key win even while reconnecting or awaiting approval", () => {
    expect(
      selectAuthStep({
        ...gate,
        reconnecting: true,
        sharingKeyHex: "a1".repeat(32),
        status: "awaiting-approval",
      }),
    ).toBe("player");
  });

  it("shows the loading screen while reconnecting", () => {
    expect(selectAuthStep({ ...gate, reconnecting: true })).toBe("loading");
  });

  it("routes awaiting approval to the approve screen", () => {
    expect(selectAuthStep({ ...gate, status: "awaiting-approval" })).toBe(
      "approve",
    );
  });

  it("routes registering to the recovery screen", () => {
    expect(selectAuthStep({ ...gate, status: "registering" })).toBe("recovery");
  });

  it("routes a connected app-key session to the player (publish default)", () => {
    expect(selectAuthStep({ ...gate, status: "connected" })).toBe("player");
  });

  it("routes the `reconnecting` status to the loading screen", () => {
    expect(selectAuthStep({ ...gate, status: "reconnecting" })).toBe("loading");
  });
});
