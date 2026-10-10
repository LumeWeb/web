import { describe, expect, it } from "vitest";
import { type AuthFlowInput, selectAuthStep } from "./authFlow";

const gate: AuthFlowInput = {
  reconnecting: false,
  sharingKeyHex: null,
  status: "disconnected",
};

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
