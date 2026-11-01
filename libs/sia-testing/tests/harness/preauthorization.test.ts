/** Checks policy encoding against fixed outputs from the Go service signer. */
import { expect, it } from "vitest";
import {
  preauthorizationHash,
  type PreauthorizationPolicy,
} from "../e2e/support/preauthorization.js";

const policy: PreauthorizationPolicy = {
  allowedAppID: "11".repeat(32),
  connectKey: "fixture-connect-key",
  expiration: new Date("2030-01-02T03:04:05Z"),
  publicKey:
    "ed25519:d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a",
  totalUses: 2,
};

it("matches the Go policy hash with an app restriction", () => {
  expect(Buffer.from(preauthorizationHash(policy)).toString("hex")).toBe(
    "30cd080fe2dfc7c0ffd746eac74e115485f170d32947d39b3cfa693d676657a9",
  );
});

it("matches the Go unrestricted policy hash with a UTF-8 connect key", () => {
  expect(
    Buffer.from(
      preauthorizationHash({
        connectKey: "clé",
        expiration: policy.expiration,
        publicKey: policy.publicKey,
        totalUses: 2,
      }),
    ).toString("hex"),
  ).toBe("ebc6b34b0f71a2a13b79ff1ba40bb93c658b11e6fb3317374617891c67fe01b9");
});

it("encodes expiration in whole Unix seconds like the service", () => {
  expect(
    Buffer.from(
      preauthorizationHash({
        ...policy,
        expiration: new Date("2030-01-02T03:04:05.999Z"),
      }),
    ).toString("hex"),
  ).toBe("30cd080fe2dfc7c0ffd746eac74e115485f170d32947d39b3cfa693d676657a9");
});

for (const { name, patch } of [
  { name: "a short public key", patch: { publicKey: "ed25519:bad" } },
  {
    name: "an unknown key algorithm",
    patch: { publicKey: policy.publicKey.replace("ed25519", "ED25519") },
  },
  { name: "a short app ID", patch: { allowedAppID: "bad" } },
  { name: "an empty connect key", patch: { connectKey: "" } },
  { name: "a zero use limit", patch: { totalUses: 0 } },
  { name: "a fractional use limit", patch: { totalUses: 1.5 } },
  {
    name: "an unsafe use limit",
    patch: { totalUses: Number.MAX_SAFE_INTEGER + 1 },
  },
  { name: "an invalid expiration", patch: { expiration: new Date("invalid") } },
  {
    name: "a pre-epoch expiration",
    patch: { expiration: new Date("1960-01-01") },
  },
]) {
  it(`rejects ${name}`, () => {
    expect(() => preauthorizationHash({ ...policy, ...patch })).toThrow();
  });
}
