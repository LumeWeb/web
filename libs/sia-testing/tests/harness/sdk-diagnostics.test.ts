/** SDK log text is reduced to public counters before crossing runtime boundaries. */
import { expect, it } from "vitest";
import { createSDKDiagnostics } from "../e2e/support/sdk-diagnostics.js";

it("counts admission and transfer observations without retaining raw SDK failures", () => {
  const diagnostics = createSDKDiagnostics();
  const secret =
    "seed-SENTINEL ?signature=signed-query-SENTINEL raw-error-SENTINEL";
  diagnostics.record(secret);
  diagnostics.record(`no account token for host ${secret}`);
  diagnostics.record(`slab 0 shard 2 download failed ${secret}`);
  diagnostics.record(`slab 1 shard 1 uploaded ${secret}`);
  expect(diagnostics.snapshot()).toEqual({ noToken: 1, transfers: 2 });
  const snapshot = diagnostics.snapshot();
  snapshot.noToken = 100;
  expect(diagnostics.snapshot()).toEqual({ noToken: 1, transfers: 2 });
  for (const sentinel of secret.split(" "))
    expect(JSON.stringify(diagnostics.snapshot())).not.toContain(sentinel);
});
