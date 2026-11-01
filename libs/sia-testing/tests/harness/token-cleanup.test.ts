/** Native token failures retain original private error values in teardown order. */
import { expect, it, vi } from "vitest";
import { withTokenCleanup } from "../e2e/native/shared-token-checks.ts";

it.each([
  new Error("secret primary"),
  undefined,
  null,
  "signed-query-SENTINEL",
])(
  "retains primary %s plus multiple cleanup errors by identity",
  async (primary) => {
    const calls: string[] = [];
    const account = new Error("raw-error-SENTINEL"),
      revocation = { secret: "seed-SENTINEL" };
    const failure: unknown = await withTokenCleanup(
      vi.fn<() => Promise<void>>().mockRejectedValue(primary),
      {
        cleanup: () => {
          calls.push("account");
          return vi.fn<() => Promise<void>>().mockRejectedValue(account)();
        },
        confirm: () => {
          calls.push("confirm");
          return Promise.resolve();
        },
        expired: () => false,
        revoke: () => {
          calls.push("revoke");
          return vi.fn<() => Promise<void>>().mockRejectedValue(revocation)();
        },
      },
    ).catch((error: unknown) => error);
    expect(calls).toEqual(["revoke", "account"]);
    expect(failure).toBeInstanceOf(AggregateError);
    if (!(failure instanceof AggregateError))
      throw new Error("Expected original failures");
    expect(failure.errors).toHaveLength(3);
    expect(failure.errors[0]).toBe(primary);
    expect(failure.errors[1]).toBe(revocation);
    expect(failure.errors[2]).toBe(account);
  },
);

it("confirms cleanup after an already-expired sharing key without turning absence into a failure", async () => {
  const calls: string[] = [];
  await withTokenCleanup(() => Promise.resolve(), {
    cleanup: () => {
      calls.push("account");
      return Promise.resolve();
    },
    confirm: () => {
      calls.push("confirm");
      return Promise.resolve();
    },
    expired: () => true,
    revoke: () =>
      Promise.reject(new Error("404 Not Found: sharing key not found")),
  });
  expect(calls).toEqual(["account", "confirm"]);
});
