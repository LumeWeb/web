/** Fixture cleanup must preserve original rejections and still attempt later owned resources. */
import { expect, it, vi } from "vitest";
import { withOwnedCleanup } from "../../src/e2e/internal/lifecycle.mjs";

it.each([new Error("primary"), undefined, null, "non-error"])(
  "keeps primary %s and all cleanup failures in order",
  async (primary) => {
    const calls: string[] = [];
    const cleanupError = new Error("owned cleanup");
    const failure: unknown = await withOwnedCleanup(
      vi.fn<() => Promise<void>>().mockRejectedValue(primary),
      [
        () => {
          calls.push("close");
          return Promise.reject(cleanupError);
        },
        () => {
          calls.push("delete-owned");
          return Promise.resolve();
        },
      ],
    ).catch((error: unknown) => error);
    expect(calls).toEqual(["close", "delete-owned"]);
    expect(failure).toBeInstanceOf(AggregateError);
    if (!(failure instanceof AggregateError))
      throw new Error("Expected both failures");
    expect(failure.errors).toEqual([primary, cleanupError]);
  },
);
